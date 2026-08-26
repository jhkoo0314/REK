-- Store why a listing left current inventory without deleting its history.
-- Apply manually to Supabase Dev only. Production is out of scope.

create type public.listing_end_reason as enum ('other_broker_contract', 'other');

alter table public.listings
  add column end_reason public.listing_end_reason;

comment on column public.listings.end_reason is 'Reason for a non-contract management closure. Contract completion uses listing_status = contract_complete.';
