-- Bharat Bhramanam: run this once in Supabase → SQL Editor → New query → Run.
-- One row per user. Users can READ only their own row. Nobody can write from the browser;
-- only the server functions (service role key) mark a user as paid after verifying Razorpay.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  paid boolean not null default false,
  paid_at timestamptz,
  razorpay_order_id text,
  razorpay_payment_id text unique,
  amount_paise integer,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

-- No insert / update / delete policies on purpose.
revoke insert, update, delete on public.profiles from anon, authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- To give yourself (the owner) free Premium after you register:
-- update public.profiles set paid = true, paid_at = now() where email = 'you@example.com';
