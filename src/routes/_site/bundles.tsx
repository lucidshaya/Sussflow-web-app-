import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { KitContents, KitRelated } from "@/components/site/Kit";
import { EmptyState, glassCard, PageHero, SetupNotice } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { dealPercent, formatNaira, lowestPrice } from "@/lib/format";
import { bundleItemsQuery, itemsOf, prefetch, productsQuery } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/bundles")({
  loader: async ({ context: { queryClient } }) => {
    const bundles = productsQuery({ categorySlug: "bundles" });
    await prefetch(queryClient, bundles);
    const ids = queryClient.getQueryData(bundles.queryKey)?.map((b) => b.id) ?? [];
    if (ids.length) await prefetch(queryClient, bundleItemsQuery(ids));
  },
  head: () =>
    seo({
      title: "Period Care Kits & Bundles | Sussflow Nigeria",
      description:
        "Sussflow kits and bundles designed around different period-care journeys, from first periods to switching to reusable pads and cups.",
      path: "/bundles",
    }),
  component: BundlesPage,
});

/** Show a stored quote with consistent curly quotes, whether or not it was saved with them. */
const asQuote = (text: string) => `“${text.trim().replace(/^[“"]+|[”"]+$/g, "")}”`;

// Every active product in the "Bundles" category, managed in Admin → Products.
function BundlesPage() {
  const bundles = useQuery(productsQuery({ categorySlug: "bundles" }));
  const ids = bundles.data?.map((b) => b.id) ?? [];
  const items = useQuery(bundleItemsQuery(ids));

  return (
    <>
      <PageHero
        eyebrow="Find your Sussflow kit"
        title="Not sure which menstrual products to choose?"
      >
        We've made choosing easier. These aren't just product bundles.{" "}
        <strong className="text-foreground">
          They're designed around different period-care journeys.
        </strong>
      </PageHero>
      <section className="mx-auto max-w-7xl space-y-6 px-5 py-8">
        {!isSupabaseConfigured ? (
          <SetupNotice what="the kits" />
        ) : bundles.isLoading ? (
          <div className={`${glassCard} h-80 animate-pulse`} />
        ) : !bundles.data?.length ? (
          <EmptyState title="New kits are on the way" />
        ) : (
          bundles.data.map((bundle, index) => {
            const variants = bundle.product_variants.filter((v) => v.is_active);
            const price = lowestPrice(variants);
            const deal = Math.max(0, ...variants.map((v) => dealPercent(v) ?? 0));
            const own = items.data?.filter((item) => item.bundle_id === bundle.id);
            const paragraphs = (bundle.description ?? "").split(/\n\s*\n/).filter(Boolean);
            return (
              <article
                key={bundle.id}
                className={`${glassCard} grid items-center gap-6 p-5 sm:p-7 md:grid-cols-2 md:gap-8 md:p-10 [&>*]:min-w-0`}
              >
                <Link
                  to="/products/$slug"
                  params={{ slug: bundle.slug }}
                  className={`relative block overflow-hidden rounded-2xl ${index % 2 ? "md:order-2" : ""}`}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <img
                    src={bundle.image_url ?? "/images/kit.jpg"}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  {deal > 0 && (
                    <span className="absolute right-3 top-3 rounded-full bg-leaf px-2.5 py-0.5 text-xs font-semibold text-white">
                      −{deal}%
                    </span>
                  )}
                </Link>
                <div>
                  <p className="text-xs font-semibold uppercase text-brand">{bundle.name}</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">
                    {bundle.tagline ? asQuote(bundle.tagline) : bundle.name}
                  </h2>
                  {paragraphs.map((para) => (
                    <p key={para} className="mt-3 leading-relaxed text-foreground/70">
                      {para}
                    </p>
                  ))}
                  <div className="mt-4">
                    <KitContents items={itemsOf(own, "included")} compact />
                  </div>
                  {bundle.perfect_for && (
                    <p className="mt-4 rounded-2xl border border-glass-border bg-glass-soft p-4 text-sm">
                      <strong>Perfect for:</strong> {bundle.perfect_for}
                    </p>
                  )}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Button asChild>
                      <Link to="/products/$slug" params={{ slug: bundle.slug }}>
                        Shop {bundle.name.replace(/^The /, "the ")}{" "}
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    {price != null && (
                      <span className="font-display text-xl font-semibold">
                        {variants.length > 1 && (
                          <span className="mr-1 text-sm font-medium text-foreground/50">from</span>
                        )}
                        {formatNaira(price)}
                      </span>
                    )}
                    <KitRelated items={itemsOf(own, "related")} />
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </>
  );
}
