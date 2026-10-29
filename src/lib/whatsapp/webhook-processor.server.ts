// Server-only WhatsApp webhook processing: durable inbox, message store, delivery
// status reconciliation and auto-replies. Loaded dynamically from the webhook route
// so it never enters the browser bundle.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";

import {
  getBusinessNumber,
  sendWhatsAppTemplate,
  sendWhatsAppText,
  type TemplateComponent,
} from "./gateway.server";
import {
  asArray,
  asRecord,
  collectMessageObjects,
  digits,
  extractChangeValue,
  get,
  isSameNumber,
  mediaInfo,
  shouldAdvanceStatus,
  str,
  textContent,
  timestampToIso,
  type JsonRecord,
} from "./parse";

// Placeholder copy the business can change: it promises nothing about hours or prices.
const AUTO_REPLY_TEXT =
  "Thanks for messaging Karachi Business Growth! We've received your message and will reply shortly. " +
  "Tell us what you need help with — ads, SEO, a website, or WhatsApp AI — and we'll get back to you.";

const REPLY_ATTEMPT_LIMIT = 5;
// Meta's service window is 24 hours from the customer's message; stop short of it.
const REPLY_WINDOW_MS = 22 * 60 * 60 * 1000;
// A claimed send that never finished stays ambiguous for this long, then becomes retryable.
const AMBIGUOUS_SEND_MS = 2 * 60 * 1000;
const STATUS_ATTEMPT_LIMIT = 8;
const PARKED_MS = 7 * 24 * 60 * 60 * 1000;
const RECOVERY_LIMIT = 5;

/** jsonb columns are typed as a strict JSON union; these values come from Meta. */
function asJson(value: unknown): Json {
  return value as Json;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function uniqueViolation(error: { code?: string } | null | undefined): boolean {
  return error?.code === "23505";
}

type InboxRow = {
  id: number;
  event: string;
  payload: unknown;
  attempts: number;
};

type StatusInfo = {
  id: string;
  status: string;
  recipientId: string | null;
  providerTimestamp: string | null;
  errors: unknown[];
};

type MessageInput = {
  id: string;
  direction: string;
  fromNumber: string | null;
  toNumber: string | null;
  messageType: string | null;
  textBody: string | null;
  mediaId: string | null;
  mediaMime: string | null;
  mediaFilename: string | null;
  caption: string | null;
  raw: JsonRecord;
  receivedAt: string;
  replyStatus: string;
};

type OutboundPatch = {
  updated_at: string;
  status?: string;
  status_at?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  error_code?: string | null;
  error_message?: string | null;
};

/**
 * Store a verified delivery durably, then process it. A duplicate delivery reuses
 * the stored row and only re-processes it when the first attempt never completed.
 */
export async function receiveEvent(input: {
  deliveryId: string;
  event: string;
  payload: unknown;
}): Promise<void> {
  const existing = await supabaseAdmin
    .from("whatsapp_webhook_events")
    .select("id")
    .eq("delivery_id", input.deliveryId)
    .maybeSingle();
  if (existing.error) {
    throw new Error(`WhatsApp inbox read failed: ${existing.error.message}`);
  }

  if (!existing.data) {
    const inserted = await supabaseAdmin
      .from("whatsapp_webhook_events")
      .insert({
        delivery_id: input.deliveryId,
        event: input.event,
        payload: asJson(input.payload),
        received_at: new Date().toISOString(),
      });
    if (inserted.error && !uniqueViolation(inserted.error)) {
      throw new Error(`WhatsApp inbox write failed: ${inserted.error.message}`);
    }
  }

  const stored = await supabaseAdmin
    .from("whatsapp_webhook_events")
    .select("id, event, payload, attempts, processed_at")
    .eq("delivery_id", input.deliveryId)
    .maybeSingle();
  if (stored.error) {
    throw new Error(`WhatsApp inbox read failed: ${stored.error.message}`);
  }
  const row = stored.data;
  if (!row) {
    throw new Error("WhatsApp inbox row is missing after insert");
  }
  if (get(row, "processed_at")) return;

  const rowId = Number(get(row, "id"));
  if (!Number.isFinite(rowId)) {
    throw new Error("WhatsApp inbox row has no usable id");
  }

  await processRow(
    {
      id: rowId,
      event: str(get(row, "event")) ?? input.event,
      payload: get(row, "payload"),
      attempts: Number(get(row, "attempts") ?? 0),
    },
    true,
  );
}

/**
 * Process one stored delivery. Every business update is retry-safe and completion
 * is committed last, so a crash between the two only causes a harmless replay.
 */
async function processRow(row: InboxRow, recoverAfter: boolean): Promise<void> {
  try {
    await dispatchEvent(row.event, row.payload);
  } catch (error) {
    const attempts = row.attempts + 1;
    const backoffMs = Math.min(2 ** attempts, 60) * 1000;
    const recorded = await supabaseAdmin
      .from("whatsapp_webhook_events")
      .update({
        attempts,
        processing_error: errorMessage(error),
        next_retry_at: new Date(Date.now() + backoffMs).toISOString(),
      })
      .eq("id", row.id);
    if (recorded.error) {
      console.error("Could not record WhatsApp processing failure:", recorded.error.message);
    }
    throw error;
  }

  const completed = await supabaseAdmin
    .from("whatsapp_webhook_events")
    .update({ processed_at: new Date().toISOString(), processing_error: null })
    .eq("id", row.id);
  if (completed.error) {
    throw new Error(`WhatsApp inbox update failed: ${completed.error.message}`);
  }

  if (recoverAfter) {
    await recoverUnfinishedWork();
  }
}

async function dispatchEvent(event: string, payload: unknown): Promise<void> {
  const value = extractChangeValue(payload);

  switch (event) {
    case "whatsapp.message":
      return handleInboundMessages(value);
    case "whatsapp.status":
      return handleStatuses(value);
    case "whatsapp.message_error":
    case "whatsapp.account_update":
    case "whatsapp.template_status":
      return recordAccountEvent(event, value);
    case "whatsapp.smb_message_echoes":
      return handleEchoes(value);
    case "whatsapp.history":
      return handleHistory(value);
    case "whatsapp.smb_app_state_sync":
      return handleContacts(value);
    default:
      // Unknown event types keep their payload in the inbox and are acknowledged.
      return;
  }
}

async function storeMessage(message: MessageInput): Promise<void> {
  const stored = await supabaseAdmin
    .from("whatsapp_messages")
    .upsert(
      {
        id: message.id,
        direction: message.direction,
        from_number: message.fromNumber,
        to_number: message.toNumber,
        message_type: message.messageType,
        text_body: message.textBody,
        media_id: message.mediaId,
        media_mime: message.mediaMime,
        media_filename: message.mediaFilename,
        caption: message.caption,
        raw: asJson(message.raw),
        received_at: message.receivedAt,
        reply_status: message.replyStatus,
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (stored.error) {
    throw new Error(`WhatsApp message store failed: ${stored.error.message}`);
  }
}

function messageInput(
  message: JsonRecord,
  options: { direction: string; replyStatus: string },
): MessageInput | null {
  const id = str(get(message, "id"));
  if (!id) return null;
  const media = mediaInfo(message);
  return {
    id,
    direction: options.direction,
    fromNumber: str(get(message, "from")),
    toNumber: str(get(message, "to")),
    messageType: str(get(message, "type")),
    textBody: textContent(message),
    mediaId: media.mediaId,
    mediaMime: media.mediaMime,
    mediaFilename: media.mediaFilename,
    caption: media.caption,
    raw: message,
    receivedAt: timestampToIso(get(message, "timestamp")) ?? new Date().toISOString(),
    replyStatus: options.replyStatus,
  };
}

async function handleInboundMessages(value: JsonRecord | null): Promise<void> {
  for (const item of asArray(get(value, "messages"))) {
    const message = asRecord(item);
    if (!message) continue;
    const input = messageInput(message, { direction: "inbound", replyStatus: "pending" });
    if (input) await storeMessage(input);
  }
  await sendPendingReplies(3);
}

async function handleEchoes(value: JsonRecord | null): Promise<void> {
  for (const item of asArray(get(value, "message_echoes"))) {
    const message = asRecord(item);
    if (!message) continue;
    const input = messageInput(message, { direction: "outbound_echo", replyStatus: "skipped" });
    if (input) await storeMessage(input);
  }
}

async function handleHistory(value: JsonRecord | null): Promise<void> {
  const business = await getBusinessNumber().catch(() => null);
  for (const message of collectMessageObjects(value)) {
    const from = str(get(message, "from"));
    const direction = business && isSameNumber(from, business) ? "outbound_echo" : "inbound";
    const input = messageInput(message, { direction, replyStatus: "skipped" });
    if (input) await storeMessage(input);
  }
}

async function handleContacts(value: JsonRecord | null): Promise<void> {
  for (const item of asArray(get(value, "state_sync"))) {
    const entry = asRecord(item);
    const contact = asRecord(get(entry, "contact"));
    const phoneNumber = str(get(contact, "phone_number"));
    if (!phoneNumber) continue;
    const action = str(get(entry, "action"));

    if (action === "remove") {
      const removed = await supabaseAdmin
        .from("whatsapp_contacts")
        .delete()
        .eq("phone_number", phoneNumber);
      if (removed.error) {
        throw new Error(`WhatsApp contact removal failed: ${removed.error.message}`);
      }
      continue;
    }

    const stored = await supabaseAdmin
      .from("whatsapp_contacts")
      .upsert(
        {
          phone_number: phoneNumber,
          full_name: str(get(contact, "full_name")),
          action,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "phone_number" },
      );
    if (stored.error) {
      throw new Error(`WhatsApp contact store failed: ${stored.error.message}`);
    }
  }
}

async function recordAccountEvent(event: string, value: JsonRecord | null): Promise<void> {
  const stored = await supabaseAdmin
    .from("whatsapp_account_events")
    .insert({
      event,
      detail: asJson(value ?? {}),
      received_at: new Date().toISOString(),
    });
  if (stored.error) {
    throw new Error(`WhatsApp account event store failed: ${stored.error.message}`);
  }
}

async function applyStatus(status: StatusInfo): Promise<boolean> {
  const lookup = await supabaseAdmin
    .from("whatsapp_outbound_messages")
    .select("id, status, sent_at, delivered_at, read_at")
    .eq("provider_message_id", status.id)
    .maybeSingle();
  if (lookup.error) {
    throw new Error(`WhatsApp status lookup failed: ${lookup.error.message}`);
  }
  const row = lookup.data;
  if (!row) return false;

  const rowId = Number(get(row, "id"));
  if (!Number.isFinite(rowId)) return false;

  const providerTime = status.providerTimestamp ?? new Date().toISOString();
  const patch: OutboundPatch = { updated_at: new Date().toISOString() };
  let changed = false;

  // Backfill each state's own provider timestamp, even when the overall state
  // has already moved further along.
  if (status.status === "sent" && !get(row, "sent_at")) {
    patch.sent_at = providerTime;
    changed = true;
  }
  if (status.status === "delivered" && !get(row, "delivered_at")) {
    patch.delivered_at = providerTime;
    changed = true;
  }
  if (status.status === "read" && !get(row, "read_at")) {
    patch.read_at = providerTime;
    changed = true;
  }

  if (shouldAdvanceStatus(str(get(row, "status")), status.status)) {
    patch.status = status.status;
    patch.status_at = providerTime;
    changed = true;
    if (status.status === "failed") {
      const first = asRecord(asArray(status.errors)[0]);
      patch.error_code = str(get(first, "code"));
      patch.error_message = str(get(first, "title")) ?? str(get(first, "message"));
    }
  }

  if (!changed) return true;

  const updated = await supabaseAdmin
    .from("whatsapp_outbound_messages")
    .update(patch)
    .eq("id", rowId);
  if (updated.error) {
    throw new Error(`WhatsApp status update failed: ${updated.error.message}`);
  }
  return true;
}

async function queuePendingStatus(status: StatusInfo): Promise<void> {
  const stored = await supabaseAdmin
    .from("whatsapp_pending_statuses")
    .upsert(
      {
        message_id: status.id,
        status: status.status,
        recipient_id: status.recipientId,
        provider_timestamp: status.providerTimestamp,
        errors: asJson(status.errors),
        received_at: new Date().toISOString(),
      },
      { onConflict: "message_id,status", ignoreDuplicates: true },
    );
  if (stored.error) {
    throw new Error(`WhatsApp pending status store failed: ${stored.error.message}`);
  }
}

async function handleStatuses(value: JsonRecord | null): Promise<void> {
  for (const item of asArray(get(value, "statuses"))) {
    const record = asRecord(item);
    const id = str(get(record, "id"));
    const status = str(get(record, "status"));
    if (!record || !id || !status) continue;

    const info: StatusInfo = {
      id,
      status,
      recipientId: str(get(record, "recipient_id")),
      providerTimestamp: timestampToIso(get(record, "status_timestamp")),
      errors: asArray(get(record, "errors")),
    };

    const applied = await applyStatus(info);
    // A callback can beat the sender's own record: keep it and apply it later.
    if (!applied) await queuePendingStatus(info);
  }
}

async function reconcilePendingStatuses(messageId: string): Promise<void> {
  const queued = await supabaseAdmin
    .from("whatsapp_pending_statuses")
    .select("message_id, status, recipient_id, provider_timestamp, errors")
    .eq("message_id", messageId)
    .is("applied_at", null)
    .order("received_at", { ascending: true });
  if (queued.error) {
    throw new Error(`WhatsApp pending status read failed: ${queued.error.message}`);
  }

  for (const item of queued.data ?? []) {
    const applied = await applyStatus({
      id: str(get(item, "message_id")) ?? messageId,
      status: str(get(item, "status")) ?? "",
      recipientId: str(get(item, "recipient_id")),
      providerTimestamp: str(get(item, "provider_timestamp")),
      errors: asArray(get(item, "errors")),
    });
    if (!applied) continue;
    const marked = await supabaseAdmin
      .from("whatsapp_pending_statuses")
      .update({ applied_at: new Date().toISOString() })
      .eq("message_id", str(get(item, "message_id")) ?? "")
      .eq("status", str(get(item, "status")) ?? "");
    if (marked.error) {
      throw new Error(`WhatsApp pending status update failed: ${marked.error.message}`);
    }
  }
}

/**
 * Send and record an outbound message. The provider message id is saved before
 * delivery callbacks can arrive, and any callback that already landed is applied.
 */
export async function sendAndRecord(input: {
  to: string;
  text?: string;
  templateName?: string;
  templateLanguage?: string;
  templateComponents?: TemplateComponent[];
}): Promise<{ messageId: string }> {
  const to = digits(input.to);
  if (!to) throw new Error("A WhatsApp recipient number is required");
  if (!input.text && !input.templateName) {
    throw new Error("A message body or template name is required");
  }

  const inserted = await supabaseAdmin
    .from("whatsapp_outbound_messages")
    .insert({
      to_number: to,
      text_body: input.text ?? null,
      template_name: input.templateName ?? null,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (inserted.error || !inserted.data) {
    throw new Error(
      `WhatsApp outbound record failed: ${inserted.error?.message ?? "no row returned"}`,
    );
  }
  const outboundId = Number(get(inserted.data, "id"));
  if (!Number.isFinite(outboundId)) {
    throw new Error("WhatsApp outbound record has no usable id");
  }

  try {
    const result = input.text
      ? await sendWhatsAppText(to, input.text)
      : await sendWhatsAppTemplate(
          to,
          input.templateName ?? "",
          input.templateLanguage ?? "en_US",
          input.templateComponents ?? [],
        );

    const saved = await supabaseAdmin
      .from("whatsapp_outbound_messages")
      .update({
        provider_message_id: result.messageId,
        status: "accepted",
        status_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", outboundId);
    if (saved.error) {
      // Meta accepted the message but the id is not stored: name it so a human can reconcile.
      throw new Error(
        `WhatsApp send accepted (message ${result.messageId}) but the record update failed: ${saved.error.message}`,
      );
    }

    await reconcilePendingStatuses(result.messageId);
    return result;
  } catch (error) {
    const failed = await supabaseAdmin
      .from("whatsapp_outbound_messages")
      .update({
        status: "failed",
        error_message: errorMessage(error),
        updated_at: new Date().toISOString(),
      })
      .eq("id", outboundId);
    if (failed.error) {
      console.error("Could not record WhatsApp send failure:", failed.error.message);
    }
    throw error;
  }
}

/**
 * Auto-reply to customer messages. Each reply is claimed with a conditional update
 * so a retry or a concurrent delivery can never send it twice.
 */
async function sendPendingReplies(limit: number): Promise<void> {
  const business = await getBusinessNumber().catch(() => null);
  const cutoff = new Date(Date.now() - REPLY_WINDOW_MS).toISOString();

  const due = await supabaseAdmin
    .from("whatsapp_messages")
    .select("id, from_number, reply_status, reply_attempts")
    .in("reply_status", ["pending", "failed"])
    .lt("reply_attempts", REPLY_ATTEMPT_LIMIT)
    .gte("received_at", cutoff)
    .order("received_at", { ascending: true })
    .limit(limit);
  if (due.error) {
    throw new Error(`WhatsApp reply read failed: ${due.error.message}`);
  }

  for (const row of due.data ?? []) {
    const messageId = str(get(row, "id"));
    if (!messageId) continue;
    const currentStatus = str(get(row, "reply_status")) ?? "pending";

    if (business && isSameNumber(str(get(row, "from_number")), business)) {
      const skipped = await supabaseAdmin
        .from("whatsapp_messages")
        .update({ reply_status: "skipped" })
        .eq("id", messageId)
        .eq("reply_status", currentStatus);
      if (skipped.error) {
        throw new Error(`WhatsApp reply update failed: ${skipped.error.message}`);
      }
      continue;
    }

    const claimed = await supabaseAdmin
      .from("whatsapp_messages")
      .update({
        reply_status: "sending",
        reply_attempted_at: new Date().toISOString(),
      })
      .eq("id", messageId)
      .eq("reply_status", currentStatus)
      .select("id");
    if (claimed.error) {
      throw new Error(`WhatsApp reply claim failed: ${claimed.error.message}`);
    }
    if (!claimed.data || claimed.data.length === 0) continue;

    try {
      const result = await sendAndRecord({ to: str(get(row, "from_number")) ?? "", text: AUTO_REPLY_TEXT });
      const done = await supabaseAdmin
        .from("whatsapp_messages")
        .update({
          reply_status: "sent",
          reply_message_id: result.messageId,
          replied_at: new Date().toISOString(),
          reply_error: null,
        })
        .eq("id", messageId);
      if (done.error) {
        throw new Error(`WhatsApp reply update failed: ${done.error.message}`);
      }
    } catch (error) {
      const failed = await supabaseAdmin
        .from("whatsapp_messages")
        .update({
          reply_status: "failed",
          reply_error: errorMessage(error),
          reply_attempts: Number(get(row, "reply_attempts") ?? 0) + 1,
        })
        .eq("id", messageId);
      if (failed.error) {
        console.error("Could not record WhatsApp reply failure:", failed.error.message);
      }
    }
  }
}

/**
 * Recovery for work left unfinished after a crash or a gateway retry: ambiguous
 * sends, delivery callbacks that waited on their outbound row, and replies still
 * owed. Blocked rows are pushed back by attempt count so they cannot starve
 * runnable work.
 */
async function recoverUnfinishedWork(): Promise<void> {
  const ambiguous = await supabaseAdmin
    .from("whatsapp_messages")
    .update({
      reply_status: "failed",
      reply_error: "Send outcome unknown — needs review",
    })
    .eq("reply_status", "sending")
    .lt("reply_attempted_at", new Date(Date.now() - AMBIGUOUS_SEND_MS).toISOString());
  if (ambiguous.error) {
    console.error("Could not resurface ambiguous WhatsApp replies:", ambiguous.error.message);
  }

  const due = await supabaseAdmin
    .from("whatsapp_pending_statuses")
    .select("message_id, status, recipient_id, provider_timestamp, errors, attempts")
    .is("applied_at", null)
    .lte("next_retry_at", new Date().toISOString())
    .order("next_retry_at", { ascending: true })
    .limit(RECOVERY_LIMIT);
  if (due.error) {
    console.error("Could not read pending WhatsApp statuses:", due.error.message);
    return;
  }

  for (const item of due.data ?? []) {
    const messageId = str(get(item, "message_id"));
    const status = str(get(item, "status"));
    if (!messageId || !status) continue;

    const applied = await applyStatus({
      id: messageId,
      status,
      recipientId: str(get(item, "recipient_id")),
      providerTimestamp: str(get(item, "provider_timestamp")),
      errors: asArray(get(item, "errors")),
    });

    if (applied) {
      const marked = await supabaseAdmin
        .from("whatsapp_pending_statuses")
        .update({ applied_at: new Date().toISOString() })
        .eq("message_id", messageId)
        .eq("status", status);
      if (marked.error) {
        console.error("Could not mark WhatsApp status applied:", marked.error.message);
      }
      continue;
    }

    const attempts = Number(get(item, "attempts") ?? 0) + 1;
    const waitMs = attempts >= STATUS_ATTEMPT_LIMIT ? PARKED_MS : 30 * 1000 * attempts;
    const deferred = await supabaseAdmin
      .from("whatsapp_pending_statuses")
      .update({
        attempts,
        next_retry_at: new Date(Date.now() + waitMs).toISOString(),
      })
      .eq("message_id", messageId)
      .eq("status", status);
    if (deferred.error) {
      console.error("Could not defer WhatsApp status:", deferred.error.message);
    }
  }

  await sendPendingReplies(RECOVERY_LIMIT);
}
