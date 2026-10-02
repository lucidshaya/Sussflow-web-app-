import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { glassCard } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { unsubscribeEmail } from "@/functions/newsletter";
import { privatePage } from "@/lib/seo";
import { readableError } from "@/lib/validation";

export const Route = createFileRoute("/_site/unsubscribe")({
  validateSearch: z.object({ e: z.string().optional(), t: z.string().optional() }),
  head: () => privatePage("Unsubscribe | Sussflow"),
  component: Unsubscribe,
});

// A button (not an automatic unsubscribe on page load) so email link scanners can't
// unsubscribe people by opening the link.
function Unsubscribe() {
  const { e: email, t: token } = Route.useSearch();
  const run = useServerFn(unsubscribeEmail);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="mx-auto max-w-md px-5 py-16">
      <div className={`${glassCard} p-8 text-center`}>
        {state === "done" ? (
          <>
            <Check className="mx-auto size-8 text-leaf" />
            <h1 className="mt-3 font-display text-2xl font-semibold">You're unsubscribed</h1>
            <p className="mt-2 text-sm text-foreground/65">
              We won't email {email} again. You can rejoin any time from the bottom of our website.
            </p>
          </>
        ) : !email || !token ? (
          <>
            <h1 className="font-display text-2xl font-semibold">Unsubscribe</h1>
            <p className="mt-2 text-sm text-foreground/65">
              Use the unsubscribe link at the bottom of one of our emails.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold">
              Unsubscribe from Sussflow emails?
            </h1>
            <p className="mt-2 break-all text-sm text-foreground/65">{email}</p>
            {error && (
              <p role="alert" className="mt-3 text-sm font-medium text-alert">
                {error}
              </p>
            )}
            <Button
              className="mt-6"
              disabled={state === "busy"}
              onClick={async () => {
                setState("busy");
                setError(null);
                try {
                  await run({ data: { email, token } });
                  setState("done");
                } catch (err) {
                  setError(readableError(err));
                  setState("idle");
                }
              }}
            >
              {state === "busy" && <Loader2 className="size-4 animate-spin" />} Unsubscribe
            </Button>
          </>
        )}
        <p className="mt-6 text-sm">
          <Link to="/" className="font-semibold text-brand hover:underline">
            Back to Sussflow
          </Link>
        </p>
      </div>
    </section>
  );
}
