-- Sussflow 0007: size switch, product videos, reviews, delivery zones, editable banner and
-- blog emails. Run after 0006.

-- ───────────────────────── Sizes ─────────────────────────
-- Each price option can have a size (XS, M, Size 1…) and/or a length (16"). Per product,
-- switches decide which the storefront shows; the hidden one is kept, not deleted.
alter table public.product_variants
  add column if not exists size_label text check (size_label is null or char_length(size_label) <= 30);

alter table public.products
  add column if not exists show_size boolean not null default false,
  add column if not exists show_length boolean not null default true,
  -- Optional link to a product video (YouTube, Instagram, TikTok…), shown as a button.
  add column if not exists video_url text check (video_url is null or video_url ~ '^https://');

-- Period underwear and cups: their sizes were stored as the "length" in 0006; move them.
update public.product_variants v
set size_label = v.length_label, length_label = null
from public.products p
where p.id = v.product_id and p.slug in ('period-underwear', 'menstrual-cup')
  and v.size_label is null and v.length_label is not null;
update public.products set show_size = true, show_length = false
where slug in ('period-underwear', 'menstrual-cup');

-- Reusable pads: sizes XS–2XL by length; inches kept but hidden.
update public.product_variants v
set size_label = case v.length_label
  when '6"' then 'XS' when '8"' then 'S' when '10"' then 'M'
  when '12"' then 'L' when '14"' then 'XL' when '16"' then '2XL' end
from public.products p
where p.id = v.product_id and p.slug = 'reusable-menstrual-pads' and v.size_label is null;
update public.products set show_size = true, show_length = false
where slug = 'reusable-menstrual-pads';

-- ───────────────────────── Reviews ─────────────────────────
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 60),
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 1000),
  -- Reviews appear on the site only after an admin approves them.
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists product_reviews_product_idx
  on public.product_reviews (product_id, is_approved, created_at desc);

alter table public.product_reviews enable row level security;
drop policy if exists product_reviews_public_read on public.product_reviews;
create policy product_reviews_public_read on public.product_reviews
  for select using (is_approved or public.is_admin());
drop policy if exists product_reviews_admin_write on public.product_reviews;
create policy product_reviews_admin_write on public.product_reviews
  for all using (public.is_admin()) with check (public.is_admin());
-- New reviews are inserted by a server function (service role), never directly by visitors.

-- ───────────────────────── Delivery zones & banner ─────────────────────────
-- Waybill fees per geopolitical zone (kobo), keyed as in src/lib/delivery.ts.
alter table public.settings
  add column if not exists zone_fees jsonb not null default '{}'::jsonb
    check (jsonb_typeof(zone_fees) = 'object'),
  add column if not exists announcement_enabled boolean not null default true,
  add column if not exists announcement_text text not null default 'Website-only deals are live · Shop deals'
    check (char_length(announcement_text) <= 140),
  add column if not exists announcement_link text default '/deals'
    check (announcement_link is null or announcement_link ~ '^(/|https://)');

-- Start every zone at the current "outside Lagos" fee so checkout totals don't change.
update public.settings
set zone_fees = jsonb_build_object(
  'south_west', nationwide_delivery_fee, 'south_south', nationwide_delivery_fee,
  'south_east', nationwide_delivery_fee, 'north_central', nationwide_delivery_fee,
  'north_east', nationwide_delivery_fee, 'north_west', nationwide_delivery_fee)
where zone_fees = '{}'::jsonb;

-- ───────────────────────── Blog emails ─────────────────────────
-- One row per (article, subscriber) so a send can resume without emailing anyone twice.
create table if not exists public.newsletter_sends (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  email text not null,
  sent_at timestamptz not null default now(),
  primary key (post_id, email)
);
create table if not exists public.email_unsubscribes (
  email text primary key,
  created_at timestamptz not null default now()
);
alter table public.newsletter_sends enable row level security;
alter table public.email_unsubscribes enable row level security;
drop policy if exists newsletter_sends_admin_read on public.newsletter_sends;
create policy newsletter_sends_admin_read on public.newsletter_sends
  for select using (public.is_admin());
drop policy if exists email_unsubscribes_admin_read on public.email_unsubscribes;
create policy email_unsubscribes_admin_read on public.email_unsubscribes
  for select using (public.is_admin());
