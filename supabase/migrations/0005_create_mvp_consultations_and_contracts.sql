-- MVP Dev schema addition. Apply only after the 0001-0004 listing foundation.
-- Scope: simple consultations and contracts for an internal team of up to five users.
-- A consultation's first-inquiry listing can differ from the listing actually contracted.

-- The earlier P0 table uses `id` as its primary key but did not retain the
-- composite key needed to prove that a linked listing belongs to this organization.
alter table public.listings
  add constraint listings_id_organization_id_key unique (id, organization_id);

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  consultation_number bigint not null check (consultation_number > 0),
  initial_listing_id uuid,
  consultation_date date not null default current_date,
  customer_name text,
  customer_contact text,
  lead_source text,
  progress_stage text not null default '신규 문의'
    check (progress_stage in ('신규 문의', '연락 중', '방문 예정', '방문 완료', '계약 진행', '계약 완료', '종료')),
  next_contact_date date,
  consultation_note text,
  created_by_member_id uuid not null,
  updated_by_member_id uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint consultations_id_organization_id_key unique (id, organization_id),
  constraint consultations_organization_number_key unique (organization_id, consultation_number),
  constraint consultations_initial_listing_same_organization_fkey
    foreign key (initial_listing_id, organization_id)
    references public.listings (id, organization_id) on delete restrict,
  constraint consultations_created_by_same_organization_fkey
    foreign key (created_by_member_id, organization_id)
    references public.organization_members (id, organization_id) on delete restrict,
  constraint consultations_updated_by_same_organization_fkey
    foreign key (updated_by_member_id, organization_id)
    references public.organization_members (id, organization_id) on delete restrict,
  constraint consultations_closed_next_contact_date_check
    check (progress_stage not in ('계약 완료', '종료') or next_contact_date is null)
);

create index consultations_organization_next_contact_date_idx
  on public.consultations (organization_id, next_contact_date);

create index consultations_organization_initial_listing_idx
  on public.consultations (organization_id, initial_listing_id);

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  contract_number bigint not null check (contract_number > 0),
  listing_id uuid not null,
  consultation_id uuid,
  contract_status text not null default '계약 예정'
    check (contract_status in ('계약 예정', '계약 진행', '계약 완료', '해지', '만료', '확인 필요')),
  formal_contract_date date,
  lease_start_date date,
  lease_end_date date,
  deposit_manwon integer check (deposit_manwon is null or deposit_manwon >= 0),
  monthly_rent_manwon integer check (monthly_rent_manwon is null or monthly_rent_manwon >= 0),
  management_fee_manwon integer check (management_fee_manwon is null or management_fee_manwon >= 0),
  tenant_name text,
  tenant_contact text,
  contract_note text,
  created_by_member_id uuid not null,
  updated_by_member_id uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint contracts_id_organization_id_key unique (id, organization_id),
  constraint contracts_organization_number_key unique (organization_id, contract_number),
  constraint contracts_listing_same_organization_fkey
    foreign key (listing_id, organization_id)
    references public.listings (id, organization_id) on delete restrict,
  constraint contracts_consultation_same_organization_fkey
    foreign key (consultation_id, organization_id)
    references public.consultations (id, organization_id) on delete restrict,
  constraint contracts_created_by_same_organization_fkey
    foreign key (created_by_member_id, organization_id)
    references public.organization_members (id, organization_id) on delete restrict,
  constraint contracts_updated_by_same_organization_fkey
    foreign key (updated_by_member_id, organization_id)
    references public.organization_members (id, organization_id) on delete restrict,
  constraint contracts_lease_period_check
    check (lease_end_date is null or lease_start_date is null or lease_end_date >= lease_start_date)
);

create index contracts_organization_lease_end_date_idx
  on public.contracts (organization_id, lease_end_date);

create index contracts_organization_listing_idx
  on public.contracts (organization_id, listing_id);

create index contracts_organization_consultation_idx
  on public.contracts (organization_id, consultation_id);

create trigger consultations_set_updated_at
before update on public.consultations
for each row execute function public.set_updated_at();

create trigger contracts_set_updated_at
before update on public.contracts
for each row execute function public.set_updated_at();

comment on table public.consultations is
  '최초 문의 매물과 유입 경로를 기록하는 상담. 계약 매물과 달라도 된다.';

comment on column public.contracts.consultation_id is
  '계약으로 이어진 상담. 실제 계약 매물과 상담의 최초 문의 매물은 달라도 된다.';

comment on table public.contracts is
  '실제 계약 매물과 성사 상담을 선택 연결하는 최소 계약 기록. 계약 저장만으로 매물 상태는 바꾸지 않는다.';
