-- Dev only: verify the fabricated listing data and P0 database constraints.
-- This script intentionally attempts invalid inserts, catches the expected errors,
-- and leaves no test rows behind. Do not run in Preview or Production.

do $$
begin
  if not exists (
    select 1 from public.listings
    where id = '10000000-0000-4000-8000-000000000301'
  ) then
    raise exception 'Run 0001_dev_listing_fixture.sql before this verification script.';
  end if;

  begin
    insert into public.units (
      id, organization_id, building_id, unit_number,
      created_by_member_id, updated_by_member_id
    ) values (
      '10000000-0000-4000-8000-000000000299',
      '10000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000102',
      '302',
      '10000000-0000-4000-8000-000000000010',
      '10000000-0000-4000-8000-000000000010'
    );
    raise exception 'Expected 302/302호 duplicate protection did not run.';
  exception
    when unique_violation then
      raise notice 'PASS: 302 and 302호 cannot be duplicated in the same building.';
  end;

  begin
    insert into public.units (
      id, organization_id, building_id, unit_number,
      created_by_member_id, updated_by_member_id
    ) values (
      '20000000-0000-4000-8000-000000000299',
      '20000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000101',
      '901호',
      '20000000-0000-4000-8000-000000000010',
      '20000000-0000-4000-8000-000000000010'
    );
    raise exception 'Expected cross-organization building protection did not run.';
  exception
    when foreign_key_violation then
      raise notice 'PASS: a unit cannot use a building from another organization.';
  end;

  begin
    insert into public.listings (
      id, organization_id, unit_id, listing_number, listing_status, listing_holder,
      transaction_type, availability_type, created_by_member_id, updated_by_member_id
    ) values (
      '10000000-0000-4000-8000-000000000399',
      '10000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000201',
      1999, '공실', '제약 검증용 가공값',
      '월세', '즉시입주',
      '10000000-0000-4000-8000-000000000010',
      '10000000-0000-4000-8000-000000000010'
    );
    raise exception 'Expected one-current-listing protection did not run.';
  exception
    when unique_violation then
      raise notice 'PASS: a unit cannot have two current listings.';
  end;
end;
$$;

select
  organizations.name as organization_name,
  count(listings.id) as listing_count
from public.organizations
left join public.listings on listings.organization_id = organizations.id
where organizations.id in (
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001'
)
group by organizations.name
order by organizations.name;

select
  count(*) as organization_relationship_mismatches
from public.listings
join public.units on units.id = listings.unit_id
join public.buildings on buildings.id = units.building_id
where listings.organization_id <> units.organization_id
   or units.organization_id <> buildings.organization_id;
