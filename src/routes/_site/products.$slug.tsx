import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, ChevronLeft, Minus, PlayCircle, Plus, ShoppingBag } from "lucide-react";
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
import { KitAddons, KitContents, KitRelated } from "@/components/site/Kit";
import { PAIR_PRODUCT_SLUGS, PairUp } from "@/components/site/PairUp";
import { ProductGallery } from "@/components/site/ProductGallery";
import { ProductReviews } from "@/components/site/ProductReviews";
import { Stars } from "@/components/site/Stars";
import { Button } from "@/components/ui/button";
import { FAQ_GROUPS, PRODUCT_FAQ_GROUP } from "@/content/site";
import { useCart } from "@/lib/cart";
import { choicesError, parseChoices, type ChosenOptions } from "@/lib/choices";
import {
  dealPercent,
  formatNaira,
  mustPickOption,
  optionGroupName,
  optionKey,
  optionText,
  orderedOptionKeys,
  packLabel,
  soldInPairs,
} from "@/lib/format";
import {
  bundleItemsQuery,
  itemsOf,
  prefetch,
  productBySlugQuery,
  productReviewsQuery,
  settingsQuery,
} from "@/lib/queries";
import { pointsEarned, pointsValue, rewardsActive } from "@/lib/rewards";
import { productDescription, productJsonLd, seo } from "@/lib/seo";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Variant } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/products/$slug")({
  // Fetch on the server so the HTML carries the product (search engines, link previews).
  loader: async ({ context: { queryClient }, params }) => {
    if (!isSupabaseConfigured) return { product: null };
    const product = await queryClient
      .ensureQueryData(productBySlugQuery(params.slug))
      .catch(() => undefined); // network trouble: let the page fetch it in the browser
    if (product === null) throw notFound();
    if (product)
      await prefetch(queryClient, bundleItemsQuery([product.id]), productReviewsQuery(product.id));
    const reviews = product
      ? (queryClient.getQueryData(productReviewsQuery(product.id).queryKey) ?? [])
      : [];
    return { product: product ?? null, reviews };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Product | Sussflow Nigeria" }] };
    return seo({
      title: `${p.name} | Sussflow Nigeria`,
      description: productDescription(p),
      path: `/products/${p.slug}`,
      image: p.image_url,
      type: "product",
      jsonLd: [productJsonLd(p, loaderData?.reviews)],
    });
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const product = useQuery(productBySlugQuery(slug));
  const kitItems = useQuery(bundleItemsQuery(product.data ? [product.data.id] : []));
  const kit = {
    included: itemsOf(kitItems.data, "included"),
    addons: itemsOf(kitItems.data, "addon"),
    related: itemsOf(kitItems.data, "related"),
  };
  const { add } = useCart();
  const { data: storeSettings } = useQuery(settingsQuery);
  const rewards = rewardsActive(storeSettings) ? storeSettings : null;

  const variants = useMemo(
    () => (product.data?.product_variants ?? []).filter((v) => v.is_active),
    [product.data],
  );
  // Main options (sizes or lengths) in price-list order; packs are grouped under each.
  const lengths = useMemo(
    () => orderedOptionKeys(variants, product.data ?? undefined),
    [variants, product.data],
  );

  // "Size" or "Length", from the product's Show size / Show length switches.
  const optionName = optionGroupName(product.data ?? undefined);
  // Sizes must be picked on purpose; lengths start on the first option.
  const mustPick = mustPickOption(product.data ?? undefined, variants);
  const choices = useMemo(() => parseChoices(product.data?.choices), [product.data]);

  const [length, setLength] = useState<string | null>(null);
  const [packSize, setPackSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [picked, setPicked] = useState<ChosenOptions>({});
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const first = variants[0];
    setLength(mustPick || !first ? null : optionKey(first) || null);
    setPackSize(first?.pack_size ?? null);
    setQuantity(1);
    setPicked({});
    setHint(null);
  }, [variants, mustPick]);

  // Before a size is chosen, show packs and prices from the first size (prices match).
  const shownLength = length ?? (lengths.length ? lengths[0] : null);
  const packsForLength = variants.filter((v) =>
    lengths.length ? optionKey(v) === shownLength : true,
  );
  const needs =
    (mustPick && !length ? `Choose a ${optionName.toLowerCase()}` : null) ??
    choicesError(choices, picked);
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
          <RatingAndVideo productId={p.id} videoUrl={p.video_url} />
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
          {selected && rewards && pointsEarned(selected.price, rewards) > 0 && (
            <p className="mt-1 text-sm text-foreground/65">
              🎁 Earn <strong>{pointsEarned(selected.price, rewards)} points</strong> (
              {formatNaira(pointsValue(pointsEarned(selected.price, rewards), rewards))} off a
              future order) when you buy with an account.
            </p>
          )}

          {variants.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-glass-border bg-glass-soft p-4 text-sm">
              This product is coming soon. Check back shortly.
            </p>
          ) : (
            <div className="mt-6 space-y-5">
              {lengths.length > 0 && (
                <OptionGroup label={optionName}>
                  {lengths.map((l) => (
                    <OptionButton
                      key={l}
                      active={l === length}
                      onClick={() => {
                        setLength(l);
                        setHint(null);
                        const packs = variants.filter((v) => optionKey(v) === l);
                        if (!packs.some((v) => v.pack_size === packSize))
                          setPackSize(packs[0]?.pack_size ?? null);
                      }}
                    >
                      {optionText(
                        variants.find((v) => optionKey(v) === l)!,
                        product.data ?? undefined,
                      )}
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
                      {optionLabel(v.pack_size, p.slug)} · {formatNaira(v.price)}
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
              {choices.map((choice) => (
                <OptionGroup key={choice.name} label={choice.name}>
                  {choice.values.map((value) => (
                    <OptionButton
                      key={value}
                      active={picked[choice.name] === value}
                      onClick={() => {
                        setPicked((current) => ({ ...current, [choice.name]: value }));
                        setHint(null);
                      }}
                    >
                      {value}
                    </OptionButton>
                  ))}
                </OptionGroup>
              ))}
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
                  onClick={() => {
                    if (!selected) return;
                    if (needs) {
                      setHint(needs);
                      return;
                    }
                    add(selected.id, quantity, choices.length ? picked : undefined);
                  }}
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
              {hint && (
                <p role="alert" className="text-sm font-semibold text-alert">
                  {hint}
                </p>
              )}
              {selected && selected.stock > 0 && selected.stock <= 5 && (
                <p className="text-xs font-semibold text-alert">Only {selected.stock} left</p>
              )}
            </div>
          )}

          {p.description
            ?.split(/\n\s*\n/)
            .filter(Boolean)
            .map((para, i) => (
              <p
                key={para}
                className={`${i === 0 ? "mt-7" : "mt-3"} leading-relaxed text-foreground/75`}
              >
                {para}
              </p>
            ))}
          {kit.included.length > 0 && (
            <div className="mt-6 rounded-2xl border border-glass-border bg-glass-soft p-4">
              <KitContents items={kit.included} />
            </div>
          )}
          {p.perfect_for && (
            <p className="mt-4 rounded-2xl border border-glass-border bg-glass-soft p-4 text-sm">
              <strong>Perfect for:</strong> {p.perfect_for}
            </p>
          )}
          {kit.addons.length > 0 && (
            <div className="mt-6">
              <KitAddons items={kit.addons} />
            </div>
          )}
          {kit.related.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase text-brand">Also see</p>
              <div className="flex flex-wrap gap-2">
                <KitRelated items={kit.related} />
              </div>
            </div>
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

      <ProductReviews productId={p.id} productName={p.name} />

      {PAIR_PRODUCT_SLUGS.has(p.slug) && (
        <div className="-mx-5">
          <PairUp highlight={p.slug} />
        </div>
      )}

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

/** Star summary (links to reviews) and a "Watch video" button when a video link is set. */
function RatingAndVideo({ productId, videoUrl }: { productId: string; videoUrl: string | null }) {
  const reviews = useQuery(productReviewsQuery(productId)).data ?? [];
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  if (!reviews.length && !videoUrl) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      {reviews.length > 0 && (
        <a
          href="#reviews"
          className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-brand"
        >
          <Stars value={average} /> {average.toFixed(1)} ({reviews.length})
        </a>
      )}
      {videoUrl && (
        <Button asChild variant="glass" size="small">
          <a href={videoUrl} target="_blank" rel="noopener noreferrer">
            <PlayCircle className="size-4" /> Watch video
          </a>
        </Button>
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

function optionLabel(size: number, productSlug: string) {
  if (size > 1) return packLabel(size, productSlug)?.replace(/ pack$/, "");
  return soldInPairs(productSlug) ? "1 pair" : "Single";
}
