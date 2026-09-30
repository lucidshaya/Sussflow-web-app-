import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import { EMPTY_PRODUCT, ProductForm } from "@/components/admin/ProductForm";
import { AdminPageHeader } from "@/components/admin/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/_dash/products/new")({
  component: NewProduct,
});

function NewProduct() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <>
      <Link
        to="/admin/products"
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 hover:text-brand"
      >
        <ChevronLeft className="size-4" /> Products
      </Link>
      <AdminPageHeader
        title="New product"
        description="Create the product, then add its price options (length, pack size, price, stock)."
      />
      <ProductForm
        initial={EMPTY_PRODUCT}
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
