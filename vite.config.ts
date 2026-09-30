import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";

// Make server-only secrets from .env (SUPABASE_SERVICE_ROLE_KEY, PAYSTACK_SECRET_KEY, SITE_URL)
// available to server functions during local dev. In production set them in Vercel's env.
for (const [key, value] of Object.entries(
  loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd(), ""),
)) {
  if (process.env[key] === undefined) process.env[key] = value;
}

// Security headers on every response (applied by Vercel from the build output).
// CSP allows only this site, Supabase (API, auth, storage images), Google Fonts and the
// Paystack checkout redirect. TanStack Start's hydration uses inline scripts, hence 'unsafe-inline'.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.paystack.com",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = {
  "content-security-policy": CSP,
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "cross-origin-opener-policy": "same-origin",
};

const ROUTE_RULES = {
  "/**": { headers: SECURITY_HEADERS },
  // Keep the dashboard and account pages out of search engines.
  "/admin/**": { headers: { ...SECURITY_HEADERS, "x-robots-tag": "noindex, nofollow" } },
  "/api/**": { headers: { ...SECURITY_HEADERS, "cache-control": "no-store" } },
};

// Public site address for canonical links, share cards and the sitemap (not a secret).
const SITE_URL = (process.env["VITE_SITE_URL"] || process.env["SITE_URL"] || "").replace(
  /\/+$/,
  "",
);

export default defineConfig(({ command }) => ({
  server: { port: 8080 },
  define: { "import.meta.env.VITE_SITE_URL": JSON.stringify(SITE_URL) },
  resolve: {
    alias: { "@": `${process.cwd()}/src` },
    dedupe: ["react", "react-dom", "@tanstack/react-query", "@tanstack/query-core"],
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
      // Keep server-only modules out of the browser bundle.
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    // Builds `.vercel/output` (Build Output API) for Vercel.
    ...(command === "build" ? [nitro({ preset: "vercel", routeRules: ROUTE_RULES })] : []),
    viteReact(),
  ],
}));
