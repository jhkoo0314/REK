-- Dev DB schema draft only. Do not apply until the user approves.
-- Scope: P0 listing core, building -> unit -> current listing.

create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  building_name text,
  lot_area text not null check (char_length(btrim(lot_area)) > 0),
  lot_number text not null check (char_length(btrim(lot_number)) > 0),
  lot_address text not null check (char_length(btrim(lot_address)) > 0),
  building_alias_note text,
  has_elevator text check (has_elevator in ('있음', '없음', '확인 필요')),
  parking_status text check (parking_status in ('가능', '제한적', '불가', '확인 필요')),
  has_cctv text check (has_cctv in ('있음', '없음', '확인 필요')),
  pet_policy text check (pet_policy in ('가능', '불가', '협의', '확인 필요')),
  move_in_registration_policy text check (move_in_registration_policy in ('가능', '불가', '협의', '확인 필요')),
  short_term_policy text check (short_term_policy in ('가능', '불가', '협의', '확인 필요')),
  common_fee_note text,
  building_highlights text,
  internal_note text,
  common_entrance_password text,
  info_status text not null default '기본등록' check (info_status in ('기본등록', '일부확인', '확인완료', '재확인 필요')),
  last_checked_date date,
  next_check_date date,
  is_active boolean not null default true,
  created_by_member_id uuid not null,
  updated_by_member_id uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint buildings_id_organization_id_key unique (id, organization_id),
  constraint buildings_created_by_same_organization_fkey
    foreign key (created_by_member_id, organization_id)
    references public.organization_members (id, organization_id) on delete restrict,
  constraint buildings_updated_by_same_organization_fkey
    foreign key (updated_by_member_id, organization_id)
    references public.organization_members (id, organization_id) on delete restrict
);

create unique index buildings_organization_normalized_name_address_key
  on public.buildings (
    organization_id,
    lower(btrim(coalesce(nullif(building_name, ''), '건물명 미입력'))),
    lower(regexp_replace(btrim(lot_address), '\s+', ' ', 'g'))
  );

create index buildings_organization_lot_address_idx
  on public.buildings (organization_id, lot_address);

create index buildings_organization_building_name_idx
  on public.buildings (organization_id, building_name);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  building_id uuid not null,
  unit_number text not null check (char_length(btrim(unit_number)) > 0),
  normalized_unit_number text generated always as (
    lower(regexp_replace(btrim(unit_number), '\s*호$', '', 'i'))
  ) stored,
  floor_number integer,
  room_type text check (room_type in ('원룸', '투룸', '투베이', '쓰리룸', '쓰리베이', '주인세대', '기타', '확인 필요')),
  is_separated text check (is_separated in ('예', '아니오', '확인 필요')),
  direction text check (direction in ('동', '서', '남', '북', '방위', '확인 필요')),
  area_status text check (area_status in ('면적 확인', '면적 미확인')),
  exclusive_area_m2 numeric(10, 2) check (exclusive_area_m2 is null or exclusive_area_m2 >= 0),
  has_balcony text check (has_balcony in ('있음', '없음', '확인 필요')),
  has_built_in_closet text check (has_built_in_closet in ('있음', '없음', '확인 필요')),
  has_double_window text check (has_double_window in ('있음', '없음', '확인 필요')),
  storage_status text check (storage_status in ('좋음', '보통', '부족', '확인 필요')),
  system_aircon_count integer check (system_aircon_count is null or system_aircon_count >= 0),
  unit_options jsonb check (unit_options is null or jsonb_typeof(unit_options) = 'array'),
  other_option_note text,
  unit_highlights text,
  unit_cautions text,
  access_method text check (access_method in ('비밀번호', '열쇠', '세입자 협의', '관리인 문의', '확인 필요')),
  unit_access_password text,
  internal_note text,
  is_active boolean not null default true,
  created_by_member_id uuid not null,
  updated_by_member_id uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint units_id_organization_id_key unique (id, organization_id),
  constraint units_building_same_organization_fkey
    foreign key (building_id, organization_id)
    references public.buildings (id, organization_id) on delete restrict,
  constraint units_created_by_same_organization_fkey
    foreign key (created_by_member_id, organization_id)
    references public.organization_members (id, organization_id) on delete restrict,
  constraint units_updated_by_same_organization_fkey
    foreign key (updated_by_member_id, organization_id)
    references public.organization_members (id, organization_id) on delete restrict,
  constraint units_organization_building_normalized_number_key
    unique (organization_id, building_id, normalized_unit_number)
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  unit_id uuid not null,
  listing_number bigint not null check (listing_number > 0),
  received_date date not null default current_date,
  listing_status text not null default '확인 필요'
    check (listing_status in ('확인 필요', '퇴실 예정', '공실', '광고 가능', '계약 진행 중', '계약 완료', '보류', '종료')),
  listing_holder text not null check (char_length(btrim(listing_holder)) > 0),
  deposit_manwon integer check (deposit_manwon is null or deposit_manwon >= 0),
  monthly_rent_manwon integer check (monthly_rent_manwon is null or monthly_rent_manwon >= 0),
  management_fee_manwon integer check (management_fee_manwon is null or management_fee_manwon >= 0),
  management_fee_note text,
  availability_type text not null default '확인 필요'
    check (availability_type in ('즉시입주', '날짜 지정', '퇴실 후 협의', '확인 필요')),
  available_from_date date,
  move_out_due_date date,
  lease_term_note text,
  short_term_note text,
  cleaning_status text check (cleaning_status in ('문제 없음', '완료', '필요', '진행 중', '확인 필요')),
  wallpaper_status text check (wallpaper_status in ('문제 없음', '완료', '필요', '진행 중', '확인 필요')),
  repair_status text check (repair_status in ('문제 없음', '완료', '필요', '진행 중', '확인 필요')),
  has_listing_photos text check (has_listing_photos in ('있음', '없음', '확인 필요')),
  option_change_note text,
  listing_note text,
  landlord_contact text,
  tenant_contact text,
  last_checked_date date,
  next_check_date date,
  verification_note text,
  closed_date date,
  close_reason text check (close_reason in ('계약 완료', '타 부동산 계약', '임대인 보류', '정보 오류', '광고 중단', '기타')),
  is_current boolean not null default true,
  created_by_member_id uuid not null,
  updated_by_member_id uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint listings_unit_same_organization_fkey
    foreign key (unit_id, organization_id)
    references public.units (id, organization_id) on delete restrict,
  constraint listings_created_by_same_organization_fkey
    foreign key (created_by_member_id, organization_id)
    references public.organization_members (id, organization_id) on delete restrict,
  constraint listings_updated_by_same_organization_fkey
    foreign key (updated_by_member_id, organization_id)
    references public.organization_members (id, organization_id) on delete restrict,
  constraint listings_organization_listing_number_key unique (organization_id, listing_number),
  constraint listings_available_from_date_required_check
    check (availability_type <> '날짜 지정' or available_from_date is not null)
);

create unique index listings_one_current_listing_per_unit_key
  on public.listings (unit_id)
  where is_current;

create index listings_organization_current_status_idx
  on public.listings (organization_id, is_current, listing_status);

create index listings_organization_next_check_date_idx
  on public.listings (organization_id, next_check_date);

create index listings_organization_move_out_due_date_idx
  on public.listings (organization_id, move_out_due_date);

create trigger buildings_set_updated_at
before update on public.buildings
for each row execute function public.set_updated_at();

create trigger units_set_updated_at
before update on public.units
for each row execute function public.set_updated_at();

create trigger listings_set_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

comment on table public.buildings is '건물 공통 정보. 일반 삭제 대신 is_active=false를 우선 사용한다.';
comment on table public.units is '호실 고정 정보. 302와 302호는 normalized_unit_number로 같은 값으로 처리한다.';
comment on table public.listings is '현재 매물 조건과 상태. 가격·상태 변경은 같은 현재 행을 수정하고 새 회차를 자동 생성하지 않는다.';

-- RLS and policies are deliberately not included. They are a Production transition task.
