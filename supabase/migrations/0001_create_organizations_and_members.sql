-- Dev DB schema draft only. Do not apply until the user approves.
-- Scope: organization boundary and Clerk user membership.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
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
  name text not null check (char_length(btrim(name)) > 0),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  clerk_user_id text not null,
  display_name text,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint organization_members_clerk_user_id_key unique (clerk_user_id),
  constraint organization_members_id_organization_id_key unique (id, organization_id)
);

create index organization_members_organization_status_idx
  on public.organization_members (organization_id, status);

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger organization_members_set_updated_at
before update on public.organization_members
for each row execute function public.set_updated_at();

comment on table public.organizations is '사무실 단위의 업무 데이터 범위';
comment on table public.organization_members is 'Clerk 사용자와 조직·역할을 연결하는 내부 멤버십';

-- RLS and policies are deliberately not included. They are a Production transition task.
