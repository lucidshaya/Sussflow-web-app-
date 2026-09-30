import type { Variant } from "./types";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** Format a kobo amount as Naira, e.g. 780000 → ₦7,800 */
export function formatNaira(kobo: number) {
  return naira.format(Math.round(kobo) / 100);
}

export function toKobo(naira: number) {
  return Math.round(naira * 100);
}

/** Products sold by the pair (period pants) rather than in "N-in-1" packs. */
const SOLD_IN_PAIRS = new Set(["period-underwear"]);

export function soldInPairs(productSlug: string | null | undefined) {
  return Boolean(productSlug && SOLD_IN_PAIRS.has(productSlug));
}

/** "3-in-1 pack", or "3 pairs" for period pants; null for a single item. */
export function packLabel(size: number, productSlug?: string | null) {
  if (size <= 1) return null;
  return soldInPairs(productSlug) ? `${size} pairs` : `${size}-in-1 pack`;
}

export function variantLabel(
  variant: Pick<Variant, "length_label" | "pack_size">,
  productSlug?: string | null,
) {
  const parts: string[] = [];
  if (variant.length_label) parts.push(variant.length_label);
  const pack = packLabel(variant.pack_size, productSlug);
  if (pack) parts.push(pack);
  return parts.join(" · ");
}

export function lowestPrice(variants: Pick<Variant, "price" | "is_active">[]) {
  const prices = variants.filter((v) => v.is_active).map((v) => v.price);
  return prices.length ? Math.min(...prices) : null;
}

/** Whole-number % saved when a variant has a higher "was" price, else null. */
export function dealPercent(variant: Pick<Variant, "price" | "compare_at_price">) {
  const was = variant.compare_at_price;
  if (!was || was <= variant.price) return null;
  return Math.round((1 - variant.price / was) * 100);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}

export function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
