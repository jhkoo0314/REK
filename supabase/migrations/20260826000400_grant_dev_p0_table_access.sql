-- Dev-only follow-up: allow the publishable Supabase client used by the web
-- server to access P0 tables while RLS is explicitly disabled.
-- Status: written only. Never apply this grant set to Production.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on table
  public.organizations,
  public.organization_members,
  public.buildings,
  public.units,
  public.building_contacts,
  public.unit_access_details,
  public.listings
to anon, authenticated;

grant usage, select on all sequences in schema public to anon, authenticated;

comment on schema public is 'Dev grants allow fabricated-data testing only. Production must use RLS and least-privilege grants.';
