# Supabase Dev DB 초기화·P0 적용 수동 절차

> 대상: **Supabase Dev 프로젝트의 `public` 스키마만**
>
> 제외: Supabase Production, Clerk Development/Production, Vercel, 기존 Streamlit SQLite
>
> 주의: 아래 초기화 SQL은 Dev `public` 안의 테이블·함수·타입·데이터를 모두 지운다. Dev가 맞는지 먼저 확인한 뒤에만 실행한다.

## 왜 초기화가 필요한가

테이블을 지웠더라도 함수(`set_updated_at`)나 타입 같은 DB 구성은 남아 있을 수 있다. 새 재빌드를 정말 처음부터 시작하려면 Dev의 `public` 영역을 비우고 P0 migration을 한 번만 적용한다.

## 1. 적용 대상 확인

1. Supabase Dashboard에서 **Dev 프로젝트**를 연다. Production 프로젝트가 아닌지 프로젝트 이름을 확인한다.
2. SQL Editor를 연다.
3. 아래 조회문을 실행한다. 결과는 확인만 하고 비밀 키·주소는 복사하지 않는다.

```sql
select
  current_database() as database_name,
  current_user as database_user,
  current_setting('app.settings.project_ref', true) as project_ref;
```

`project_ref`가 비어 있어도 오류는 아니다. 이 경우 Dashboard의 프로젝트 이름으로 Dev 여부를 다시 확인한다.

## 2. Dev `public` 스키마 초기화

Dev가 맞음을 확인한 경우에만 아래 SQL을 실행한다.

```sql
drop schema if exists public cascade;
create schema public;

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;

alter default privileges in schema public
  grant all on tables to postgres, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;

alter default privileges in schema public
  grant usage, select on sequences to postgres, service_role, anon, authenticated;
```

이 SQL은 `public`만 초기화한다. `auth` 등 Supabase 내부 영역, Clerk, Production, Streamlit SQLite에는 영향을 주지 않는다.

## 3. P0 migration 적용

1. [P0 migration 파일](../supabase/migrations/20260826000100_create_p0_core_schema.sql)을 연다.
2. 파일 전체를 SQL Editor에 붙여 넣고 한 번 실행한다.
3. 이 파일은 Dev RLS 비활성화와 다음 테이블 생성을 포함한다.

   - `organizations`, `organization_members`
   - `buildings`, `units`, `listings`
   - `building_contacts`, `unit_access_details`

## 4. 적용 결과 확인

아래 SQL을 실행해 테이블과 RLS 상태를 확인한다.

```sql
select
  tablename,
  rowsecurity as rls_enabled
from pg_tables
where schemaname = 'public'
order by tablename;
```

기대 결과는 위 7개 테이블이 보이고, 모두 `false`다.

## 5. 아직 하지 않는 일

- 가공 seed 입력
- 실제 연락처·실제 출입 비밀번호 입력
- Production DB 변경
- RLS 정책 적용

초기화와 migration이 성공한 결과를 확인한 뒤에만, 다음 단계에서 가공 seed를 별도로 넣는다.
