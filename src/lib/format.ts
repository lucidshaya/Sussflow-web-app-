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

/** The product switches that decide how a price option is named (Admin → Products). */
export interface OptionDisplay {
  slug?: string | null;
  show_size?: boolean | null;
  show_length?: boolean | null;
}

/** Identity of a variant's main option, used to group pack sizes under it. */
export const optionKey = (variant: Pick<Variant, "size_label" | "length_label">) =>
  variant.size_label ?? variant.length_label ?? "";

/** "M", '16"' or 'M (16")', following the product's Show size / Show length switches. */
export function optionText(
  variant: Pick<Variant, "size_label" | "length_label">,
  product?: OptionDisplay,
) {
  const size = (product?.show_size ?? false) ? variant.size_label : null;
  const length = (product?.show_length ?? true) ? variant.length_label : null;
  if (size && length) return `${size} (${length})`;
  // If the shown field is empty for this option, fall back to whatever it has.
  return size ?? length ?? variant.size_label ?? variant.length_label ?? "";
}

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "XXL", "3XL", "4XL", "5XL"];

/** Options for a picker: sizes run small → large; lengths keep the price-list order. */
export function orderedOptionKeys(
  variants: Pick<Variant, "size_label" | "length_label">[],
  product?: OptionDisplay,
) {
  const keys = [...new Set(variants.map(optionKey).filter(Boolean))];
  if (!product?.show_size) return keys;
  const rank = (k: string) => {
    const i = SIZE_ORDER.indexOf(k.toUpperCase());
    return i === -1 ? Number.POSITIVE_INFINITY : i;
  };
  // Stable sort: unknown names (e.g. "Size 1 (Small)") keep their order after known ones.
  return keys
    .map((k, i) => ({ k, i }))
    .sort((a, b) => rank(a.k) - rank(b.k) || a.i - b.i)
    .map((x) => x.k);
}

/** Picker heading: "Size" when sizes are shown, otherwise "Length". */
export const optionGroupName = (product?: OptionDisplay) =>
  product?.show_size ? "Size" : "Length";

/** Sizes must be chosen on purpose (no pre-selected size) when there's more than one. */
export function mustPickOption(
  product: OptionDisplay | undefined,
  variants: Pick<Variant, "size_label" | "length_label">[],
) {
  return Boolean(product?.show_size) && new Set(variants.map(optionKey)).size > 1;
}

export function variantLabel(
  variant: Pick<Variant, "size_label" | "length_label" | "pack_size">,
  product?: OptionDisplay,
) {
  const parts: string[] = [];
  const option = optionText(variant, product);
  if (option) parts.push(option);
  const pack = packLabel(variant.pack_size, product?.slug);
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
