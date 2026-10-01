import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { parseChoices } from "@/lib/choices";
import { formatNaira, lowestPrice } from "@/lib/format";
import type { BundleItemWithProduct } from "@/lib/queries";

const itemName = (item: BundleItemWithProduct) => item.product?.name ?? item.label ?? "";

/** "What's inside": catalogue products link to their page, free-text lines are plain. */
export function KitContents({
  items,
  compact = false,
}: {
  items: BundleItemWithProduct[];
  compact?: boolean;
}) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-brand">What's inside</p>
      <ul className={compact ? "mt-2 flex flex-wrap gap-2" : "mt-3 space-y-2"}>
        {items.map((item) => {
          const text = `${item.quantity > 1 ? `${item.quantity} × ` : ""}${itemName(item)}`;
          return (
            <li
              key={item.id}
              className={
                compact
                  ? "rounded-full border border-glass-border bg-glass-soft px-3 py-1 text-xs font-medium"
                  : "flex items-center gap-2 text-sm"
              }
            >
              {!compact && <Check className="size-4 shrink-0 text-leaf" />}
              {item.product && !compact ? (
                <Link
                  to="/products/$slug"
                  params={{ slug: item.product.slug }}
                  className="font-medium hover:text-brand"
                >
                  {text}
                </Link>
              ) : (
                <span className="font-medium">{text}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** "Customise your kit": optional extras the customer can add alongside the kit. */
export function KitAddons({ items }: { items: BundleItemWithProduct[] }) {
  const { add } = useCart();
  const addons = items.filter((item) => item.product && item.product.product_variants.length);
  if (!addons.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-brand">Customise your kit</p>
      <p className="mt-1 text-sm text-foreground/60">Add extras to make it yours.</p>
      <ul className="mt-3 grid gap-2">
        {addons.map((item) => {
          const product = item.product!;
          const variants = product.product_variants;
          const single =
            variants.length === 1 && parseChoices(product.choices).length === 0
              ? variants[0]
              : undefined;
          const price = lowestPrice(variants);
          return (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-glass-border bg-glass-soft p-2.5"
            >
              <img
                src={product.image_url ?? "/images/pads.jpg"}
                alt=""
                loading="lazy"
                className="size-12 shrink-0 rounded-xl object-cover"
              />
              <span className="min-w-0 flex-1 text-sm">
                <span className="block truncate font-semibold">{product.name}</span>
                {price != null && (
                  <span className="text-foreground/60">
                    {single ? "" : "from "}
                    {formatNaira(price)}
                  </span>
                )}
              </span>
              {single ? (
                <Button
                  size="small"
                  variant="outline"
                  disabled={single.stock <= 0}
                  onClick={() => add(single.id, item.quantity)}
                  aria-label={`Add ${product.name} to bag`}
                >
                  {single.stock <= 0 ? "Sold out" : <Plus className="size-4" />}
                </Button>
              ) : (
                <Button size="small" variant="outline" asChild>
                  <Link
                    to="/products/$slug"
                    params={{ slug: product.slug }}
                    aria-label={`Choose options for ${product.name}`}
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Buttons to linked products, e.g. First Period Box → Back-to-School Kit. */
export function KitRelated({ items }: { items: BundleItemWithProduct[] }) {
  const related = items.filter((item) => item.product);
  if (!related.length) return null;
  return (
    <>
      {related.map((item) => {
        const product = item.product!;
        const price = lowestPrice(product.product_variants);
        return (
          <Button key={item.id} asChild variant="glass">
            <Link to="/products/$slug" params={{ slug: product.slug }}>
              {product.name}
              {price != null && <span className="text-foreground/60">· {formatNaira(price)}</span>}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        );
      })}
    </>
  );
}
