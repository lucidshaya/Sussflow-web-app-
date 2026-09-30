import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { joinWaitlist as joinWaitlistFn } from "@/functions/enquiries";
import { settingsQuery } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";
import { readableError, waitlistSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { whatsappHref } from "@/lib/whatsapp";

import { FieldError, glassCard, invalidField, Logo } from "./primitives";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { to: "/shop", label: "All products" },
      { to: "/deals", label: "Website deals" },
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
              <h2 className="font-display text-2xl font-semibold">Join the Sussflow list</h2>
              <p className="mt-1 max-w-lg text-sm text-foreground/60">
                Be first to hear about website-only deals, period tips and new Sussflow stores near
                you. No spam, unsubscribe any time.
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
                    Sign up
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
              <SocialLinks />
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
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-primary-foreground/25 pb-24 pt-5 text-xs sm:pb-5 text-primary-foreground/75">
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

// Simple-icons style glyphs (brand icons aren't in lucide).
const SOCIAL_PATHS = {
  Instagram:
    "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.38A5.86 5.86 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.12a5.86 5.86 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 0 0 2.12-1.38 5.86 5.86 0 0 0 1.38-2.12c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.96s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.38-2.12A5.86 5.86 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z",
  TikTok:
    "M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z",
  Facebook:
    "M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07",
  WhatsApp:
    "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.43 9.43 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.44 9.45-9.44 2.52 0 4.89.99 6.67 2.77a9.37 9.37 0 0 1 2.76 6.68c0 5.21-4.24 9.44-9.45 9.44m8.04-17.48A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.68 12.06c0 2 .52 3.96 1.52 5.68L.58 23.62l6.01-1.58a11.34 11.34 0 0 0 5.45 1.39h.01c6.26 0 11.36-5.1 11.36-11.36 0-3.03-1.18-5.89-3.33-8.03",
} as const;

/** Social icons for whichever links are filled in under Admin → Settings. */
function SocialLinks() {
  const { data: settings } = useQuery(settingsQuery);
  const links = (
    [
      ["Instagram", settings?.instagram_url],
      ["TikTok", settings?.tiktok_url],
      ["Facebook", settings?.facebook_url],
      ["WhatsApp", whatsappHref(settings?.whatsapp_url, settings?.contact_phone)],
    ] as const
  ).filter((entry): entry is readonly [keyof typeof SOCIAL_PATHS, string] => Boolean(entry[1]));
  if (!links.length) return null;
  return (
    <ul className="mt-5 flex gap-2">
      {links.map(([name, href]) => (
        <li key={name}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Sussflow on ${name}`}
            className="grid size-10 place-items-center rounded-full border border-glass-border bg-glass-soft text-foreground/70 transition hover:-translate-y-0.5 hover:border-brand/40 hover:text-brand"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-[18px]">
              <path d={SOCIAL_PATHS[name]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
