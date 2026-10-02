-- Sussflow 0009: tighten who can call database functions directly (Supabase security advisor).
-- Run after 0008.

-- Trigger and event-trigger functions run automatically; nobody needs to call them over the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.stamp_order_status() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
do $$
begin
  if exists (select 1 from pg_proc where proname = 'rls_auto_enable' and pronamespace = 'public'::regnamespace) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;

-- has_role(uid, role) would let anyone check whether a given user is an admin. Only is_admin()
-- uses it (as its owner), so the API roles don't need it.
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;

-- is_admin() stays executable: every RLS policy calls it, and it only answers for the caller.
