---
name: realestate-build
description: Prepare and begin an approved build task in the realestate_web project. Use when manually invoked before implementing a UI, database, authentication, workflow, test, or deployment task so Codex reads the current project context, follows the real-estate business and security rules, implements only the approved scope, verifies it, and updates build progress.
---

# Realestate Build

Use this project-local skill only for `C:\realestate_web`.

## Start every build

1. Read `AGENTS.md` completely.
2. Read `docs/BUILD_PROGRESS.md` and `docs/TODO.md` to find the current stage, completed work, pending approval, and next task.
3. Check the working tree before editing. Preserve unrelated user changes.
4. Identify the request's stage: foundation, P0 listings, P1 dashboard/consultations/contracts/advertisements, testing, or Production transition.
5. State in one short Korean update what will be built and what will deliberately not be changed.

## Read relevant context before implementation

| Build type | Required documents |
|---|---|
| Any business feature | `docs/1.web_service_prd_v1.md`, `docs/6.web_workflow_spec_v1.md`, `docs/9.web_implementation_plan_v1.md` |
| UI or UX | `docs/7.web_screen_spec_wireframe_v1.md`, `docs/DESIGN_BUILD_PREP.md`, matching file in `docs/Design_guide/` |
| Database or server data | `docs/4.supabase_data_model_v1.md`, `docs/5.supabase_security_transition_plan.md`, `docs/3.user_access_policy_v1.md`, `docs/8.web_technical_architecture_v1.md` |
| Tests or release | `docs/10.web_test_acceptance_v1.md`, `docs/11.production_release_checklist_v1.md` |

Use `rg` to find the task's exact section in long documents, then read that section and its surrounding rules. The latest user instruction overrides a document only when it does not expose secrets, real data, or weaken Production safety.

## Non-negotiable project rules

- Keep `building → unit → listing` as the core relationship.
- Normal price, status, and availability changes update the current listing; never create a new listing automatically.
- Never change listing status automatically after a contract or after preparing advertising copy. Ask for confirmation in the actual feature flow.
- Use only fabricated data in Local, Dev, and Preview. Never migrate legacy SQLite data.
- Never expose secret keys or read/print environment-file values.
- Keep `organization_id` in all business data design. Do not trust an organization ID sent by the browser.
- Do not apply DB migrations, change RLS, deploy, push Git, or use Production data unless the user explicitly authorizes that action.
- For Production, use Clerk authentication, server authorization, and Supabase RLS together. Do not bypass normal CRUD with a secret/service-role key.

## UI implementation rules

- Match the approved design guide's Inter typography, Roboto Mono numeric style, color tokens, wording, and information hierarchy.
- Keep `app/**/page.tsx` as a composition file. Put page-only sections in `features/<feature>/components/`.
- Reuse common UI from `components/shared/`; do not copy status badges, headers, table frames, or sensitive-info behavior between pages.
- Keep contact details, account details, door codes, and internal notes out of default lists. Make sensitive detail information collapsed by default.
- Include loading, empty, error, saving, access-denied, and confirmation states when implementing a real workflow.
- Do not add AI automation, photos, Excel export, mass editing, or other P3 work before P0 is complete and approved.

## Database build rules

- Write every schema or policy change as an ordered file in `supabase/migrations/`.
- State clearly whether a migration is **written only** or **applied to Dev**. Writing a file is not approval to run it.
- For P0, create organizations/members first, then buildings/units/listings, constraints, and indexes. Add consultations, contracts, advertisements, and task completions only in their scheduled feature stage.
- Generate or update TypeScript DB types only after a migration has actually been applied to the intended Dev database.

## Finish every build

1. Verify within authorized scope: lint, type check, build, and relevant tests where possible.
2. If a local tool/environment issue blocks validation, report the precise limitation without pretending the build passed.
3. Update `docs/TODO.md` only for genuinely completed work. Do not mark static UI as a finished database workflow.
4. Update `docs/BUILD_PROGRESS.md` with completed work, verification result, migration written/applied status, next work, and approval required.
5. Give a short Korean handoff: result first, then the next safe task.

## Manual invocation

```text
Use $realestate-build to prepare the next approved build task.
```
