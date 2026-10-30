import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: { rpc: (fn: "has_role", args: { _user_id: string; _role: "admin" }) => PromiseLike<{ data: boolean | null }> }; userId: string };

async function requireAdmin(context: Ctx) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!data) throw new Error("Only the business owner can open the inbox.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function digitsOnly(v: string | null | undefined) {
  return (v ?? "").replace(/\D/g, "");
}

export type InboxMessage = {
  id: string;
  direction: "in" | "out";
  text: string;
  at: string;
  status: string | null;
};

export type Conversation = { number: string; name: string | null; lastText: string; lastAt: string; lastDirection: "in" | "out" };

export const checkInboxAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { isAdmin: !!data };
  });

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Conversation[]> => {
    const db = await requireAdmin(context as unknown as Ctx);
    const [inb, outb, contacts] = await Promise.all([
      db.from("whatsapp_messages").select("from_number, to_number, direction, text_body, caption, message_type, received_at").order("received_at", { ascending: false }).limit(1000),
      db.from("whatsapp_outbound_messages").select("to_number, text_body, template_name, created_at").order("created_at", { ascending: false }).limit(1000),
      db.from("whatsapp_contacts").select("phone_number, full_name"),
    ]);
    if (inb.error) throw new Error(inb.error.message);
    if (outb.error) throw new Error(outb.error.message);
    const names = new Map<string, string | null>();
    for (const c of contacts.data ?? []) names.set(digitsOnly(c.phone_number), c.full_name);
    const map = new Map<string, Conversation>();
    const add = (num: string, text: string, at: string, dir: "in" | "out") => {
      if (!num) return;
      const cur = map.get(num);
      if (!cur || cur.lastAt < at) map.set(num, { number: num, name: names.get(num) ?? null, lastText: text, lastAt: at, lastDirection: dir });
    };
    for (const m of inb.data ?? []) {
      const isIn = m.direction === "inbound";
      add(digitsOnly(isIn ? m.from_number : m.to_number), m.text_body ?? m.caption ?? `[${m.message_type ?? "message"}]`, m.received_at ?? "", isIn ? "in" : "out");
    }
    for (const m of outb.data ?? []) add(digitsOnly(m.to_number), m.text_body ?? `[template ${m.template_name}]`, m.created_at ?? "", "out");
    return [...map.values()].sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
  });

export const getConversation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { number: string }) => ({ number: digitsOnly(input.number) }))
  .handler(async ({ context, data }): Promise<InboxMessage[]> => {
    const db = await requireAdmin(context as unknown as Ctx);
    const n = data.number;
    if (!n) return [];
    const [inb, outb] = await Promise.all([
      db.from("whatsapp_messages").select("id, direction, from_number, to_number, text_body, caption, message_type, received_at").or(`from_number.eq.${n},to_number.eq.${n}`).order("received_at").limit(500),
      db.from("whatsapp_outbound_messages").select("id, provider_message_id, text_body, template_name, status, created_at").eq("to_number", n).order("created_at").limit(500),
    ]);
    if (inb.error) throw new Error(inb.error.message);
    if (outb.error) throw new Error(outb.error.message);
    const sentIds = new Set((outb.data ?? []).map((o) => o.provider_message_id).filter(Boolean));
    const list: InboxMessage[] = [];
    for (const m of inb.data ?? []) {
      if (sentIds.has(m.id)) continue;
      list.push({ id: m.id, direction: m.direction === "inbound" ? "in" : "out", text: m.text_body ?? m.caption ?? `[${m.message_type ?? "message"}]`, at: m.received_at ?? "", status: null });
    }
    for (const o of outb.data ?? []) list.push({ id: `o${o.id}`, direction: "out", text: o.text_body ?? `[template ${o.template_name}]`, at: o.created_at ?? "", status: o.status });
    return list.sort((a, b) => (a.at < b.at ? -1 : 1));
  });

export const sendReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { number: string; text: string }) => {
    const text = String(input.text ?? "").trim();
    const number = digitsOnly(input.number);
    if (!number || number.length < 8) throw new Error("Invalid number");
    if (!text || text.length > 4000) throw new Error("Message must be 1–4000 characters");
    return { number, text };
  })
  .handler(async ({ context, data }) => {
    await requireAdmin(context as unknown as Ctx);
    const { sendAndRecord } = await import("./webhook-processor.server");
    try {
      const r = await sendAndRecord({ to: data.number, text: data.text });
      return { ok: true as const, messageId: r.messageId };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Inbox reply failed:", msg);
      const windowClosed = /131047|24 hours|re-engagement/i.test(msg);
      return { ok: false as const, error: windowClosed ? "This customer last wrote more than 24 hours ago, so WhatsApp only allows an approved template message." : "WhatsApp did not accept the message. Please try again." };
    }
  });
