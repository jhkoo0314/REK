-- Dev schema change only. Apply manually to Dev after review.
-- Creates one atomic operation for: existing/new building -> existing/new unit -> current listing.

create or replace function public.create_listing_with_structure(
  p_organization_id uuid,
  p_member_id uuid,
  p_existing_building_id uuid,
  p_building_name text,
  p_lot_area text,
  p_lot_number text,
  p_lot_address text,
  p_existing_unit_id uuid,
  p_unit_number text,
  p_room_type text,
  p_listing_holder text,
  p_listing_status text,
  p_transaction_type text,
  p_deposit_manwon integer,
  p_monthly_rent_manwon integer,
  p_management_fee_manwon integer,
  p_availability_type text,
  p_available_from_date date,
  p_listing_note text
)
returns uuid
language plpgsql
as $$
declare
  v_building_id uuid;
  v_unit_id uuid;
  v_listing_id uuid;
  v_existing_listing_id uuid;
  v_next_listing_number bigint;
begin
  if not exists (
    select 1
    from public.organization_members
    where id = p_member_id
      and organization_id = p_organization_id
      and status = 'active'
  ) then
    raise exception 'Active organization membership is required.';
  end if;

  if nullif(btrim(p_listing_holder), '') is null then
    raise exception 'Listing holder is required.';
  end if;

  if p_existing_building_id is not null then
    select id into v_building_id
    from public.buildings
    where id = p_existing_building_id
      and organization_id = p_organization_id
      and is_active = true;

    if v_building_id is null then
      raise exception 'Selected building is not available in this organization.';
    end if;
  else
    if nullif(btrim(p_lot_area), '') is null
      or nullif(btrim(p_lot_number), '') is null
      or nullif(btrim(p_lot_address), '') is null then
      raise exception 'New building area, lot number, and address are required.';
    end if;

    insert into public.buildings (
      organization_id, building_name, lot_area, lot_number, lot_address,
      created_by_member_id, updated_by_member_id
    ) values (
      p_organization_id, nullif(btrim(p_building_name), ''), btrim(p_lot_area),
      btrim(p_lot_number), btrim(p_lot_address), p_member_id, p_member_id
    ) returning id into v_building_id;
  end if;

  if p_existing_unit_id is not null then
    select id into v_unit_id
    from public.units
    where id = p_existing_unit_id
      and organization_id = p_organization_id
      and building_id = v_building_id
      and is_active = true;

    if v_unit_id is null then
      raise exception 'Selected unit is not available in this building.';
    end if;
  else
    if nullif(btrim(p_unit_number), '') is null then
      raise exception 'New unit number is required.';
    end if;

    insert into public.units (
      organization_id, building_id, unit_number, room_type,
      created_by_member_id, updated_by_member_id
    ) values (
      p_organization_id, v_building_id, btrim(p_unit_number), p_room_type,
      p_member_id, p_member_id
    ) returning id into v_unit_id;
  end if;

  select id into v_existing_listing_id
  from public.listings
  where organization_id = p_organization_id
    and unit_id = v_unit_id
    and is_current = true
  for update;

  if v_existing_listing_id is not null then
    raise exception 'CURRENT_LISTING_EXISTS:%', v_existing_listing_id;
  end if;

  if p_availability_type = '날짜 지정' and p_available_from_date is null then
    raise exception 'Available-from date is required when availability type is date-specific.';
  end if;

  -- Listing numbers are unique per organization, so concurrent registration is serialized here.
  perform pg_advisory_xact_lock(hashtext(p_organization_id::text));
  select coalesce(max(listing_number), 0) + 1 into v_next_listing_number
  from public.listings
  where organization_id = p_organization_id;

  insert into public.listings (
    organization_id, unit_id, listing_number, listing_holder, listing_status,
    transaction_type, deposit_manwon, monthly_rent_manwon, management_fee_manwon,
    availability_type, available_from_date, listing_note,
    created_by_member_id, updated_by_member_id
  ) values (
    p_organization_id, v_unit_id, v_next_listing_number, btrim(p_listing_holder), p_listing_status,
    p_transaction_type, p_deposit_manwon, p_monthly_rent_manwon, p_management_fee_manwon,
    p_availability_type, p_available_from_date, nullif(btrim(p_listing_note), ''),
    p_member_id, p_member_id
  ) returning id into v_listing_id;

  return v_listing_id;
end;
$$;

comment on function public.create_listing_with_structure is
  'Dev registration operation. Creates a building/unit only when needed and prevents a second current listing for the selected unit.';
