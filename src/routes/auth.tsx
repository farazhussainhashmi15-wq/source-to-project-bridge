import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Karachi Business Growth Inbox" },
      { name: "description", content: "Sign in to the Karachi Business Growth WhatsApp inbox." },
      { property: "og:title", content: "Sign in — Karachi Business Growth Inbox" },
      { property: "og:description", content: "Sign in to the WhatsApp inbox." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/inbox" });
    });
    const { data } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_IN" && s) navigate({ to: "/inbox" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
    setBusy(false);
    if (res.error) setMsg(res.error.message);
    else if (mode === "up" && !res.data.session) setMsg("Check your email to confirm your account, then sign in.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6">
        <h1 className="text-xl font-semibold text-foreground">WhatsApp inbox</h1>
        <p className="text-sm text-muted-foreground">Sign in with the business email to read and reply to customers.</p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" })}
        >
          Continue with Google
        </Button>
        <form onSubmit={submit} className="space-y-3">
          <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "in" ? "Sign in" : "Create account"}
          </Button>
        </form>
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <button type="button" className="text-sm text-primary underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "No account yet? Create one" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
