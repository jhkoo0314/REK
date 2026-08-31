-- Keep the confirmed management end date with the retained listing history.
-- Apply manually to Supabase Dev only. Production is out of scope.

alter table public.listings
  add column end_date date;

comment on column public.listings.end_date is 'Confirmed date a non-contract listing management closure took effect.';
