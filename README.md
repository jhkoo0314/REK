# 부동산 매물관리 웹서비스

# REK

원룸·투룸 중심 임대 중개 업무를 위한 내부 웹서비스입니다. 매물, 상담, 계약, 광고 현황과 오늘 할 일을 한 흐름으로 관리해 반복 확인과 업무 누락을 줄이는 것이 목표입니다.

현재는 **기획·데이터·화면·보안·테스트 문서가 완료된 상태**이며, 프로젝트 기반과 UI 뼈대 구축을 진행하고 있습니다. 로그인과 실제 데이터 연결은 개발용 Clerk·Supabase 환경을 준비한 뒤 순서대로 추가합니다.

---

## 1. 이 서비스가 해결할 일

| 업무 | 현재 목표 |
| --- | --- |
| 매물 관리 | 건물→호실→매물 구조로 등록·검색·필터·수정·상태 관리 |
| 오늘 할 일 | 입주·퇴실·공실 확인·상담 연락·계약 일정을 한 화면에서 확인 |
| 상담 관리 | 문의 조건, 제안 매물, 통화·문자·방문 이력, 다음 연락일 관리 |
| 계약 관리 | 계약 조건·일정·입금 확인과 매물 상태·광고 종료 확인 연결 |
| 광고 관리 | 채널별 게시 상태와 광고 문구 생성·복사 |
| 사용자 관리 | Clerk 기반 admin/staff 초대와 권한 관리 |

외부 채널 자동 등록, 자동 문자 발송, 대량 사진 처리, AI 자동화는 초기 범위에 포함하지 않습니다.

---

## 2. 핵심 업무 원칙

- 매물 구조는 `건물 → 호실 → 매물`입니다.
- 가격·상태·입주 가능일이 바뀌면 기존 현재 매물을 수정합니다. 새 매물을 자동 생성하지 않습니다.
- 계약 완료·취소에 따른 매물 상태 변경은 사용자가 확인한 뒤 적용합니다.
- 광고 문구 생성은 외부 등록용 결과를 만들 뿐, 매물 상태나 광고 상태를 자동 변경하지 않습니다.
- 목록은 빠른 판단을 위해 핵심 정보만 보여 주고, 민감 정보는 상세 화면에서 필요한 경우에만 확인합니다.
- 기존 Streamlit SQLite 데이터는 이관하지 않습니다. 웹서비스 운영 시작일부터 새 매물·상담·계약을 등록합니다.

---

## 3. 기술 스택

| 영역 | 선택 |
| --- | --- |
| 웹 프레임워크 | Next.js 16 App Router |
| UI | React, TypeScript 5.x 이상, Tailwind CSS, shadcn/ui |
| 입력·표 | React Hook Form, Zod, TanStack Table, date-fns |
| 로그인 | Clerk |
| 데이터 | Supabase Postgres |
| 사진(후순위) | Supabase Storage |
| 배포 | Vercel |

일상 기능은 Next.js와 TypeScript로 구현합니다. 별도 Python 서버는 두지 않으며, Python은 필요할 때 일회성 자료 정리·OCR·사진 일괄 작업에만 검토합니다.

---

## 4. 개발·디자인 협업 방식

이 프로젝트는 하이브리드 방식으로 진행합니다.

| 담당 | 역할 |
| --- | --- |
| Codex | 실제 프로젝트 코드, UI 구현, 기능, DB, Clerk, Supabase, RLS, 테스트, 배포 |
| Gemini Flash 3.6 | 전체 UI 디자인 뼈대, 디자인 시스템, 정적 화면 시안·프로토타입 |

Gemini는 프로젝트 코드를 수정하지 않습니다. Gemini 디자인 시안을 사용자가 승인하면, Codex가 shadcn/ui와 Tailwind 기반으로 실제 프로젝트에 구현합니다.

전체 디자인 뼈대를 먼저 만든 뒤, 매물 관리부터 상담·계약·광고 기능을 순서대로 연결합니다.

자세한 규칙은 `hybrid_development_working_agreement_v1.md`를 참고합니다.

---

## 5. 환경 구분과 데이터 원칙

| 환경 | 목적 | 데이터 | RLS |
| --- | --- | --- |
| Local | 개발 | 가공 테스트 데이터만 | 개발 중 비활성화 가능 |
| Preview | 화면·기능 검토 | 가공 테스트 데이터만 | 운영 전 활성화 검증 |
| Production | 실제 사무실 업무 | 웹서비스에 새로 등록한 실제 데이터 | 활성화 필수 |

Production에는 Clerk Production, Supabase Production, Vercel Production을 사용합니다. Dev/Preview와 운영 환경은 반드시 분리합니다.

실제 고객명·연락처·계약금·계좌·출입 정보·매물 사진은 Dev/Preview에 입력하지 않습니다.

---

## 6. 예정 프로젝트 구조

```text
app/                    # URL별 페이지, 레이아웃, Server Action, Route Handler
app/(app)/              # 로그인 후 업무 화면
components/ui/          # shadcn/ui 기반 공통 부품
components/shared/      # 사이드바, 헤더, 상태 배지 등
features/listings/      # 매물 관리
features/consultations/ # 상담 관리
features/contracts/     # 계약 관리
features/advertisements/# 광고 현황·문구 생성
features/tasks/         # 오늘 할 일
features/members/       # 사용자 관리
lib/                    # Clerk, Supabase, 권한, 날짜·금액 함수
types/                  # DB와 화면 타입
supabase/migrations/    # DB 구조·RLS 변경 기록
scripts/                # 일회성 점검·자료 정리 스크립트
docs/                   # 프로젝트 문서 안내
```

---

## 7. 개발 시작 후 실행 방법

Next.js 프로젝트를 만든 뒤 아래 명령을 기본으로 사용합니다.

```bash
npm install
npm run dev
```

프로젝트 초기화 때 아래 검증 명령도 표준화합니다.

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

`typecheck`와 `test` 스크립트는 초기 프로젝트 설정 시 추가합니다. 비밀값이 들어 있는 `.env.local` 파일은 Git에 올리지 않습니다.

---

## 8. 환경 변수 이름

실제 값은 Vercel 또는 로컬 환경 파일에만 저장합니다.

| 이름 | 용도 | 노출 규칙 |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 공개 키 | 브라우저 노출 가능 |
| `CLERK_SECRET_KEY` | Clerk 서버 비밀 키 | 서버 전용 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 브라우저 노출 가능 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase 공개 키 | 브라우저 노출 가능 |
| `SUPABASE_SECRET_KEY` | 제한된 서버 관리 작업 | 서버 전용, 일반 CRUD 금지 |

Production의 일반 매물·상담·계약 요청은 사용자 인증 문맥과 Supabase RLS를 통과해야 합니다. 비밀 키로 RLS를 우회하지 않습니다.

---

## 9. 구현 순서

1. 프로젝트 기반, 공통 앱 셸, Clerk Development 로그인
2. Supabase Dev 스키마와 조직 멤버 구조
3. 매물 목록·검색·등록·상세·수정
4. 대시보드와 오늘 할 일
5. 상담 관리
6. 계약 관리
7. 광고 현황과 문구 생성
8. Preview 검토와 수용 테스트
9. Production RLS·운영 계정·신규 데이터 등록 방식 확인
10. Production 운영 시작
11. 사진, 엑셀 내보내기, 대량 수정 등 후속 기능

매물 관리(P0)가 안정되기 전에는 사진·AI·자동화 기능을 먼저 추가하지 않습니다.

---

## 10. 문서 안내

| 문서 | 내용 |
| --- | --- |
| `web_service_prd_v1.md` | 제품 요구사항과 초기 범위 |
| `development_environment_plan.md` | Local·Preview·Production 환경 계획 |
| `user_access_policy_v1.md` | Clerk 사용자·역할·권한 정책 |
| `supabase_data_model_v1.md` | Supabase 테이블·관계 정의 |
| `supabase_security_transition_plan.md` | Dev RLS 비활성화에서 Production 보안으로 전환하는 기준 |
| `web_workflow_spec_v1.md` | 매물·상담·계약·광고 업무 흐름 |
| `web_screen_spec_wireframe_v1.md` | 화면 명세와 UX 기준 |
| `web_technical_architecture_v1.md` | 기술 구조와 폴더·배포 기준 |
| `web_implementation_plan_v1.md` | 실제 구현 순서와 완료 기준 |
| `web_test_acceptance_v1.md` | 테스트·수용 기준 |
| `production_release_checklist_v1.md` | Production 배포·운영 시작 체크리스트 |
| `hybrid_development_working_agreement_v1.md` | Codex·Gemini 협업 규칙 |
| `AGENTS.md` | Codex 작업 규칙 |

---

## 11. Production 시작 조건

- 매물 등록·검색·수정(P0)과 핵심 업무 흐름 테스트가 통과해야 합니다.
- Blocker와 Critical 오류가 0건이어야 합니다.
- admin, staff, inactive, 다른 조직 테스트 계정으로 접근 권한을 확인해야 합니다.
- Production Supabase의 RLS와 조직 분리 테스트가 통과해야 합니다.
- 실제 데이터는 웹서비스에서 새로 등록하는 방식으로 시작합니다.
- 기존 SQLite 원본은 과거 확인용 백업으로 보관합니다.
# REK
# REK
