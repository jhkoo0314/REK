-- P0 follow-up: human-readable listing number for internal list/search use.
-- Status: written only. Apply to Supabase Dev manually after the initial P0 schema.

create sequence public.listing_reference_number_seq as integer start with 1;

alter table public.listings
  add column listing_reference_number integer;

update public.listings
set listing_reference_number = nextval('public.listing_reference_number_seq')
where listing_reference_number is null;

alter table public.listings
  alter column listing_reference_number set default nextval('public.listing_reference_number_seq'),
  alter column listing_reference_number set not null;

create unique index listings_organization_reference_number_idx
  on public.listings (organization_id, listing_reference_number);

comment on column public.listings.listing_reference_number is 'Organization-scoped human-readable listing sequence. Display as M-000001.';
