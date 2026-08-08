-- Switch pricing from NGN (Monthly / Lifetime) to USD (Monthly / Yearly).
--
-- Existing 'lifetime' profiles are migrated to 'yearly' with an expiry
-- one year out from today, since lifetime access no longer exists as a
-- plan — this is a business decision (lifetime buyers keep a year of
-- access rather than losing paid access outright), not a technical
-- default. Adjust the grace period below if a different policy is
-- wanted before running this in production.
-- Run this once in the Supabase dashboard SQL editor, same as 0001.

update public.profiles
  set plan = 'yearly',
      plan_expires_at = now() + interval '365 days'
  where plan = 'lifetime';

alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check check (plan in ('free', 'monthly', 'yearly'));
