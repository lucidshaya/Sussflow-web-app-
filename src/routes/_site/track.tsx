import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";

import { FormField, focusFirstError } from "@/components/site/FormField";
import { OrderStatusBadge } from "@/components/site/OrderStatusBadge";
import { OrderTimeline } from "@/components/site/OrderTimeline";
import { glassCard, PageHero } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { trackOrder, type TrackedOrder } from "@/functions/orders";
import { formatDate, formatNaira } from "@/lib/format";
import { settingsQuery } from "@/lib/queries";
import { readableError, toFieldErrors, trackOrderSchema, type FieldErrors } from "@/lib/validation";
import { whatsappHref } from "@/lib/whatsapp";

export const Route = createFileRoute("/_site/track")({
  validateSearch: z.object({ ref: z.string().optional(), email: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Track your order | Sussflow" },
      { name: "description", content: "Follow your Sussflow order from payment to delivery." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const search = Route.useSearch();
  const lookup = useServerFn(trackOrder);
  const [values, setValues] = useState({ reference: search.ref ?? "", email: search.email ?? "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const find = async (input: typeof values) => {
    const result = trackOrderSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors = toFieldErrors(result.error);
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
      return;
    }
    setBusy(true);
    setNotFound(null);
    try {
      setOrder(await lookup({ data: result.data }));
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch (error) {
      setOrder(null);
      setNotFound(readableError(error));
    } finally {
      setBusy(false);
    }
  };

  // Links from the order confirmation page arrive with both details filled in.
  useEffect(() => {
    if (search.ref && search.email) void find({ reference: search.ref, email: search.email });
    // Run once for the initial link only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <>
      <PageHero eyebrow="Track your order" title="Where's my order?">
        Enter the order number from your receipt and the email you used at checkout. No account
        needed.
      </PageHero>
      <section className="mx-auto max-w-3xl px-5 py-8">
        <form
          noValidate
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void find(values);
          }}
          className={`${glassCard} grid gap-3 p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-start sm:p-7`}
        >
          <FormField
            {...field("reference")}
            label="Order number"
            placeholder="SF-MUNPVKUX-42ED75"
            autoComplete="off"
            maxLength={40}
            inputClassName="uppercase placeholder:normal-case"
          />
          <FormField
            {...field("email")}
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={254}
          />
          <Button type="submit" disabled={busy} className="sm:mt-5">
            {busy ? "Finding…" : "Track order"}
          </Button>
          {notFound && (
            <p role="alert" className="text-sm font-medium text-alert sm:col-span-3">
              {notFound}
            </p>
          )}
        </form>

        <div ref={resultRef} className="scroll-mt-28">
          {order && <TrackedOrderCard order={order} />}
        </div>
      </section>
    </>
  );
}

function TrackedOrderCard({ order }: { order: TrackedOrder }) {
  const { data: settings } = useQuery(settingsQuery);
  const chat = whatsappHref(settings?.whatsapp_url, settings?.contact_phone);

  return (
    <div className={`${glassCard} mt-6 p-6 sm:p-7`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">{order.reference}</h2>
          <p className="text-sm text-foreground/60">Placed {formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} fulfilment={order.fulfilment} />
      </div>

      <div className="mt-6 rounded-3xl border border-glass-border bg-glass-soft p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase text-foreground/55">
          {order.fulfilment === "pickup" ? "Pickup progress" : "Delivery progress"}
        </h3>
        <OrderTimeline order={order} />
      </div>

      <ul className="mt-6 divide-y divide-foreground/10 text-sm">
        {order.items.map((item, i) => (
          <li key={i} className="flex justify-between gap-3 py-3">
            <span>
              <span className="font-semibold">{item.product_name}</span>
              {item.variant_label && (
                <span className="text-foreground/60"> · {item.variant_label}</span>
              )}{" "}
              × {item.quantity}
            </span>
            <span className="font-semibold">{formatNaira(item.unit_price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="flex justify-between border-t border-foreground/10 pt-3 text-base font-semibold">
        <span>Total</span>
        <span>{formatNaira(order.total)}</span>
      </p>

      <p className="mt-5 rounded-2xl border border-glass-border bg-glass-soft p-4 text-sm text-foreground/70">
        {order.fulfilment === "pickup" ? (
          <>
            <strong className="block text-foreground">Pickup point</strong>
            {settings?.pickup_address ?? "Lagos"}. We'll contact you when it's ready to collect.
          </>
        ) : (
          <>
            <strong className="block text-foreground">Delivering to</strong>
            {[order.city, order.state].filter(Boolean).join(", ") || "Your delivery address"}
          </>
        )}
        {chat && (
          <>
            {" "}
            <a
              href={chat}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-brand underline"
            >
              Questions? Message us on WhatsApp
            </a>
          </>
        )}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="glass">
          <Link to="/shop">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
