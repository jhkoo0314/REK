-- P1 상담 목록 단순화: 폐기한 제안 매물 연결을 정리하고 S-000001 표시번호를 추가한다.
-- Status: written only. Apply manually to Supabase Dev after 20260826001100.

-- The first draft of 013 may have been applied manually. It is safe to remove
-- that unused relation before continuing with the simplified MVP workflow.
drop table if exists public.consultation_listings;
drop type if exists public.consultation_listing_role;

create sequence if not exists public.consultation_reference_number_seq;

alter table public.consultations
  add column if not exists consultation_reference_number bigint;

update public.consultations
set consultation_reference_number = nextval('public.consultation_reference_number_seq')
where consultation_reference_number is null;

alter table public.consultations
  alter column consultation_reference_number set default nextval('public.consultation_reference_number_seq'),
  alter column consultation_reference_number set not null;

do $$
begin
  alter table public.consultations
    add constraint consultations_organization_reference_number_key
    unique (organization_id, consultation_reference_number);
exception when duplicate_object then null;
end $$;

select setval(
  'public.consultation_reference_number_seq',
  coalesce((select max(consultation_reference_number) from public.consultations), 0) + 1,
  false
);

create index if not exists consultations_organization_reference_number_idx
  on public.consultations (organization_id, consultation_reference_number desc);

comment on column public.consultations.consultation_reference_number is 'Human-friendly internal consultation number, rendered as S-000001.';
