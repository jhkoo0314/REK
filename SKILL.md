---
name: realestate-rebuild-context
description: C:\realestate_web 재빌드 작업을 수동으로 시작할 때 현재 단계, 업무 규칙, 보안 기준, 문서 기록 규칙을 빠르게 확인한다.
---

# Realestate Rebuild Context

이 파일은 새 세션에서 이 프로젝트를 수동으로 시작할 때 사용한다. 목표는 현재 Streamlit 내부 업무 도구를 기능별로 분리된 로그인 기반 웹서비스로 다시 구현하는 것이다.

## 시작할 때 반드시 읽을 문서

아래 순서로 읽는다.

1. `AGENTS.md` — 프로젝트 전체 규칙과 변경 권한
2. `README.md` — 현재 단계와 문서 사용 순서
3. `docs/REBUILD_MASTER_SPEC.md` — 재빌드 범위, 업무·보안 규칙, 확정 폴더 구조
4. `docs/TODO.md` — 지금 진행할 단계와 완료 기준
5. `docs/CURRENT_IMPLEMENTATION_STATUS.md` — 실제 구현·검증·DB 적용 현황
6. `docs/BUILD_PROGRESS.md` — 재빌드 판단, 다음 안전한 작업, 승인 필요 사항

그 뒤 `git status --short`로 기존 변경을 확인한다. 관련 없는 사용자 변경은 보존한다.

## 작업 종류별 추가 문서

| 작업 | 추가로 읽을 문서 |
| --- | --- |
| 매물·상담·계약·광고 업무 | `docs/1.web_service_prd_v1.md`, `docs/4.supabase_data_model_v1.md`, `docs/6.web_workflow_spec_v1.md` |
| 화면·디자인 | `docs/7.web_screen_spec_wireframe_v1.md`, `docs/Design_guide/`의 해당 시안 |
| 로그인·권한·DB·RLS | `docs/2.development_environment_plan.md`, `docs/3.user_access_policy_v1.md`, `docs/5.supabase_security_transition_plan.md`, `docs/8.web_technical_architecture_v1.md` |
| 테스트·배포 | `docs/10.web_test_acceptance_v1.md`, `docs/11.production_release_checklist_v1.md` |
| 디자인 협업 | `docs/12.hybrid_development_working_agreement_v1.md` |

## 재빌드의 고정 규칙

- P0의 실제 화면은 원룸·투룸 중심으로 만든다. DB 공통 구조는 아파트·오피스텔·상가·사무실 확장을 고려한다.
- 일반 가격·상태·입주일 수정은 같은 현재 매물을 수정한다. 새 매물을 자동으로 만들지 않는다.
- 계약 상태가 매물·상담에 영향을 주는 경우, 사용자의 확인 뒤에만 반영한다.
- Local·Dev·Preview에는 가공 데이터만 사용한다. 기존 Streamlit SQLite는 자동 이관하지 않는다.
- DB migration은 파일 작성과 Dev 적용을 구분한다. Dev 초기화·migration 적용·RLS 변경·배포·Git push는 사용자 승인이 필요하다.
- `app`에는 페이지 조립만 둔다. 업무 코드는 `features/<기능>/components`, `server`, `schemas`로 나눈다. 공통 UI는 `components/shared`, 공통 함수는 `lib`에 둔다.
- 기본 목록·오늘 할 일에는 연락처·비밀번호·내부 메모를 표시하지 않는다.

## 작업 종료 전 기록

단계 또는 독립 기능을 끝낸 뒤 아래를 함께 갱신한다.

1. `docs/TODO.md` — 실제 확인까지 끝난 항목만 완료 표시
2. `docs/CURRENT_IMPLEMENTATION_STATUS.md` — 구현 범위, 코드 검사·브라우저 확인, DB 적용 여부, 남은 작업
3. `docs/BUILD_PROGRESS.md` — 다음 안전한 작업과 사용자 승인 필요 사항
4. `README.md` — 사용자에게 보이는 현재 단계나 실행 방법이 바뀐 경우

검사를 실행하지 못했거나 브라우저 확인이 남았으면 완료로 표시하지 않고 이유를 기록한다.

## 수동 실행 문구

```text
Use $realestate-rebuild-context to prepare the next build task in C:\realestate_web.
```
