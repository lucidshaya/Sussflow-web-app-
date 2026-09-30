import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { fieldClass, glassCard, Logo, SetupNotice } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Admin sign in | Sussflow" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) void navigate({ to: "/admin" });
  }, [loading, user, isAdmin, navigate]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setBusy(false);
    if (error) toast.error(error.message);
  };

  return (
    <div className="page-atmosphere grid min-h-screen place-items-center px-4 py-10">
      <div className={`${glassCard} w-full max-w-md p-8`}>
        <Logo className="mx-auto h-10" />
        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-brand">
          <ShieldCheck className="size-4" /> Admin dashboard
        </div>
        {!isSupabaseConfigured ? (
          <div className="mt-6">
            <SetupNotice what="the dashboard" />
          </div>
        ) : user && !loading && !isAdmin ? (
          <div className="mt-6 space-y-4 text-center">
            <p className="text-sm text-foreground/70">
              <strong>{user.email}</strong> doesn't have admin access. Ask an existing admin to
              grant it from Settings, or see the README for creating the first admin.
            </p>
            <Button variant="glass" onClick={() => void signOut()}>
              Sign in with another account
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              name="email"
              type="email"
              required
              placeholder="Admin email"
              className={fieldClass}
              autoComplete="email"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              className={fieldClass}
              autoComplete="current-password"
            />
            <Button type="submit" className="w-full" disabled={busy || loading}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
            <Link
              to="/auth"
              search={{ mode: "reset" }}
              className="block text-center text-sm font-semibold text-foreground/60 hover:text-brand"
            >
              Forgot your password?
            </Link>
          </form>
        )}
        <Link
          to="/"
          className="mt-6 block text-center text-sm font-semibold text-foreground/60 hover:text-brand"
        >
          ← Back to store
        </Link>
      </div>
    </div>
  );
}
