import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { fieldClass, glassCard, Logo, SetupNotice } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { emailSchema, nameSchema } from "@/lib/validation";

export const Route = createFileRoute("/_site/auth")({
  validateSearch: z.object({
    redirect: z.string().optional(),
    mode: z.enum(["signin", "signup", "reset"]).optional(),
  }),
  head: () => ({ meta: [{ title: "Sign in | Sussflow" }] }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">(search.mode ?? "signin");
  const [busy, setBusy] = useState(false);

  const redirectTo =
    search.redirect && search.redirect.startsWith("/") ? search.redirect : "/account";

  useEffect(() => {
    if (!loading && user) void navigate({ to: redirectTo });
  }, [loading, user, navigate, redirectTo]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (mode === "signup") {
      const check = z
        .object({ fullName: nameSchema, email: emailSchema })
        .safeParse({ fullName: form.get("fullName") ?? "", email });
      if (!check.success) {
        toast.error(check.error.issues[0]?.message ?? "Please check your details");
        return;
      }
      if (password.length < 8) {
        toast.error("Use a password of at least 8 characters");
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      } else if (mode === "signup") {
        const fullName = String(form.get("fullName") ?? "").trim();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/account`,
          },
        });
        if (error) throw error;
        if (!data.session) toast.success("Check your email to confirm your account.");
        else toast.success("Account created!");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent — check your email.");
        setMode("signin");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-5 py-12">
      <div className={`${glassCard} p-8`}>
        <Logo className="mx-auto h-10" />
        {!isSupabaseConfigured ? (
          <div className="mt-6">
            <SetupNotice what="accounts" />
          </div>
        ) : (
          <>
            {mode !== "reset" && (
              <div className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-glass-border bg-glass-soft p-1 text-sm font-semibold">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={cn(
                      "rounded-full py-2 transition-colors",
                      mode === m ? "bg-primary text-primary-foreground" : "hover:text-brand",
                    )}
                  >
                    {m === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>
            )}
            <h1 className="mt-6 font-display text-2xl font-semibold">
              {mode === "signin"
                ? "Welcome back"
                : mode === "signup"
                  ? "Join Sussflow"
                  : "Reset your password"}
            </h1>
            <p className="mt-1 text-sm text-foreground/60">
              {mode === "signup"
                ? "Save your details and track your orders."
                : mode === "reset"
                  ? "We'll email you a reset link."
                  : "Sign in to view your orders."}
            </p>
            <form onSubmit={submit} className="mt-5 space-y-3">
              {mode === "signup" && (
                <input
                  name="fullName"
                  required
                  placeholder="Full name"
                  className={fieldClass}
                  autoComplete="name"
                />
              )}
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className={fieldClass}
                autoComplete="email"
              />
              {mode !== "reset" && (
                <input
                  name="password"
                  type="password"
                  required
                  minLength={mode === "signup" ? 8 : 6}
                  placeholder="Password"
                  className={fieldClass}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              )}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy
                  ? "Please wait…"
                  : mode === "signin"
                    ? "Sign in"
                    : mode === "signup"
                      ? "Create account"
                      : "Send reset link"}
              </Button>
            </form>
            <button
              type="button"
              onClick={() => setMode(mode === "reset" ? "signin" : "reset")}
              className="mt-4 text-sm font-semibold text-brand hover:underline"
            >
              {mode === "reset" ? "← Back to sign in" : "Forgot your password?"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
