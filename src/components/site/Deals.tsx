import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Award, Heart, Leaf, MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { parseChoices } from "@/lib/choices";
import { dealPercent, formatNaira } from "@/lib/format";
import { productsQuery } from "@/lib/queries";
import type { ProductWithVariants, Variant } from "@/lib/types";
import { cn } from "@/lib/utils";

import { SwipeRow } from "./SwipeRow";

// Copy lives here; prices, stock and photos come from the price list in the dashboard.
// A deal disappears on its own if its product or price option is switched off.
interface Deal {
  id: string;
  slug: string;
  /** Price options that make up the deal (the lowest one is shown). */
  skus: string[];
  title: (price: string, percent: number | null) => string;
  body: string;
  tone: "lilac" | "leaf" | "blush";
}

const DEALS: Deal[] = [
  {
    id: "pants",
    slug: "period-underwear",
    skus: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"].map((size) => `UNDERWEAR-BLK-3-${size}`),
    title: (price) => `3 period pants for ${price}`,
    body: "Comfortable, discreet, reusable. Stock up for every day of your cycle.",
    tone: "leaf",
  },
  {
    id: "pads",
    slug: "reusable-menstrual-pads",
    skus: ["PAD-16-10", "PAD-14-10", "PAD-12-10", "PAD-10-10"],
    title: (_price, percent) =>
      percent ? `${percent}% off any 10-pack of pads` : "10-packs of reusable pads",
    body: 'Any length, 10" to 16". Up to 100 washes per pad.',
    tone: "lilac",
  },
  {
    id: "cup",
    slug: "the-cup-convert",
    skus: ["CUP-BUNDLE"],
    title: (price) => `Cup bundle for ${price}`,
    body: "A menstrual cup plus a full cup accessories set.",
    tone: "blush",
  },
  {
    id: "school",
    slug: "back-to-school-kit",
    skus: ["BTS-KIT"],
    title: (price) => `Back-to-School Kit, ${price}`,
    body: "Period pant, carry-on pouch and wipes, ready for her school bag.",
    tone: "leaf",
  },
];

const TONES = {
  lilac: "bg-lilac/70",
  leaf: "bg-[oklch(0.93_0.09_135)]",
  blush: "bg-[oklch(0.9_0.06_350)]",
} as const;

interface LiveDeal extends Deal {
  product: ProductWithVariants;
  variants: Variant[];
  cheapest: Variant;
  percent: number | null;
}

function useLiveDeals() {
  const products = useQuery(productsQuery());
  const live = DEALS.flatMap((deal): LiveDeal[] => {
    const product = products.data?.find((p) => p.slug === deal.slug);
    const variants =
      product?.product_variants.filter((v) => v.is_active && v.sku && deal.skus.includes(v.sku)) ??
      [];
    const cheapest = [...variants].sort((a, b) => a.price - b.price)[0];
    if (!product || !cheapest) return [];
    const percents = variants.map((v) => dealPercent(v)).filter((p): p is number => p != null);
    const percent = percents.length ? Math.min(...percents) : null;
    return [{ ...deal, product, variants, cheapest, percent }];
  });
  return { deals: live, isLoading: products.isLoading };
}

/** WUKA-style promo banners for website-only deals. */
export function DealBanners() {
  const { deals, isLoading } = useLiveDeals();
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-56 animate-pulse rounded-[28px] bg-glass-soft" />
        ))}
      </div>
    );
  }
  if (!deals.length) return null;
  return (
    <SwipeRow label="Website-only deals" gridClass="sm:grid-cols-2" itemClass="w-[86%]">
      {deals.map((deal) => (
        <DealBanner key={deal.id} deal={deal} />
      ))}
    </SwipeRow>
  );
}

function DealBanner({ deal }: { deal: LiveDeal }) {
  const { add } = useCart();
  const price = formatNaira(deal.cheapest.price);
  const single = deal.variants.length === 1 && parseChoices(deal.product.choices).length === 0;
  const soldOut = deal.variants.every((v) => v.stock <= 0);
  const was = deal.cheapest.compare_at_price;

  return (
    <article
      className={cn(
        "relative grid grid-cols-[0.9fr_1.1fr] overflow-hidden rounded-[28px] border border-glass-border shadow-glass",
        TONES[deal.tone],
      )}
    >
      <Link
        to="/products/$slug"
        params={{ slug: deal.slug }}
        className="relative block min-h-52"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={deal.product.image_url ?? "/images/pads.jpg"}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
      </Link>
      <span className="absolute left-3 top-3 grid size-16 place-items-center rounded-full bg-leaf text-center text-[10px] font-semibold uppercase leading-tight text-white shadow-lg sm:size-[4.5rem]">
        <span>
          {single ? "Only" : "From"}
          <span className="block text-sm normal-case sm:text-base">{price}</span>
        </span>
      </span>
      <div className="flex flex-col justify-center p-4 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
          Website-only deal
        </p>
        <h3 className="font-statement mt-1 text-2xl leading-[1] sm:text-3xl">
          {deal.title(price, deal.percent)}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-foreground/70 sm:text-sm">{deal.body}</p>
        {was && single && (
          <p className="mt-1 text-xs text-foreground/55">
            Usually <s>{formatNaira(was)}</s>
          </p>
        )}
        <div className="mt-4">
          {soldOut ? (
            <Button size="small" variant="outline" disabled>
              Sold out
            </Button>
          ) : single ? (
            <Button size="small" onClick={() => add(deal.cheapest.id)}>
              Add to bag <Plus className="size-4" />
            </Button>
          ) : (
            <Button size="small" asChild>
              <Link to="/products/$slug" params={{ slug: deal.slug }}>
                Choose {deal.product.option_name.toLowerCase()} <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

const BADGES = [
  { icon: MapPin, label: "Designed in Nigeria by a consultant" },
  { icon: Heart, label: "Female founded" },
  { icon: Award, label: "Award winning" },
  { icon: Leaf, label: "Made from medical-grade, sustainable materials" },
] as const;

/** Four-up trust badges (brand story at a glance). */
export function TrustBadges({ className }: { className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-7 lg:grid-cols-4", className)}>
      {BADGES.map(({ icon: Icon, label }) => (
        <li key={label} className="flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-brand/10 text-brand">
            <Icon className="size-7" strokeWidth={1.8} />
          </span>
          <span className="mt-3 max-w-[12rem] text-xs font-semibold uppercase leading-snug tracking-wide text-brand">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
