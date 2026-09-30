import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";

import { EmptyState, glassCard, PageHero } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { useCart, useCartDetails } from "@/lib/cart";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/_site/cart")({
  head: () => ({ meta: [{ title: "Your bag | Sussflow" }] }),
  component: CartPage,
});

function CartPage() {
  const { count, update, remove } = useCart();
  const { items, subtotal, isLoading, unavailable } = useCartDetails();

  return (
    <>
      <PageHero
        eyebrow="Your bag"
        title={
          count ? `${count} ${count === 1 ? "item" : "items"} in your bag` : "Your bag is light"
        }
      />
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[1fr_360px]">
        {count === 0 ? (
          <div className="lg:col-span-2">
            <EmptyState title="Nothing here yet">
              <Link to="/shop" className="font-semibold text-brand hover:underline">
                Shop all products →
              </Link>
            </EmptyState>
          </div>
        ) : (
          <>
            <div className={`${glassCard} p-5 md:p-7`}>
              {isLoading && <p className="text-sm text-foreground/60">Loading…</p>}
              {unavailable.length > 0 && (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-alert/30 bg-alert/10 p-4 text-sm">
                  <span>{unavailable.length} item(s) in your bag are no longer available.</span>
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => unavailable.forEach((line) => remove(line.variantId))}
                  >
                    Remove
                  </Button>
                </div>
              )}
              <ul className="divide-y divide-foreground/10">
                {items.map((item) => (
                  <li key={item.variantId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <Link to="/products/$slug" params={{ slug: item.productSlug }}>
                      <img
                        src={item.imageUrl ?? "/images/pads.jpg"}
                        alt=""
                        className="size-24 rounded-2xl object-cover"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            to="/products/$slug"
                            params={{ slug: item.productSlug }}
                            className="font-semibold hover:text-brand"
                          >
                            {item.productName}
                          </Link>
                          {item.label && <p className="text-sm text-foreground/60">{item.label}</p>}
                          <p className="text-sm text-foreground/60">
                            {formatNaira(item.unitPrice)} each
                          </p>
                        </div>
                        <span className="font-semibold">{formatNaira(item.lineTotal)}</span>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center gap-1 rounded-full border border-glass-border bg-glass-soft p-1">
                          <button
                            type="button"
                            className="grid size-8 place-items-center rounded-full hover:bg-glass"
                            onClick={() => update(item.variantId, item.quantity - 1)}
                            aria-label="Decrease"
                          >
                            <Minus className="size-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            className="grid size-8 place-items-center rounded-full hover:bg-glass disabled:opacity-40"
                            onClick={() => update(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            aria-label="Increase"
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(item.variantId)}
                          className="flex items-center gap-1 text-sm text-foreground/50 hover:text-alert"
                        >
                          <Trash2 className="size-4" /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <aside className={`${glassCard} h-fit p-6 lg:sticky lg:top-36`}>
              <h2 className="font-display text-xl font-semibold">Summary</h2>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-foreground/65">Subtotal</span>
                <span className="font-semibold">{formatNaira(subtotal)}</span>
              </div>
              <p className="mt-2 text-xs text-foreground/55">
                Delivery or Lagos pickup is selected at checkout.
              </p>
              <Button className="mt-5 w-full" asChild>
                <Link to="/checkout">Checkout</Link>
              </Button>
              <Button variant="glass" className="mt-2 w-full" asChild>
                <Link to="/shop">Continue shopping</Link>
              </Button>
            </aside>
          </>
        )}
      </section>
    </>
  );
}
