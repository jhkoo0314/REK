-- Dev only: links the one real Clerk Development admin to the seeded organization A.
-- In Clerk Dashboard > Users, copy the User ID that begins with user_ and replace the value below.
-- Do not use the email address, an API key, or a Supabase token.

do $$
declare
  -- Change only the empty quotes below to the Clerk User ID, for example: 'user_abc123'.
  dev_admin_clerk_user_id text := 'user_3HuW2kBFIHDdqfCqwjjbt29L7qf';
begin
  if dev_admin_clerk_user_id = 'user_3HuW2kBFIHDdqfCqwjjbt29L7qf' or dev_admin_clerk_user_id !~ '^user_' then
    raise exception 'Enter the Clerk Development User ID beginning with user_ between the empty quotes.';
  end if;

  update public.organization_members
  set clerk_user_id = 'user_3HuW2kBFIHDdqfCqwjjbt29L7qf',
      display_name = '가공 A 관리자',
      role = 'admin',
      status = 'active'
  where id = '10000000-0000-4000-8000-000000000010';

  if not found then
    raise exception 'The seeded organization A admin membership was not found. Run 0001_dev_listing_fixture.sql first.';
  end if;
end;
$$;
