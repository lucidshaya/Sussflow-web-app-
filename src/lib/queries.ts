import { queryOptions } from "@tanstack/react-query";

import { isSupabaseConfigured, supabase, unwrap } from "./supabase";
import type { Category, ProductWithVariants, Settings } from "./types";

const PRODUCT_SELECT = "*, product_variants(*), categories(name, slug)";

function sortVariants(product: ProductWithVariants): ProductWithVariants {
  return {
    ...product,
    product_variants: [...product.product_variants].sort((a, b) => a.sort - b.sort),
  };
}

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  enabled: isSupabaseConfigured,
  queryFn: async () =>
    unwrap<Category[]>(await supabase.from("categories").select("*").order("sort")),
});

export const productsQuery = (
  opts: { categorySlug?: string | undefined; featured?: boolean } = {},
) =>
  queryOptions({
    queryKey: ["products", opts],
    enabled: isSupabaseConfigured,
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(
          opts.categorySlug
            ? "*, product_variants(*), categories!inner(name, slug)"
            : PRODUCT_SELECT,
        )
        .eq("is_active", true)
        .order("sort");
      if (opts.categorySlug) query = query.eq("categories.slug", opts.categorySlug);
      if (opts.featured) query = query.eq("featured", true);
      const rows = unwrap<ProductWithVariants[]>(await query);
      return rows.map(sortVariants);
    },
  });

export const productBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    enabled: isSupabaseConfigured,
    queryFn: async () => {
      const row = unwrap<ProductWithVariants | null>(
        await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle(),
      );
      return row ? sortVariants(row) : null;
    },
  });

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  enabled: isSupabaseConfigured,
  queryFn: async () =>
    unwrap<Settings | null>(await supabase.from("settings").select("*").eq("id", 1).maybeSingle()),
});
