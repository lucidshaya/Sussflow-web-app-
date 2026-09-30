import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect } from "react";
import { z } from "zod";

import { glassCard } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/format";
import { verifyPayment } from "@/functions/payments";

export const Route = createFileRoute("/_site/checkout/callback")({
  validateSearch: z.object({ reference: z.string().optional(), trxref: z.string().optional() }),
  head: () => ({ meta: [{ title: "Payment status | Sussflow" }] }),
  component: CallbackPage,
});

function CallbackPage() {
  const search = Route.useSearch();
  const reference = search.reference ?? search.trxref;
  const verify = useServerFn(verifyPayment);
  const { clear } = useCart();

  const result = useQuery({
    queryKey: ["verify-payment", reference],
    enabled: Boolean(reference),
    retry: 1,
    queryFn: () => verify({ data: { reference: reference ?? "" } }),
  });

  useEffect(() => {
    if (result.data?.ok) clear();
  }, [result.data?.ok, clear]);

  return (
    <section className="mx-auto max-w-2xl px-5 py-12">
      <div className={`${glassCard} p-8 text-center md:p-12`}>
        {!reference ? (
          <Status
            icon={<XCircle className="size-12 text-alert" />}
            title="No payment reference"
            body="We couldn't find a payment to confirm."
          />
        ) : result.isLoading ? (
          <Status
            icon={<Loader2 className="size-12 animate-spin text-brand" />}
            title="Confirming your payment…"
            body="This only takes a moment."
          />
        ) : result.error || !result.data?.ok ? (
          <Status
            icon={<XCircle className="size-12 text-alert" />}
            title="Payment not confirmed"
            body={
              result.data?.reason ??
              result.error?.message ??
              "Something went wrong. If you were charged, contact us with your reference."
            }
          />
        ) : (
          <>
            <Status
              icon={<CheckCircle2 className="size-12 text-leaf" />}
              title="Thank you — your order is confirmed!"
              body={`A receipt has been sent to ${result.data.order?.email ?? "your email"}.`}
            />
            {result.data.order && (
              <div className="mt-6 rounded-2xl border border-glass-border bg-glass-soft p-5 text-left text-sm">
                <p className="flex justify-between">
                  <span className="text-foreground/60">Reference</span>
                  <span className="font-semibold">{result.data.order.reference}</span>
                </p>
                <ul className="mt-3 space-y-1 border-t border-foreground/10 pt-3">
                  {(
                    result.data.order.order_items as {
                      product_name: string;
                      variant_label: string | null;
                      quantity: number;
                      unit_price: number;
                    }[]
                  ).map((item, i) => (
                    <li key={i} className="flex justify-between gap-3">
                      <span>
                        {item.product_name}
                        {item.variant_label ? ` (${item.variant_label})` : ""} × {item.quantity}
                      </span>
                      <span>{formatNaira(item.unit_price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex justify-between border-t border-foreground/10 pt-3 font-semibold">
                  <span>Total paid</span>
                  <span>{formatNaira(result.data.order.total as number)}</span>
                </p>
                <p className="mt-3 text-xs text-foreground/60">
                  {result.data.order.fulfilment === "pickup"
                    ? "We'll contact you when your order is ready for pickup in Lagos."
                    : "Our team will share your delivery details shortly."}
                </p>
              </div>
            )}
          </>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/shop">Continue shopping</Link>
          </Button>
          {result.data?.order ? (
            <Button asChild variant="glass">
              <Link
                to="/track"
                search={{
                  ref: result.data.order.reference as string,
                  email: result.data.order.email as string,
                }}
              >
                Track your order
              </Link>
            </Button>
          ) : (
            <Button asChild variant="glass">
              <Link to="/account">My orders</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function Status({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <>
      <div className="flex justify-center">{icon}</div>
      <h1 className="mt-4 font-display text-3xl font-semibold">{title}</h1>
      <p className="mt-2 text-foreground/65">{body}</p>
    </>
  );
}
