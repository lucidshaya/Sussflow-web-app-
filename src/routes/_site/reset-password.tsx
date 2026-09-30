import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KeyRound, Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { FormField } from "@/components/site/FormField";
import { glassCard, Logo } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { newPasswordSchema, toFieldErrors, type FieldErrors } from "@/lib/validation";

export const Route = createFileRoute("/_site/reset-password")({
  head: () => ({ meta: [{ title: "Choose a new password | Sussflow" }, { name: "robots", content: "noindex" }] }),
  component: ResetPasswordPage,
});

type Stage = "checking" | "ready" | "invalid" | "done";

/**
 * Landing page for the "reset password" email. Supabase signs the person in from the link
 * (hash tokens, or a `?code=` in PKCE mode); we then let them set a new password.
 */
function ResetPasswordPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [stage, setStage] = useState<Stage>("checking");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [values, setValues] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let settled = false;
    const ready = () => {
      settled = true;
      setStage((s) => (s === "checking" ? "ready" : s));
    };
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    const error = hash.get("error_description") ?? query.get("error_description");
    if (error) {
      setLinkError(error.replace(/\+/g, " "));
      setStage("invalid");
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN")) ready();
    });
    const code = query.get("code");
    void (async () => {
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setLinkError(exchangeError.message);
          setStage("invalid");
          return;
        }
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) ready();
    })();
    // No session appears → the link was already used, expired or opened on another device.
    const timer = window.setTimeout(() => {
      if (!settled) setStage((s) => (s === "checking" ? "invalid" : s));
    }, 4000);
    return () => {
      sub.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = newPasswordSchema.safeParse(values);
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: result.data.password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Remove tokens from the address bar.
    window.history.replaceState(null, "", window.location.pathname);
    setStage("done");
    toast.success("Password updated. You're signed in.");
  };

  const field = (key: keyof typeof values) => ({
    name: key,
    value: values[key],
    error: errors[key],
    onChange: (value: string) => {
      setValues((v) => ({ ...v, [key]: value }));
      if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    },
  });

  return (
    <section className="mx-auto max-w-md px-5 py-12">
      <div className={`${glassCard} p-8`}>
        <Logo className="mx-auto h-10" />
        {stage === "checking" && (
          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-foreground/65">
            <Loader2 className="size-4 animate-spin" /> Checking your reset link…
          </p>
        )}
        {stage === "invalid" && (
          <div className="mt-8 text-center">
            <h1 className="font-display text-2xl font-semibold">This link has expired</h1>
            <p className="mt-2 text-sm text-foreground/65">
              {linkError ??
                "Reset links work once and expire after a short time. Request a new one and open it on this device."}
            </p>
            <Button asChild className="mt-6">
              <Link to="/auth" search={{ mode: "reset" }}>
                Send a new reset link
              </Link>
            </Button>
          </div>
        )}
        {stage === "ready" && (
          <form onSubmit={submit} noValidate className="mt-8 space-y-4">
            <div className="text-center">
              <KeyRound className="mx-auto size-7 text-brand" />
              <h1 className="mt-2 font-display text-2xl font-semibold">Choose a new password</h1>
              <p className="mt-1 text-sm text-foreground/60">At least 8 characters.</p>
            </div>
            <FormField
              {...field("password")}
              label="New password"
              type="password"
              autoComplete="new-password"
              maxLength={72}
              required
            />
            <FormField
              {...field("confirm")}
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              maxLength={72}
              required
            />
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Saving…" : "Save new password"}
            </Button>
          </form>
        )}
        {stage === "done" && (
          <div className="mt-8 text-center">
            <h1 className="font-display text-2xl font-semibold">Password updated</h1>
            <p className="mt-2 text-sm text-foreground/65">You're signed in with your new password.</p>
            <Button
              className="mt-6"
              onClick={() => void navigate({ to: isAdmin ? "/admin" : "/account" })}
            >
              {isAdmin ? "Go to the dashboard" : "Go to my account"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
