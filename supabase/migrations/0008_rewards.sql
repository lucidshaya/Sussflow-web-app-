-- Sussflow 0008: points rewards. Run after 0007.
-- Customers with an account earn points on paid orders and spend them as a discount at
-- checkout. Rules are set in Admin → Settings → Rewards; rewards start switched off.

alter table public.settings
  add column if not exists rewards_enabled boolean not null default false,
  -- kobo a customer spends to earn 1 point (10000 = ₦100)
  add column if not exists reward_spend_per_point integer not null default 10000
    check (reward_spend_per_point > 0),
  -- kobo off a future order per point (200 = ₦2)
  add column if not exists reward_point_value integer not null default 200
    check (reward_point_value > 0);

alter table public.orders
  add column if not exists points_redeemed integer not null default 0 check (points_redeemed >= 0),
  add column if not exists points_discount integer not null default 0 check (points_discount >= 0),
  add column if not exists points_earned integer not null default 0 check (points_earned >= 0);

create table if not exists public.reward_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  points integer not null check (points <> 0),
  reason text not null check (reason in ('earned', 'redeemed', 'reversed', 'adjustment')),
  note text check (note is null or char_length(note) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists reward_ledger_user_idx on public.reward_ledger (user_id, created_at desc);
-- A payment confirmed twice (webhook + callback) can't earn or spend twice.
create unique index if not exists reward_ledger_order_reason_idx
  on public.reward_ledger (order_id, reason)
  where order_id is not null and reason in ('earned', 'redeemed');

alter table public.reward_ledger enable row level security;
drop policy if exists reward_ledger_own_read on public.reward_ledger;
create policy reward_ledger_own_read on public.reward_ledger
  for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists reward_ledger_admin_write on public.reward_ledger;
create policy reward_ledger_admin_write on public.reward_ledger
  for all using (public.is_admin()) with check (public.is_admin());

-- Current points balance (server functions use the service role; admins via RLS).
create or replace function public.reward_balance(_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(points), 0)::integer from public.reward_ledger where user_id = _user_id;
$$;
revoke all on function public.reward_balance(uuid) from public, anon, authenticated;
grant execute on function public.reward_balance(uuid) to service_role;
