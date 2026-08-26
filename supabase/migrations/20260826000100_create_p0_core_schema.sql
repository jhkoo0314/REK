-- P0 core schema: organizations → buildings → units → listings
-- Status: written only. Do not apply to Supabase Dev without explicit approval.
-- Dev rule: RLS is explicitly disabled for all P0 tables so the development
-- server can read/write only fabricated test data, including restricted details.
-- Production rule: enable RLS and add organization-based policies before any
-- real operational data is entered. See docs/5.supabase_security_transition_plan.md.

create extension if not exists pgcrypto;

create type public.member_role as enum ('admin', 'staff');
create type public.member_status as enum ('active', 'inactive');
create type public.property_type as enum ('one_room', 'two_room', 'apartment', 'officetel', 'retail', 'office');
create type public.listing_status as enum ('vacant', 'contract_in_progress', 'contract_complete', 'on_hold', 'ended');
create type public.transaction_type as enum ('monthly_rent', 'jeonse', 'sale', 'to_be_confirmed');
create type public.photo_status as enum ('not_available', 'available', 'needs_confirmation');
create type public.field_status as enum ('not_checked', 'checked', 'needs_recheck');
create type public.contact_role as enum ('owner', 'manager', 'caretaker', 'tenant', 'other');

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  clerk_organization_id text not null unique,
  name text not null check (btrim(name) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, clerk_organization_id)
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  clerk_user_id text not null check (btrim(clerk_user_id) <> ''),
  role public.member_role not null default 'staff',
  status public.member_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, clerk_user_id)
);

create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null check (btrim(name) <> ''),
  normalized_name text not null check (btrim(normalized_name) <> ''),
  road_address text,
  lot_address text,
  address_detail text,
  postal_code text,
  normalized_address text not null check (btrim(normalized_address) <> ''),
  created_by_clerk_user_id text not null check (btrim(created_by_clerk_user_id) <> ''),
  updated_by_clerk_user_id text not null check (btrim(updated_by_clerk_user_id) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    nullif(btrim(coalesce(road_address, '')), '') is not null
    or nullif(btrim(coalesce(lot_address, '')), '') is not null
  ),
  unique (id, organization_id),
  unique (organization_id, normalized_name, normalized_address)
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  building_id uuid not null,
  unit_number text not null check (btrim(unit_number) <> ''),
  normalized_unit_number text not null check (btrim(normalized_unit_number) <> ''),
  floor integer,
  layout_type text,
  direction text,
  options text[] not null default '{}',
  created_by_clerk_user_id text not null check (btrim(created_by_clerk_user_id) <> ''),
  updated_by_clerk_user_id text not null check (btrim(updated_by_clerk_user_id) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (building_id, organization_id)
    references public.buildings(id, organization_id) on delete restrict,
  unique (id, organization_id),
  unique (building_id, normalized_unit_number)
);

-- Sensitive operational details live outside normal building/unit/listing rows.
-- They must never be selected for ordinary list, search, export, or mock-data screens.
create table public.building_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  building_id uuid not null,
  contact_name text not null check (btrim(contact_name) <> ''),
  phone_number text not null check (btrim(phone_number) <> ''),
  contact_role public.contact_role not null default 'other',
  is_primary boolean not null default false,
  contact_note text,
  created_by_clerk_user_id text not null check (btrim(created_by_clerk_user_id) <> ''),
  updated_by_clerk_user_id text not null check (btrim(updated_by_clerk_user_id) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (building_id, organization_id)
    references public.buildings(id, organization_id) on delete restrict,
  unique (id, organization_id)
);

create table public.unit_access_details (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  unit_id uuid not null,
  access_password text,
  access_note text,
  created_by_clerk_user_id text not null check (btrim(created_by_clerk_user_id) <> ''),
  updated_by_clerk_user_id text not null check (btrim(updated_by_clerk_user_id) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (unit_id, organization_id)
    references public.units(id, organization_id) on delete restrict,
  unique (unit_id)
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  unit_id uuid not null,
  property_type public.property_type not null,
  listing_status public.listing_status not null default 'vacant',
  is_current boolean not null default true,
  transaction_type public.transaction_type not null default 'to_be_confirmed',
  deposit_amount integer check (deposit_amount is null or deposit_amount >= 0),
  monthly_rent_amount integer check (monthly_rent_amount is null or monthly_rent_amount >= 0),
  maintenance_fee_amount integer check (maintenance_fee_amount is null or maintenance_fee_amount >= 0),
  available_date date,
  move_out_date date,
  exclusive_area_m2 numeric(10, 2) check (exclusive_area_m2 is null or exclusive_area_m2 > 0),
  photo_status public.photo_status not null default 'not_available',
  last_confirmed_date date,
  field_status public.field_status not null default 'not_checked',
  holding_source text,
  created_by_clerk_user_id text not null check (btrim(created_by_clerk_user_id) <> ''),
  updated_by_clerk_user_id text not null check (btrim(updated_by_clerk_user_id) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (unit_id, organization_id)
    references public.units(id, organization_id) on delete restrict,
  check (listing_status <> 'ended' or is_current = false),
  check (transaction_type <> 'monthly_rent' or monthly_rent_amount is not null),
  check (transaction_type <> 'jeonse' or (deposit_amount is not null and coalesce(monthly_rent_amount, 0) = 0)),
  check (transaction_type <> 'sale' or (deposit_amount is not null and coalesce(monthly_rent_amount, 0) = 0))
);

create unique index listings_one_current_per_unit_idx
  on public.listings (unit_id)
  where is_current = true;

create index organization_members_active_lookup_idx
  on public.organization_members (clerk_user_id, organization_id)
  where status = 'active';

create index buildings_organization_name_idx
  on public.buildings (organization_id, normalized_name);

create index units_organization_building_idx
  on public.units (organization_id, building_id);

create index building_contacts_organization_building_idx
  on public.building_contacts (organization_id, building_id);

create unique index building_contacts_one_primary_per_building_idx
  on public.building_contacts (building_id)
  where is_primary = true;

create index listings_organization_current_status_idx
  on public.listings (organization_id, listing_status)
  where is_current = true;

create index listings_available_date_idx
  on public.listings (organization_id, available_date)
  where is_current = true and available_date is not null;

create index listings_move_out_date_idx
  on public.listings (organization_id, move_out_date)
  where is_current = true and move_out_date is not null;

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger organization_members_set_updated_at
before update on public.organization_members
for each row execute function public.set_updated_at();

create trigger buildings_set_updated_at
before update on public.buildings
for each row execute function public.set_updated_at();

create trigger units_set_updated_at
before update on public.units
for each row execute function public.set_updated_at();

create trigger building_contacts_set_updated_at
before update on public.building_contacts
for each row execute function public.set_updated_at();

create trigger unit_access_details_set_updated_at
before update on public.unit_access_details
for each row execute function public.set_updated_at();

create trigger listings_set_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

-- Explicit Dev-only setting. New tables default to this state, but declaring it
-- here prevents the intended development posture from being ambiguous.
alter table public.organizations disable row level security;
alter table public.organization_members disable row level security;
alter table public.buildings disable row level security;
alter table public.units disable row level security;
alter table public.building_contacts disable row level security;
alter table public.unit_access_details disable row level security;
alter table public.listings disable row level security;

comment on table public.organizations is 'Internal organization mapped to a Clerk Organization.';
comment on table public.organization_members is 'Organization membership and active access status.';
comment on table public.buildings is 'Organization-scoped building information. Sensitive operational data is stored separately.';
comment on table public.units is 'Building units with normalized unit number for duplicate prevention.';
comment on table public.building_contacts is 'Restricted building contacts. Exclude from ordinary lists, exports, and mock data.';
comment on table public.unit_access_details is 'Restricted per-unit access password and access note. Exclude from ordinary lists, exports, and mock data.';
comment on table public.listings is 'Current or historical listing conditions. General changes update the current row.';
