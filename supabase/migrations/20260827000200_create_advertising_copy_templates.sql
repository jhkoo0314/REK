-- P1 광고 관리: 조직별 매물 유형 광고 문구 템플릿
-- Dev only: RLS is explicitly disabled. Production requires organization RLS.

create table if not exists public.advertising_copy_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_group text not null check (property_group in ('residential', 'apartment', 'officetel', 'commercial')),
  template_name text not null check (btrim(template_name) <> '' and template_name = btrim(template_name) and char_length(template_name) <= 50),
  title_template text not null check (btrim(title_template) <> '' and char_length(title_template) <= 120),
  body_template text not null check (btrim(body_template) <> '' and char_length(body_template) <= 2000),
  is_active boolean not null default true,
  created_by_clerk_user_id text not null check (btrim(created_by_clerk_user_id) <> ''),
  updated_by_clerk_user_id text not null check (btrim(updated_by_clerk_user_id) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, organization_id)
);

create unique index if not exists advertising_copy_templates_one_name_per_group_idx
  on public.advertising_copy_templates (organization_id, property_group, lower(template_name));
create index if not exists advertising_copy_templates_group_idx
  on public.advertising_copy_templates (organization_id, property_group, is_active, updated_at desc);

drop trigger if exists advertising_copy_templates_set_updated_at on public.advertising_copy_templates;
create trigger advertising_copy_templates_set_updated_at
  before update on public.advertising_copy_templates
  for each row execute function public.set_updated_at();

alter table public.advertising_copy_templates disable row level security;
grant select, insert, update, delete on public.advertising_copy_templates to anon, authenticated;

comment on table public.advertising_copy_templates is 'P1 organization-scoped fixed advertising copy templates. Only approved listing placeholders may be used; generated copy is not stored.';
