-- A cancellation or expiry after completion remains in the contract activity history.
-- Keep the completed listing as history, then create one new vacant listing only
-- when the same unit does not already have current inventory.

create or replace function public.apply_contract_listing_state(target_contract_id uuid)
returns void language plpgsql as $$
declare item public.contracts%rowtype;
begin
  select * into item from public.contracts where id = target_contract_id;
  if not found then return; end if;

  if item.status in ('in_progress', 'balance_due') then
    update public.listings
    set listing_status = 'contract_in_progress',
        updated_by_clerk_user_id = item.updated_by_clerk_user_id
    where id = item.listing_id
      and organization_id = item.organization_id
      and is_current = true
      and listing_status not in ('ended', 'contract_complete');

  elsif item.status = 'completed' then
    update public.listings
    set listing_status = 'contract_complete',
        is_current = false,
        updated_by_clerk_user_id = item.updated_by_clerk_user_id
    where id = item.listing_id
      and organization_id = item.organization_id
      and is_current = true;

    if item.source_consultation_id is not null then
      update public.consultations
      set status = 'ended',
          progress_stage = 'closed',
          scheduled_next_contact_date = null,
          next_contact_date = null,
          updated_by_clerk_user_id = item.updated_by_clerk_user_id
      where id = item.source_consultation_id
        and organization_id = item.organization_id;
    end if;

  elsif item.status in ('cancelled', 'expired') then
    update public.listings
    set listing_status = 'vacant',
        updated_by_clerk_user_id = item.updated_by_clerk_user_id
    where id = item.listing_id
      and organization_id = item.organization_id
      and is_current = true
      and listing_status = 'contract_in_progress';

    if exists (
      select 1
      from public.contract_activities
      where contract_id = item.id
        and organization_id = item.organization_id
        and activity_type = 'completed'
    ) and not exists (
      select 1
      from public.listings historical
      where historical.id = item.listing_id
        and historical.organization_id = item.organization_id
        and historical.is_current = false
        and historical.listing_status = 'contract_complete'
    ) then
      return;
    end if;

    if exists (
      select 1
      from public.contract_activities
      where contract_id = item.id
        and organization_id = item.organization_id
        and activity_type = 'completed'
    ) and not exists (
      select 1
      from public.listings current_listing
      join public.listings historical on historical.id = item.listing_id
      where current_listing.organization_id = item.organization_id
        and current_listing.unit_id = historical.unit_id
        and current_listing.is_current = true
    ) then
      insert into public.listings (
        organization_id, unit_id, property_type, listing_status, is_current,
        transaction_type, deposit_amount, monthly_rent_amount,
        maintenance_fee_amount, availability_type, available_date, move_out_date,
        exclusive_area_m2, holding_source, created_by_clerk_user_id,
        updated_by_clerk_user_id
      )
      select organization_id, unit_id, property_type, 'vacant', true,
        transaction_type, deposit_amount, monthly_rent_amount,
        maintenance_fee_amount, availability_type, available_date, move_out_date,
        exclusive_area_m2, holding_source, item.updated_by_clerk_user_id,
        item.updated_by_clerk_user_id
      from public.listings
      where id = item.listing_id
        and organization_id = item.organization_id
        and is_current = false
        and listing_status = 'contract_complete';
    end if;
  end if;
end;
$$;
