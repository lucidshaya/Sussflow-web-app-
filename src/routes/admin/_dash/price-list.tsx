import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";

import {
  adminCard,
  AdminPageHeader,
  ErrorNote,
  Loading,
  Pill,
  SearchInput,
} from "@/components/admin/ui";
import { VariantRows } from "@/components/admin/VariantRows";
import { Button } from "@/components/ui/button";
import { adminCategoriesQuery, adminProductsQuery } from "@/lib/admin-queries";
import { formatNaira, lowestPrice } from "@/lib/format";

export const Route = createFileRoute("/admin/_dash/price-list")({
  component: PriceList,
});

function PriceList() {
  const products = useQuery(adminProductsQuery);
  const categories = useQuery(adminCategoriesQuery);
  const [search, setSearch] = useState("");

  const filtered = (products.data ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );
  const groups = [...(categories.data ?? []), { id: null, name: "Uncategorised", slug: "none" }]
    .map((category) => ({ category, items: filtered.filter((p) => p.category_id === category.id) }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <AdminPageHeader
        title="Price list"
        description="Every length, pack size, price and stock level in one place. Edit inline and hit Save — the storefront updates instantly."
        actions={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Filter products…" />
            <Button asChild>
              <Link to="/admin/products/new">
                <Plus className="size-4" /> New product
              </Link>
            </Button>
          </>
        }
      />
      <ErrorNote error={products.error} />
      {products.isLoading ? (
        <Loading />
      ) : (
        <div className="space-y-8">
          {groups.map(({ category, items }) => (
            <section key={category.slug}>
              <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-brand">
                {category.name}
              </h2>
              <div className="space-y-4">
                {items.map((product) => {
                  const from = lowestPrice(product.product_variants);
                  return (
                    <article key={product.id} className={adminCard}>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url ?? "/images/pads.jpg"}
                            alt=""
                            className="size-12 rounded-xl object-cover"
                          />
                          <div>
                            <h3 className="font-display text-lg font-semibold leading-tight">
                              {product.name}
                            </h3>
                            <p className="text-xs text-foreground/55">
                              {product.product_variants.length} option
                              {product.product_variants.length === 1 ? "" : "s"}
                              {from != null && ` · from ${formatNaira(from)}`}
                            </p>
                          </div>
                          {!product.is_active && <Pill tone="alert">Hidden from shop</Pill>}
                        </div>
                        <Button variant="ghost" size="small" asChild>
                          <Link to="/admin/products/$id" params={{ id: product.id }}>
                            <Pencil className="size-4" /> Edit product
                          </Link>
                        </Button>
                      </div>
                      <VariantRows productId={product.id} variants={product.product_variants} />
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
          {groups.length === 0 && <p className="text-sm text-foreground/60">No products match.</p>}
        </div>
      )}
    </>
  );
}
