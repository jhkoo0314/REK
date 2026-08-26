-- P0 follow-up: tenants belong to a unit, while owners remain building contacts.
-- Status: written only. Apply manually to Supabase Dev after 20260826000400.

create table public.unit_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  unit_id uuid not null,
  contact_name text not null check (btrim(contact_name) <> ''),
  phone_number text not null check (btrim(phone_number) <> ''),
  contact_role public.contact_role not null default 'tenant',
  created_by_clerk_user_id text not null check (btrim(created_by_clerk_user_id) <> ''),
  updated_by_clerk_user_id text not null check (btrim(updated_by_clerk_user_id) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (unit_id, organization_id) references public.units(id, organization_id) on delete restrict,
  unique (unit_id, contact_role)
);

create index unit_contacts_organization_unit_idx on public.unit_contacts (organization_id, unit_id);

create trigger unit_contacts_set_updated_at
before update on public.unit_contacts
for each row execute function public.set_updated_at();

alter table public.unit_contacts disable row level security;
grant select, insert, update, delete on table public.unit_contacts to anon, authenticated;

comment on table public.unit_contacts is 'Restricted unit-specific contacts, including current tenant. Exclude from ordinary lists, exports, and generic detail views.';
