import { statusLabel } from "@/lib/order-flow";
import type { Fulfilment, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<OrderStatus, string> = {
  pending: "border-foreground/15 bg-glass-soft text-foreground/70",
  paid: "border-leaf/40 bg-leaf/15 text-[oklch(0.45_0.14_144)]",
  processing: "border-brand/30 bg-brand/10 text-brand",
  shipped: "border-brand/40 bg-lilac/40 text-brand",
  delivered: "border-leaf/50 bg-leaf/25 text-[oklch(0.4_0.13_144)]",
  cancelled: "border-foreground/20 bg-foreground/5 text-foreground/55",
  failed: "border-alert/30 bg-alert/10 text-alert",
};

export function OrderStatusBadge({
  status,
  fulfilment = "delivery",
}: {
  status: OrderStatus;
  fulfilment?: Fulfilment;
}) {
  return (
    <span
      className={cn(
        "inline-flex self-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STYLES[status],
      )}
    >
      {statusLabel(status, fulfilment)}
    </span>
  );
}
