-- Sussflow order timeline: remember when each fulfilment step happened.
-- Run after 0001/0002 (Supabase SQL editor or `supabase db push`).
--
-- Status flow (the enum is shared; the storefront labels depend on fulfilment):
--   pending → paid → processing → shipped → delivered
--   delivery: Order placed → Payment confirmed → Packing → Out for delivery → Delivered
--   pickup:   Order placed → Payment confirmed → Packing → Ready for pickup → Picked up
--   cancelled / failed end the flow.

alter table public.orders
  add column if not exists processing_at timestamptz,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists cancelled_at timestamptz;

-- Stamp the matching column the first time an order reaches a status.
create or replace function public.stamp_order_status()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    case new.status
      when 'paid' then new.paid_at := coalesce(new.paid_at, now());
      when 'processing' then new.processing_at := coalesce(new.processing_at, now());
      when 'shipped' then new.shipped_at := coalesce(new.shipped_at, now());
      when 'delivered' then new.delivered_at := coalesce(new.delivered_at, now());
      when 'cancelled' then new.cancelled_at := coalesce(new.cancelled_at, now());
      else null;
    end case;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_stamp_status on public.orders;
create trigger orders_stamp_status
  before update of status on public.orders
  for each row execute function public.stamp_order_status();
