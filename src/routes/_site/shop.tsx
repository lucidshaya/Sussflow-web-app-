import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import { EmptyState, PageHero, SetupNotice } from "@/components/site/primitives";
import { ProductCard, ProductGridSkeleton } from "@/components/site/ProductCard";
import { categoriesQuery, productsQuery } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/shop")({
  validateSearch: z.object({ category: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Shop Reusable Menstrual Products in Nigeria | Sussflow" },
      {
        name: "description",
        content:
          "Shop reusable menstrual pads, pantyliners, interlabial pads, period underwear, menstrual cups and cup care. Lagos pickup and nationwide delivery.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { category } = Route.useSearch();
  const categories = useQuery(categoriesQuery);
  const products = useQuery(productsQuery({ categorySlug: category }));
  const current = categories.data?.find((c) => c.slug === category);

  return (
    <>
      <PageHero
        eyebrow="Shop Sussflow"
        title={current ? current.name : "Everything you need for your period journey"}
      >
        {current?.description ??
          "Reusable menstrual pads, menstrual cups, period underwear, pantyliners, interlabial pads, first-period products and other menstrual health essentials."}
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-8">
        {!isSupabaseConfigured ? (
          <SetupNotice />
        ) : (
          <>
            <div
              className="mb-6 flex flex-wrap gap-2"
              role="tablist"
              aria-label="Filter by category"
            >
              <FilterChip active={!category} to={undefined} label="All" />
              {categories.data?.map((c) => (
                <FilterChip key={c.id} active={category === c.slug} to={c.slug} label={c.name} />
              ))}
            </div>
            {products.isLoading ? (
              <ProductGridSkeleton count={6} />
            ) : products.error ? (
              <p className="text-sm text-alert">Couldn't load products: {products.error.message}</p>
            ) : products.data?.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {products.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState title="Nothing here yet">
                New products for this category are on their way.
              </EmptyState>
            )}
          </>
        )}
      </section>
    </>
  );
}

function FilterChip({
  active,
  to,
  label,
}: {
  active: boolean;
  to: string | undefined;
  label: string;
}) {
  return (
    <Link
      to="/shop"
      search={{ category: to }}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-glass-border bg-glass text-foreground/75 backdrop-blur-xl hover:text-brand",
      )}
    >
      {label}
    </Link>
  );
}
