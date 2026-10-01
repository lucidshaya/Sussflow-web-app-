import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { OrderStatusBadge } from "@/components/site/OrderStatusBadge";
import { OrderTimeline } from "@/components/site/OrderTimeline";
import { EmptyState, glassCard } from "@/components/site/primitives";
import { useAuth } from "@/lib/auth";
import { formatDate, formatNaira } from "@/lib/format";
import { settingsQuery } from "@/lib/queries";
import { supabase, unwrap } from "@/lib/supabase";
import type { OrderWithItems } from "@/lib/types";
import { whatsappHref } from "@/lib/whatsapp";
import { privatePage } from "@/lib/seo";

export const Route = createFileRoute("/_site/account/orders/$id")({
  head: () => privatePage("Order details | Sussflow"),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const order = useQuery({
    queryKey: ["my-order", id],
    enabled: Boolean(user),
    queryFn: async () =>
      unwrap<OrderWithItems | null>(
        await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle(),
      ),
  });
  const { data: settings } = useQuery(settingsQuery);
  const chat = whatsappHref(settings?.whatsapp_url, settings?.contact_phone);

  return (
    <section className="mx-auto max-w-3xl px-5 py-10">
      <Link
        to="/account"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 hover:text-brand"
      >
        <ChevronLeft className="size-4" /> My account
      </Link>
      {!user ? (
        <EmptyState title="Please sign in to view this order" />
      ) : order.isLoading ? (
        <div className={`${glassCard} h-64 animate-pulse`} />
      ) : !order.data ? (
        <EmptyState title="Order not found" />
      ) : (
        <div className={`${glassCard} p-7`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold">{order.data.reference}</h1>
              <p className="text-sm text-foreground/60">{formatDate(order.data.created_at)}</p>
            </div>
            <OrderStatusBadge status={order.data.status} fulfilment={order.data.fulfilment} />
          </div>
          <div className="mt-6 rounded-3xl border border-glass-border bg-glass-soft p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase text-foreground/55">
              {order.data.fulfilment === "pickup" ? "Pickup progress" : "Delivery progress"}
            </h2>
            <OrderTimeline order={order.data} />
          </div>
          <ul className="mt-6 divide-y divide-foreground/10 text-sm">
            {order.data.order_items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 py-3">
                <span>
                  <span className="font-semibold">{item.product_name}</span>
                  {item.variant_label && (
                    <span className="text-foreground/60"> · {item.variant_label}</span>
                  )}{" "}
                  × {item.quantity}
                </span>
                <span className="font-semibold">
                  {formatNaira(item.unit_price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t border-foreground/10 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground/60">Subtotal</dt>
              <dd>{formatNaira(order.data.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground/60">
                {order.data.fulfilment === "pickup"
                  ? "Delivery fee (Lagos pickup)"
                  : "Delivery fee"}
              </dt>
              <dd>{formatNaira(order.data.delivery_fee)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatNaira(order.data.total)}</dd>
            </div>
          </dl>
          {order.data.fulfilment === "pickup" && (
            <div className="mt-5 rounded-2xl border border-glass-border bg-glass-soft p-4 text-sm">
              <strong className="block">Pickup point</strong>
              {settings?.pickup_address ?? "Lagos"}
              {settings?.pickup_instructions && (
                <span className="mt-1 block text-foreground/65">
                  {settings.pickup_instructions}
                </span>
              )}
              <span className="mt-1 block text-foreground/65">
                We'll contact you when your order is ready to collect.
                {chat && (
                  <>
                    {" "}
                    <a
                      href={chat}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-brand underline"
                    >
                      Message us on WhatsApp
                    </a>
                  </>
                )}
              </span>
            </div>
          )}
          {order.data.fulfilment === "delivery" && (
            <p className="mt-5 rounded-2xl border border-glass-border bg-glass-soft p-4 text-sm">
              <strong className="block">Delivering to</strong>
              {[order.data.address, order.data.city, order.data.state].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
