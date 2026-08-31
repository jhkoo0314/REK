# 웹프로젝트 구조 인덱스

> 기준일: 2026-08-31  
> 목적: 필요한 화면·업무 기능·데이터베이스 변경 파일을 빠르게 찾기 위한 안내 문서

## 1. 먼저 알아둘 점

이 프로젝트는 Next.js 웹서비스입니다. `index.ts`라는 실행 파일을 따로 두지 않고, `app/` 폴더 안의 `page.tsx` 파일이 각 화면 주소를 담당합니다.

예를 들어 매물 목록 화면은 `app/(app)/listings/page.tsx`이고, 실제 목록 표·검색·수정 기능은 `features/listings/`에서 관리합니다.

## 2. 최상위 폴더와 파일

| 위치 | 역할 | 일반적으로 수정하는 경우 |
| --- | --- | --- |
| `app/` | 주소별 화면을 연결하는 곳 | 새 화면을 만들거나 화면 순서를 바꿀 때 |
| `components/shared/` | 여러 화면이 함께 쓰는 공통 화면 부품 | 공통 상단 메뉴·상태 배지·빈 화면을 바꿀 때 |
| `features/` | 매물·상담·계약 등 업무별 실제 기능 | 특정 업무의 표·입력창·저장 방식을 바꿀 때 |
| `lib/` | 로그인 조직 확인, DB 연결, 공통 문자 처리 | 여러 업무가 공통으로 쓰는 처리 방식을 바꿀 때 |
| `supabase/migrations/` | DB 항목과 업무 규칙의 변경 기록 | 저장 항목·자동 상태 변경을 추가하거나 수정할 때 |
| `docs/` | 업무 기준, 화면 설계, 진행·검증 기록 | 업무 규칙·진행 상황을 기록하거나 확인할 때 |
| `README.md` | 프로젝트의 짧은 소개와 실행 방법 | 현재 단계·실행 방법이 달라졌을 때 |
| `AGENTS.md` | 이 프로젝트의 작업 규칙 | 작업 전 반드시 참고 |
| `package.json` | 실행·검사 명령과 사용 도구 목록 | 새 도구 추가 또는 실행 명령 변경 시 |

## 3. 화면 주소와 업무 기능 연결

| 업무 | 화면 주소 | 화면 연결 파일 | 실제 기능 폴더 |
| --- | --- | --- | --- |
| 로그인 | `/sign-in`, `/sign-up` | `app/sign-in/`, `app/sign-up/` | Clerk 설정 및 `lib/auth/` |
| 상담관리 | `/consultations` | `app/(app)/consultations/` | `features/consultations/` |
| 오늘 할 일 | `/dashboard` | `app/(app)/dashboard/page.tsx` | `features/tasks/` |
| 매물관리 | `/listings` | `app/(app)/listings/` | `features/listings/` |
| 건물·호실 관리 | `/buildings` | `app/(app)/buildings/page.tsx` | `features/listings/` |
| 계약관리 | `/contracts` | `app/(app)/contracts/` | `features/contracts/` |
| 광고관리 | `/advertisements` | `app/(app)/advertisements/page.tsx` | `features/advertisements/` |
| 구성원 권한 | `/members` | `app/(app)/members/page.tsx` | `features/members/` |
| 매물 유형 미리보기 | `/property-types` | `app/(app)/property-types/` | `features/property-types/` |

`app/(app)/`의 괄호 폴더 이름은 주소에 표시되지 않습니다. 즉 파일은 `app/(app)/listings/page.tsx`에 있어도 실제 주소는 `/listings`입니다.

## 4. 업무 기능 폴더의 구성

| 하위 폴더/파일 | 역할 |
| --- | --- |
| `components/` | 표, 입력창, 상세 화면, 버튼 등 사용자가 보는 업무 화면 부품 |
| `schemas/` | 사용자가 입력한 내용이 올바른지 확인하는 기준 |
| `server/` | DB에서 조회·저장·수정하는 서버 처리 |
| `types.ts` | 매물처럼 여러 화면에서 공통으로 쓰는 데이터 모양 |

현재 업무별 구성은 다음과 같습니다.

| 폴더 | 담당 업무 |
| --- | --- |
| `features/listings/` | 매물 등록·목록·검색·상세·수정·빠른 수정·관리 종료, 건물·호실 탐색 |
| `features/consultations/` | 상담 등록·수정, 최초 제안 매물 연결, 후속 연락·방문 이력 |
| `features/contracts/` | 계약 매물 검색·등록·수정·단계 이력·해지·만료 |
| `features/tasks/` | 오늘·지연 업무 조회, 완료 처리, 빠른 처리 |
| `features/advertisements/` | 월별 광고비, 매물 조건 기반 광고 문구 생성·복사 |
| `features/members/` | 직원별 민감정보 열람 권한 |
| `features/property-types/` | 향후 매물 유형 확장을 위한 화면 미리보기 |
| `features/revenue/` | 중개수수료 정산, 수납·환불, 담당자별 매출관리 |

## 5. DB 변경 파일 확인 방법

`supabase/migrations/`의 파일은 날짜와 순서가 앞에 붙습니다. 새 파일을 만들었다고 바로 Dev DB에 적용되는 것은 아닙니다. 적용 여부는 반드시 `docs/CURRENT_IMPLEMENTATION_STATUS.md`와 `docs/BUILD_PROGRESS.md`에서 따로 확인합니다.

현재 주요 최신 변경 파일은 아래와 같습니다.

| 파일 | 내용 | Dev DB 적용 상태 |
| --- | --- | --- |
| `20260831000100_add_listing_end_date.sql` | 매물 관리 종료일 추가 | Dev DB 적용 완료 |
| `20260831000200_remove_listing_photo_and_recheck.sql` | 사진 유무·재확인일 제거 | Dev DB 적용 완료 |
| `20260831000300_allow_contract_historical_listing_selection.sql` | 계약 등록에서 과거 매물 이력 선택 허용 | Dev DB 적용 완료 |
| `20260831000400_relist_after_completed_contract_cancellation.sql` | 계약 완료 후 해지·만료 시 새 공실 매물 생성 규칙 | Dev DB 적용 완료 |
| `20260901000100_add_contract_revenue_management.sql` | 중개수수료 정산·수납·환불·담당자별 매출관리 | Dev DB 적용 완료 |
| `20260901000200_add_member_default_revenue_rates.sql` | 관리자 직원별 기본 담당자 수수료 비율 | Dev DB 적용 대기 |
| `20260901000300_split_contract_commission_by_party.sql` | 임차인·임대인 수수료 분리 | Dev DB 적용 대기 |

## 6. 현재 폴더 구조 요약

```text
realestate_web/
├─ app/                         화면 주소와 페이지 조립
│  ├─ (app)/                    로그인 후 업무 화면
│  │  ├─ advertisements/        광고관리
│  │  ├─ buildings/             건물·호실 관리
│  │  ├─ consultations/         상담관리
│  │  ├─ contracts/             계약관리
│  │  ├─ dashboard/             오늘 할 일
│  │  ├─ listings/              매물관리
│  │  ├─ members/               구성원 권한
│  │  └─ property-types/        유형별 화면 미리보기
│  ├─ sign-in/                  로그인
│  └─ sign-up/                  회원가입
├─ components/shared/           공통 앱 화면 부품
├─ features/                    업무별 실제 기능
├─ lib/                         공통 처리와 연결 설정
├─ supabase/migrations/         DB 변경 기록
├─ docs/                        기준·진행·검증 문서
├─ README.md                    프로젝트 안내
└─ AGENTS.md                    작업 규칙
```

## 7. 변경할 내용을 찾는 빠른 기준

| 바꾸려는 내용 | 먼저 확인할 위치 |
| --- | --- |
| 매물 목록의 열·검색 조건·빠른 수정 | `features/listings/` |
| 매물 등록 입력 항목 | `features/listings/components/listing-registration-form.tsx` 및 `features/listings/schemas/` |
| 상담 목록·후속이력·상담 수정 | `features/consultations/` |
| 계약 등록 흐름·계약 단계 | `features/contracts/` |
| 광고 문구·광고비 | `features/advertisements/` |
| 상단 메뉴·로그인 정보·조직 선택 | `components/shared/app-shell.tsx`, `lib/auth/` |
| DB에 저장하는 항목·자동 처리 규칙 | `supabase/migrations/` 및 해당 업무의 `server/` |
| 업무 규칙·진행 상태 | `docs/REBUILD_MASTER_SPEC.md`, `docs/TODO.md`, `docs/CURRENT_IMPLEMENTATION_STATUS.md` |

## 8. 유지 원칙

- 새 업무 화면은 `app/`에 주소를 연결하고, 실제 기능은 해당 `features/` 업무 폴더에 둡니다.
- 한 화면에서 공통으로 쓸 내용은 `components/shared/`에 한 번만 둡니다.
- DB 변경은 반드시 새 migration 파일로 남기고, 파일 작성과 Dev DB 적용을 구분해 기록합니다.
- 기존 Streamlit SQLite 자료는 이 구조와 별개인 읽기 전용 과거 기록이며, 웹 DB로 자동 이관하지 않습니다.
