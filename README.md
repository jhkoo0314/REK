# 부동산 매물관리 웹서비스

현재 Streamlit 내부 업무 도구를 웹으로 다시 구현하는 프로젝트입니다. 고객 공개 사이트가 아니라, 사무실 직원이 매물·상담·계약·오늘 할 일을 안전하게 처리하는 로그인 기반 도구입니다.

## 현재 단계

P0 매물 관리와 P1 상담·계약·오늘 할 일의 실제 Dev DB 저장 흐름을 구현하고 확인했습니다. 현재는 P1 광고비·광고 문구·Excel 내보내기(6단계)를 진행합니다. Production 연결과 실제 업무 데이터 입력은 아직 하지 않습니다. 실제 구현 상태는 `docs/CURRENT_IMPLEMENTATION_STATUS.md`에서 확인합니다.

## 개발 실행

1. `.env.local`에 이미 준비된 Clerk Development 설정을 유지합니다. 값은 Git·화면·로그에 표시하지 않습니다.
2. `npm run dev`를 실행한 뒤 브라우저에서 `http://localhost:3000`을 엽니다.
3. 로그인하면 중요업무알림(`/dashboard`)으로 이동합니다.

## 문서 사용 순서

1. `docs/REBUILD_MASTER_SPEC.md` — 전체 범위·업무 규칙·보안·확정 폴더 구조
2. `docs/TODO.md` — 지금 진행할 작업과 완료 체크
3. `docs/CURRENT_IMPLEMENTATION_STATUS.md` — 실제로 끝난 작업과 확인 결과
4. `docs/BUILD_PROGRESS.md` — 재빌드 판단과 다음 안전한 작업

## 중요한 원칙

- 기존 Streamlit SQLite 자료는 자동 이관하지 않는다.
- Dev·Preview에는 가공 데이터만 사용한다.
- DB migration은 파일 작성 뒤 별도 승인으로만 Dev에 적용한다.
- `.env.local`은 Git에 올리거나 화면·로그에 표시하지 않는다.
- 코드와 화면은 기능별 폴더·파일로 나누며, 한 파일에 화면·검증·DB 처리를 몰아넣지 않는다.

## 작업 종료 기록 규칙

각 단계 또는 기능이 끝나면 다음 문서를 함께 갱신합니다.

- `TODO.md`: 실제 완료한 체크 항목
- `CURRENT_IMPLEMENTATION_STATUS.md`: 구현 범위, 검사 결과, 브라우저 확인, DB 적용 여부, 남은 작업
- `BUILD_PROGRESS.md`: 다음 작업과 승인 필요 사항
- `README.md`: 사용자에게 보여 줄 현재 단계와 실행 방식이 바뀐 경우
