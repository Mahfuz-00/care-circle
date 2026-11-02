# CareCircle — Architecture

`../PRD.md` is the authoritative specification. This document explains how the three surfaces
fit together and where the load-bearing decisions live.

## One application, three surfaces

```
                    ┌──────────────────────────────┐
                    │   Laravel application (1)     │
                    │                              │
  React dashboard ──┤  /api/v1          dashboard  │
  (caregivers,      │  /mobile/v1       mobile     │
   self-users,      │  /api/v1/platform dashboard  │
   operators)       │                   + platform.admin
                    └──────────────────────────────┘
  Flutter app ──────────┘        ▲
  (seniors)                      │
                    operator console (dashboard only — absent on mobile)
```

Surface isolation is enforced by **Sanctum token abilities**, not by convention. A token is
minted with exactly one surface ability, and the two route groups each demand their own:

| Prefix | Ability required | Rejects |
|---|---|---|
| `/api/v1` | `dashboard` | mobile tokens |
| `/mobile/v1` | `mobile` | dashboard tokens |
| `/api/v1/platform/*` | `dashboard` **and** `platform.admin` | everyone else |

The `platform.admin` ability is only minted for accounts whose user flag is set, and the console
additionally re-checks that flag on every request — so revoking the flag takes effect immediately
rather than waiting for the token to expire.

## Tenant isolation is a database property

Every care-circle-owned table carries `ENABLE` + `FORCE ROW LEVEL SECURITY`, with policies keyed
on two session GUCs:

| GUC | Meaning |
|---|---|
| `app.current_user_id` | who is acting |
| `app.current_care_circle_id` | which circle they are acting in |

`ResolveCareCircleContext` writes **both** on every authenticated request — including when they
are empty. That is deliberate: a request must never inherit the previous request's context from a
recycled connection. Because an unset GUC resolves to `NULL` inside the policy, every comparison
becomes false and the table returns **zero rows**. Fail closed.

The app never queries as the table owner. Two roles exist:

| Role | Used by | Privileges |
|---|---|---|
| `care_circle_app` | every request | DML on granted tables, **no** `BYPASSRLS`, no DDL |
| `care_circle_owner` | migrations and seeders only | owns the schema, `BYPASSRLS` |

### Three ordering constraints that are easy to get wrong

These were all found by running the real stack rather than the test harness:

1. **Bindings must be resolved after the context is set.** Route-model binding queries the
   database, and those tables are behind RLS, so `bootstrap/app.php` reorders middleware to
   `authenticate → resolve care-circle context → bind models`. Otherwise every
   `/medications/{id}` request 404s in production while passing in tests.
2. **`INSERT … RETURNING` re-reads through the SELECT policy.** Eloquent's `create()` always
   appends `RETURNING id`. A brand-new care circle has no member row yet, so it must be readable
   by its owner, and the append-only ledger — which deliberately has no permissive SELECT — is
   written with a plain `insert()` instead.
3. **The acting user must be in context even on circle-less routes.** `/auth/me` answers "which
   circles am I in?", which is a question asked before any circle is selected.

## Roles are declared once

`config/roles.php` is the single source of truth for the PRD §6 matrix. The API enforces it via
`CareCircleMember::hasPermission()`, and `GET /api/v1/meta/roles` exposes the same config to the
dashboard so the matrix it renders cannot drift from the matrix it is subject to.

## Escalation

`EscalationPolicy` is a pure function of an `EscalationContext`, which makes every gate from PRD
§7 individually testable. Gates are evaluated in order and the first failure wins, so the
recorded reason is the most specific one that applied:

time → priority → consent → verified number → quiet hours → attempt limit → cooldown →
daily call budget → state re-check.

`EscalationEngine` runs one pass: it gathers the circle's active members (excluding the person
the escalation is *about*), evaluates the gates for each, and places at most one call. **Every
candidate produces a record — sent or skipped, with the reason.** Consent is deliberately not
filtered when gathering candidates, so a non-consenting caregiver yields `no_consent` rather than
silently vanishing.

Push, SMS and voice sit behind `Contracts\Channel`. The default `Log*` implementations write what
they would have sent, so the pipeline is fully exercisable without an FCM/APNs/Twilio account.

Emergency alerts deliberately skip the *time* and *priority* gates — a heart attack is not a
routine dose — while every other gate (quiet hours, budget, attempt limits) still applies, which
is what keeps normal operation non-aggressive without ever muting a real emergency.

## "Nothing is reported that was not measured"

`HealthChecker` reports `ok` / `warn` / `fail` / `skipped` and always says why. A scheduler that
has never heart-beaten reports `fail`; a machine with no `pg_dump` reports `skipped` for backups
rather than a comfortable green. Metrics return `null` — not `0` — where there is nothing to
measure.

The platform console reads cross-tenant aggregates on the owner connection, because tenant-scoped
RLS is designed to return nothing without a context. That exception is isolated in
`Platform\Concerns\ReadsAcrossTenants` and every such read is written to the audit ledger.

## Verification

| Surface | Command | Result |
|---|---|---|
| Backend | `php artisan test` | 62 passed |
| Backend | `vendor/bin/pint` | clean |
| Frontend | `npm run build` (+ `tsc --noEmit`) | clean |
| Frontend | `npm run lint` | clean |
| Mobile | `flutter analyze` | no issues |
| Mobile | `flutter test` | 77 passed |

`TenantIsolationTest` is the important one: it asserts the isolation guarantees against two
separate connections — the owner for fixtures, and the **restricted runtime role** for the
assertions — and drives registration → add medication → list → cross-account isolation over the
same connection production uses. The remaining feature suites run on the owner connection, which
bypasses RLS, so they test application logic (permissions, gates, surface abilities) rather than
isolation.
