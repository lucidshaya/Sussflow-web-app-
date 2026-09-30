-- Sussflow website deals + social links. Run after 0003.

-- "Was" price for deals: the shop shows it crossed out next to the real price.
-- Checkout always charges `price`; this column is display-only.
alter table public.product_variants
  add column if not exists compare_at_price integer
    check (compare_at_price is null or compare_at_price > 0);

-- Launch deals: 15% off every 10-pack of pads, and 3 period pants for ₦40,000.
update public.product_variants set compare_at_price = 2200000 where sku = 'PAD-16-10';
update public.product_variants set compare_at_price = 2000000 where sku = 'PAD-14-10';
update public.product_variants set compare_at_price = 1500000 where sku in ('PAD-12-10', 'PAD-10-10');
update public.product_variants set compare_at_price = 4500000 where sku = 'UNDERWEAR-BLK-3';

-- Social links shown in the footer (Instagram and WhatsApp already exist).
alter table public.settings
  add column if not exists tiktok_url text,
  add column if not exists facebook_url text;
