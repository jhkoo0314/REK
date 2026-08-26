create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  task_key text not null,
  completed_at timestamptz not null default now(),
  completed_by_clerk_user_id text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, task_key)
);

create index if not exists task_completions_org_idx on public.task_completions(organization_id, completed_at desc);

alter table public.task_completions disable row level security;
grant select, insert, update, delete on public.task_completions to anon, authenticated;
