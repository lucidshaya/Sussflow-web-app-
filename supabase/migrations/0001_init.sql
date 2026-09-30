-- Sussflow schema: catalogue, customers, orders, enquiries, settings.
-- Prices are stored in kobo (₦1 = 100 kobo), matching Paystack's amount unit.

create extension if not exists "pgcrypto";

-- ───────────────────────── Roles ─────────────────────────
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin')
$$;

-- ───────────────────────── Profiles ─────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── Catalogue ─────────────────────────
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  tagline text,
  short_detail text,
  description text,
  perfect_for text,
  image_url text,
  gallery text[] not null default '{}',
  is_active boolean not null default true,
  featured boolean not null default false,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  length_label text,                 -- e.g. 16", 14", or null for single-size products
  pack_size integer not null default 1,
  price integer not null check (price >= 0), -- kobo
  stock integer not null default 0 check (stock >= 0),
  sku text unique,
  is_active boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index product_variants_product_idx on public.product_variants (product_id);
create index products_category_idx on public.products (category_id);

-- ───────────────────────── Orders ─────────────────────────
create type public.order_status as enum (
  'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'
);
create type public.fulfilment_method as enum ('delivery', 'pickup');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  full_name text not null,
  phone text not null,
  fulfilment public.fulfilment_method not null default 'delivery',
  address text,
  city text,
  state text,
  notes text,
  admin_notes text,
  subtotal integer not null,
  delivery_fee integer not null default 0,
  total integer not null,
  status public.order_status not null default 'pending',
  paystack_payload jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_created_idx on public.orders (created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  variant_label text,
  unit_price integer not null,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index order_items_order_idx on public.order_items (order_id);

-- ───────────────────────── Enquiries (sessions, partnerships, waitlist, contact) ─────────────────────────
create type public.enquiry_type as enum ('session', 'partnership', 'waitlist', 'contact');
create type public.enquiry_status as enum ('new', 'in_progress', 'closed');

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  type public.enquiry_type not null,
  name text not null,
  organisation text,
  email text not null,
  phone text,
  location text,
  beneficiaries integer,
  message text,
  status public.enquiry_status not null default 'new',
  created_at timestamptz not null default now()
);

-- ───────────────────────── Settings (single row) ─────────────────────────
create table public.settings (
  id integer primary key default 1 check (id = 1),
  lagos_delivery_fee integer not null default 0,           -- kobo; 0 = confirmed after order
  nationwide_delivery_fee integer not null default 0,      -- kobo; 0 = confirmed after order
  free_delivery_threshold integer,                         -- kobo, null = never free
  pickup_address text not null default 'Iju axis, Lagos, Nigeria',
  pickup_instructions text,
  contact_email text,
  contact_phone text,
  whatsapp_url text,
  instagram_url text,
  updated_at timestamptz not null default now()
);

-- ───────────────────────── updated_at trigger ─────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
create trigger variants_touch before update on public.product_variants for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger settings_touch before update on public.settings for each row execute function public.touch_updated_at();

-- ───────────────────────── Stock decrement (called by the payment server) ─────────────────────────
create or replace function public.decrement_stock(_variant_id uuid, _qty integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.product_variants
  set stock = greatest(stock - _qty, 0)
  where id = _variant_id
$$;
revoke execute on function public.decrement_stock(uuid, integer) from public, anon, authenticated;

-- ───────────────────────── Row level security ─────────────────────────
alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.enquiries enable row level security;
alter table public.settings enable row level security;

-- user_roles: users can see their own roles; admins manage all
create policy "roles_select_own" on public.user_roles for select using (user_id = auth.uid() or public.is_admin());
create policy "roles_admin_all" on public.user_roles for all using (public.is_admin()) with check (public.is_admin());

-- profiles
create policy "profiles_select_own" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "profiles_insert_own" on public.profiles for insert with check (id = auth.uid());
create policy "profiles_admin_delete" on public.profiles for delete using (public.is_admin());

-- catalogue: public reads active rows; admins do everything
create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_admin_all" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "products_public_read" on public.products for select using (is_active or public.is_admin());
create policy "products_admin_all" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "variants_public_read" on public.product_variants for select using (
  (is_active and exists (select 1 from public.products p where p.id = product_id and p.is_active))
  or public.is_admin()
);
create policy "variants_admin_all" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

-- orders: customers read their own; only the server (service role) creates/updates; admins manage
create policy "orders_select_own" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "orders_admin_all" on public.orders for all using (public.is_admin()) with check (public.is_admin());

create policy "order_items_select_own" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);
create policy "order_items_admin_all" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

-- enquiries: anyone may submit; admins manage
create policy "enquiries_public_insert" on public.enquiries for insert with check (true);
create policy "enquiries_admin_all" on public.enquiries for all using (public.is_admin()) with check (public.is_admin());

-- settings: public read; admins update
create policy "settings_public_read" on public.settings for select using (true);
create policy "settings_admin_all" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── Storage: product images ─────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects for select using (bucket_id = 'product-images');
create policy "product_images_admin_insert" on storage.objects for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_update" on storage.objects for update using (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_delete" on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());
