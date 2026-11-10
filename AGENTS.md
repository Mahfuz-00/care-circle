# CareCircle — Project Instructions

CareCircle is a medication & care-coordination SaaS for seniors, self-users, caregivers and a
platform operator. `PRD.md` at the repo root is the **authoritative** spec — read the relevant
section before changing behavior, and treat it as the contract.

## Layout

| Path | Surface | Stack |
|---|---|---|
| `backend/` | Laravel API for both client surfaces + landlord console | Laravel, PHP 8.4+, Sanctum, PostgreSQL 16 with RLS |
| `frontend/` | Web dashboard (caregivers, self-users, platform admin) | React 19, Vite, TypeScript, Tailwind, TanStack Router/Query, Zustand |
| `mobile-app/` | iOS + Android app (senior-first) | Flutter 3, Clean Architecture, BLoC, GoRouter, get_it, dio |

## The rules that are never negotiable

1. **Two surfaces, one app.** `/api/v1` requires the `dashboard` ability; `/mobile/v1` requires
   `mobile`. A token minted on one surface is rejected by the other. `/api/v1/platform/*`
   additionally requires `platform.admin`. The landlord console does not exist on mobile.
2. **Tenant isolation is a database property.** Every care-circle table has `ENABLE` + `FORCE
   ROW LEVEL SECURITY`, policies keyed on session GUCs, and returns **zero rows** when context is
   unset. Fail closed, never fail open.
3. **Least privilege at runtime.** The app connects as a restricted role; migrations run as owner.
4. **Every privileged action is audited** in an append-only ledger (actor, care_circle_id, IP,
   level, payload).
5. **Roles are declared once** in `config/roles.php`; API enforcement and the dashboard matrix
   both derive from it.
6. **Escalation is server-enforced and non-aggressive.** Every gate in PRD §7 must pass. Skipped
   actions are recorded **with the reason**.
7. **Nothing is reported that was not measured.** Health checks that cannot run report `fail`;
   backups with no dump tool report `skipped`.
8. **Accessibility first** on mobile: large text, high contrast, screen-reader support, voice-first.
9. **No medical advice.** CareCircle reminds and coordinates; it never diagnoses or prescribes.

## Working conventions

- Backend: strict types, enums over magic strings, FormRequests for validation, API Resources for
  output, Policies for authorization. Migrations are reversible; never edit a shipped migration.
- Frontend: server state in TanStack Query, UI state in Zustand, permissions derived from one
  source. Always-visible focus states and semantic landmarks.
- Mobile: `features/<feature>/{data,domain,presentation}`; the domain layer imports no Flutter/dio.
  Minimum 48dp targets, respect OS text scale, never truncate medication names.
- Design: `docs/DESIGN-PRINCIPLES.md` is the working doctrine — one design system across three
  workspaces, status in words rather than colour, tabular figures for numeric values, every data
  region handling all five states, and nothing reported that was not measured.
- Verify before claiming done: `php artisan test` + Pint (backend), `npm run build` + lint
  (frontend), `flutter analyze` + `flutter test` (mobile). Report failures honestly.

## Delegation

Project subagents live in `.commandcode/agents/`: `backend-api`, `frontend-dashboard`,
`mobile-flutter`, `prd-compliance` (read-only spec reviewer), `security-rls` (read-only isolation
auditor). Prefer delegating surface-specific work to them.
