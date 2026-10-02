import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Subtotal + delivery = total, shown the same way at checkout, confirmation and tracking. */
export function OrderTotals({
  subtotal,
  deliveryFee,
  total,
  fulfilment,
  totalLabel = "Total",
  deliveryLabel,
  pointsDiscount = 0,
  deliveryText,
  emphasise = false,
  className,
}: {
  subtotal: number;
  deliveryFee: number;
  total: number;
  fulfilment: "delivery" | "pickup";
  totalLabel?: string;
  /** e.g. "Delivery fee (South-West waybill)"; defaults to "Delivery fee". */
  deliveryLabel?: string;
  /** Shown instead of the fee amount, e.g. "Choose your area" before a Lagos area is picked. */
  deliveryText?: string | undefined;
  /** Kobo taken off by points (rewards). */
  pointsDiscount?: number;
  emphasise?: boolean;
  className?: string;
}) {
  return (
    <dl className={cn("space-y-2 text-sm", className)}>
      <div className="flex justify-between">
        <dt className="text-foreground/65">Subtotal</dt>
        <dd className="font-semibold">{formatNaira(subtotal)}</dd>
      </div>
      {pointsDiscount > 0 && (
        <div className="flex justify-between text-leaf">
          <dt>Points discount</dt>
          <dd className="font-semibold">−{formatNaira(pointsDiscount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-foreground/65">
          {deliveryLabel ??
            (fulfilment === "pickup" ? "Delivery fee (Lagos pickup)" : "Delivery fee")}
        </dt>
        <dd className="font-semibold">{deliveryText ?? formatNaira(deliveryFee)}</dd>
      </div>
      <div className="flex justify-between border-t border-foreground/10 pt-3 text-base">
        <dt className="font-semibold">{totalLabel}</dt>
        <dd
          className={emphasise ? "font-display text-xl font-semibold text-brand" : "font-semibold"}
        >
          {formatNaira(total)}
        </dd>
      </div>
    </dl>
  );
}
