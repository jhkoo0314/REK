# Dev DB 구조 작성 완료 — 적용 대기

작성일: 2026-08-15  
상태: **SQL 파일만 작성됨. Supabase Dev 프로젝트에는 아직 적용하지 않음.**

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

## 이번에 의도적으로 하지 않은 것

- `supabase db push`, SQL 실행, Dev DB 테이블 생성
- RLS 정책 적용
- seed 데이터 입력
- 상담·계약·광고·오늘 할 일 테이블 생성
- 실제 고객·연락처·출입 정보 입력

## 승인 후 다음 실행 순서

1. migration 1, 2를 Dev Supabase에 적용
2. 가공 조직·admin/staff·건물·호실·매물 seed를 준비
3. 제약 조건을 테스트
4. Next.js 매물 목록·등록·상세 화면을 실제 Dev DB에 연결

Production 적용은 하지 않으며, Production RLS는 별도 보안 전환 단계에서 다룹니다.
