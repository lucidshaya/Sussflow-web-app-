import { formatNaira } from "./format";
import type { ProductWithVariants, Settings } from "./types";

/**
 * The public address of the site, e.g. https://sussflow.vercel.app or a custom domain.
 * Set from SITE_URL at build time (see `vite.config.ts`), so moving to a new domain only
 * needs SITE_URL changed in Vercel and a redeploy.
 */
export const SITE_URL = (
  (import.meta.env["VITE_SITE_URL"] as string | undefined) || "https://sussflow.vercel.app"
).replace(/\/+$/, "");

export const SITE_NAME = "Sussflow";
export const SITE_TITLE = "Sussflow | Reusable Menstrual Products & Period Care in Nigeria";
export const SITE_DESCRIPTION =
  "Shop reusable menstrual pads, menstrual cups, period underwear and sustainable menstrual products in Nigeria. Based in Lagos with nationwide delivery. Menstrual health education for schools, NGOs & organisations.";
export const SITE_KEYWORDS =
  "reusable menstrual products Nigeria, reusable sanitary pads Nigeria, reusable menstrual pads Nigeria, menstrual cup Nigeria, period underwear Nigeria, menstrual products Nigeria, menstrual care products Nigeria, menstrual health Nigeria, sustainable menstrual products Nigeria, reusable pads Lagos, reusable sanitary pads Lagos, menstrual cup Lagos, period underwear Lagos, menstrual products Lagos, buy reusable pads Lagos, buy menstrual cup Lagos, menstrual health education Nigeria, menstrual hygiene education Nigeria, menstrual health education for schools, menstrual health NGO Nigeria, menstrual health CSR Nigeria, reusable sanitary pads for schools";

const DEFAULT_IMAGE = "/og-image.jpg";

export const absoluteUrl = (pathOrUrl: string) => new URL(pathOrUrl, `${SITE_URL}/`).href;

type JsonLd = Record<string, unknown>;

/** Inline JSON-LD script. `<`, `>`, `&` are escaped so stored text can't break out of the tag. */
const jsonLdScript = (data: JsonLd) => ({
  type: "application/ld+json",
  children: JSON.stringify(data).replace(
    /[<>&\u2028\u2029]/g,
    (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`,
  ),
});

/** Keep descriptions to the ~160 characters search results show. */
export function clip(text: string, max = 158) {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

/** Title, description, canonical URL, share-card tags and structured data for a public page. */
export function seo({
  title,
  description,
  path,
  image,
  type = "website",
  jsonLd = [],
}: {
  title: string;
  description?: string | undefined;
  path: string;
  image?: string | null | undefined;
  type?: "website" | "product" | "article";
  jsonLd?: JsonLd[];
}) {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image || DEFAULT_IMAGE);
  const meta: { title?: string; name?: string; property?: string; content?: string }[] = [
    { title },
    { property: "og:title", content: title },
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:image", content: imageUrl },
  ];
  if (description) {
    meta.push(
      { name: "description", content: description },
      { property: "og:description", content: description },
      { name: "twitter:description", content: description },
    );
  }
  return {
    meta,
    links: [{ rel: "canonical", href: url }],
    scripts: jsonLd.map(jsonLdScript),
  };
}

/** Pages with personal or one-off content (bag, checkout, account): kept out of search. */
export const privatePage = (title: string) => ({
  meta: [{ title }, { name: "robots", content: "noindex, nofollow" }],
});

export function organizationJsonLd(settings: Settings | null | undefined): JsonLd {
  const sameAs = [
    settings?.instagram_url,
    settings?.facebook_url,
    settings?.tiktok_url,
    settings?.linkedin_url,
    settings?.x_url,
    settings?.google_business_url,
  ].filter((link): link is string => Boolean(link));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        legalName: "Sussflow Reusable Nigeria Limited",
        url: `${SITE_URL}/`,
        logo: absoluteUrl("/logo.png"),
        description:
          "Reusable menstrual pads, menstrual cups, period underwear and menstrual health education in Nigeria.",
        areaServed: "NG",
        ...(sameAs.length ? { sameAs } : {}),
        address: {
          "@type": "PostalAddress",
          streetAddress: settings?.pickup_address ?? "Iju axis",
          addressLocality: "Lagos",
          addressRegion: "Lagos",
          addressCountry: "NG",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        inLanguage: "en-NG",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

/** Google's product result data: name, image, price range and stock. */
export function productJsonLd(product: ProductWithVariants): JsonLd {
  const variants = product.product_variants.filter((v) => v.is_active && v.price > 0);
  const prices = variants.map((v) => v.price / 100);
  const inStock = variants.some((v) => v.stock > 0);
  const images = [product.image_url, ...(product.gallery ?? [])]
    .filter((src): src is string => Boolean(src))
    .map(absoluteUrl);
  const url = absoluteUrl(`/products/${product.slug}`);
  const availability = `https://schema.org/${inStock ? "InStock" : "OutOfStock"}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url,
    ...(images.length ? { image: images } : {}),
    description: clip(product.description || product.short_detail || product.name, 500),
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(product.categories ? { category: product.categories.name } : {}),
    ...(prices.length
      ? {
          offers:
            prices.length === 1
              ? {
                  "@type": "Offer",
                  url,
                  priceCurrency: "NGN",
                  price: prices[0],
                  availability,
                  seller: { "@id": `${SITE_URL}/#organization` },
                }
              : {
                  "@type": "AggregateOffer",
                  url,
                  priceCurrency: "NGN",
                  lowPrice: Math.min(...prices),
                  highPrice: Math.max(...prices),
                  offerCount: prices.length,
                  availability,
                  seller: { "@id": `${SITE_URL}/#organization` },
                },
        }
      : {}),
  };
}

/** Product description for search results, with the starting price when there is one. */
export function productDescription(product: ProductWithVariants) {
  const prices = product.product_variants.filter((v) => v.is_active && v.price > 0);
  const from = prices.length ? Math.min(...prices.map((v) => v.price)) : null;
  const base = product.short_detail || product.description || product.tagline || product.name;
  const price = from == null ? "" : ` From ${formatNaira(from)}.`;
  // The fixed tail is ~60 characters; the product's own copy gets the rest.
  const named = base.toLowerCase().includes(product.name.toLowerCase())
    ? base
    : `${product.name}: ${base}`;
  const lead = clip(named, 95).replace(/[.!…]?$/, ".");
  return `${lead}${price} Lagos pickup & nationwide delivery.`;
}

export function faqJsonLd(items: { q: string; a: string[] }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a.join(" ") },
    })),
  };
}
