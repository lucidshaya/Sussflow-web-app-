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

export default defineConfig(({ command }) => ({
  server: { port: 8080 },
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
    ...(command === "build" ? [nitro({ preset: "vercel" })] : []),
    viteReact(),
  ],
}));
