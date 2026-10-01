import { formatNaira } from "./format";
import type { Settings } from "./types";

// Delivery fees are set in Admin → Settings (kobo) and added to the order total at checkout.
type FeeSettings = Pick<Settings, "lagos_delivery_fee" | "nationwide_delivery_fee">;

export const isLagosState = (state: string | null | undefined) =>
  (state ?? "").toLowerCase().includes("lagos");

/** The fee charged at checkout. Used by both the checkout page and the payment server function. */
export function deliveryFeeFor(
  settings: FeeSettings | null | undefined,
  order: { fulfilment: "delivery" | "pickup"; state: string | null | undefined },
) {
  if (order.fulfilment !== "delivery" || !settings) return 0;
  return isLagosState(order.state) ? settings.lagos_delivery_fee : settings.nationwide_delivery_fee;
}

/** Customer-facing summary of the current delivery fees. */
export function deliveryRates(settings: FeeSettings | null | undefined) {
  if (!settings) return [];
  return [
    { label: "Delivery fee within Lagos", value: formatNaira(settings.lagos_delivery_fee) },
    { label: "Delivery fee outside Lagos", value: formatNaira(settings.nationwide_delivery_fee) },
    { label: "Lagos pickup", value: formatNaira(0) },
  ];
}
