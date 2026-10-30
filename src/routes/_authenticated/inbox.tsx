import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { checkInboxAccess, getConversation, listConversations, sendReply } from "@/lib/whatsapp/inbox.functions";

export const Route = createFileRoute("/_authenticated/inbox")({
  head: () => ({
    meta: [
      { title: "WhatsApp Inbox — Karachi Business Growth" },
      { name: "description", content: "Review customer WhatsApp conversations and reply." },
      { property: "og:title", content: "WhatsApp Inbox — Karachi Business Growth" },
      { property: "og:description", content: "Review customer WhatsApp conversations and reply." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InboxPage,
});

function fmt(at: string) {
  if (!at) return "";
  return new Date(at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" });
}
function pretty(n: string) {
  return n.startsWith("92") ? `+92 ${n.slice(2, 5)} ${n.slice(5)}` : `+${n}`;
}

function InboxPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const access = useServerFn(checkInboxAccess);
  const list = useServerFn(listConversations);
  const getConv = useServerFn(getConversation);
  const send = useServerFn(sendReply);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const accessQ = useQuery({ queryKey: ["inbox-access"], queryFn: () => access() });
  const isAdmin = accessQ.data?.isAdmin === true;
  const convs = useQuery({ queryKey: ["convs"], queryFn: () => list(), enabled: isAdmin, refetchInterval: 15000 });
  const thread = useQuery({
    queryKey: ["thread", selected],
    queryFn: () => getConv({ data: { number: selected! } }),
    enabled: isAdmin && !!selected,
    refetchInterval: 8000,
  });

  useEffect(() => bottom.current?.scrollIntoView({ block: "end" }), [thread.data]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !draft.trim()) return;
    setSending(true);
    setError(null);
    const r = await send({ data: { number: selected, text: draft } }).catch((err: unknown) => ({ ok: false as const, error: err instanceof Error ? err.message : "Send failed" }));
    setSending(false);
    if (r.ok) setDraft("");
    else setError(r.error);
    qc.invalidateQueries({ queryKey: ["thread", selected] });
    qc.invalidateQueries({ queryKey: ["convs"] });
  }

  if (accessQ.isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!isAdmin)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <p className="max-w-sm text-foreground">This account can't open the inbox. Sign in with the business email karachibussinessgrowth@gmail.com.</p>
        <Button variant="outline" onClick={signOut}>Sign out</Button>
      </div>
    );

  const current = convs.data?.find((c) => c.number === selected);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="font-semibold">WhatsApp inbox</h1>
        <Button variant="ghost" size="sm" onClick={signOut}>Sign out</Button>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className={`${selected ? "hidden md:block" : "block"} w-full overflow-y-auto border-r border-border md:w-80`}>
          {convs.isLoading && <p className="p-4 text-sm text-muted-foreground">Loading conversations…</p>}
          {convs.error && <p className="p-4 text-sm text-destructive">{String(convs.error.message)}</p>}
          {convs.data?.length === 0 && <p className="p-4 text-sm text-muted-foreground">No messages yet. New customer messages will appear here.</p>}
          {convs.data?.map((c) => (
            <button
              key={c.number}
              onClick={() => { setSelected(c.number); setError(null); }}
              className={`block w-full border-b border-border px-4 py-3 text-left hover:bg-accent ${selected === c.number ? "bg-accent" : ""}`}
            >
              <div className="flex justify-between gap-2">
                <span className="truncate font-medium">{c.name ?? pretty(c.number)}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{fmt(c.lastAt)}</span>
              </div>
              <p className="truncate text-sm text-muted-foreground">{c.lastDirection === "out" ? "You: " : ""}{c.lastText}</p>
            </button>
          ))}
        </aside>
        <section className={`${selected ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}>
          {!selected ? (
            <div className="m-auto text-muted-foreground">Pick a conversation</div>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSelected(null)}>←</Button>
                <div>
                  <div className="font-medium">{current?.name ?? pretty(selected)}</div>
                  <div className="text-xs text-muted-foreground">{pretty(selected)}</div>
                </div>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto bg-muted/40 p-4">
                {thread.data?.map((m) => (
                  <div key={m.id} className={`flex ${m.direction === "out" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${m.direction === "out" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border border-border"}`}>
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      <p className="mt-1 text-[10px] opacity-70">{fmt(m.at)}{m.status ? ` · ${m.status}` : ""}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottom} />
              </div>
              <form onSubmit={onSend} className="flex gap-2 border-t border-border p-3">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a reply…"
                  rows={2}
                  className="resize-none"
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(e); } }}
                />
                <Button type="submit" disabled={sending || !draft.trim()}>{sending ? "Sending…" : "Send"}</Button>
              </form>
              {error && <p className="px-3 pb-3 text-sm text-destructive">{error}</p>}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
