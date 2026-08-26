-- P1 6-3: admin-controlled staff access to sensitive information.
-- Dev only: RLS is explicitly disabled. Production requires organization RLS.

create table if not exists public.organization_member_sensitive_permissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clerk_user_id text not null check (btrim(clerk_user_id) <> ''),
  can_view_property_contacts boolean not null default false,
  can_view_unit_access boolean not null default false,
  can_view_consultation_contacts boolean not null default false,
  updated_by_clerk_user_id text not null check (btrim(updated_by_clerk_user_id) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, clerk_user_id),
  foreign key (organization_id, clerk_user_id) references public.organization_members(organization_id, clerk_user_id) on delete cascade
);

drop trigger if exists organization_member_sensitive_permissions_set_updated_at on public.organization_member_sensitive_permissions;
create trigger organization_member_sensitive_permissions_set_updated_at
  before update on public.organization_member_sensitive_permissions
  for each row execute function public.set_updated_at();

alter table public.organization_member_sensitive_permissions disable row level security;
grant select, insert, update, delete on public.organization_member_sensitive_permissions to anon, authenticated;

comment on table public.organization_member_sensitive_permissions is 'P1 per-staff sensitive information access. Admin always has full access; a staff member with no row has no sensitive-view permission.';
