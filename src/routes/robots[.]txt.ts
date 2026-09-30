import { createFileRoute } from "@tanstack/react-router";

import { absoluteUrl } from "@/lib/seo";

// Private and one-off pages stay out of search; everything else is open to crawlers.
const ROBOTS = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /account
Disallow: /cart
Disallow: /checkout
Disallow: /auth
Disallow: /reset-password

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(ROBOTS, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
});
