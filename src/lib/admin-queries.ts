import { queryOptions } from "@tanstack/react-query";

import { supabase, unwrap } from "./supabase";
import type { BlogPostRow, Category, ProductReview, ProductWithVariants } from "./types";

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

export const adminBlogPostsQuery = queryOptions({
  queryKey: ["admin", "blog"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: true })
      .order("created_at", { ascending: false });
    if (error?.code === "PGRST205" || error?.code === "42P01") return null; // not migrated yet
    if (error) throw new Error(error.message);
    return data as BlogPostRow[];
  },
});

export const adminBlogPostQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin", "blog", id],
    queryFn: async () =>
      unwrap<BlogPostRow | null>(
        await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle(),
      ),
  });

export type AdminReview = ProductReview & { products: { name: string; slug: string } | null };

export const adminReviewsQuery = queryOptions({
  queryKey: ["admin", "reviews"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("product_reviews")
      .select("*, products(name, slug)")
      .order("is_approved")
      .order("created_at", { ascending: false });
    if (error?.code === "PGRST205" || error?.code === "42P01") return null; // not migrated yet
    if (error) throw new Error(error.message);
    return data as AdminReview[];
  },
});
