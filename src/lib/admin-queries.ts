import { queryOptions } from "@tanstack/react-query";

import { supabase, unwrap } from "./supabase";
import type { Category, ProductWithVariants } from "./types";

// Admin queries rely on RLS: admins can read inactive rows too.

export const adminProductsQuery = queryOptions({
  queryKey: ["admin", "products"],
  queryFn: async () => {
    const rows = unwrap<ProductWithVariants[]>(
      await supabase
        .from("products")
        .select("*, product_variants(*), categories(name, slug)")
        .order("sort"),
    );
    return rows.map((p) => ({
      ...p,
      product_variants: [...p.product_variants].sort((a, b) => a.sort - b.sort),
    }));
  },
});

export const adminCategoriesQuery = queryOptions({
  queryKey: ["admin", "categories"],
  queryFn: async () =>
    unwrap<Category[]>(await supabase.from("categories").select("*").order("sort")),
});
