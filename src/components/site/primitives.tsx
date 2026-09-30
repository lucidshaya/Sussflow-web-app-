import type { ReactNode } from "react";

import lockup from "@/assets/sussflow-lockup.png";
import { cn } from "@/lib/utils";

export const glassCard =
  "rounded-[28px] border border-glass-border bg-glass shadow-glass backdrop-blur-xl";
export const glassPanel =
  "rounded-3xl border border-glass-border bg-glass shadow-glass backdrop-blur-xl";
export const fieldClass =
  "w-full rounded-2xl border border-glass-border bg-glass px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-foreground/40 focus:border-brand disabled:opacity-60";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={lockup}
      alt="Sussflow"
      width={655}
      height={120}
      className={cn("h-8 w-auto", className)}
    />
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-wide text-brand", className)}>
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
        {title}
      </h2>
      {children && <div className="mt-3 leading-relaxed text-foreground/70">{children}</div>}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-8">
      <div className={cn(glassCard, "relative overflow-hidden p-6 sm:p-8 md:p-12")}>
        <div
          className="absolute -right-16 -top-20 size-72 rounded-full bg-lilac/50 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 left-10 size-56 rounded-full bg-leaf/15 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative max-w-3xl">
          <span className="inline-flex rounded-full border border-glass-border bg-glass px-3 py-1 text-xs font-semibold text-brand">
            {eyebrow}
          </span>
          <h1 className="font-statement mt-4 text-[2.5rem] leading-[0.95] sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {children && (
            <div className="mt-4 text-[15px] leading-relaxed text-foreground/70 sm:text-base md:text-lg">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function SetupNotice({ what = "the catalogue" }: { what?: string }) {
  return (
    <div className={cn(glassPanel, "p-6 text-sm leading-relaxed")}>
      <p className="font-semibold text-brand">Connect Supabase to load {what}</p>
      <p className="mt-1 text-foreground/70">
        Add <code className="rounded bg-glass-soft px-1">VITE_SUPABASE_URL</code> and{" "}
        <code className="rounded bg-glass-soft px-1">VITE_SUPABASE_ANON_KEY</code> to{" "}
        <code className="rounded bg-glass-soft px-1">.env</code>, run the SQL in{" "}
        <code className="rounded bg-glass-soft px-1">supabase/migrations</code>, then restart the
        dev server.
      </p>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className={cn(glassPanel, "p-10 text-center")}>
      <p className="font-display text-xl font-semibold">{title}</p>
      {children && <div className="mt-2 text-sm text-foreground/60">{children}</div>}
    </div>
  );
}

export const invalidField = "border-alert/60 bg-alert/5 focus:border-alert";

export function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <span id={id} role="alert" className="mt-1 block text-xs font-medium text-alert">
      {message}
    </span>
  );
}
