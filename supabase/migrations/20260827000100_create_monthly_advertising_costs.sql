-- P1 광고 관리: 조직별 월·플랫폼 총 광고비
-- Dev only: RLS is explicitly disabled. Production requires organization RLS.

create table if not exists public.monthly_advertising_costs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  billing_month date not null,
  platform text not null check (btrim(platform) <> '' and platform = btrim(platform) and char_length(platform) <= 50),
  amount integer not null check (amount >= 0),
  memo text check (memo is null or char_length(memo) <= 500),
  created_by_clerk_user_id text not null check (btrim(created_by_clerk_user_id) <> ''),
  updated_by_clerk_user_id text not null check (btrim(updated_by_clerk_user_id) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, organization_id),
  check (extract(day from billing_month) = 1)
);

create unique index if not exists monthly_advertising_costs_one_platform_per_month_idx
  on public.monthly_advertising_costs (organization_id, billing_month, lower(platform));
create index if not exists monthly_advertising_costs_month_idx
  on public.monthly_advertising_costs (organization_id, billing_month desc, platform);

drop trigger if exists monthly_advertising_costs_set_updated_at on public.monthly_advertising_costs;
create trigger monthly_advertising_costs_set_updated_at
  before update on public.monthly_advertising_costs
  for each row execute function public.set_updated_at();

alter table public.monthly_advertising_costs disable row level security;
grant select, insert, update, delete on public.monthly_advertising_costs to anon, authenticated;

comment on table public.monthly_advertising_costs is 'P1 organization-scoped total advertising cost per billing month and platform. Re-saving the same month/platform updates the existing record.';
