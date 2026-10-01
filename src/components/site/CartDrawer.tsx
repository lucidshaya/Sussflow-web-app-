import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { DeliveryRates } from "./DeliveryRates";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useCart, useCartDetails } from "@/lib/cart";
import { formatNaira } from "@/lib/format";

export function CartDrawer() {
  const { open, setOpen, update, remove, count } = useCart();
  const { items, subtotal, isLoading } = useCartDetails();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col border-l border-glass-border bg-background/92 p-6 backdrop-blur-2xl sm:max-w-md">
        <div>
          <SheetTitle className="font-display text-2xl font-semibold">Your bag</SheetTitle>
          <SheetDescription className="text-sm text-foreground/60">
            {count ? `${count} ${count === 1 ? "item" : "items"}` : "Nothing here yet"}
          </SheetDescription>
        </div>

        {count === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <ShoppingBag className="size-10 text-brand" />
            <p className="mt-4 font-display text-xl font-semibold">Your bag is light</p>
            <p className="mt-2 text-sm text-foreground/60">Find period care that fits your life.</p>
            <Button className="mt-6" asChild onClick={() => setOpen(false)}>
              <Link to="/shop">Shop all products</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="-mx-2 mt-2 flex-1 space-y-3 overflow-y-auto px-2">
              {isLoading && <li className="text-sm text-foreground/60">Loading your bag…</li>}
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className="flex gap-3 rounded-2xl border border-glass-border bg-glass p-3"
                >
                  <img
                    src={item.imageUrl ?? "/images/pads.jpg"}
                    alt=""
                    className="size-20 shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.productName}</p>
                        {item.label && <p className="text-xs text-foreground/60">{item.label}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.variantId)}
                        className="text-foreground/40 hover:text-alert"
                        aria-label={`Remove ${item.productName}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 rounded-full border border-glass-border bg-glass-soft p-0.5">
                        <button
                          type="button"
                          className="grid size-7 place-items-center rounded-full hover:bg-glass"
                          onClick={() => update(item.variantId, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="grid size-7 place-items-center rounded-full hover:bg-glass disabled:opacity-40"
                          onClick={() => update(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">{formatNaira(item.lineTotal)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-foreground/10 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground/70">Subtotal</span>
                <span className="text-lg font-semibold">{formatNaira(subtotal)}</span>
              </div>
              <DeliveryRates />
              <Button className="w-full" asChild onClick={() => setOpen(false)}>
                <Link to="/checkout">Checkout</Link>
              </Button>
              <Button variant="glass" className="w-full" asChild onClick={() => setOpen(false)}>
                <Link to="/cart">View bag</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
