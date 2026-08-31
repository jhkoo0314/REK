-- Remove unused photo availability and manual reconfirmation from listing operations.
-- This permanently removes the existing values. Apply to Supabase Dev only.

create or replace function public.create_p0_listing(
  p_organization_id uuid,
  p_clerk_user_id text,
  p_payload jsonb
)
returns table (listing_id uuid, listing_reference_number integer)
language plpgsql
as $$
declare v_building_id uuid; v_unit_id uuid; v_options text[];
begin
  v_building_id := nullif(p_payload ->> 'buildingId', '')::uuid;
  v_unit_id := nullif(p_payload ->> 'unitId', '')::uuid;
  if v_building_id is null then
    insert into public.buildings (organization_id, name, normalized_name, road_address, lot_address, address_detail, postal_code, normalized_address, created_by_clerk_user_id, updated_by_clerk_user_id)
    values (p_organization_id, p_payload ->> 'buildingName', p_payload ->> 'normalizedBuildingName', nullif(p_payload ->> 'roadAddress', ''), nullif(p_payload ->> 'lotAddress', ''), nullif(p_payload ->> 'addressDetail', ''), nullif(p_payload ->> 'postalCode', ''), p_payload ->> 'normalizedAddress', p_clerk_user_id, p_clerk_user_id)
    returning id into v_building_id;
  elsif not exists (select 1 from public.buildings where id = v_building_id and organization_id = p_organization_id) then
    raise exception '선택한 건물 정보를 찾을 수 없습니다.' using errcode = 'P0001';
  end if;

  if v_unit_id is null then
    select coalesce(array_agg(value), '{}') into v_options from jsonb_array_elements_text(coalesce(p_payload -> 'options', '[]'::jsonb));
    insert into public.units (organization_id, building_id, unit_number, normalized_unit_number, floor, layout_type, direction, options, created_by_clerk_user_id, updated_by_clerk_user_id)
    values (p_organization_id, v_building_id, p_payload ->> 'unitNumber', p_payload ->> 'normalizedUnitNumber', nullif(p_payload ->> 'floor', '')::integer, nullif(p_payload ->> 'layoutType', ''), nullif(p_payload ->> 'direction', ''), v_options, p_clerk_user_id, p_clerk_user_id)
    returning id into v_unit_id;
  elsif not exists (select 1 from public.units where id = v_unit_id and building_id = v_building_id and organization_id = p_organization_id) then
    raise exception '선택한 호실 정보를 찾을 수 없습니다.' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.listings where unit_id = v_unit_id and is_current = true) then
    raise exception '선택한 호실에는 이미 현재 매물이 있습니다. 기존 매물을 수정해 주세요.' using errcode = '23505';
  end if;

  if nullif(p_payload ->> 'accessPassword', '') is not null then
    insert into public.unit_access_details (organization_id, unit_id, access_password, created_by_clerk_user_id, updated_by_clerk_user_id)
    values (p_organization_id, v_unit_id, p_payload ->> 'accessPassword', p_clerk_user_id, p_clerk_user_id)
    on conflict (unit_id) do update set access_password = excluded.access_password, updated_by_clerk_user_id = excluded.updated_by_clerk_user_id;
  end if;

  insert into public.listings (organization_id, unit_id, property_type, listing_status, is_current, transaction_type, deposit_amount, monthly_rent_amount, maintenance_fee_amount, availability_type, available_date, move_out_date, exclusive_area_m2, holding_source, created_by_clerk_user_id, updated_by_clerk_user_id)
  values (p_organization_id, v_unit_id, (p_payload ->> 'propertyType')::public.property_type, (p_payload ->> 'listingStatus')::public.listing_status, true, (p_payload ->> 'transactionType')::public.transaction_type, nullif(p_payload ->> 'depositAmount', '')::integer, nullif(p_payload ->> 'monthlyRentAmount', '')::integer, nullif(p_payload ->> 'maintenanceFeeAmount', '')::integer, (p_payload ->> 'availabilityType')::public.availability_type, nullif(p_payload ->> 'availableDate', '')::date, nullif(p_payload ->> 'moveOutDate', '')::date, nullif(p_payload ->> 'exclusiveAreaM2', '')::numeric, nullif(p_payload ->> 'holdingSource', ''), p_clerk_user_id, p_clerk_user_id)
  returning id, public.listings.listing_reference_number into listing_id, listing_reference_number;
  return next;
end;
$$;

alter table public.listings
  drop column photo_status,
  drop column last_confirmed_date;

drop type public.photo_status;
