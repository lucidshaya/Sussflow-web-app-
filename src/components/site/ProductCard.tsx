import { Link } from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatNaira, lowestPrice } from "@/lib/format";
import type { ProductWithVariants } from "@/lib/types";

import { glassPanel } from "./primitives";

export function ProductCard({ product }: { product: ProductWithVariants }) {
  const { add } = useCart();
  const active = product.product_variants.filter((variant) => variant.is_active);
  const from = lowestPrice(active);
  const single = active.length === 1 ? active[0] : undefined;
  const soldOut = active.length > 0 && active.every((variant) => variant.stock <= 0);

  return (
    <article className={`${glassPanel} group flex flex-col p-4`}>
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative block overflow-hidden rounded-2xl"
      >
        <img
          src={product.image_url ?? "/images/pads.jpg"}
          width={816}
          height={816}
          loading="lazy"
          alt={product.name}
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {product.categories && (
          <span className="absolute left-3 top-3 rounded-full border border-glass-border bg-glass px-3 py-1 text-[11px] font-semibold text-foreground/80 backdrop-blur-xl">
            {product.categories.name}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold leading-snug">
              <Link
                to="/products/$slug"
                params={{ slug: product.slug }}
                className="hover:text-brand"
              >
                {product.name}
              </Link>
            </h3>
            {product.short_detail && (
              <p className="mt-1 text-xs text-foreground/60">{product.short_detail}</p>
            )}
          </div>
          {from != null && (
            <span className="shrink-0 text-right text-sm font-semibold">
              {active.length > 1 && (
                <span className="block text-[11px] font-medium text-foreground/50">from</span>
              )}
              {formatNaira(from)}
            </span>
          )}
        </div>
        <div className="mt-auto pt-4">
          {soldOut ? (
            <Button variant="outline" className="w-full" disabled>
              Sold out
            </Button>
          ) : single ? (
            <Button variant="outline" className="w-full" onClick={() => add(single.id)}>
              Add to bag <Plus className="size-4" />
            </Button>
          ) : (
            <Button variant="outline" className="w-full" asChild>
              <Link to="/products/$slug" params={{ slug: product.slug }}>
                Choose options <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`${glassPanel} animate-pulse p-4`}>
          <div className="aspect-square rounded-2xl bg-glass-soft" />
          <div className="mt-4 h-5 w-2/3 rounded-full bg-glass-soft" />
          <div className="mt-2 h-3 w-1/2 rounded-full bg-glass-soft" />
          <div className="mt-5 h-11 rounded-full bg-glass-soft" />
        </div>
      ))}
    </div>
  );
}
