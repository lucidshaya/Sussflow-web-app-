-- Sussflow 0006: size-based options, customer choices (flow type / colour) and the blog. Run after 0005.

-- ───────────────────────── Product options ─────────────────────────
-- What a product's variant option is called on the storefront and in the dashboard:
-- "Length" for pads (16", 14"…), "Size" for period underwear (XS–4XL) and cups (Size 1 / Size 2).
alter table public.products
  add column if not exists option_name text not null default 'Length'
    check (char_length(option_name) between 1 and 30);

-- Extra choices that don't change price or stock, e.g.
-- [{"name": "Flow type", "values": ["Normal flow", "Heavy flow"]}].
-- The customer's picks are saved with the order line (order_items.variant_label).
alter table public.products
  add column if not exists choices jsonb not null default '[]'::jsonb
    check (jsonb_typeof(choices) = 'array');

-- ───────────────────────── Blog ─────────────────────────
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 140),
  excerpt text not null default '' check (char_length(excerpt) <= 300),
  tag text not null default 'Period care' check (char_length(tag) <= 40),
  image_url text,
  -- Plain text: blank lines separate paragraphs, "## " starts a heading, "- " a bullet.
  body text not null default '',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx
  on public.blog_posts (is_published, published_at desc);

drop trigger if exists blog_posts_touch on public.blog_posts;
create trigger blog_posts_touch before update on public.blog_posts
  for each row execute function public.touch_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists blog_posts_public_read on public.blog_posts;
create policy blog_posts_public_read on public.blog_posts
  for select using (is_published or public.is_admin());

drop policy if exists blog_posts_admin_write on public.blog_posts;
create policy blog_posts_admin_write on public.blog_posts
  for all using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── Catalogue updates ─────────────────────────
-- Period underwear is sold by size (XS–4XL); menstrual cups in Size 1 (small) and Size 2 (large).
update public.products set option_name = 'Size' where slug in ('period-underwear', 'menstrual-cup');

-- Reusable pads: flow type and colour are customer choices.
update public.products
set choices = '[
  {"name": "Flow type", "values": ["Normal flow", "Heavy flow"]},
  {"name": "Colour", "values": ["Plain colour", "Mixed colour"]}
]'::jsonb
where slug = 'reusable-menstrual-pads' and choices = '[]'::jsonb;
