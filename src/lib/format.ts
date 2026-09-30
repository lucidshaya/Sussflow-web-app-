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

export function variantLabel(variant: Pick<Variant, "length_label" | "pack_size">) {
  const parts: string[] = [];
  if (variant.length_label) parts.push(variant.length_label);
  if (variant.pack_size > 1) parts.push(`${variant.pack_size}-in-1 pack`);
  return parts.join(" · ");
}

export function lowestPrice(variants: Pick<Variant, "price" | "is_active">[]) {
  const prices = variants.filter((v) => v.is_active).map((v) => v.price);
  return prices.length ? Math.min(...prices) : null;
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
