import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ProductForm } from "@/components/admin/ProductForm";
import {
  adminCard,
  AdminPageHeader,
  ConfirmDelete,
  ErrorNote,
  Loading,
} from "@/components/admin/ui";
import { KitItemsEditor } from "@/components/admin/KitItemsEditor";
import { VariantRows } from "@/components/admin/VariantRows";
import { Button } from "@/components/ui/button";
import { supabase, unwrap } from "@/lib/supabase";
import type { ProductWithVariants } from "@/lib/types";
import { parseChoices } from "@/lib/choices";

export const Route = createFileRoute("/admin/_dash/products/$id")({
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const product = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: async () => {
      const row = unwrap<ProductWithVariants | null>(
        await supabase
          .from("products")
          .select("*, product_variants(*), categories(name, slug)")
          .eq("id", id)
          .maybeSingle(),
      );
      return row
        ? { ...row, product_variants: [...row.product_variants].sort((a, b) => a.sort - b.sort) }
        : null;
    },
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["product"] });
  };

  if (product.isLoading) return <Loading />;
  if (!product.data) return <ErrorNote error={product.error ?? new Error("Product not found")} />;

  const p = product.data;

  return (
    <>
      <Link
        to="/admin/products"
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 hover:text-brand"
      >
        <ChevronLeft className="size-4" /> Products
      </Link>
      <AdminPageHeader
        title={p.name}
        description={`/${p.slug}`}
        actions={
          <>
            <Button variant="glass" size="small" asChild>
              <Link to="/products/$slug" params={{ slug: p.slug }} target="_blank">
                <ExternalLink className="size-4" /> View in shop
              </Link>
            </Button>
            <ConfirmDelete
              title={`Delete ${p.name}?`}
              description="This removes the product and all its price options. Past orders keep their line items."
              trigger={
                <Button
                  variant="outline"
                  size="small"
                  className="hover:border-alert/50 hover:text-alert"
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              }
              onConfirm={async () => {
                const { error } = await supabase.from("products").delete().eq("id", p.id);
                if (error) {
                  toast.error(error.message);
                  return;
                }
                toast.success("Product deleted");
                refresh();
                await navigate({ to: "/admin/products" });
              }}
            />
          </>
        }
      />

      <section className={`${adminCard} mb-5`}>
        <h2 className="font-display text-lg font-semibold">Price options</h2>
        <p className="mb-3 text-sm text-foreground/60">
          Each option is a {p.option_name.toLowerCase()} + pack size combination with its own price
          and stock.
        </p>
        <VariantRows productId={p.id} variants={p.product_variants} optionName={p.option_name} />
      </section>

      <section className={`${adminCard} mb-5`}>
        <h2 className="font-display text-lg font-semibold">Kit contents</h2>
        <p className="mb-3 text-sm text-foreground/60">
          For kits and bundles: list what's inside, add-ons customers can pick to customise it, and
          related products to link to. Kits in the “Bundles” category appear on the Bundles page.
        </p>
        <KitItemsEditor bundleId={p.id} />
      </section>

      <ProductForm
        key={p.id}
        initial={{
          name: p.name,
          slug: p.slug,
          category_id: p.category_id,
          tagline: p.tagline,
          short_detail: p.short_detail,
          description: p.description,
          perfect_for: p.perfect_for,
          image_url: p.image_url,
          gallery: p.gallery,
          is_active: p.is_active,
          featured: p.featured,
          sort: p.sort,
          option_name: p.option_name ?? "Length",
          choices: parseChoices(p.choices),
        }}
        submitLabel="Save changes"
        onSubmit={async (values) => {
          const { error } = await supabase.from("products").update(values).eq("id", p.id);
          if (error) {
            toast.error(error.message);
            return;
          }
          toast.success("Product saved");
          refresh();
        }}
      />
    </>
  );
}
