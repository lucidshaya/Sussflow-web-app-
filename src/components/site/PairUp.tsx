import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatNaira, soldInPairs, variantLabel } from "@/lib/format";
import { productsQuery } from "@/lib/queries";
import type { ProductWithVariants, Variant } from "@/lib/types";
import { cn } from "@/lib/utils";

import { SectionHeading } from "./primitives";
import { SwipeRow } from "./SwipeRow";

// Copy lives here; products, options and prices come from the dashboard.
const PAIRS = [
  {
    id: "cup-panty",
    slugs: ["menstrual-cup", "period-underwear"],
    title: "Cup + Period Panty",
    what: "Internal protection + backup protection",
    bestFor: "Ideal for extra-heavy flow and added overnight security.",
  },
  {
    id: "pad-interlabial",
    slugs: ["reusable-menstrual-pads", "interlabial-pads"],
    title: "Reusable Pad + Interlabial Pad",
    what: "Extra absorbency + additional protection",
    bestFor: "A practical combination for heavier days.",
  },
  {
    id: "panty-pad",
    slugs: ["period-underwear", "reusable-menstrual-pads"],
    title: "Period Panty + Reusable Pad",
    what: "Absorbency + backup protection",
    bestFor: "Great for heavy-flow days when you want an extra layer of security.",
  },
] as const;

export const PAIR_PRODUCT_SLUGS: ReadonlySet<string> = new Set(PAIRS.flatMap((p) => p.slugs));

/** Heavy-flow default: the longest single pack (e.g. 16" 3-in-1), else the first option. */
function defaultVariant(variants: Variant[]) {
  const inStock = variants.filter((v) => v.stock > 0);
  const pool = inStock.length ? inStock : variants;
  const longest = [...pool].sort(
    (a, b) =>
      (Number.parseInt(b.length_label ?? "0", 10) || 0) -
        (Number.parseInt(a.length_label ?? "0", 10) || 0) || a.pack_size - b.pack_size,
  );
  return longest[0];
}

/** "Have an extra-heavy flow? Ultimate protection. Pair up." */
export function PairUp({ highlight }: { highlight?: string }) {
  const products = useQuery(productsQuery());
  const pairs = PAIRS.map((pair) => ({
    ...pair,
    products: pair.slugs
      .map((slug) => products.data?.find((p) => p.slug === slug))
      .filter((p): p is ProductWithVariants =>
        Boolean(p?.product_variants.some((v) => v.is_active)),
      ),
  }))
    .filter((pair) => pair.products.length === 2)
    // Pairs that include the product being viewed come first.
    .sort(
      (a, b) =>
        Number(b.slugs.some((s) => s === highlight)) - Number(a.slugs.some((s) => s === highlight)),
    );

  if (!pairs.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-10">
      <SectionHeading eyebrow="Have an extra-heavy flow?" title="Ultimate protection. Pair up.">
        Need extra confidence on your heaviest days? Combine two Sussflow essentials for added
        protection and peace of mind.
      </SectionHeading>
      <div className="mt-6">
        <SwipeRow label="Product pairs for heavy flow" itemClass="w-[85%]">
          {pairs.map((pair) => (
            <PairCard key={pair.id} {...pair} />
          ))}
        </SwipeRow>
      </div>
      <p className="mt-4 text-xs text-foreground/55">
        Pairing products adds coverage and security. No period product can guarantee zero leaks.
      </p>
    </section>
  );
}

function PairCard({
  title,
  what,
  bestFor,
  products,
}: {
  title: string;
  what: string;
  bestFor: string;
  products: ProductWithVariants[];
}) {
  const { add } = useCart();
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const picks = products.map((product) => {
    const variants = product.product_variants.filter((v) => v.is_active);
    const variant = variants.find((v) => v.id === chosen[product.id]) ?? defaultVariant(variants);
    return { product, variants, variant };
  });
  const total = picks.reduce((sum, pick) => sum + (pick.variant?.price ?? 0), 0);
  const soldOut = picks.some((pick) => !pick.variant || pick.variant.stock <= 0);

  return (
    <article className="flex flex-col rounded-[28px] border border-glass-border bg-glass p-5 shadow-glass backdrop-blur-xl">
      <div className="flex items-center justify-center gap-2">
        {picks.map(({ product }, i) => (
          <div key={product.id} className="flex items-center gap-2">
            {i > 0 && (
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-primary-foreground">
                <Plus className="size-4" />
              </span>
            )}
            <Link to="/products/$slug" params={{ slug: product.slug }} className="block">
              <img
                src={product.image_url ?? "/images/pads.jpg"}
                alt={product.name}
                loading="lazy"
                className="size-24 rounded-2xl object-cover sm:size-28"
              />
            </Link>
          </div>
        ))}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">
        <span aria-hidden="true">🩷 </span>
        {title}
      </h3>
      <p className="text-sm font-medium text-brand">{what}</p>
      <p className="mt-1 text-sm text-foreground/65">→ {bestFor}</p>

      <div className="mt-4 space-y-2">
        {picks.map(({ product, variants, variant }) =>
          variants.length > 1 ? (
            <label key={product.id} className="block text-xs font-semibold text-foreground/60">
              {product.name}
              <select
                value={variant?.id}
                onChange={(e) => setChosen((c) => ({ ...c, [product.id]: e.target.value }))}
                className="mt-1 w-full rounded-full border border-glass-border bg-glass-soft px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-brand"
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                    {variantLabel(v, product.slug) ||
                      (soldInPairs(product.slug) ? "1 pair" : "Single")}{" "}
                    · {formatNaira(v.price)}
                    {v.stock <= 0 ? " (sold out)" : ""}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p key={product.id} className="flex justify-between text-sm">
              <span className="font-medium">{product.name}</span>
              {variant && <span>{formatNaira(variant.price)}</span>}
            </p>
          ),
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="font-display text-xl font-semibold">{formatNaira(total)}</span>
        <Button
          size="small"
          disabled={soldOut}
          className={cn(soldOut && "opacity-60")}
          onClick={() => {
            for (const { variant } of picks) if (variant) add(variant.id);
          }}
        >
          <ShoppingBag className="size-4" /> {soldOut ? "Sold out" : "Shop the pair"}
        </Button>
      </div>
    </article>
  );
}
