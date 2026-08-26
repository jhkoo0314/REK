-- 계약의 거래 방식(월세·전세·매매)과 계약 구분(신규·재계약)을 분리한다.
-- Apply manually to Supabase Dev after 20260826001600 and 20260826001500.

do $$ begin create type public.contract_kind as enum ('new_contract', 'renewal'); exception when duplicate_object then null; end $$;

alter table public.contracts add column if not exists transaction_type public.transaction_type;
alter table public.contracts add column if not exists contract_kind public.contract_kind;

update public.contracts c
set transaction_type = l.transaction_type
from public.listings l
where l.id = c.listing_id and l.organization_id = c.organization_id and c.transaction_type is null;

update public.contracts set transaction_type = 'to_be_confirmed' where transaction_type is null;
update public.contracts set contract_kind = case when contract_type = 'renewal' then 'renewal'::public.contract_kind else 'new_contract'::public.contract_kind end where contract_kind is null;

alter table public.contracts alter column transaction_type set default 'to_be_confirmed', alter column transaction_type set not null;
alter table public.contracts alter column contract_kind set default 'new_contract', alter column contract_kind set not null;

comment on column public.contracts.transaction_type is 'Same transaction method as listing: monthly rent, jeonse, sale, or confirmation needed.';
comment on column public.contracts.contract_kind is 'New contract or renewal; separate from transaction method.';
