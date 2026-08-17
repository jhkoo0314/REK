-- Dev schema change only. Write this file first; apply it to Dev only after user approval.
-- Scope: distinguish monthly-rent and jeonse listings without changing listing history.

alter table public.listings
  add column transaction_type text not null default '확인 필요'
  check (transaction_type in ('월세', '전세', '확인 필요'));

comment on column public.listings.transaction_type is
  '거래 유형. 월세·전세·확인 필요 중 하나이며, 일반 수정에서는 기존 listings 행을 갱신한다.';
