import { createFileRoute } from "@tanstack/react-router";

import { BLOG_POSTS } from "@/content/blog";
import { absoluteUrl } from "@/lib/seo";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

// Public pages worth indexing. Bag, checkout, account and admin pages are left out.
const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/shop", priority: "0.9", changefreq: "daily" },
  { path: "/bundles", priority: "0.8", changefreq: "weekly" },
  { path: "/deals", priority: "0.8", changefreq: "weekly" },
  { path: "/find-your-fit", priority: "0.7", changefreq: "monthly" },
  { path: "/education", priority: "0.7", changefreq: "monthly" },
  { path: "/faq", priority: "0.7", changefreq: "monthly" },
  { path: "/blog", priority: "0.7", changefreq: "weekly" },
  ...BLOG_POSTS.map((post) => ({
    path: `/blog/${post.slug}`,
    priority: "0.6",
    changefreq: "monthly",
  })),
  { path: "/size-guide", priority: "0.6", changefreq: "monthly" },
  { path: "/store-location", priority: "0.6", changefreq: "monthly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/become-a-stockist", priority: "0.4", changefreq: "yearly" },
  { path: "/become-a-distributor", priority: "0.4", changefreq: "yearly" },
  { path: "/track", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.2", changefreq: "yearly" },
  { path: "/privacy", priority: "0.2", changefreq: "yearly" },
];

const escapeXml = (text: string) => text.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

async function catalogPages() {
  if (!isSupabaseConfigured) return [];
  const [products, categories] = await Promise.all([
    supabase.from("products").select("slug").eq("is_active", true).order("sort"),
    supabase.from("categories").select("slug").order("sort"),
  ]);
  return [
    ...(categories.data ?? []).map((c: { slug: string }) => ({
      path: `/shop?category=${encodeURIComponent(c.slug)}`,
      priority: "0.8",
      changefreq: "weekly",
    })),
    ...(products.data ?? []).map((p: { slug: string }) => ({
      path: `/products/${encodeURIComponent(p.slug)}`,
      priority: "0.9",
      changefreq: "weekly",
    })),
  ];
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const pages = [...STATIC_PAGES, ...(await catalogPages().catch(() => []))];
        const urls = pages
          .map(
            (page) =>
              `  <url><loc>${escapeXml(absoluteUrl(page.path))}</loc><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            // New products show up within an hour without rebuilding.
            "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
