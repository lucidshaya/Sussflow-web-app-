import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  adminCard,
  AdminPageHeader,
  ConfirmDelete,
  ErrorNote,
  LeafSwitch,
  Loading,
  Pill,
  SearchInput,
  td,
  th,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { adminCategoriesQuery, adminProductsQuery } from "@/lib/admin-queries";
import { formatNaira, lowestPrice } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/_dash/products/")({
  component: ProductsList,
});

function ProductsList() {
  const products = useQuery(adminProductsQuery);
  const categories = useQuery(adminCategoriesQuery);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const patch = async (id: string, values: Partial<Product>) => {
    const { error } = await supabase.from("products").update(values).eq("id", id);
    if (error) toast.error(error.message);
    else refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Product deleted");
    refresh();
  };

  const rows = (products.data ?? []).filter(
    (p) =>
      (!category || p.category_id === category) &&
      `${p.name} ${p.slug}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <AdminPageHeader
        title="Products"
        description={`${products.data?.length ?? 0} products in the catalogue`}
        actions={
          <Button asChild>
            <Link to="/admin/products/new">
              <Plus className="size-4" /> New product
            </Link>
          </Button>
        }
      />
      <div className={adminCard}>
        <div className="mb-4 flex flex-wrap gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search products…" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-full border border-glass-border bg-glass px-4 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <ErrorNote error={products.error} />
        {products.isLoading ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className={th}>Product</th>
                  <th className={th}>Category</th>
                  <th className={th}>Options</th>
                  <th className={th}>Price</th>
                  <th className={th}>Stock</th>
                  <th className={th}>Visible</th>
                  <th className={th}>Featured</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {rows.map((product) => {
                  const from = lowestPrice(product.product_variants);
                  const stock = product.product_variants.reduce((sum, v) => sum + v.stock, 0);
                  return (
                    <tr key={product.id} className="hover:bg-glass-soft">
                      <td className={td}>
                        <Link
                          to="/admin/products/$id"
                          params={{ id: product.id }}
                          className="flex items-center gap-3 font-semibold hover:text-brand"
                        >
                          <img
                            src={product.image_url ?? "/images/pads.jpg"}
                            alt=""
                            className="size-10 rounded-lg object-cover"
                          />
                          {product.name}
                        </Link>
                      </td>
                      <td className={td}>
                        {product.categories?.name ?? <span className="text-foreground/40">—</span>}
                      </td>
                      <td className={td}>{product.product_variants.length}</td>
                      <td className={td}>
                        {from != null ? formatNaira(from) : <Pill tone="alert">No price</Pill>}
                      </td>
                      <td className={td}>
                        {stock <= 5 ? (
                          <Pill tone={stock === 0 ? "alert" : "brand"}>{stock}</Pill>
                        ) : (
                          stock
                        )}
                      </td>
                      <td className={td}>
                        <LeafSwitch
                          checked={product.is_active}
                          onCheckedChange={(checked) =>
                            void patch(product.id, { is_active: checked })
                          }
                          aria-label="Visible in shop"
                        />
                      </td>
                      <td className={td}>
                        <LeafSwitch
                          checked={product.featured}
                          onCheckedChange={(checked) =>
                            void patch(product.id, { featured: checked })
                          }
                          aria-label="Featured"
                        />
                      </td>
                      <td className={`${td} text-right`}>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-9" asChild>
                            <Link
                              to="/admin/products/$id"
                              params={{ id: product.id }}
                              aria-label={`Edit ${product.name}`}
                            >
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <ConfirmDelete
                            title={`Delete ${product.name}?`}
                            description="This removes the product and all its price options. Past orders keep their line items. To hide it instead, switch off “Visible”."
                            onConfirm={() => remove(product.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 && (
              <p className="p-6 text-center text-sm text-foreground/60">No products found.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
