-- Let a contract retain the actual listing round even if it has already moved to history.
-- Contract activity rules still update only current listings, so historical records are not reopened.

create or replace function public.validate_contract_actual_listing()
returns trigger language plpgsql as $$
begin
  if not exists (
    select 1 from public.listings
    where id = new.listing_id and organization_id = new.organization_id
  ) then
    raise exception 'A contract must use a listing in the same organization.';
  end if;
  return new;
end;
$$;
