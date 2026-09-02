-- Prairie Garden — QA fixes (run once in the Supabase SQL editor)
--
-- Fixes two issues found during a full security/edge-case review:
--
-- 1. CRITICAL: the "users update own profile" RLS policy only restricted
--    *which row* a user could update (their own), not *which columns*.
--    Since Postgres RLS has no column-level concept, any logged-in user
--    could PATCH their own profiles row and flip is_admin to true directly
--    via the Supabase REST API — no service role needed. Verified this
--    empirically against the live project with a fresh non-admin account
--    before writing this fix. Column-level GRANTs are the correct tool
--    here: RLS still controls the row, GRANT now controls the columns.
--
-- 2. Atomic stock decrement — the webhook previously did a read-then-write
--    (select stock, then update stock - quantity) when marking an order
--    paid. Two orders for the same plant confirming close together could
--    race and overwrite each other's decrement, mildly overselling stock.
--    This function does the decrement in one atomic UPDATE statement.

-- === Fix 1: lock down which profile columns a user can self-update ===

revoke update on profiles from authenticated;
grant update (full_name, default_address) on profiles to authenticated;
-- is_admin is intentionally left out — it can now only be changed by the
-- service role (e.g. the manual "promote to admin" step you did earlier),
-- never by a user updating their own row.

-- === Fix 2: atomic stock decrement, used by the Stripe webhook ===

create or replace function public.decrement_plant_stock(p_plant_id uuid, p_quantity integer)
returns void
language sql
security definer set search_path = public
as $$
  update plants
  set stock = greatest(stock - p_quantity, 0)
  where id = p_plant_id;
$$;
