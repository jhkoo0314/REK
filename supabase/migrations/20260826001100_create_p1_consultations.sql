-- P1 상담 관리: 일반/매물 상담과 누적 후속 이력
-- Status: written only. Apply manually to Supabase Dev after review.
-- Dev rule: RLS stays explicitly disabled. Production requires organization RLS.

do $$
begin
  create type public.consultation_category as enum ('general', 'listing');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.consultation_status as enum ('in_progress', 'on_hold', 'ended', 'needs_confirmation');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.consultation_stage as enum ('new_inquiry', 'condition_check', 'visit_scheduled', 'visit_completed', 'reviewing', 'closed');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.consultation_method as enum ('phone', 'message', 'visit', 'other');
exception when duplicate_object then null;
end $$;

-- A composite key lets the database reject a listing from another organization.
alter table public.listings
  add constraint listings_id_organization_key unique (id, organization_id);

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  initial_listing_id uuid,
  category public.consultation_category not null default 'general',
  customer_name text,
  customer_phone text not null check (btrim(customer_phone) <> ''),
  consultation_date date not null,
  inflow_source text not null default 'not_specified' check (btrim(inflow_source) <> ''),
  consultation_method public.consultation_method not null default 'phone',
  consultation_note text,
  desired_areas text[] not null default '{}',
  desired_areas_other text,
  desired_room_types text[] not null default '{}',
  desired_room_types_other text,
  desired_deposit_budget integer check (desired_deposit_budget is null or desired_deposit_budget >= 0),
  desired_monthly_rent_budget integer check (desired_monthly_rent_budget is null or desired_monthly_rent_budget >= 0),
  desired_move_in_date date,
  required_features_note text,
  status public.consultation_status not null default 'in_progress',
  progress_stage public.consultation_stage not null default 'new_inquiry',
  scheduled_next_contact_date date,
  next_contact_date date,
  closed_reason text,
  latest_followup_date date,
  latest_followup_method public.consultation_method,
  latest_followup_stage public.consultation_stage,
  latest_followup_note text,
  created_by_clerk_user_id text not null check (btrim(created_by_clerk_user_id) <> ''),
  updated_by_clerk_user_id text not null check (btrim(updated_by_clerk_user_id) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (initial_listing_id, organization_id)
    references public.listings(id, organization_id) on delete restrict,
  unique (id, organization_id),
  check (category = 'general' or initial_listing_id is not null),
  check (status <> 'ended' or (progress_stage = 'closed' and scheduled_next_contact_date is null and next_contact_date is null))
);

create table public.consultation_followups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  consultation_id uuid not null,
  followup_date date not null,
  followup_method public.consultation_method not null,
  progress_stage public.consultation_stage,
  visit_result text,
  closed_reason text,
  next_contact_date date,
  note text,
  created_by_clerk_user_id text not null check (btrim(created_by_clerk_user_id) <> ''),
  updated_by_clerk_user_id text not null check (btrim(updated_by_clerk_user_id) <> ''),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (consultation_id, organization_id)
    references public.consultations(id, organization_id) on delete cascade,
  unique (id, organization_id)
);

create index consultations_organization_consultation_date_idx
  on public.consultations (organization_id, consultation_date desc);
create index consultations_organization_next_contact_date_idx
  on public.consultations (organization_id, next_contact_date)
  where next_contact_date is not null;
create index consultations_organization_initial_listing_idx
  on public.consultations (organization_id, initial_listing_id)
  where initial_listing_id is not null;
create index consultation_followups_organization_consultation_date_idx
  on public.consultation_followups (organization_id, consultation_id, followup_date desc, created_at desc);

create or replace function public.prepare_consultation_before_write()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'ended' then
    new.progress_stage := 'closed';
    new.scheduled_next_contact_date := null;
    new.next_contact_date := null;
  elsif tg_op = 'INSERT' then
    new.next_contact_date := new.scheduled_next_contact_date;
  end if;
  return new;
end;
$$;

create or replace function public.recalculate_consultation_followup_summary()
returns trigger
language plpgsql
as $$
declare
  target_consultation_id uuid := coalesce(new.consultation_id, old.consultation_id);
  target_organization_id uuid := coalesce(new.organization_id, old.organization_id);
  newest public.consultation_followups%rowtype;
begin
  select * into newest
  from public.consultation_followups
  where consultation_id = target_consultation_id
    and organization_id = target_organization_id
  order by followup_date desc, created_at desc, id desc
  limit 1;

  if found then
    update public.consultations
    set latest_followup_date = newest.followup_date,
        latest_followup_method = newest.followup_method,
        latest_followup_stage = newest.progress_stage,
        latest_followup_note = newest.note,
        next_contact_date = case when status = 'ended' then null else newest.next_contact_date end
    where id = target_consultation_id and organization_id = target_organization_id;
  else
    update public.consultations
    set latest_followup_date = null,
        latest_followup_method = null,
        latest_followup_stage = null,
        latest_followup_note = null,
        next_contact_date = case when status = 'ended' then null else scheduled_next_contact_date end
    where id = target_consultation_id and organization_id = target_organization_id;
  end if;
  return null;
end;
$$;

create trigger consultations_prepare_before_write
before insert or update on public.consultations
for each row execute function public.prepare_consultation_before_write();

create trigger consultations_set_updated_at
before update on public.consultations
for each row execute function public.set_updated_at();

create trigger consultation_followups_set_updated_at
before update on public.consultation_followups
for each row execute function public.set_updated_at();

create trigger consultation_followups_recalculate_summary
after insert or update or delete on public.consultation_followups
for each row execute function public.recalculate_consultation_followup_summary();

alter table public.consultations disable row level security;
alter table public.consultation_followups disable row level security;

grant select, insert, update, delete on table
  public.consultations,
  public.consultation_followups
to anon, authenticated;

comment on table public.consultations is 'P1 organization-scoped customer consultations. Customer phone is visible only in the same organization consultation workspace.';
comment on table public.consultation_followups is 'P1 accumulated follow-up activity. The trigger recalculates the consultation summary after every write.';
