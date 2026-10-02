-- Sussflow 0010: delivery fees by area within Lagos. Run after 0009.
-- Customers delivering to Lagos choose their area at checkout; each area has its own fee,
-- editable in Admin → Settings → Lagos delivery areas. Fees are in kobo.

alter table public.settings
  add column if not exists lagos_areas jsonb not null default '[]'::jsonb
    check (jsonb_typeof(lagos_areas) = 'array');

-- The area the customer chose, saved with the order (a snapshot of its name).
alter table public.orders
  add column if not exists delivery_area text
    check (delivery_area is null or char_length(delivery_area) <= 80);

update public.settings
set lagos_areas = '[
  {"id": "vi-lekki", "name": "Victoria Island to Lekki", "fee": 500000},
  {"id": "badore-awoyaya", "name": "Badore to Awoyaya", "fee": 700000},
  {"id": "mainland", "name": "Mainland", "fee": 400000},
  {"id": "ikorodu", "name": "Ikorodu (except Caleb University)", "fee": 500000},
  {"id": "mile2-festac", "name": "Mile 2 to Festac", "fee": 500000},
  {"id": "satellite", "name": "Satellite Town", "fee": 600000},
  {"id": "alakuko-sango", "name": "Alakuko to part of Sango Ota", "fee": 600000}
]'::jsonb
where lagos_areas = '[]'::jsonb;
