# Dev DB 구조 적용 완료

작성일: 2026-08-15  
상태: **사용자가 Dev Supabase에 1번, 2번 migration을 순서대로 적용 완료.** Production에는 적용하지 않았다.

## 이번에 준비한 구조

1. 조직과 사용자 연결
   - `organizations`
   - `organization_members` — Clerk 사용자 ID, admin/staff, active/inactive
2. 매물 기본 흐름
   - `buildings` → `units` → `listings`
3. 업무 안전장치
   - 모든 매물 기본 테이블에 `organization_id`, 생성·수정 시각, 작성·수정 멤버 기록
   - 같은 지번·건물의 중복 생성 방지
   - `302`와 `302호` 중복 방지
   - 호실 하나에 현재 매물은 최대 한 건
   - 금액 음수, 날짜 지정인데 입주일이 없는 입력 방지
   - 일반 수정은 같은 `listings` 행을 바꾸는 구조

## 작성된 migration 파일

| 순서 | 파일 | 내용 |
|---:|---|---|
| 1 | `supabase/migrations/0001_create_organizations_and_members.sql` | 조직·멤버·수정시각 자동 갱신 함수 |
| 2 | `supabase/migrations/0002_create_buildings_units_and_listings.sql` | 건물·호실·매물·제약·인덱스 |
| 3 | `supabase/migrations/0003_add_listing_transaction_type.sql` | 매물 거래 유형(월세·전세·확인 필요) — **Dev 적용 완료** |

## 이번에 의도적으로 하지 않은 것

- RLS 정책 적용
- seed 데이터 입력
- 상담·계약·광고·오늘 할 일 테이블 생성
- 실제 고객·연락처·출입 정보 입력

## 다음 작업 순서

1. `supabase/seeds/0001_dev_listing_fixture.sql` 실행 완료
2. `supabase/seeds/0002_verify_dev_listing_constraints.sql`을 Dev에 실행해 제약 조건 테스트
3. 필요한 추가 스키마 보완은 새 번호 migration 파일로 작성하고, 사용자가 Dev 적용
4. Next.js 매물 목록·등록·상세 화면을 실제 Dev DB에 연결

Production 적용은 하지 않으며, Production RLS는 별도 보안 전환 단계에서 다룹니다.
