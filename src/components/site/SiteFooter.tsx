import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { joinWaitlist as joinWaitlistFn } from "@/functions/enquiries";
import { isSupabaseConfigured } from "@/lib/supabase";
import { readableError, waitlistSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";

import { FieldError, glassCard, invalidField, Logo } from "./primitives";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { to: "/shop", label: "All products" },
      {
        to: "/products/$slug",
        params: { slug: "reusable-menstrual-pads" },
        label: "Reusable pads",
      },
      { to: "/products/$slug", params: { slug: "menstrual-cup" }, label: "Menstrual cup" },
      { to: "/products/$slug", params: { slug: "period-underwear" }, label: "Period underwear" },
      { to: "/bundles", label: "Bundles" },
    ],
  },
  {
    title: "Learn",
    links: [
      { to: "/find-your-fit", label: "Find your fit" },
      { to: "/faq", label: "FAQs" },
      { to: "/education", label: "Menstrual health education" },
      { to: "/about", label: "About Sussflow" },
    ],
  },
  {
    title: "Help",
    links: [
      { to: "/store-location", label: "Lagos pickup & delivery" },
      { to: "/education", label: "Partner with us" },
      { to: "/account", label: "My account" },
      { to: "/cart", label: "Bag" },
    ],
  },
] as const;

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);
  const join = useServerFn(joinWaitlistFn);

  const joinWaitlist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error("Supabase is not configured yet.");
      return;
    }
    const result = waitlistSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message);
      return;
    }
    setBusy(true);
    try {
      await join({ data: { email } });
      setJoined(true);
    } catch (err) {
      setError(readableError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="pt-10">
      <div className="mx-auto max-w-7xl px-5 pb-10">
        <div className={`${glassCard} p-7 md:p-10`}>
          <div className="flex flex-col justify-between gap-8 border-b border-foreground/10 pb-8 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Coming soon: more stores near you
              </h2>
              <p className="mt-1 max-w-lg text-sm text-foreground/60">
                We're bringing reusable period care closer to you. Join the waitlist to hear when
                Sussflow lands in a store near you.
              </p>
            </div>
            {joined ? (
              <p className="flex items-center gap-2 font-semibold text-brand">
                <Check className="size-5" /> You're on the list.
              </p>
            ) : (
              <form onSubmit={joinWaitlist} noValidate className="w-full md:w-auto">
                <div className="flex gap-2">
                  <label htmlFor="footer-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="footer-email"
                    required
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    maxLength={254}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(undefined);
                    }}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "footer-email-error" : undefined}
                    placeholder="you@email.com"
                    className={cn(
                      "min-w-0 flex-1 rounded-full border border-glass-border bg-glass px-4 py-2.5 text-sm outline-none focus:border-brand md:w-64",
                      error && invalidField,
                    )}
                  />
                  <Button type="submit" disabled={busy}>
                    Join the waitlist
                  </Button>
                </div>
                <FieldError id="footer-email-error" message={error} />
              </form>
            )}
          </div>
          <div className="grid gap-8 pt-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div>
              <Logo className="h-9" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-foreground/60">
                Smart menstrual choices for confidence, health &amp; everyday life. Based in Lagos,
                serving customers nationwide.
              </p>
            </div>
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="text-xs font-semibold uppercase text-brand">{column.title}</p>
                <ul className="mt-3 space-y-2 text-sm text-foreground/70">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {"params" in link ? (
                        <Link
                          to="/products/$slug"
                          params={link.params}
                          className="hover:text-brand"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <Link to={link.to} className="hover:text-brand">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Giant wordmark band */}
      <div className="overflow-hidden bg-brand text-primary-foreground">
        <div className="mx-auto max-w-[1500px] px-5">
          <p
            aria-hidden="true"
            className="font-statement select-none whitespace-nowrap pt-6 text-[clamp(5rem,22vw,21rem)] leading-[0.8] tracking-[-0.05em]"
          >
            sussflow<span className="text-leaf">.</span>
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-primary-foreground/25 py-5 text-xs text-primary-foreground/75">
            <span>
              © {new Date().getFullYear()} Sussflow Reusable Nigeria Limited · Lagos, Nigeria
            </span>
            <span>Choose reusable. Choose informed. Choose what works for you.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
