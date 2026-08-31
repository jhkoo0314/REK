-- 관리자 설정: 직원별 기본 담당자 수수료 비율

create table if not exists public.organization_member_revenue_rates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  clerk_user_id text not null check (btrim(clerk_user_id) <> ''),
  staff_share_rate numeric(5,2) not null check (staff_share_rate >= 0 and staff_share_rate <= 100),
  updated_by_clerk_user_id text not null check (btrim(updated_by_clerk_user_id) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, clerk_user_id)
);

drop trigger if exists organization_member_revenue_rates_set_updated_at on public.organization_member_revenue_rates;
create trigger organization_member_revenue_rates_set_updated_at before update on public.organization_member_revenue_rates for each row execute function public.set_updated_at();
alter table public.organization_member_revenue_rates disable row level security;
grant select, insert, update, delete on table public.organization_member_revenue_rates to anon, authenticated;
