-- P1 계약 관리: 실제 계약 매물, 출처 상담, 금액·일정, 단계 이력
-- Dev only: RLS is explicitly disabled. Production requires organization RLS.

do $$ begin create type public.contract_type as enum ('rental', 'sale', 'renewal'); exception when duplicate_object then null; end $$;
do $$ begin create type public.brokerage_type as enum ('direct', 'co_brokerage', 'other'); exception when duplicate_object then null; end $$;
do $$ begin create type public.contract_status as enum ('in_progress', 'balance_due', 'completed', 'cancelled', 'expired'); exception when duplicate_object then null; end $$;
do $$ begin create type public.contract_activity_type as enum ('provisional_contract', 'formal_contract', 'balance_due', 'completed', 'cancelled', 'expired'); exception when duplicate_object then null; end $$;

create sequence if not exists public.contract_reference_number_seq;

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  contract_reference_number bigint not null default nextval('public.contract_reference_number_seq'),
  listing_id uuid not null,
  source_consultation_id uuid,
  contract_type public.contract_type not null default 'rental',
  brokerage_type public.brokerage_type not null default 'direct',
  status public.contract_status not null default 'in_progress',
  contract_started_date date,
  official_contract_date date,
  move_in_date date,
  end_date date,
  total_contract_deposit_amount integer check (total_contract_deposit_amount is null or total_contract_deposit_amount >= 0),
  provisional_deposit_amount integer check (provisional_deposit_amount is null or provisional_deposit_amount >= 0),
  additional_deposit_due_date date,
  balance_amount integer check (balance_amount is null or balance_amount >= 0),
  balance_due_date date,
  note text,
  created_by_clerk_user_id text not null check (btrim(created_by_clerk_user_id) <> ''),
  updated_by_clerk_user_id text not null check (btrim(updated_by_clerk_user_id) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (listing_id, organization_id) references public.listings(id, organization_id) on delete restrict,
  foreign key (source_consultation_id, organization_id) references public.consultations(id, organization_id) on delete restrict,
  unique (id, organization_id),
  unique (organization_id, contract_reference_number),
  check (official_contract_date is null or contract_started_date is null or official_contract_date >= contract_started_date),
  check (move_in_date is null or official_contract_date is null or move_in_date >= official_contract_date),
  check (end_date is null or move_in_date is null or end_date > move_in_date),
  check (provisional_deposit_amount is null or total_contract_deposit_amount is null or provisional_deposit_amount <= total_contract_deposit_amount)
);

create table if not exists public.contract_activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  contract_id uuid not null,
  activity_type public.contract_activity_type not null,
  activity_date date not null,
  note text,
  created_by_clerk_user_id text not null check (btrim(created_by_clerk_user_id) <> ''),
  updated_by_clerk_user_id text not null check (btrim(updated_by_clerk_user_id) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (contract_id, organization_id) references public.contracts(id, organization_id) on delete cascade,
  unique (id, organization_id)
);

create unique index if not exists contracts_one_open_contract_per_listing_idx on public.contracts (listing_id)
  where status in ('in_progress', 'balance_due');
create index if not exists contracts_organization_status_idx on public.contracts (organization_id, status, updated_at desc);
create index if not exists contracts_organization_dates_idx on public.contracts (organization_id, official_contract_date, balance_due_date, end_date);
create index if not exists contract_activities_contract_date_idx on public.contract_activities (organization_id, contract_id, activity_date desc, created_at desc);

create or replace function public.validate_contract_actual_listing()
returns trigger language plpgsql as $$
begin
  if not exists (
    select 1 from public.listings
    where id = new.listing_id and organization_id = new.organization_id and is_current = true
  ) then
    raise exception 'A contract must use a current listing in the same organization.';
  end if;
  return new;
end;
$$;

create or replace function public.apply_contract_listing_state(target_contract_id uuid)
returns void language plpgsql as $$
declare item public.contracts%rowtype;
begin
  select * into item from public.contracts where id = target_contract_id;
  if not found then return; end if;
  if item.status in ('in_progress', 'balance_due') then
    update public.listings set listing_status = 'contract_in_progress', updated_by_clerk_user_id = item.updated_by_clerk_user_id
    where id = item.listing_id and organization_id = item.organization_id and is_current = true and listing_status not in ('ended', 'contract_complete');
  elsif item.status = 'completed' then
    update public.listings set listing_status = 'contract_complete', is_current = false, updated_by_clerk_user_id = item.updated_by_clerk_user_id
    where id = item.listing_id and organization_id = item.organization_id and is_current = true;
    if item.source_consultation_id is not null then
      update public.consultations set status = 'ended', progress_stage = 'closed', scheduled_next_contact_date = null, next_contact_date = null, updated_by_clerk_user_id = item.updated_by_clerk_user_id
      where id = item.source_consultation_id and organization_id = item.organization_id;
    end if;
  elsif item.status in ('cancelled', 'expired') then
    update public.listings set listing_status = 'vacant', updated_by_clerk_user_id = item.updated_by_clerk_user_id
    where id = item.listing_id and organization_id = item.organization_id and is_current = true and listing_status = 'contract_in_progress';
  end if;
end;
$$;

create or replace function public.sync_contract_listing_state()
returns trigger language plpgsql as $$ begin perform public.apply_contract_listing_state(new.id); return new; end; $$;

create or replace function public.sync_contract_status_from_activity()
returns trigger language plpgsql as $$
begin
  update public.contracts set status = case new.activity_type
    when 'provisional_contract' then 'in_progress'::public.contract_status
    when 'formal_contract' then 'in_progress'::public.contract_status
    when 'balance_due' then 'balance_due'::public.contract_status
    when 'completed' then 'completed'::public.contract_status
    when 'cancelled' then 'cancelled'::public.contract_status
    when 'expired' then 'expired'::public.contract_status end,
    updated_by_clerk_user_id = new.updated_by_clerk_user_id
  where id = new.contract_id and organization_id = new.organization_id;
  return new;
end;
$$;

drop trigger if exists contracts_set_updated_at on public.contracts;
create trigger contracts_validate_actual_listing before insert or update of listing_id on public.contracts for each row execute function public.validate_contract_actual_listing();
create trigger contracts_set_updated_at before update on public.contracts for each row execute function public.set_updated_at();
create trigger contracts_apply_listing_state after insert or update of status on public.contracts for each row execute function public.sync_contract_listing_state();
create trigger contract_activities_set_updated_at before update on public.contract_activities for each row execute function public.set_updated_at();
create trigger contract_activities_sync_status after insert or update on public.contract_activities for each row execute function public.sync_contract_status_from_activity();

alter table public.contracts disable row level security;
alter table public.contract_activities disable row level security;
grant select, insert, update, delete on table public.contracts, public.contract_activities to anon, authenticated;
grant usage, select on sequence public.contract_reference_number_seq to anon, authenticated;

comment on table public.contracts is 'P1 organization-scoped contract. The actual listing is mandatory; source consultation is optional.';
comment on table public.contract_activities is 'Append-only contract stage history. Saving an activity updates the contract status and its actual listing state.';
