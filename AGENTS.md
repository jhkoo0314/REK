# AGENTS.md — 부동산 매물관리 웹서비스 작업 규칙

## 1. 프로젝트 목적

이 프로젝트는 원룸·투룸 중심 임대 중개 업무를 위한 웹서비스다. 목표는 매물, 상담, 계약, 광고 현황을 한 흐름으로 관리하여 반복 확인과 누락을 줄이는 것이다.

기술적으로 복잡한 구조보다 **매일 실제로 등록·검색·수정·확인할 수 있는가**를 우선한다.

---

## 2. 역할과 변경 권한

### Codex

Codex는 실제 프로젝트의 유일한 구현 담당자다.

- Next.js·React·TypeScript 코드 작성과 수정
- shadcn/ui·Tailwind 기반 UI 구현
- Clerk 로그인·권한 구현
- Supabase 스키마, migration, RLS, Storage 정책 구현
- Server Action, Route Handler, Zod 검증, 데이터 조회·저장 구현
- 테스트, 오류 수정, Git 변경, Vercel 배포 준비
- 문서와 실제 구현의 불일치 점검

### Gemini Flash 3.6

Gemini는 정적 디자인 기준물만 만든다.

- 전체 UI 톤, 레이아웃, 디자인 시스템, 화면 시안, 정적 프로토타입 제안 가능
- 실제 Git 저장소, 프로젝트 코드, 패키지, DB, 인증, 환경 변수, 배포 설정은 변경 불가
- 실제 고객·계약·연락처·출입·계정·비밀값은 제공하거나 사용하지 않음

Gemini 결과는 사용자 승인 후 Codex가 실제 프로젝트 코드로 구현한다. Gemini 결과를 프로젝트 코드에 직접 덮어쓰지 않는다.

---

## 3. 문서 우선순위

기능을 변경하기 전에 아래 문서를 먼저 확인한다. 문서와 사용자 최신 지시가 충돌하면 **사용자 최신 지시가 우선**이다.

| 우선 | 문서 | 역할 |
| --- | --- | --- |
| 1 | `web_service_prd_v1.md` | 제품 목적과 1차 범위 |
| 2 | `supabase_data_model_v1.md` | 데이터 구조와 관계 |
| 3 | `web_workflow_spec_v1.md` | 실제 업무 흐름과 업무 규칙 |
| 4 | `web_screen_spec_wireframe_v1.md` | 화면 구성과 UX 기준 |
| 5 | `web_technical_architecture_v1.md` | 기술 구조와 폴더·환경 기준 |
| 6 | `supabase_security_transition_plan.md` | Dev→Production 보안 전환 |
| 7 | `user_access_policy_v1.md` | 사용자·역할·조직 권한 |
| 8 | `web_implementation_plan_v1.md` | 구현 우선순위와 순서 |
| 9 | `web_test_acceptance_v1.md` | 테스트·수용 기준 |
| 10 | `production_release_checklist_v1.md` | Production 배포·운영 시작 기준 |
| 11 | `hybrid_development_working_agreement_v1.md` | Codex·Gemini 하이브리드 협업 규칙 |

---

## 4. 확정 기술 스택

- Next.js 16 App Router
- React
- TypeScript 5.x 이상
- Tailwind CSS
- shadcn/ui
- React Hook Form + Zod
- TanStack Table
- date-fns
- Clerk
- Supabase Postgres
- Supabase Storage(사진 기능 추가 시)
- Vercel

일상적인 웹 기능을 위해 별도 Python API, Express 서버, ORM, Redux, Redis, tRPC, GraphQL, 마이크로서비스를 추가하지 않는다. 필요성이 확인되기 전에는 새 기술을 도입하지 않는다.

Python은 기존 SQLite 확인, 일회성 자료 정리, OCR·사진 일괄 처리처럼 웹 요청에 맞지 않는 작업이 생길 때만 별도로 검토한다.

---

## 5. 제품·데이터 규칙

### 5.1 핵심 관계

모든 매물은 다음 구조를 따른다.

`건물 → 호실 → 매물`

- 건물 하나에는 여러 호실이 있다.
- 호실 하나에는 과거 매물이 있을 수 있다.
- 같은 호실의 일반 가격·상태·입주 가능일 변경은 기존 현재 매물을 수정한다.
- 일반 수정 시 새 매물을 자동 생성하지 않는다.
- 상담·계약·광고 현황은 매물에 연결되지만, 매물 수정으로 자동 삭제되거나 새로 생성되지 않는다.

### 5.2 업무 안전 규칙

- 계약 완료·취소 시 매물 상태 변경은 사용자가 확인한 뒤 실행한다.
- 광고 문구 생성만으로 매물·광고 상태를 자동 변경하지 않는다.
- 연결 기록이 있는 매물은 삭제보다 상태 변경·비활성화를 먼저 제안한다.
- 목록에서는 연락처·계좌·출입 관련 정보 같은 민감 정보를 기본 표시하지 않는다.
- 모든 일반 업무 요청은 로그인 사용자의 조직 안에서만 처리한다.

### 5.3 기존 SQLite 데이터

- 기존 Streamlit SQLite 데이터는 Supabase로 이관하지 않는다.
- 웹서비스는 운영 시작일부터 건물·호실·매물·상담·계약을 새로 등록한다.
- SQLite 원본은 과거 기록 확인용 읽기 전용 백업으로만 보관한다.

---

## 6. 인증·보안 규칙

### 개발 환경

- Clerk Development와 Supabase Dev를 사용한다.
- Dev/Preview에는 가공한 테스트 데이터만 사용한다.
- Dev Supabase에서만 필요 시 RLS를 일시 비활성화할 수 있다.
- RLS를 끈 상태여도 UI·서버·DB 설계는 항상 `organization_id` 기준을 유지한다.

### Production 환경

- Clerk Production, Supabase Production, Vercel Production은 Dev와 분리한다.
- Production의 실제 업무 테이블과 Storage 객체는 RLS를 활성화한다.
- Clerk–Supabase는 공식 Native Integration을 사용한다.
- 일반 매물·상담·계약 CRUD는 사용자 인증 문맥과 RLS를 통과해야 한다.
- Supabase secret/service-role 키는 일반 CRUD와 브라우저에서 사용하지 않는다.
- `NEXT_PUBLIC_` 환경 변수에는 공개 가능한 값만 넣는다.
- 실제 고객·계약·출입·사진 데이터는 RLS·조직 분리·수용 테스트 통과 전까지 Production에도 넣지 않는다.

---

## 7. UI·UX 구현 규칙

- 전체 화면은 승인된 Gemini 디자인 기준물을 바탕으로 Codex가 구현한다.
- 기본 HTML 같은 화면을 만들지 않는다. 여백, 타이포그래피, 색상, 카드/표, 상태 위계를 일관되게 적용한다.
- 표는 업무 판단에 필요한 핵심 열을 우선 표시한다.
- 긴 정보와 민감 정보는 상세 화면에 두고 목록 밀도를 낮춘다.
- 페이지당 주 행동 버튼은 하나만 강조한다.
- 상태는 색상만이 아니라 텍스트 배지로 표시한다.
- 로딩, 빈 화면, 오류, 저장 중, 권한 없음, 삭제 확인도 UI 범위에 포함한다.
- 데스크톱을 우선하되, 모바일에서 대시보드·검색·상세 확인·간단 수정은 가능해야 한다.
- 과도한 애니메이션·차트·장식 요소는 추가하지 않는다.

### 7.1 UI 컴포넌트 분리·재사용 규칙

- 모든 화면은 `app/**/page.tsx`를 **조립 전용 파일**로 유지한다. 페이지 파일에는 화면의 순서와 데이터 연결만 두고, 큰 카드·표·폼·섹션의 JSX를 길게 작성하지 않는다.
- 화면 전용 UI는 해당 업무 폴더의 `features/<업무>/components/`에 둔다. 예: 대시보드의 `DashboardHero`, `MetricCard`, `TodayTasksCard`.
- 둘 이상의 화면에서 같은 역할·모양으로 쓰는 UI는 `components/shared/`에 한 번만 만들고 각 페이지가 import해서 사용한다. 예: `AppShell`, `PageHeader`, `StatusBadge`, `DataTableFrame`, `SensitiveInfo`.
- shadcn의 기초 버튼·입력칸·다이얼로그처럼 아주 기본적인 UI는 `components/ui/`에 둔다. 업무 규칙을 담은 컴포넌트는 여기에 두지 않는다.
- 같은 이름의 상태 색상, 버튼 스타일, 표 구조를 페이지마다 복사하지 않는다. 공통 컴포넌트를 확장하거나 필요한 속성(props)을 추가한다.
- 재사용 가능성이 아직 없는 아주 작은 표시 요소까지 억지로 공통화하지 않는다. 대신 한 화면의 컴포넌트가 길어지거나 역할이 둘 이상이면 분리한다.
- 새 화면을 구현하기 전에는 사용할 공통 컴포넌트와 페이지 전용 컴포넌트 목록을 디자인 구현 가이드에 먼저 적고, 구현 뒤에도 실제 파일 경로가 그 구조를 따른지 확인한다.

---

## 8. 구현 방식

### 8.1 작업 순서

1. 프로젝트 기반·공통 앱 셸·로그인
2. Dev DB 스키마와 조직 멤버 구조
3. 매물 목록·검색·등록·상세·수정(P0)
4. 대시보드·오늘 할 일
5. 상담 관리
6. 계약 관리
7. 광고 현황·문구 생성
8. 테스트·Preview 검토
9. Production RLS·계정·신규 운영 시작
10. 사진·내보내기·대량 작업 등 후속 기능

P0가 통과되기 전에는 P2/P3 기능을 먼저 구현하지 않는다.

### 8.2 기능 작업 단위

모든 기능은 구현 전 아래를 명확히 한다.

- 목적: 어떤 반복 업무를 줄이는가
- 입력: 사용자가 무엇을 넣는가
- 처리: 서버·DB·업무 규칙이 무엇을 검증하는가
- 출력: 사용자가 무엇을 보고 다음에 무엇을 하는가
- 완료 기준: 실제로 확인 가능한 테스트 항목
- 제외 범위: 이번 작업에서 하지 않는 것

### 8.3 코드 구조

- 업무 단위로 `features/listings`, `features/consultations`, `features/contracts`, `features/advertisements`, `features/tasks`, `features/members`를 구분한다.
- 공통 UI는 `components/ui`, `components/shared`에 둔다.
- Clerk·Supabase·권한·날짜·금액 같은 공통 함수는 `lib`에 둔다.
- DB 스키마·RLS 변경은 `supabase/migrations`의 migration 파일로 남긴다.
- 반복이 명확해지기 전에는 불필요하게 파일과 추상화를 늘리지 않는다.

---

## 9. 작업 전·후 필수 확인

### 변경 전

- [ ] 관련 기획·데이터·워크플로우·화면 문서를 확인한다.
- [ ] 변경이 P0/P1/P2/P3 중 어디에 속하는지 확인한다.
- [ ] DB·권한·기존 업무 규칙에 미치는 영향을 확인한다.
- [ ] Gemini 디자인 변경인지, Codex 기능 변경인지 구분한다.
- [ ] 페이지 전용 컴포넌트와 공통 컴포넌트의 분리 계획을 디자인 구현 가이드에서 확인한다.

### 변경 후

- [ ] 정상 입력과 잘못된 입력을 확인한다.
- [ ] admin/staff 권한을 확인한다.
- [ ] 다른 조직 접근이 불가능한지 확인한다.
- [ ] 목록·상세·대시보드 등 연결 화면이 함께 갱신되는지 확인한다.
- [ ] 로딩·빈 화면·오류 상태가 이해 가능하게 표시되는지 확인한다.
- [ ] 린트·타입 검사·빌드·관련 테스트를 실행한다.
- [ ] 문서·작업 상태에 영향이 있으면 함께 갱신한다.
- [ ] 새 UI가 기존 공통 컴포넌트를 재사용하는지, 중복 컴포넌트를 만들지 않았는지 확인한다.

---

## 10. 금지 사항

- 실제 데이터를 Dev/Preview에 넣지 않는다.
- Production RLS를 끈 채 실제 데이터를 운영하지 않는다.
- 브라우저에 비밀 키를 넣지 않는다.
- 일반 CRUD에서 secret/service-role 키로 RLS를 우회하지 않는다.
- 요청값으로 받은 `organization_id`를 그대로 신뢰하지 않는다.
- 운영 문제를 해결하기 위해 Production RLS 전체를 해제하지 않는다.
- 사용자 승인 없이 디자인 뼈대·업무 흐름·데이터 규칙을 크게 바꾸지 않는다.
- 기존 SQLite 데이터를 자동·수동으로 Supabase에 이관하지 않는다.
- 필요성이 검증되기 전 새로운 프레임워크·DB·상태관리·AI·외부 연동을 추가하지 않는다.

---

## 11. Production 배포 기준

Production 배포 전에는 다음을 모두 통과해야 한다.

- [ ] `web_test_acceptance_v1.md`의 Blocker와 Critical 오류가 0건이다.
- [ ] admin·staff·inactive·다른 조직 테스트 계정으로 권한을 확인했다.
- [ ] Production RLS와 조직 분리 테스트를 통과했다.
- [ ] Production 환경 변수·도메인·Clerk 리다이렉트 URL을 확인했다.
- [ ] 실제 업무 데이터는 웹서비스에서 새로 등록하는 방식이 준비됐다.
- [ ] `production_release_checklist_v1.md`의 최종 체크를 완료했다.
