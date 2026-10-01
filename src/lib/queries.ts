import { queryOptions, type QueryClient } from "@tanstack/react-query";

import { isSupabaseConfigured, supabase, unwrap } from "./supabase";
import type {
  BlogPostRow,
  BundleItemKind,
  BundleItem,
  Category,
  Product,
  ProductWithVariants,
  Settings,
  Variant,
} from "./types";

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

/** A kit line with its catalogue product (null for free-text lines or hidden products). */
export interface BundleItemWithProduct extends BundleItem {
  product:
    | (Pick<Product, "id" | "name" | "slug" | "image_url" | "choices"> & {
        product_variants: Variant[];
      })
    | null;
}

/** True when the kit tables don't exist yet (migration 0005 not run). */
function isMissingTable(error: { code?: string } | null) {
  return error?.code === "PGRST205" || error?.code === "42P01";
}

/** Contents, add-ons and related products for one or more kits. */
export const bundleItemsQuery = (bundleIds: string[]) =>
  queryOptions({
    queryKey: ["bundle-items", [...bundleIds].sort()],
    enabled: isSupabaseConfigured && bundleIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bundle_items")
        .select(
          "*, product:products!bundle_items_product_id_fkey(id, name, slug, image_url, choices, product_variants(*))",
        )
        .in("bundle_id", bundleIds)
        .order("sort");
      if (isMissingTable(error)) return [];
      if (error) throw new Error(error.message);
      return (data as BundleItemWithProduct[])
        .map((item) =>
          item.product
            ? {
                ...item,
                product: {
                  ...item.product,
                  product_variants: item.product.product_variants
                    .filter((v) => v.is_active)
                    .sort((a, b) => a.sort - b.sort),
                },
              }
            : item,
        )
        .filter((item) => item.product || item.label);
    },
  });

/** Kit lines of one kind: "included", "addon" or "related". */
export const itemsOf = (items: BundleItemWithProduct[] | undefined, kind: BundleItemKind) =>
  (items ?? []).filter((item) => item.kind === kind);

/**
 * For route loaders: fetch on the server so the page's HTML includes the data (search engines,
 * link previews). Failures are swallowed; the page then fetches in the browser as usual.
 */
export async function prefetch(
  queryClient: QueryClient,
  ...queries: { queryKey: readonly unknown[] }[]
) {
  if (!isSupabaseConfigured) return;
  await Promise.all(
    queries.map((query) =>
      queryClient.prefetchQuery(query as Parameters<QueryClient["prefetchQuery"]>[0]),
    ),
  );
}

const BLOG_FIELDS =
  "id, slug, title, excerpt, tag, image_url, body, is_published, published_at, created_at, updated_at";

/** Published blog posts, newest first (Admin → Blog). Empty until migration 0006 has run. */
export const blogPostsQuery = (limit?: number) =>
  queryOptions({
    queryKey: ["blog", limit ?? "all"],
    enabled: isSupabaseConfigured,
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select(BLOG_FIELDS)
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (isMissingTable(error)) return [];
      if (error) throw new Error(error.message);
      return data as BlogPostRow[];
    },
  });

export const blogPostQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog", "post", slug],
    enabled: isSupabaseConfigured,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(BLOG_FIELDS)
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (isMissingTable(error)) return null;
      if (error) throw new Error(error.message);
      return data as BlogPostRow | null;
    },
  });
