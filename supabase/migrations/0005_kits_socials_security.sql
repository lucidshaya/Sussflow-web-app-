-- Sussflow: kit contents, more social links, stockist/distributor enquiries, security tightening.
-- Run after 0004 in the Supabase SQL editor.

-- ───────────────────────── Kit contents ─────────────────────────
-- A kit/bundle is a normal product (usually in the "Bundles" category) priced in the price list.
-- These rows describe it on the storefront:
--   included → "What's inside" (a catalogue product, or free text such as "Carry-on pouch")
--   addon    → "Customise your kit": extras the customer can add to their bag
--   related  → a linked product shown as a second button (e.g. First Period Box → Back-to-School Kit)
create table if not exists public.bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.products (id) on delete cascade,
  product_id uuid references public.products (id) on delete cascade,
  label text,
  kind text not null default 'included' check (kind in ('included', 'addon', 'related')),
  quantity integer not null default 1 check (quantity between 1 and 99),
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  check (product_id is not null or nullif(trim(label), '') is not null),
  check (product_id is null or product_id <> bundle_id)
);

create index if not exists bundle_items_bundle_idx on public.bundle_items (bundle_id, sort);

alter table public.bundle_items enable row level security;

drop policy if exists "bundle_items_public_read" on public.bundle_items;
create policy "bundle_items_public_read" on public.bundle_items for select using (
  exists (select 1 from public.products p where p.id = bundle_id and (p.is_active or public.is_admin()))
);
drop policy if exists "bundle_items_admin_all" on public.bundle_items;
create policy "bundle_items_admin_all" on public.bundle_items for all
  using (public.is_admin()) with check (public.is_admin());

-- Starter contents (edit in Admin → Products → a kit → Kit contents).
insert into public.bundle_items (bundle_id, product_id, label, kind, quantity, sort)
select b.id, p.id, null, 'included', 1, 1
from public.products b, public.products p
where b.slug = 'back-to-school-kit' and p.slug = 'period-underwear'
  and not exists (select 1 from public.bundle_items i where i.bundle_id = b.id);
insert into public.bundle_items (bundle_id, label, kind, quantity, sort)
select b.id, x.label, 'included', 1, x.sort
from public.products b,
  (values ('Carry-on pouch', 2), ('Wipes', 3)) as x(label, sort)
where b.slug = 'back-to-school-kit'
  and not exists (select 1 from public.bundle_items i where i.bundle_id = b.id and i.label = x.label);

insert into public.bundle_items (bundle_id, product_id, kind, quantity, sort)
select b.id, p.id, 'included', 1, 1
from public.products b, public.products p
where b.slug = 'the-cup-convert' and p.slug = 'menstrual-cup'
  and not exists (select 1 from public.bundle_items i where i.bundle_id = b.id and i.product_id = p.id);
insert into public.bundle_items (bundle_id, label, kind, quantity, sort)
select b.id, 'Cup accessories set', 'included', 1, 2
from public.products b
where b.slug = 'the-cup-convert'
  and not exists (select 1 from public.bundle_items i where i.bundle_id = b.id and i.label = 'Cup accessories set');

insert into public.bundle_items (bundle_id, product_id, kind, quantity, sort)
select b.id, p.id, 'related', 1, 1
from public.products b, public.products p
where b.slug = 'the-first-period-box' and p.slug = 'back-to-school-kit'
  and not exists (select 1 from public.bundle_items i where i.bundle_id = b.id and i.product_id = p.id);

-- ───────────────────────── Social links ─────────────────────────
alter table public.settings
  add column if not exists linkedin_url text,
  add column if not exists x_url text,
  add column if not exists google_business_url text;

update public.settings set
  instagram_url = coalesce(instagram_url, 'https://www.instagram.com/officialsussflow/'),
  tiktok_url = coalesce(tiktok_url, 'https://www.tiktok.com/@sussflow'),
  linkedin_url = coalesce(linkedin_url, 'https://www.linkedin.com/company/sussflow-reusable'),
  x_url = coalesce(x_url, 'https://x.com/sussflow'),
  google_business_url = coalesce(
    google_business_url,
    'https://www.google.com/maps/search/?api=1&query=Sussflow%20Reusable%20Iju%20Ishaga%20Lagos'
  )
where id = 1;

-- ───────────────────────── Stockist & distributor applications ─────────────────────────
alter type public.enquiry_type add value if not exists 'stockist';
alter type public.enquiry_type add value if not exists 'distributor';

-- ───────────────────────── Security tightening ─────────────────────────
-- Enquiries are only created by validated server functions (service role), never directly.
drop policy if exists "enquiries_public_insert" on public.enquiries;

-- Pin search_path on trigger functions (Supabase linter: function_search_path_mutable).
alter function public.touch_updated_at() set search_path = public;
alter function public.stamp_order_status() set search_path = public;
