import { formatNaira } from "./format";
import type { Settings } from "./types";

// Delivery fees are set in Admin → Settings (kobo). 0 means free delivery.
type FeeSettings = Pick<
  Settings,
  "lagos_delivery_fee" | "nationwide_delivery_fee" | "free_delivery_threshold"
>;

export const isLagosState = (state: string | null | undefined) =>
  (state ?? "").toLowerCase().includes("lagos");

/** The fee charged at checkout. Used by both the checkout page and the payment server function. */
export function deliveryFeeFor(
  settings: FeeSettings | null | undefined,
  order: { fulfilment: "delivery" | "pickup"; state: string | null | undefined; subtotal: number },
) {
  if (order.fulfilment !== "delivery" || !settings) return 0;
  if (
    settings.free_delivery_threshold != null &&
    order.subtotal >= settings.free_delivery_threshold
  )
    return 0;
  return isLagosState(order.state) ? settings.lagos_delivery_fee : settings.nationwide_delivery_fee;
}

/** How a delivery fee is shown to customers: the amount, or "Free" when it is ₦0. */
export const deliveryLabel = (fee: number) => (fee > 0 ? formatNaira(fee) : "Free");

/** Customer-facing summary of the current rates. */
export function deliveryRates(settings: FeeSettings | null | undefined) {
  if (!settings) return [];
  return [
    { label: "Lagos pickup", value: "Free" },
    { label: "Delivery within Lagos", value: deliveryLabel(settings.lagos_delivery_fee) },
    { label: "Delivery outside Lagos", value: deliveryLabel(settings.nationwide_delivery_fee) },
    ...(settings.free_delivery_threshold != null
      ? [
          {
            label: "Free delivery",
            value: `on orders of ${formatNaira(settings.free_delivery_threshold)} or more`,
          },
        ]
      : []),
  ];
}
