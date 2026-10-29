// Browser-safe parsing helpers for WhatsApp webhook payloads.
// No environment variables or database access here: this module is imported by tests
// and can be loaded anywhere.

export type JsonRecord = Record<string, unknown>;

export function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/** Read one key out of a parsed webhook object, or a database row. */
export function get(record: unknown, key: string): unknown {
  return (record as JsonRecord | null | undefined)?.[key];
}

/** Digits only, so "+92 314 2763051" and "923142763051" compare equal. */
export function digits(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

/**
 * A Pakistani local number (0314 2763051) drops the country code and keeps a
 * leading zero, while the international form (923142763051) does the opposite.
 * Both spellings must recognise the same number.
 */
export function numberVariants(value: string | null | undefined): string[] {
  const normalized = digits(value);
  if (normalized === "") return [];
  return normalized.startsWith("0") ? [normalized, normalized.slice(1)] : [normalized];
}

/**
 * True when both values point at the same WhatsApp number.
 * Local formats drop the country code, so a suffix match is required.
 */
export function isSameNumber(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  for (const left of numberVariants(a)) {
    for (const right of numberVariants(b)) {
      if (left === "" || right === "") continue;
      if (left === right || left.endsWith(right) || right.endsWith(left)) return true;
    }
  }
  return false;
}

/** Delivery states in the order Meta reports them. */
export const STATUS_ORDER = ["pending", "accepted", "sent", "delivered", "read"] as const;

export function statusRank(status: string): number {
  return STATUS_ORDER.indexOf(status as (typeof STATUS_ORDER)[number]);
}

/**
 * A late "sent" callback must never overwrite an established "delivered" or "read"
 * state, and a "failed" notice must not arrive after the customer already read the
 * message.
 */
export function shouldAdvanceStatus(
  current: string | null | undefined,
  next: string,
): boolean {
  if (next === "failed") {
    return (
      current === null ||
      current === undefined ||
      ["pending", "accepted", "sent"].includes(current)
    );
  }
  const nextRank = statusRank(next);
  if (nextRank < 0) return false;
  const currentRank = statusRank(current ?? "");
  return currentRank < 0 || nextRank >= currentRank;
}

/** Meta's webhook body always carries exactly one change. */
export function extractChangeValue(payload: unknown): JsonRecord | null {
  const entry = asRecord(asArray(get(asRecord(payload), "entry"))[0]);
  const change = asRecord(asArray(get(entry, "changes"))[0]);
  return asRecord(get(change, "value"));
}

export function extractField(payload: unknown): string | null {
  const entry = asRecord(asArray(get(asRecord(payload), "entry"))[0]);
  const change = asRecord(asArray(get(entry, "changes"))[0]);
  return str(get(change, "field"));
}

/**
 * Collect every WhatsApp message object nested anywhere in a value, so history
 * imports (threads of threads) and echo batches are handled without assuming a
 * fixed shape. Objects that look like messages are not descended into.
 */
export function collectMessageObjects(value: unknown, maxDepth = 10): JsonRecord[] {
  const found: JsonRecord[] = [];
  const seen = new Set<JsonRecord>();

  const walk = (node: unknown, depth: number) => {
    if (depth > maxDepth) return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }
    const record = asRecord(node);
    if (!record) return;
    const id = get(record, "id");
    const from = get(record, "from");
    const to = get(record, "to");
    const looksLikeMessage =
      typeof id === "string" && (typeof from === "string" || typeof to === "string");
    if (looksLikeMessage) {
      if (!seen.has(record)) {
        seen.add(record);
        found.push(record);
      }
      return;
    }
    for (const key of Object.keys(record)) walk(record[key], depth + 1);
  };

  walk(value, 0);
  return found;
}

/** Meta sends message times as unix seconds. */
export function timestampToIso(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value * 1000).toISOString();
  }
  const raw = str(value);
  if (raw && /^\d+$/.test(raw)) {
    return new Date(Number(raw) * 1000).toISOString();
  }
  return null;
}

export type MediaInfo = {
  mediaId: string | null;
  mediaMime: string | null;
  mediaFilename: string | null;
  caption: string | null;
  mediaSize: number | null;
};

/** Image/document/audio/video/sticker bodies all carry an id plus optional metadata. */
export function mediaInfo(message: JsonRecord): MediaInfo {
  const type = str(get(message, "type"));
  const container = type ? asRecord(get(message, type)) : null;
  const size = get(container, "file_size");
  return {
    mediaId: str(get(container, "id")),
    mediaMime: str(get(container, "mime_type")),
    mediaFilename: str(get(container, "filename")),
    caption: str(get(container, "caption")),
    mediaSize: typeof size === "number" ? size : null,
  };
}

/** The human-readable part of any inbound message shape. */
export function textContent(message: JsonRecord): string | null {
  const text = str(get(asRecord(get(message, "text")), "body"));
  if (text) return text;

  const button = str(get(asRecord(get(message, "button")), "text"));
  if (button) return button;

  const interactive = asRecord(get(message, "interactive"));
  const reply =
    str(get(asRecord(get(interactive, "button_reply")), "title")) ??
    str(get(asRecord(get(interactive, "list_reply")), "title"));
  if (reply) return reply;

  const reaction = str(get(asRecord(get(message, "reaction")), "emoji"));
  if (reaction) return reaction;

  return null;
}
