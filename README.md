# CareCircle

Medication & care-coordination SaaS for seniors, self-users, caregivers, and a platform
operator. Reliable reminders that only speak when they should, stock that never runs out
silently, and a medical emergency button that actually reaches the care circle.

`PRD.md` at the repo root is the **authoritative specification** for everything in this repo.

## Repository layout

| Path | Surface | Stack |
|---|---|---|
| [`backend/`](./backend) | One Laravel app serving both client surfaces + the landlord console | Laravel 12, PHP 8.4, Sanctum, PostgreSQL 16 with Row-Level Security |
| [`frontend/`](./frontend) | Web dashboard — caregivers, self-users, platform admin | React 19, Vite, TypeScript, Tailwind, TanStack Router/Query, Zustand |
| [`mobile-app/`](./mobile-app) | iOS + Android app, senior-first | Flutter 3, Clean Architecture, BLoC, GoRouter, get_it, dio |

## The three surfaces

| Surface | Prefix | Sanctum ability |
|---|---|---|
| Web dashboard | `/api/v1` | `dashboard` |
| Mobile app | `/mobile/v1` | `mobile` |
| Landlord console | `/api/v1/platform/*` | `dashboard` **and** `platform.admin` |

A token minted on one client surface is rejected by the other. The landlord console is
deliberately absent from mobile.

## Getting started

PostgreSQL 16 is required — tenant isolation is built on Row-Level Security, which is a Postgres
feature. Node 22.12+ and Flutter 3.10+ are needed for the other two surfaces.

```bash
# 1. Backend — create the two database roles, then migrate as the owner
cd backend
composer install
cp .env.example .env && php artisan key:generate
psql -U postgres -h 127.0.0.1 -f database/sql/000_setup_roles.sql
php artisan migrate --database=pgsql_migrations
php artisan db:seed --database=pgsql_migrations
php artisan serve

# 2. Frontend
cd frontend
npm install
npm run dev

# 3. Mobile
cd mobile-app
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8000
```

Seeded accounts (password `password`): `margaret@carecircle.test` (senior),
`sarah@carecircle.test` (primary caregiver), `tom@carecircle.test` (caregiver),
`operator@carecircle.test` (platform operator).

Migrations and seeders run on the **owner** connection on purpose — the runtime role is
deliberately unable to change schema. See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Documentation

| Document | Contents |
|---|---|
| [`PRD.md`](./PRD.md) | the authoritative specification |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | surfaces, isolation model, escalation, and why the ordering constraints exist |
| [`docs/API.md`](./docs/API.md) | endpoint reference for all three surfaces |
| [`AGENTS.md`](./AGENTS.md) | working conventions for this repo |

## Verification

| Surface | Command | Result |
|---|---|---|
| Backend | `php artisan test` | 62 passed |
| Backend | `vendor/bin/pint` | clean |
| Frontend | `npm run build` | clean (includes `tsc --noEmit`) |
| Frontend | `npm run lint` | clean |
| Mobile | `flutter analyze` | no issues |
| Mobile | `flutter test` | 77 passed |

## Non-negotiables

1. Two surfaces, one app — surface isolation is enforced by Sanctum abilities.
2. Tenant isolation is a database property — RLS, fail closed, zero rows when context is unset.
3. Least privilege at runtime — restricted role for the app, owner for migrations.
4. Every privileged action is audited in an append-only ledger.
5. Roles are declared once in `config/roles.php`.
6. Escalation is server-enforced and non-aggressive — every gate in PRD §7 must pass, skips are
   recorded with the reason.
7. Nothing is reported that was not measured.
8. Accessibility first on mobile.
9. No medical advice — we remind and coordinate, never diagnose or prescribe.

## Project subagents

`.commandcode/agents/` defines the project subagents: `backend-api`, `frontend-dashboard`,
`mobile-flutter`, `prd-compliance` (read-only spec reviewer), and `security-rls` (read-only
isolation auditor).
