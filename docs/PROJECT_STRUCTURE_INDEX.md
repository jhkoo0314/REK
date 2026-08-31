# 웹프로젝트 구조 인덱스

> 기준일: 2026-09-01
> 목적: 화면·업무 기능·DB 변경 파일의 위치를 빠르게 찾기 위한 현재 구조 안내

## 1. 먼저 알아둘 점

이 프로젝트는 `index.ts` 실행 파일을 따로 두지 않는 Next.js 웹서비스입니다. `app/` 안의 `page.tsx` 파일이 각 화면 주소를 담당하고, 실제 화면 부품과 저장 처리는 `features/` 업무 폴더에 둡니다.

예를 들어 `/revenue/status`의 화면 연결 파일은 `app/(app)/revenue/status/page.tsx`이고, 현황 조회 화면은 `features/revenue/`에서 관리합니다.

`app/(app)/`의 괄호 폴더 이름은 실제 주소에 표시되지 않습니다. 따라서 `app/(app)/listings/page.tsx`의 실제 주소는 `/listings`입니다.

## 2. 최상위 폴더와 파일

| 위치 | 역할 | 일반적으로 수정하는 경우 |
| --- | --- | --- |
| `app/` | 주소별 화면을 연결하는 페이지 조립 위치 | 새 화면·주소·화면 순서를 바꿀 때 |
| `components/shared/` | 여러 화면이 공통으로 쓰는 UI | 좌측 메뉴, 화면 제목, 상태 배지를 바꿀 때 |
| `features/` | 업무별 실제 화면·입력 검증·서버 처리 | 특정 업무의 등록·조회·수정 방식을 바꿀 때 |
| `lib/` | 로그인 조직 확인, DB 연결, 문자·전화번호 처리 | 여러 업무가 함께 쓰는 처리 방식을 바꿀 때 |
| `supabase/migrations/` | DB 저장 항목과 자동 처리 규칙 변경 기록 | DB 항목·제약·자동 규칙을 바꿀 때 |
| `docs/` | 업무 기준, 진행 기록, 화면 설계 문서 | 업무 규칙·진행 상태를 확인하거나 갱신할 때 |
| `README.md` | 프로젝트 요약과 실행 방법 | 현재 단계·문서 순서가 바뀔 때 |
| `AGENTS.md` | 작업 규칙 | 구현 전 반드시 확인 |
| `package.json` | 실행·검사 명령과 사용 도구 | 실행 방식 또는 도구가 바뀔 때 |

## 3. 화면 주소와 업무 기능 연결

| 업무 | 화면 주소 | 화면 연결 파일 | 실제 기능 위치 |
| --- | --- | --- | --- |
| 기본 이동 | `/` | `app/page.tsx` | 로그인 뒤 중요업무알림으로 이동 |
| 로그인 | `/sign-in`, `/sign-up` | `app/sign-in/`, `app/sign-up/` | Clerk 및 `lib/auth/` |
| 중요업무알림 | `/dashboard` | `app/(app)/dashboard/page.tsx` | `features/tasks/` |
| 상담관리 | `/consultations` | `app/(app)/consultations/` | `features/consultations/` |
| 매물관리 | `/listings` | `app/(app)/listings/` | `features/listings/` |
| 건물·호실 관리 | `/buildings` | `app/(app)/buildings/page.tsx` | `features/listings/` |
| 계약 조회·등록 | `/contracts`, `/contracts/new` | `app/(app)/contracts/` | `features/contracts/` |
| 계약 상세 | `/contracts/[contractId]` | `app/(app)/contracts/[contractId]/page.tsx` | `features/contracts/`, `features/revenue/` |
| 매출 정산 | `/revenue` | `app/(app)/revenue/page.tsx` | `features/revenue/` |
| 매출 현황 | `/revenue/status` | `app/(app)/revenue/status/page.tsx` | `features/revenue/` |
| 광고관리 | `/advertisements` | `app/(app)/advertisements/page.tsx` | `features/advertisements/` |
| 멤버 권한 | `/members` | `app/(app)/members/page.tsx` | `features/members/` |
| 매물 유형 미리보기 | `/property-types` | `app/(app)/property-types/` | `features/property-types/` |

## 4. 업무 기능별 현재 파일

각 업무 폴더는 보통 아래처럼 나뉩니다.

| 구분 | 역할 |
| --- | --- |
| `components/` | 표·입력창·상세 화면처럼 사용자가 보는 화면 부품 |
| `schemas/` | 잘못된 입력을 막는 입력 기준 |
| `server/` | 조직 권한 확인 후 DB를 조회·저장·수정하는 처리 |
| `types.ts` 또는 업무 파일 | 여러 화면이 함께 쓰는 데이터 모양·선택값 |

| 폴더 | 현재 담당 업무 | 주요 파일 |
| --- | --- | --- |
| `features/listings/` | 매물 등록·검색·상세·수정·빠른 수정·관리 종료, 건물·호실 탐색 | `listing-workspace.tsx`, `listing-registration-form.tsx`, `building-explorer.tsx`, `listing-queries.ts` |
| `features/consultations/` | 상담 등록·수정·목록·후속 연락·방문 이력 | `consultation-list.tsx`, `stored-consultation-detail.tsx`, `consultation-followup-timeline.tsx` |
| `features/contracts/` | 계약 매물 검색·등록·수정·단계 이력·해지·만료 | `contract-list.tsx`, `contract-registration-form.tsx`, `contract-detail.ts` |
| `features/tasks/` | 오늘·지연 업무 조회, 완료 처리, 빠른 처리 | `task-inbox.tsx`, `task-queries.ts`, `task-completions.ts` |
| `features/advertisements/` | 월별 광고비, 조건 기반 광고 문구 생성·복사 | `advertising-cost-workspace.tsx`, `advertising-copy-workspace.tsx`, `advertising-costs.ts` |
| `features/members/` | 직원별 민감정보 권한과 기본 담당자 수수료 비율 | `sensitive-permissions-workspace.tsx`, `sensitive-permissions.ts` |
| `features/revenue/` | 계약 담당자 지정, 수수료 정산, 실제 수납·환불, 매출 현황 조회 | `contract-revenue-settlement.tsx`, `revenue-workspace.tsx`, `revenue-analysis-workspace.tsx`, `revenue-management.ts`, `revenue-analysis.ts` |
| `features/property-types/` | 향후 매물 유형 확장용 가공 화면 미리보기 | `property-type-preview-workspace.tsx`, `mock-data.ts` |

## 5. 공통 기능 위치

| 위치 | 역할 |
| --- | --- |
| `components/shared/app-shell.tsx` | 좌측 메뉴, Clerk 로그인 정보, 조직 전환 |
| `components/shared/page-header.tsx` | 각 업무 화면의 제목·설명 |
| `components/shared/status-badge.tsx` | 매물·상담·계약 상태 표시 |
| `components/shared/workspace-empty-state.tsx` | 데이터가 없을 때 안내 화면 |
| `lib/auth/organization-context.ts` | 현재 로그인 사용자·조직·admin/staff 역할 확인 |
| `lib/auth/sensitive-access.ts` | 민감정보 열람 권한 확인 |
| `lib/supabase/server.ts` | 서버에서 Supabase를 연결하는 공통 처리 |
| `lib/phone-format.ts`, `lib/text-normalize.ts` | 전화번호 표시와 검색 문자 정리 |

## 6. 주요 DB 변경 파일과 적용 상태

`supabase/migrations/` 파일을 작성했다고 Dev DB에 자동 적용되지는 않습니다. 적용 여부는 `docs/CURRENT_IMPLEMENTATION_STATUS.md`와 `docs/BUILD_PROGRESS.md`의 최신 기록을 함께 확인합니다.

| 파일 | 내용 | Dev DB 적용 상태 |
| --- | --- | --- |
| `20260831000100_add_listing_end_date.sql` | 매물 관리 종료일 | 적용 완료 |
| `20260831000200_remove_listing_photo_and_recheck.sql` | 사진 유무·재확인일 제거 | 적용 완료 |
| `20260831000300_allow_contract_historical_listing_selection.sql` | 계약 등록에서 과거 매물 이력 선택 허용 | 적용 완료 |
| `20260831000400_relist_after_completed_contract_cancellation.sql` | 계약 완료 후 해지·만료 시 새 공실 생성 규칙 | 적용 완료 |
| `20260901000100_add_contract_revenue_management.sql` | 계약 담당자, 수수료 정산, 수납·환불 기록 | 적용 완료 |
| `20260901000200_add_member_default_revenue_rates.sql` | 직원별 기본 담당자 수수료 비율 | 적용 대기 |
| `20260901000300_split_contract_commission_by_party.sql` | 임차인·임대인 수수료 분리 | 적용 대기 |
| `20260901000400_convert_revenue_amounts_to_won.sql` | 수수료 정산·수납·환불을 원 단위로 전환 | 적용 대기 |

## 7. 현재 폴더 구조와 역할

```text
realestate_web/
├─ app/                                  주소별 화면을 조립하는 곳
│  ├─ (app)/                             로그인한 뒤 접근하는 업무 화면 묶음
│  │  ├─ advertisements/                 월별 광고비·광고 문구 화면
│  │  ├─ buildings/                      건물·호실 탐색·관리 화면
│  │  ├─ consultations/                  상담 목록, 신규 등록, 상담 상세 화면
│  │  ├─ contracts/                      계약 조회, 매물 검색 후 계약 등록, 계약 상세 화면
│  │  ├─ dashboard/                      오늘·지연된 중요 업무 알림 화면
│  │  ├─ listings/                       매물 목록, 등록, 상세, 수정, 과거 이력 화면
│  │  ├─ members/                        관리자용 멤버 권한·기본 수수료율 설정 화면
│  │  ├─ property-types/                 향후 유형 확장 전 가공 화면 미리보기
│  │  └─ revenue/                        계약별 매출 정산과 매출 현황 화면
│  ├─ sign-in/                           Clerk 로그인 화면
│  ├─ sign-up/                           Clerk 회원가입 화면
│  ├─ layout.tsx                         전체 웹의 기본 틀과 공통 설정
│  ├─ globals.css                        전체 색상·여백·글자 등 공통 스타일
│  └─ page.tsx                           기본 접속 시 업무 시작 화면으로 이동
│
├─ components/                           여러 업무가 함께 쓰는 화면 부품
│  └─ shared/                            앱 전체에서 재사용하는 업무 UI
│     ├─ AppShell 역할                   좌측 메뉴, 로그인 사용자, 조직 선택 영역
│     ├─ PageHeader 역할                 화면 제목과 짧은 안내 문구
│     ├─ StatusBadge 역할                매물·상담·계약 상태를 텍스트와 색으로 표시
│     └─ WorkspaceEmptyState 역할        데이터가 없을 때 다음 행동을 안내
│
├─ features/                             업무별 실제 화면·입력 검증·서버 처리
│  ├─ listings/                          매물과 건물·호실 업무
│  │  ├─ components/                     매물 표, 등록·수정 폼, 빠른 수정, 관리 종료, 건물 탐색 UI
│  │  ├─ schemas/                        매물·건물·호실 입력값 검증
│  │  ├─ server/                         매물·건물·호실 조회·저장·수정 처리
│  │  └─ types.ts, holding-sources.ts    매물 데이터 모양과 보유처 선택값
│  ├─ consultations/                     상담과 후속 이력 업무
│  │  ├─ components/                     상담 목록, 등록, 상세, 후속 연락·방문 이력 UI
│  │  ├─ schemas/                        상담 등록·수정·후속이력 입력 검증
│  │  └─ server/                         상담 조회·저장·수정 처리
│  ├─ contracts/                         계약과 계약 단계 이력 업무
│  │  ├─ components/                     계약 목록, 계약 매물 검색, 등록·수정, 단계·삭제 UI
│  │  ├─ schemas/                        계약·계약 단계 입력 검증
│  │  └─ server/                         계약 조회·저장·상태 처리
│  ├─ tasks/                             오늘·지연 업무 관리
│  │  ├─ components/                     중요 업무 목록과 빠른 처리 UI
│  │  └─ server/                         업무 계산, 완료·해제, 빠른 처리
│  ├─ advertisements/                    광고비·광고 문구 업무
│  │  ├─ components/                     광고비 입력, 광고 문구 생성·복사 UI
│  │  ├─ schemas/                        광고비·광고 문구 입력 검증
│  │  └─ server/                         월별 광고비 조회·저장·삭제
│  ├─ members/                           조직 구성원 권한 업무
│  │  ├─ components/                     관리자용 권한·기본 담당자 수수료율 설정 UI
│  │  └─ server/                         멤버 권한·수수료율 조회·저장
│  ├─ revenue/                           중개수수료와 매출 현황 업무
│  │  ├─ components/                     담당자 지정, 수수료 정산, 수납·환불, 매출 현황 UI
│  │  ├─ schemas/                        수수료 정산·수납·환불 입력 검증
│  │  └─ server/                         정산·수납·환불 저장과 권한별 매출 현황 집계
│  └─ property-types/                    향후 매물 유형 확장 검토용 가공 화면
│     └─ components/                     유형별 목록·상세·등록 흐름 미리보기
│
├─ lib/                                  모든 업무가 함께 쓰는 서버·문자 처리
│  ├─ auth/                              Clerk 로그인, 조직, 역할, 민감정보 권한 확인
│  ├─ supabase/                          서버에서 Dev/Production DB를 연결하는 공통 처리
│  ├─ mock-data/                         실제 DB를 쓰지 않는 가공 화면용 자료
│  ├─ phone-format.ts                    전화번호 화면 표시 방식
│  └─ text-normalize.ts                  검색을 위한 문자 정리
│
├─ supabase/                             Supabase 관련 자료
│  └─ migrations/                        DB 테이블·열·제약·자동 처리의 순서 있는 변경 파일
│
├─ docs/                                 업무 기준과 작업 기록
│  ├─ REBUILD_MASTER_SPEC.md             최상위 업무·보안·구조 기준
│  ├─ TODO.md                            실제 작업 순서와 완료 기록
│  ├─ CURRENT_IMPLEMENTATION_STATUS.md   구현 범위·검사·브라우저 확인·DB 적용 상태
│  ├─ BUILD_PROGRESS.md                  다음 작업과 전체 진행 판단
│  ├─ PROJECT_STRUCTURE_INDEX.md         현재 문서: 폴더·화면·기능 위치 안내
│  ├─ DESIGN_BUILD_PREP.md               화면 구성과 UI 분리 기준
│  ├─ SALES_REVENUE_BUILD_PLAN.md        수수료·담당자 매출관리 계획
│  └─ SALES_REVENUE_ANALYSIS_BUILD_DRAFT.md  매출 현황 조회 기준과 향후 분석 분리 원칙
│
├─ tests/                                자동 테스트를 둘 위치
├─ README.md                             프로젝트 요약·실행 방법·문서 읽는 순서
├─ AGENTS.md                             이 프로젝트의 구현·보안·문서 작업 규칙
├─ package.json                          실행·검사 명령과 사용 패키지 목록
├─ proxy.ts                              로그인하지 않은 접근을 막는 공통 경로 처리
└─ .env.local                            개발용 Clerk·Supabase 연결값(화면·Git에 공개 금지)
```

## 8. 변경할 내용을 찾는 빠른 기준

| 바꾸려는 내용 | 먼저 확인할 위치 |
| --- | --- |
| 매물 목록의 열·필터·빠른 수정 | `features/listings/components/listing-workspace.tsx` |
| 매물 등록·수정 입력 항목 | `features/listings/components/`, `features/listings/schemas/` |
| 건물·호실 탐색 | `features/listings/components/building-explorer.tsx` |
| 상담 목록·상담 수정·후속이력 | `features/consultations/` |
| 계약 검색·등록·단계 이력 | `features/contracts/` |
| 계약 상세의 수수료·수납·환불 | `features/revenue/components/contract-revenue-settlement.tsx` |
| 매출 정산·매출 현황 | `features/revenue/`, `app/(app)/revenue/` |
| 광고비·광고 문구 | `features/advertisements/` |
| 직원 권한·기본 담당자 수수료율 | `features/members/` |
| 좌측 메뉴·로그인 정보·조직 전환 | `components/shared/app-shell.tsx`, `lib/auth/` |
| DB 저장 항목·자동 처리 규칙 | `supabase/migrations/` 및 해당 업무 `server/` |
| 업무 규칙·진행 상태 | `docs/REBUILD_MASTER_SPEC.md`, `docs/TODO.md`, `docs/CURRENT_IMPLEMENTATION_STATUS.md` |

## 9. 유지 원칙

- 새 업무 화면은 `app/`에 주소를 연결하고, 실제 화면·입력·저장 처리는 해당 `features/` 업무 폴더에 둡니다.
- 여러 화면에서 반복하는 UI만 `components/shared/`로 모읍니다.
- DB 변경은 새 migration 파일로 남기며, 파일 작성과 Dev DB 적용을 반드시 구분해 기록합니다.
- 기존 Streamlit SQLite 자료는 웹 DB와 별개인 읽기 전용 과거 기록이며 자동 이관하지 않습니다.
