# CareCircle — Backend

One Laravel application serving **two client surfaces** and the landlord console.
`../PRD.md` is the authoritative specification.

| Surface | Prefix | Sanctum ability |
|---|---|---|
| Web dashboard | `/api/v1` | `dashboard` |
| Mobile app | `/mobile/v1` | `mobile` |
| Landlord console | `/api/v1/platform/*` | `dashboard` **and** `platform.admin` |

A token minted on one client surface is rejected by the other. The landlord console does not
exist on the mobile surface.

## Getting started

PostgreSQL 16 is required — Row-Level Security is a Postgres feature and the isolation
guarantee is built on it.

```bash
composer install
cp .env.example .env
php artisan key:generate

# Create the two roles and the two databases (as a superuser)
psql -U postgres -h 127.0.0.1 -f database/sql/000_setup_roles.sql

# Migrations and seeders run as the OWNER, never as the runtime role:
php artisan migrate --database=pgsql_migrations
php artisan db:seed --database=pgsql_migrations

php artisan serve
```

Demo accounts after seeding (password `password`):

| Email | Role |
|---|---|
| `margaret@carecircle.test` | Senior |
| `sarah@carecircle.test` | Primary Caregiver |
| `tom@carecircle.test` | Caregiver |
| `operator@carecircle.test` | Platform operator |

## Two database roles

PRD §9: *"The app connects as a restricted role; migrations run as owner."*

| Role | Used by | Privileges |
|---|---|---|
| `care_circle_app` | every request (the default connection) | DML only, **no** `BYPASSRLS`, no DDL |
| `care_circle_owner` | migrations and seeders only | owns the schema, `BYPASSRLS` |

Because the runtime role is subject to every policy, the connection that serves traffic cannot
read another care circle's rows even if the application code is wrong.

## Tenant isolation

Every care-circle table has `ENABLE` + `FORCE ROW LEVEL SECURITY`, with policies keyed on the
session GUCs `app.current_care_circle_id` and `app.current_user_id`:

- `ResolveCareCircleContext` writes **both** values on every request — including when they are
  empty — so a request can never inherit a recycled connection's context.
- With no context set, `nullif(current_setting(...), '')` yields `NULL`, every comparison is
  false, and the table returns **zero rows**. Fail closed.
- The audit ledger and channel log are append-only: they grant `SELECT` and `INSERT` policies and
  nothing else, so history cannot be rewritten — not even by the application.

> A circle is readable by its owner as well as its members. That clause is load-bearing:
> Eloquent's `create()` issues `INSERT ... RETURNING`, and `RETURNING` re-reads the new row
> through the policy's `USING` expression — so a circle created before its first member row
> exists must be visible to the account creating it.

## Escalation

`App\Services\Escalation\EscalationPolicy` implements every gate from PRD §7 — time, priority,
consent, verified number, quiet hours, attempt limit, cooldown, daily call budget, and a state
re-check. A call is placed only when all of them pass; every skip is written to
`escalation_attempts` **with the reason**, because a skipped call is information.

Push, SMS and voice sit behind `App\Services\Channels\Contracts\Channel`. The default
implementations log instead of contacting a provider, so the whole pipeline is exercisable —
and testable — without an FCM/APNs/Twilio account.

## Platform console

`/api/v1/platform/*` reports only what it measured. Health checks that cannot run report
`fail`; backups with no dump tool report `skipped`. Operational reads that are inherently
cross-tenant (metrics, failed jobs, backup readiness) deliberately use the owner connection —
which is why `App\Http\Controllers\Platform\Concerns\ReadsAcrossTenants` exists and every such
read is audited.

## Scheduled work

```bash
php artisan schedule:work     # or a cron entry in production
```

| Command | Cadence | Purpose |
|---|---|---|
| `carecircle:generate-doses` | daily 00:05 | turn each medication's schedule into dose instances |
| `carecircle:escalate` | every 5 min | run one escalation pass for overdue priority doses |
| `carecircle:health` | every 5 min | measure and record system health |

## Verification

```bash
php artisan test          # 58 tests
vendor/bin/pint           # code style
```

The suite runs against PostgreSQL, because isolation is the point. `TenantIsolationTest`
asserts the guarantees against two **separate connections**: the owner for setup, and the
restricted runtime role for the assertions — including a full registration → add medication →
list round trip on the same connection production uses.
