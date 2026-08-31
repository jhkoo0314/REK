-- 중개수수료 수입·담당자별 매출관리
-- Dev only: RLS is explicitly disabled. Production requires organization RLS.

do $$ begin create type public.contract_revenue_entry_type as enum ('receipt', 'refund'); exception when duplicate_object then null; end $$;

alter table public.contracts add column if not exists responsible_clerk_user_id text;

create table if not exists public.contract_revenue_settlements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  contract_id uuid not null,
  agreed_commission_amount integer not null check (agreed_commission_amount >= 0),
  office_share_rate numeric(5,2) not null check (office_share_rate >= 0 and office_share_rate <= 100),
  staff_share_rate numeric(5,2) not null check (staff_share_rate >= 0 and staff_share_rate <= 100),
  settlement_note text,
  created_by_clerk_user_id text not null check (btrim(created_by_clerk_user_id) <> ''),
  updated_by_clerk_user_id text not null check (btrim(updated_by_clerk_user_id) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (contract_id, organization_id) references public.contracts(id, organization_id) on delete cascade,
  unique (contract_id), unique (id, organization_id),
  check (office_share_rate + staff_share_rate = 100)
);

create table if not exists public.contract_revenue_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  contract_id uuid not null,
  responsible_clerk_user_id text not null check (btrim(responsible_clerk_user_id) <> ''),
  entry_type public.contract_revenue_entry_type not null,
  entry_date date not null,
  gross_amount integer not null check (gross_amount >= 0),
  external_co_broker_share_amount integer not null default 0 check (external_co_broker_share_amount >= 0),
  office_share_rate numeric(5,2) not null check (office_share_rate >= 0 and office_share_rate <= 100),
  staff_share_rate numeric(5,2) not null check (staff_share_rate >= 0 and staff_share_rate <= 100),
  office_share_amount integer not null check (office_share_amount >= 0),
  staff_share_amount integer not null check (staff_share_amount >= 0),
  memo text,
  created_by_clerk_user_id text not null check (btrim(created_by_clerk_user_id) <> ''),
  updated_by_clerk_user_id text not null check (btrim(updated_by_clerk_user_id) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (contract_id, organization_id) references public.contracts(id, organization_id) on delete cascade,
  unique (id, organization_id),
  check (office_share_rate + staff_share_rate = 100),
  check (external_co_broker_share_amount <= gross_amount),
  check (office_share_amount + staff_share_amount = gross_amount - external_co_broker_share_amount)
);

create index if not exists contracts_revenue_responsible_idx on public.contracts (organization_id, responsible_clerk_user_id);
create index if not exists contract_revenue_entries_month_idx on public.contract_revenue_entries (organization_id, entry_date, responsible_clerk_user_id);

drop trigger if exists contract_revenue_settlements_set_updated_at on public.contract_revenue_settlements;
create trigger contract_revenue_settlements_set_updated_at before update on public.contract_revenue_settlements for each row execute function public.set_updated_at();
drop trigger if exists contract_revenue_entries_set_updated_at on public.contract_revenue_entries;
create trigger contract_revenue_entries_set_updated_at before update on public.contract_revenue_entries for each row execute function public.set_updated_at();

alter table public.contract_revenue_settlements disable row level security;
alter table public.contract_revenue_entries disable row level security;
grant select, insert, update, delete on table public.contract_revenue_settlements, public.contract_revenue_entries to anon, authenticated;

comment on column public.contracts.responsible_clerk_user_id is '계약 저장 로그인 사용자를 자동 기록하는 담당자. 기존 계약은 null 허용.';
comment on table public.contract_revenue_settlements is '계약별 약정 수수료와 사무실/담당자 배분 기준.';
comment on table public.contract_revenue_entries is '실제 수납·환불과 해당 시점의 담당자 배분 이력.';
