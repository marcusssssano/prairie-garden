-- Prairie Garden — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push` once you
-- have the CLI linked to your project).

-- Profiles: extends auth.users, one row per signed-up (non-guest) user.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  default_address jsonb,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Plants: the product catalog.
create table plants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text, -- cover photo, shown in the shop grid and cart
  image_urls text[], -- full gallery shown on the plant detail page (includes the cover)
  category text check (category in ('Foliage', 'Succulent & Cacti', 'Flowering', 'Air Plants', 'Statement')),
  light_needs text check (light_needs in ('Low Light', 'Bright Indirect', 'Full Sun')),
  size text check (size in ('Small', 'Medium', 'Large')),
  care_level text check (care_level in ('Easy', 'Moderate', 'Fussy')),
  created_at timestamptz not null default now()
);

-- Orders: one per checkout, guest or logged-in.
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  guest_email text,
  status text not null default 'pending', -- pending | paid | fulfilled | cancelled
  total_cents integer not null,
  shipping_address jsonb not null,
  stripe_payment_intent_id text unique,
  created_at timestamptz not null default now(),
  constraint order_has_owner check (user_id is not null or guest_email is not null)
);

-- Order items: line items per order.
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  plant_id uuid not null references plants(id),
  quantity integer not null check (quantity > 0),
  price_cents_at_purchase integer not null
);

-- === Row Level Security ===

alter table profiles enable row level security;
alter table plants enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Whether the current user is an admin. security definer means this reads
-- profiles with the function owner's privileges, bypassing RLS — critical,
-- because every policy below calls this, and if it went through RLS
-- normally it would re-trigger the profiles policy that calls it, which
-- would re-trigger itself, forever ("infinite recursion detected in
-- policy for relation profiles"). This function is what breaks that loop.
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from profiles where id = auth.uid()),
    false
  );
$$;

-- Plants: anyone can read, only admins can write.
create policy "plants are publicly readable"
  on plants for select
  using (true);

create policy "only admins can insert plants"
  on plants for insert
  with check (public.is_admin());

create policy "only admins can update plants"
  on plants for update
  using (public.is_admin());

create policy "only admins can delete plants"
  on plants for delete
  using (public.is_admin());

-- Profiles: users can read/update their own row; admins can read all.
create policy "users read own profile"
  on profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "users update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Orders: logged-in users see their own orders; admins see everything.
-- Guest orders are NOT selectable via the anon/authenticated role at all —
-- guests look up their order through a server-side route (using the
-- service role key) keyed by order id + email, never a direct table query.
create policy "users read own orders"
  on orders for select
  using (auth.uid() = user_id or public.is_admin());

create policy "admins update orders"
  on orders for update
  using (public.is_admin());

-- order_items inherit visibility through their parent order.
create policy "users read own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or public.is_admin())
    )
  );

-- Note: inserts into orders/order_items happen exclusively from trusted
-- server code (the checkout API route, and the Stripe webhook) using the
-- service role client, which bypasses RLS. The checkout route creates the
-- order as 'pending' before payment; only the webhook — after verifying
-- Stripe's signature — ever flips it to 'paid'. We never trust the browser
-- to tell us a payment succeeded.

-- Auto-create a profiles row whenever someone signs up. Runs as the
-- function owner (security definer), so it bypasses RLS — there's no
-- INSERT policy on profiles for the authenticated role, by design; the
-- only way a profile row should ever appear is via this trigger.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
