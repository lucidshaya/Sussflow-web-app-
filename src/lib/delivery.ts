import { formatNaira } from "./format";
import type { Settings } from "./types";

// Delivery fees are set in Admin → Settings (kobo) and added to the order total at checkout:
// one fee within Lagos, and a waybill fee for each geopolitical zone.

export const DELIVERY_ZONES = [
  { id: "south_west", name: "South-West", states: ["Ogun", "Oyo", "Osun", "Ondo", "Ekiti"] },
  {
    id: "south_south",
    name: "South-South",
    states: ["Akwa Ibom", "Bayelsa", "Cross River", "Delta", "Edo", "Rivers"],
  },
  { id: "south_east", name: "South-East", states: ["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"] },
  {
    id: "north_central",
    name: "North-Central & Abuja",
    states: ["FCT - Abuja", "Benue", "Kogi", "Kwara", "Nasarawa", "Niger", "Plateau"],
  },
  {
    id: "north_east",
    name: "North-East",
    states: ["Adamawa", "Bauchi", "Borno", "Gombe", "Taraba", "Yobe"],
  },
  {
    id: "north_west",
    name: "North-West",
    states: ["Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Sokoto", "Zamfara"],
  },
] as const;

export type ZoneId = (typeof DELIVERY_ZONES)[number]["id"];

type FeeSettings = Pick<Settings, "lagos_delivery_fee" | "nationwide_delivery_fee"> & {
  zone_fees?: Partial<Record<ZoneId, number>> | null;
};

export const isLagosState = (state: string | null | undefined) =>
  (state ?? "").toLowerCase().includes("lagos");

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

/** The zone a state belongs to (Lagos has its own fee, so it returns null). */
export function zoneForState(state: string | null | undefined) {
  if (!state || isLagosState(state)) return null;
  const key = normalise(state);
  return (
    DELIVERY_ZONES.find((zone) =>
      zone.states.some(
        (s) => normalise(s) === key || (key.includes("abuja") && s.includes("Abuja")),
      ),
    ) ?? null
  );
}

/** A zone's waybill fee; falls back to the old single "outside Lagos" fee if unset. */
export function zoneFee(settings: FeeSettings, zone: ZoneId) {
  const fee = settings.zone_fees?.[zone];
  return typeof fee === "number" && Number.isFinite(fee) ? fee : settings.nationwide_delivery_fee;
}

/** The fee charged at checkout. Used by both the checkout page and the payment server function. */
export function deliveryFeeFor(
  settings: FeeSettings | null | undefined,
  order: { fulfilment: "delivery" | "pickup"; state: string | null | undefined },
) {
  if (order.fulfilment !== "delivery" || !settings) return 0;
  if (isLagosState(order.state)) return settings.lagos_delivery_fee;
  const zone = zoneForState(order.state);
  return zone ? zoneFee(settings, zone.id) : settings.nationwide_delivery_fee;
}

/** "Delivery fee (South-West waybill)" etc., for the checkout summary. */
export function deliveryFeeLabel(
  fulfilment: "delivery" | "pickup",
  state: string | null | undefined,
) {
  if (fulfilment === "pickup") return "Delivery fee (Lagos pickup)";
  if (isLagosState(state)) return "Delivery fee (within Lagos)";
  const zone = zoneForState(state);
  return zone ? `Delivery fee (${zone.name} waybill)` : "Delivery fee";
}

/** Customer-facing breakdown of the current delivery fees. */
export function deliveryRates(settings: FeeSettings | null | undefined) {
  if (!settings) return [];
  return [
    { label: "Within Lagos", value: formatNaira(settings.lagos_delivery_fee) },
    ...DELIVERY_ZONES.map((zone) => ({
      label: `${zone.name} (waybill)`,
      value: formatNaira(zoneFee(settings, zone.id)),
      hint: zone.states.join(", "),
    })),
    { label: "Lagos pickup", value: formatNaira(0) },
  ];
}
