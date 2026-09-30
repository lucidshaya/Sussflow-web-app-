import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  EmptyState,
  Eyebrow,
  glassCard,
  glassPanel,
  SetupNotice,
} from "@/components/site/primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductGallery } from "@/components/site/ProductGallery";
import { Button } from "@/components/ui/button";
import { FAQ_GROUPS, PRODUCT_FAQ_GROUP } from "@/content/site";
import { useCart } from "@/lib/cart";
import { dealPercent, formatNaira } from "@/lib/format";
import { productBySlugQuery } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Variant } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/products/$slug")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} | Sussflow Nigeria`,
      },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const product = useQuery(productBySlugQuery(slug));
  const { add } = useCart();

  const variants = useMemo(
    () => (product.data?.product_variants ?? []).filter((v) => v.is_active),
    [product.data],
  );
  const lengths = useMemo(
    () => [...new Set(variants.map((v) => v.length_label).filter((l): l is string => Boolean(l)))],
    [variants],
  );

  const [length, setLength] = useState<string | null>(null);
  const [packSize, setPackSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const first = variants[0];
    setLength(first?.length_label ?? null);
    setPackSize(first?.pack_size ?? null);
    setQuantity(1);
  }, [variants]);

  const packsForLength = variants.filter((v) =>
    lengths.length ? v.length_label === length : true,
  );
  const selected: Variant | undefined =
    packsForLength.find((v) => v.pack_size === packSize) ?? packsForLength[0];
  const selectedDeal = selected ? dealPercent(selected) : null;

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-10">
        <SetupNotice what="this product" />
      </div>
    );
  }
  if (product.isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 lg:grid-cols-2">
        <div className={`${glassCard} aspect-square animate-pulse`} />
        <div className={`${glassCard} h-96 animate-pulse`} />
      </div>
    );
  }
  if (!product.data) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <EmptyState title="This product isn't available">
          <Link to="/shop" className="font-semibold text-brand hover:underline">
            Browse all products →
          </Link>
        </EmptyState>
      </div>
    );
  }

  const p = product.data;
  // Period pants are sold in pairs; everything else uses the price list's "N-in-1" wording.
  const unit = p.categories?.slug === "period-underwear" ? "pair" : null;
  const images = [p.image_url ?? "/images/pads.jpg", ...p.gallery.filter(Boolean)];
  const faqGroup = FAQ_GROUPS.find((group) => group.id === PRODUCT_FAQ_GROUP[p.slug]);
  const outOfStock = !selected || selected.stock <= 0;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <Link
        to="/shop"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 hover:text-brand"
      >
        <ChevronLeft className="size-4" /> Back to shop
      </Link>
      <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <ProductGallery key={p.id} images={images} alt={p.name} />

        <div className={`${glassCard} p-7 md:p-9`}>
          {p.categories && <Eyebrow>{p.categories.name}</Eyebrow>}
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            {p.name}
          </h1>
          {p.tagline && <p className="mt-2 text-lg text-foreground/70">{p.tagline}</p>}
          {selected && (
            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="font-display text-3xl font-semibold text-brand">
                {formatNaira(selected.price)}
              </p>
              {selectedDeal != null && selected.compare_at_price && (
                <>
                  <s className="text-lg text-foreground/45">
                    {formatNaira(selected.compare_at_price)}
                  </s>
                  <span className="rounded-full bg-leaf px-2.5 py-0.5 text-xs font-semibold text-white">
                    Website deal · save {selectedDeal}%
                  </span>
                </>
              )}
            </div>
          )}

          {variants.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-glass-border bg-glass-soft p-4 text-sm">
              This product is coming soon. Chat with us to pre-order.
            </p>
          ) : (
            <div className="mt-6 space-y-5">
              {lengths.length > 0 && (
                <OptionGroup label="Length">
                  {lengths.map((l) => (
                    <OptionButton
                      key={l}
                      active={l === length}
                      onClick={() => {
                        setLength(l);
                        const packs = variants.filter((v) => v.length_label === l);
                        if (!packs.some((v) => v.pack_size === packSize))
                          setPackSize(packs[0]?.pack_size ?? null);
                      }}
                    >
                      {l}
                    </OptionButton>
                  ))}
                </OptionGroup>
              )}
              {packsForLength.some((v) => v.pack_size > 1) && (
                <OptionGroup label="Pack size">
                  {packsForLength.map((v) => (
                    <OptionButton
                      key={v.id}
                      active={v.id === selected?.id}
                      onClick={() => setPackSize(v.pack_size)}
                    >
                      {packLabel(v.pack_size, unit)} · {formatNaira(v.price)}
                      {dealPercent(v) != null && (
                        <span
                          className={cn(
                            "ml-1.5 rounded-full px-1.5 text-[11px]",
                            v.id === selected?.id ? "bg-white/25" : "bg-leaf/15 text-leaf",
                          )}
                        >
                          −{dealPercent(v)}%
                        </span>
                      )}
                    </OptionButton>
                  ))}
                </OptionGroup>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-full border border-glass-border bg-glass-soft p-1">
                  <button
                    type="button"
                    className="grid size-9 place-items-center rounded-full hover:bg-glass"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    type="button"
                    className="grid size-9 place-items-center rounded-full hover:bg-glass disabled:opacity-40"
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={!selected || quantity >= selected.stock}
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <Button
                  className="flex-1"
                  disabled={outOfStock}
                  onClick={() => selected && add(selected.id, quantity)}
                >
                  <ShoppingBag className="size-4" />{" "}
                  {outOfStock ? (
                    "Sold out"
                  ) : (
                    <span className="whitespace-nowrap">
                      Add to bag
                      <span className="hidden sm:inline">
                        {" "}
                        · {formatNaira((selected?.price ?? 0) * quantity)}
                      </span>
                    </span>
                  )}
                </Button>
              </div>
              {selected && selected.stock > 0 && selected.stock <= 5 && (
                <p className="text-xs font-semibold text-alert">Only {selected.stock} left</p>
              )}
            </div>
          )}

          {p.description && (
            <p className="mt-7 leading-relaxed text-foreground/75">{p.description}</p>
          )}
          {p.perfect_for && (
            <p className="mt-4 rounded-2xl border border-glass-border bg-glass-soft p-4 text-sm">
              <strong>Perfect for:</strong> {p.perfect_for}
            </p>
          )}
          <ul className="mt-5 space-y-2 text-sm text-foreground/70">
            <li className="flex items-center gap-2">
              <Check className="size-4 text-leaf" /> Lagos pickup (Iju axis) or nationwide courier &
              waybill delivery
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-leaf" /> Secure payment with Paystack
            </li>
          </ul>
        </div>
      </div>

      {faqGroup && (
        <section className={`${glassCard} mt-8 p-7 md:p-9`}>
          <Eyebrow>Questions</Eyebrow>
          <h2 className="mt-1 font-display text-2xl font-semibold">{faqGroup.title} FAQs</h2>
          <Accordion type="single" collapsible className="mt-4">
            {faqGroup.items.map((item) => (
              <AccordionItem key={item.q} value={item.q} className="border-foreground/10">
                <AccordionTrigger className="text-left font-semibold hover:text-brand hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-foreground/70">
                  {item.a.map((para) => (
                    <p key={para}>{para}</p>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}
    </div>
  );
}

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase text-foreground/60">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
        active
          ? "border-brand bg-brand text-primary-foreground"
          : "border-glass-border bg-glass hover:border-brand/50 hover:text-brand",
      )}
    >
      {children}
    </button>
  );
}

function packLabel(size: number, unit: string | null) {
  if (unit) return `${size} ${size > 1 ? `${unit}s` : unit}`;
  return size > 1 ? `${size}-in-1` : "Single";
}
