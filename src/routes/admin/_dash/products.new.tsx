import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { EMPTY_PRODUCT, ProductForm } from "@/components/admin/ProductForm";
import { AdminPageHeader, Loading } from "@/components/admin/ui";
import { adminCategoriesQuery } from "@/lib/admin-queries";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/_dash/products/new")({
  // ?kit=true pre-selects the Bundles category so the kit shows on the Bundles page.
  validateSearch: z.object({ kit: z.boolean().optional() }),
  component: NewProduct,
});

function NewProduct() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { kit } = Route.useSearch();
  const categories = useQuery(adminCategoriesQuery);
  const bundlesId = categories.data?.find((c) => c.slug === "bundles")?.id ?? null;
  if (kit && categories.isLoading) return <Loading />;

  return (
    <>
      <Link
        to="/admin/products"
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 hover:text-brand"
      >
        <ChevronLeft className="size-4" /> Products
      </Link>
      <AdminPageHeader
        title={kit ? "New kit" : "New product"}
        description={
          kit
            ? "Name the kit, add its quote and description, then add its price and what's inside."
            : "Create the product, then add its price options (length, pack size, price, stock)."
        }
      />
      <ProductForm
        key={kit ? "kit" : "product"}
        initial={kit ? { ...EMPTY_PRODUCT, category_id: bundlesId } : EMPTY_PRODUCT}
        submitLabel="Create product"
        onSubmit={async (values) => {
          const { data, error } = await supabase
            .from("products")
            .insert(values)
            .select("id")
            .single();
          if (error || !data) {
            toast.error(error?.message ?? "Could not create product");
            return;
          }
          toast.success("Product created — now add its prices");
          void queryClient.invalidateQueries({ queryKey: ["admin"] });
          await navigate({ to: "/admin/products/$id", params: { id: data.id as string } });
        }}
      />
    </>
  );
}
