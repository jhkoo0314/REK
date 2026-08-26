# P0 데이터 항목 확정 명세

> 상태: 초기 P0 migration·매물번호 추가 migration(`20260826000200`) 및 신규 매물 등록 흐름은 Dev 브라우저에서 정상 확인 완료 / 추가 방 구조값 migration(`20260826000500`)은 수동 적용 대기
>
> 기준 문서: `REBUILD_MASTER_SPEC.md`, `4.supabase_data_model_v1.md`, `6.web_workflow_spec_v1.md`

## 1. 공통 저장 규칙

- 기본키는 UUID다. 모든 P0 업무 테이블에는 `organization_id`, `created_at`, `updated_at`을 둔다.
- 생성·수정한 Clerk 사용자 ID는 `created_by_clerk_user_id`, `updated_by_clerk_user_id`로 기록한다. 이 값은 브라우저 입력값을 믿지 않고 서버에서 로그인 정보로 넣는다.
- 금액은 원 단위가 아닌 **만원 단위 정수**다. 예: 보증금 500만 원은 `500`으로 저장한다.
- 업무 날짜는 시간 없는 `date`다. 시각이 필요한 상담·계약 이력은 P1에서 별도로 정한다.
- 연락처와 출입 비밀번호는 P0에서 별도 제한 테이블에 저장한다. 일반 목록·검색 결과·일반 화면 목업·내보내기에는 넣지 않는다. Dev seed에는 저장·재조회 검증용으로 명백히 가공한 값 한 세트만 포함할 수 있다.
- 계좌와 일반 내부 메모는 이번 P0 범위에 넣지 않는다.
- Dev DB에서는 RLS를 명시적으로 비활성화한다. 따라서 가공 연락처·가공 출입 비밀번호도 DB에 저장하고 상세 화면에서 다시 조회할 수 있다. 실제 정보는 Dev에 넣지 않는다.

## 2. 조직과 멤버

### `organizations`

| 항목 | 형식 | 필수 | 기준 |
| --- | --- | --- | --- |
| `id` | UUID | 예 | 내부 조직 식별자 |
| `clerk_organization_id` | text | 예 | Clerk Organization ID, 전체에서 한 번만 허용 |
| `name` | text | 예 | 공백을 제거한 사무실 표시명 |
| `created_at`, `updated_at` | timestamptz | 예 | DB가 기록 |

### `organization_members`

| 항목 | 형식 | 필수 | 기준 |
| --- | --- | --- | --- |
| `id` | UUID | 예 | 멤버 기록 식별자 |
| `organization_id` | UUID | 예 | `organizations.id` 참조 |
| `clerk_user_id` | text | 예 | Clerk 사용자 ID |
| `role` | enum | 예 | `admin` 또는 `staff` |
| `status` | enum | 예 | `active` 또는 `inactive` |
| `created_at`, `updated_at` | timestamptz | 예 | DB가 기록 |

- 같은 조직에 같은 Clerk 사용자는 한 번만 등록한다.
- `admin`은 멤버 관리·비활성화를 포함한 전체 업무를, `staff`는 일반 업무를 처리한다.
- `inactive` 또는 멤버 기록이 없는 사용자는 어떤 업무 데이터도 읽거나 바꿀 수 없다.

## 3. 건물

### `buildings`

| 항목 | 형식 | 필수 | 기준 |
| --- | --- | --- | --- |
| `id`, `organization_id` | UUID | 예 | 조직 안의 건물 |
| `name` | text | 예 | 건물명, 앞뒤 공백 제거 |
| `normalized_name` | text | 예 | 공백·대소문자 차이를 제거한 중복 확인용 값 |
| `normalized_address` | text | 예 | 대표 주소의 공백·대소문자 차이를 제거한 중복 확인용 값 |
| `road_address` | text | 조건부 | 도로명 주소 또는 지번 주소 중 하나는 필수 |
| `lot_address` | text | 조건부 | 도로명 주소가 없을 때 필수 |
| `address_detail` | text | 아니오 | 동·층 같은 일반 주소 보완 정보. 연락처·비밀번호는 별도 제한 테이블에 저장 |
| `postal_code` | text | 아니오 | 주소 검색이 제공할 때만 저장 |
| 감사 항목 | text/timestamptz | 예 | 공통 저장 규칙 적용 |

- 같은 조직에서 `normalized_name`과 정규화한 대표 주소가 같은 건물은 중복 등록할 수 없다.
- 건물 공통 정보는 건물 화면에서만 수정한다. 호실·매물마다 복사해 저장하지 않는다.

## 4. 호실

### `units`

| 항목 | 형식 | 필수 | 기준 |
| --- | --- | --- | --- |
| `id`, `organization_id`, `building_id` | UUID | 예 | 같은 조직의 건물만 연결 |
| `unit_number` | text | 예 | 화면 표시용 예: `302호` |
| `normalized_unit_number` | text | 예 | 중복 확인용 숫자·영문 정규화 값. `302`와 `302호`는 같은 값 |
| `floor` | integer | 아니오 | 지상/지하를 포함할 수 있는 정수 |
| `layout_type` | text | 아니오 | 기존 DB 확장 예약 열. 현재 P0 등록 화면에서는 입력하지 않으며, 방 구조는 매물의 `property_type`으로 선택 |
| `direction` | text | 아니오 | 동·서·남·북, 남동 등 선택값 |
| `options` | text array | 아니오 | 주차·엘리베이터 등 정해진 일반 옵션만 저장 |
| 감사 항목 | text/timestamptz | 예 | 공통 저장 규칙 적용 |

- 같은 조직·같은 건물 안에서는 `normalized_unit_number`이 한 번만 존재한다.
- 호실의 층·방향·옵션은 고정 정보로 본다. `302호`처럼 일반적인 숫자 호실을 입력하면 층은 자동 제안하되 사용자가 직접 바꿀 수 있다. 현재 방 구조·가격·공실 여부는 매물에 둔다.
- 방문 관련 출입 비밀번호는 `unit_access_details`에만 저장한다. 호실 기본 정보에 복사하지 않는다.

## 5. 건물 연락처와 호실 출입 정보 (제한 정보)

이 정보는 실제 업무에 필요하지만, 노출 범위가 넓은 매물 데이터와 분리한다. 매물 등록에서는 임대인 연락처를 1번 건물 선택, 세입자 연락처와 세대 비밀번호를 2번 호실 선택에 둔다. 수정 화면에서는 제한 정보 영역에서만 저장·수정한다.

### `building_contacts`

| 항목 | 형식 | 필수 | 기준 |
| --- | --- | --- | --- |
| `id`, `organization_id`, `building_id` | UUID | 예 | 같은 조직의 건물에만 연결 |
| `contact_name` | text | 예 | 연락 대상 표시 이름 |
| `phone_number` | text | 예 | 원문 번호 저장. 목록에는 표시하지 않음 |
| `contact_role` | enum | 예 | `owner`, `manager`, `caretaker`, `tenant`, `other` |
| `is_primary` | boolean | 예 | 건물당 대표 연락처는 한 명만 허용 |
| `contact_note` | text | 아니오 | 연락 관련 짧은 업무 메모. 일반 목록·내보내기 제외 |

임대인 연락처는 건물 공통 연락처로 저장한다. 같은 건물의 여러 호실이 임대인을 공유할 수 있기 때문이다.

### `unit_contacts`

세입자 연락처는 호실마다 다르므로 `unit_contacts`에 저장한다. `20260826000700_add_restricted_unit_contacts.sql`을 Dev에 수동 적용한 뒤 사용한다.

| 항목 | 형식 | 필수 | 기준 |
| --- | --- | --- | --- |
| `unit_id` | UUID | 예 | 같은 조직의 호실만 연결 |
| `contact_name` | text | 예 | 현재 화면에서는 `세입자`로 저장 |
| `phone_number` | text | 예 | 원문 번호 저장. 일반 목록·상세에는 표시하지 않음 |
| `contact_role` | enum | 예 | 현재 P0 입력은 `tenant`만 사용 |
| 감사 항목 | text/timestamptz | 예 | 공통 저장 규칙 적용 |

### `unit_access_details`

| 항목 | 형식 | 필수 | 기준 |
| --- | --- | --- | --- |
| `id`, `organization_id`, `unit_id` | UUID | 예 | 같은 조직의 호실에만 연결 |
| `access_password` | text | 아니오 | 공동현관·도어록 등 출입 비밀번호. 호실당 한 개의 현재 기록 |
| `access_note` | text | 아니오 | 비밀번호 외 출입 방법·주의 사항. 일반 목록·내보내기 제외 |
| 감사 항목 | text/timestamptz | 예 | 공통 저장 규칙 적용 |

- 제한 정보는 매물 목록, 빠른 검색, 오늘 예정 업무, 광고 문구, 기본 내보내기에서 절대 조회·표시하지 않는다. 단, Dev seed에는 상세 저장·재조회 검증을 위한 명백한 가공 값만 포함할 수 있다.
- Dev에서는 가공 데이터를 매물 목록 행의 `비밀번호 보기` 확인창과 매물 수정 화면에서만 조회·수정한다. 임대인·세입자 연락처는 등록·수정 화면에서만 확인·변경한다. Production에서는 조직 분리 RLS와 역할 검증을 통과한 사용자에게만 제공한다.
- 출입 비밀번호를 암호화하지 않은 채 이메일·메신저·광고 문구·파일로 복사하지 않는다. Production 적용 전 암호화 방식과 열람 기록 필요 여부를 별도 확정한다.

## 6. 매물

### `listings`

| 항목 | 형식 | 필수 | 기준 |
| --- | --- | --- | --- |
| `id`, `organization_id`, `unit_id` | UUID | 예 | 같은 조직의 호실만 연결 |
| `listing_reference_number` | integer | 예 | 조직 안에서 한 번만 쓰는 표시용 번호. 화면에서는 `M-000001`처럼 표시 |
| `property_type` | enum | 예 | 등록 화면의 방 구조. `one_room`, `two_room`, `two_bay`, `three_room`, `owner_unit`, `apartment`, `officetel`, `retail`, `office` |
| `listing_status` | enum | 예 | 아래 상태값 사용 |
| `is_current` | boolean | 예 | 현재 관리 매물인지 표시. 호실당 `true` 한 건만 허용 |
| `transaction_type` | enum | 예 | `monthly_rent`, `jeonse`, `to_be_confirmed` |
| `deposit_amount` | integer | 아니오 | 보증금, 만원 단위, 0 이상 |
| `monthly_rent_amount` | integer | 아니오 | 월세, 만원 단위, 0 이상 |
| `maintenance_fee_amount` | integer | 아니오 | 관리비, 만원 단위, 0 이상 |
| `availability_type` | enum | 예 | `immediate`, `date_specified`, `needs_confirmation` |
| `available_date` | date | 조건부 | `date_specified`일 때만 필수. 즉시 가능·확인 필요에는 비움 |
| `move_out_date` | date | 아니오 | 퇴실 예정일. 오늘 예정 업무 계산에 사용 |
| `exclusive_area_m2` | numeric | 아니오 | 아파트 등 후속 상품 확장을 위한 예약 항목. 원룸·투룸 P0 등록·수정·상세 화면에서는 입력·표시하지 않음 |
| `photo_status` | enum | 예 | `not_available`, `available`, `needs_confirmation` |
| `last_confirmed_date` | date | 아니오 | 재확인 기준일 |
| `field_status` | enum | 예 | 기존 DB 호환용 기본값. 현재 P0 등록·수정 화면에서는 입력하지 않음 |
| `holding_source` | text | 아니오 | 민감 정보 없이 보유 경로를 짧게 기록 |
| 감사 항목 | text/timestamptz | 예 | 공통 저장 규칙 적용 |

### 상태값과 검증

| 항목 | 허용값·규칙 |
| --- | --- |
| `listing_status` | `vacant`, `contract_in_progress`, `contract_complete`, `on_hold`, `ended` |
| P0 입력 방 구조 | `one_room`, `two_room`, `two_bay`, `three_room`, `owner_unit` 선택 가능. 아파트·오피스텔·상가·사무실은 DB 확장 예약값이며 현재 화면에는 표시하지 않음 |
| 월세 | `monthly_rent`일 때 입력 가능. 전세일 때는 비움 또는 0 |
| 전세 | `jeonse`일 때 보증금 입력. 월세는 비움 또는 0 |
| 입주 가능 조건 | `immediate`는 즉시 가능, `date_specified`는 입주 가능일 필수, `needs_confirmation`은 날짜 없음 |
| 현재 매물 | 같은 호실에 `is_current = true`인 매물은 한 건만 허용 |
| 일반 수정 | 가격·상태·입주 가능일·재확인일 변경은 같은 현재 매물 행을 수정. 새 매물을 자동 생성하지 않음 |
| 이력 | 종료 뒤 새 현재 매물이 필요할 때만 사용자가 명시적으로 과거 매물을 종료하고 새 매물을 만든다 |

## 7. 공통 항목과 종류별 항목의 경계

- 지금 저장하는 공통 항목: 주소·호실·층·주거형 구조·방향·면적·가격·관리비·거래 방식·입주 가능일·퇴실 예정일·확인 상태.
- 지금 만들지 않는 항목: 아파트 단지·동·공급면적, 오피스텔 전용 항목, 상가 권리금·부가세·용도, 사무실 전용 항목.
- 이 전용 항목은 실제 종류를 운영하기로 결정한 뒤 별도 문서, migration, 화면, 테스트를 승인한 다음에만 추가한다.

## 8. 1-2 migration 작성 전 확인 목록

- 이 문서의 enum 이름·열 이름·필수 여부를 migration에 그대로 반영한다.
- 부분 고유 규칙: `units`의 건물별 정규화 호실, `listings`의 호실별 현재 매물 한 건을 DB 제약으로 작성한다.
- 모든 외래 키는 같은 조직 연결을 서버와 DB 정책에서 다시 검증한다.
- migration 작성과 Dev 적용은 별도 완료로 기록한다. 이 문서 작성만으로 DB는 변경되지 않는다.
- 초기 P0 schema 적용 뒤 매물 목록을 구현하려면 `20260826000200_add_listing_reference_number.sql`도 Dev에 별도로 적용한다.
- 신규 건물·호실·현재 매물을 일부만 남기지 않고 함께 저장하는 `20260826000300_add_p0_listing_creation_function.sql` 기반 등록 흐름은 브라우저에서 정상 동작을 확인했다.
