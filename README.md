# Sussflow — Reusable Menstrual Products & Period Care in Nigeria

Full-stack e-commerce storefront and admin dashboard for **Sussflow Reusable Nigeria Limited**.

- **Frontend:** TanStack Start (React 19, SSR, file-based routing) · Tailwind v4 · shadcn/ui · Poppins
- **Database, auth and storage:** [Supabase](https://supabase.com) (Postgres + RLS)
- **Hosting:** [Vercel](https://vercel.com) (nitro `vercel` preset)
- **Payments:** [Paystack](https://paystack.com) (NGN; server-side initialise + verify + webhook)

## Setup

### 1. Install

```sh
bun install   # or: npm install
cp .env.example .env
```

### 2. Supabase

1. Create a project at supabase.com.
2. In the **SQL editor**, run these two files in order. If you use the Supabase CLI, run `supabase db push` instead.
   - `supabase/migrations/0001_init.sql`: tables, row-level security, storage bucket and helper functions.
   - `supabase/migrations/0002_seed.sql`: categories, products and **the current price list**.
   - `supabase/migrations/0003_order_timeline.sql`: records when each order step happened (packing, ready/out for delivery, delivered/picked up).
3. Copy **Project URL**, **anon key** and **service_role key** (Project Settings → API) into `.env`.
4. Optional: Authentication → URL configuration. Set the Site URL to your domain so that confirmation and reset emails link back to the site.

### 3. Paystack (test mode)

1. In Paystack, go to Settings → API Keys & Webhooks and copy the **test** public and secret keys into `.env`.
2. Set `SITE_URL`. Paystack sends customers back to `${SITE_URL}/checkout/callback`.
3. Set the webhook URL to `https://<your-domain>/api/paystack/webhook`. The callback page also verifies each payment, so orders are confirmed even without the webhook during local testing.

Test card: `4084 0840 8408 4081`, any future expiry date, CVV `408`, PIN `0000`, OTP `123456`.

### 4. Create the first admin

1. Run `npm run dev` and create an account at `/auth`.
2. Run this in the Supabase SQL editor:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'you@example.com';
```

3. Sign in at `/admin/login`. Other admins can then be added from **Admin → Settings**.

### 5. Deploy to Vercel

1. Import the GitHub repo in Vercel. Leave the framework preset as **Other** and keep the default build settings. `vite build` writes `.vercel/output`, which Vercel serves directly.
2. In Project → Settings → Environment Variables, add every key from `.env.example`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`, and `SITE_URL` set to the live URL (e.g. `https://sussflow.vercel.app`).
3. After the first deploy:
   - in Supabase → Authentication → URL configuration, set the Site URL to the live URL;
   - in Paystack, set the webhook to `https://<live-url>/api/paystack/webhook`.

### 6. Custom domain

1. Vercel → Project → Settings → Domains: add the domain and create the DNS records Vercel lists at your registrar. Set it as the primary domain and redirect `sussflow.vercel.app` to it.
2. Change `SITE_URL` (Production) to `https://<your-domain>` and redeploy. Canonical links, share cards, `robots.txt` and `sitemap.xml` all use it.
3. Supabase → Authentication → URL configuration: Site URL `https://<your-domain>`, and add `https://<your-domain>/**` to Redirect URLs.
4. Paystack (Live) → Webhook URL: `https://<your-domain>/api/paystack/webhook`.
5. Google Search Console: add the domain and submit `https://<your-domain>/sitemap.xml`.

## SEO

- Every public page sets its title, description, canonical URL and share-card tags with `seo()` in `src/lib/seo.ts`; bag, checkout and account pages use `privatePage()` (noindex).
- Route loaders prefetch Supabase data on the server (`prefetch()` in `src/lib/queries.ts`, hydrated by `src/router.tsx`), so product names, prices and descriptions are in the HTML.
- Structured data: Organization + WebSite (home), Product with price and stock (product pages), FAQPage (`/faq`).
- `/sitemap.xml` lists the public pages, categories and every active product; `/robots.txt` points to it.
- The default share image is `public/og-image.jpg` (1200×630). Product pages use the product photo.

## Order flow

`pending → paid → processing → shipped → delivered`. Cancelled and failed end the flow.

| Status       | Delivery label   | Pickup label     | How it gets there                             |
| ------------ | ---------------- | ---------------- | --------------------------------------------- |
| `pending`    | Awaiting payment | Awaiting payment | Checkout creates the order                    |
| `paid`       | Paid             | Paid             | Automatic, once Paystack confirms the payment |
| `processing` | Packing          | Packing          | Admin clicks **Start packing**                |
| `shipped`    | Out for delivery | Ready for pickup | Admin clicks the next-step button             |
| `delivered`  | Delivered        | Picked up        | Admin clicks the next-step button             |

The admin order page and the customer's **My account → order** page both show this as a timeline. Use the Status dropdown for corrections and cancellations.

## Scripts

| Command         | What it does                                   |
| --------------- | ---------------------------------------------- |
| `npm run dev`   | Dev server on http://localhost:8080            |
| `npm run build` | Production build for Vercel (`.vercel/output`) |
| `npm run lint`  | ESLint + Prettier                              |

## What's where

| Path                          | Purpose                                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/_site/*`          | Storefront: home, shop, product, bundles, find-your-fit, education, FAQ, about, store location, cart, checkout, auth, account |
| `src/routes/admin/*`          | Admin: overview, **price list**, products, categories, orders, customers, enquiries, settings                                 |
| `src/functions/payments.ts`   | Server functions: create order priced from the DB, initialise and verify Paystack                                             |
| `src/functions/*.server.ts`   | Server-only helpers (Paystack verify, webhook signature, mark-paid)                                                           |
| `src/routes/api/paystack/...` | Paystack webhook endpoint                                                                                                     |
| `src/lib/`                    | Supabase clients, cart, auth context, queries, formatting                                                                     |
| `src/content/site.ts`         | Marketing copy and FAQs                                                                                                       |
| `supabase/migrations/`        | Schema and seed                                                                                                               |

## Notes

- **Prices:** stored in **kobo** (₦1 = 100 kobo). Checkout always re-prices items from the database.
- **Stock:** reduced once, when a payment is verified.
- **Delivery fees:** default to ₦0 ("confirmed after order / paid to rider"). Set them in Admin → Settings.
- **Items without a published price:** the Back-to-School Kit and the five bundles are seeded **hidden**. Set their price options in Admin → Price list, then switch them on.
