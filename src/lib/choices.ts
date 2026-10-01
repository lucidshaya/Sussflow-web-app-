// Customer choices that don't change price or stock (e.g. pads: flow type, colour).
// Set per product in Admin → Products (`products.choices`); picks are saved on the order line.

export interface ProductChoice {
  name: string;
  values: string[];
}

/** Choice name → picked value, e.g. { "Flow type": "Heavy flow" }. */
export type ChosenOptions = Record<string, string>;

/** Accepts whatever is stored in the jsonb column and keeps only well-formed choices. */
export function parseChoices(raw: unknown): ProductChoice[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const name = typeof item?.name === "string" ? item.name.trim() : "";
    const values = Array.isArray(item?.values)
      ? item.values.filter((v: unknown): v is string => typeof v === "string" && v.trim() !== "")
      : [];
    return name && values.length ? [{ name, values }] : [];
  });
}

/** "Heavy flow · Mixed colour", in the product's choice order. */
export function choicesText(chosen: ChosenOptions | undefined, choices?: ProductChoice[]) {
  if (!chosen) return "";
  const names = choices?.map((c) => c.name) ?? Object.keys(chosen);
  return names
    .map((name) => chosen[name])
    .filter(Boolean)
    .join(" · ");
}

/** Stable identity for a bag line: same variant with different choices = different lines. */
export function lineKey(variantId: string, chosen?: ChosenOptions) {
  if (!chosen || !Object.keys(chosen).length) return variantId;
  const parts = Object.keys(chosen)
    .sort()
    .map((k) => `${k}=${chosen[k]}`);
  return `${variantId}|${parts.join("&")}`;
}

/** Null when every choice has an allowed value, else a message naming what's missing. */
export function choicesError(choices: ProductChoice[], chosen: ChosenOptions | undefined) {
  for (const choice of choices) {
    const value = chosen?.[choice.name];
    if (!value || !choice.values.includes(value)) return `Choose a ${choice.name.toLowerCase()}`;
  }
  return null;
}
