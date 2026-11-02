# CareCircle — Web dashboard

The care-coordination dashboard for **self-users, seniors, primary caregivers, caregivers and the
platform operator** (PRD §3). It talks to one surface only: `/api/v1` with a Sanctum token that
carries the **`dashboard`** ability. `/mobile/v1` belongs to the Flutter app and is never called from
here.

Stack (PRD §12): React 19 · Vite 7 · TypeScript · Tailwind CSS 4 · TanStack Router · TanStack Query ·
Zustand · axios. Design system: **Warm Sage** (calm cream, deep sage, forest teal), defined as
Tailwind v4 `@theme` tokens in `src/index.css`.

## Getting started

```bash
cp .env.example .env      # VITE_API_URL, default http://localhost:8000
npm install
npm run dev               # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc --noEmit` then a production build into `dist/` |
| `npm run lint` | ESLint (flat config, typescript-eslint + react-hooks + react-refresh) |
| `npm run preview` | Serves the built `dist/` |

## Routes

| Path | Purpose | Guard |
|---|---|---|
| `/login`, `/register` | Sign in / create an account | guests only (signed-in users are redirected to `/`) |
| `/` | Dashboard: today's doses, low stock, adherence, next appointments, open alerts | auth |
| `/medications`, `/medications/new`, `/medications/{id}` | Medication list, creation, detail + refill + edit | auth, per-action role gates |
| `/appointments` | Doctor, lab and procedure visits with reminder lead times | auth |
| `/adherence` | Confirmation rate for a window, per member when the role allows | auth |
| `/care-circle` | Members, roles, invitations, circle name/timezone/quiet hours | auth, per-section role gates |
| `/emergency` | One-press “I need help”, active alerts, contacts | auth |
| `/settings` | Account, active circle, the PRD §6 permission matrix, session info | auth |
| `/platform`, `/platform/health`, `/platform/backups`, `/platform/failed-jobs`, `/platform/audit` | Operator console (landlord surface) | `platform.admin` only — hidden and refused otherwise |

Unknown paths render an intentional not-found page, not a blank screen.

## Where the logic lives

```
src/
├── lib/
│   ├── api.ts           axios instance pinned to /api/v1, bearer token, envelope unwrapping, ApiError
│   ├── config.ts        API base URL + surface prefixes
│   ├── permissions.ts   ← SINGLE SOURCE OF TRUTH for PRD §6 (roles, grants, derived capabilities)
│   ├── queryClient.ts   React Query cache policy + query-key factory
│   ├── format.ts        date/number formatting, “now” boundaries
│   └── types.ts         typed mirror of the backend API resources
├── stores/
│   ├── auth.ts          Zustand: {token, user, activeCareCircle} persisted to localStorage
│   └── ui.ts            Zustand: UI-only toasts (server state never lives here)
├── components/          AppShell (header/nav/main/footer + skip link), UI kit, guards
├── routes/              root route, authenticated layout route (beforeLoad auth guard), router
└── features/<feature>/  TanStack Query hooks + components per feature
```

### Role-based visibility

`src/lib/permissions.ts` holds the PRD §6 matrix (`ROLE_MATRIX`) including the qualified cells
(`own`, `limited`, `invite_only`). Everything that depends on a role resolves through
`capabilitiesFor()` via `useSession()`, or through `<RequirePermission permission="…">`. Changing a
cell there changes navigation, buttons, panels, route guards and the matrix rendered on `/settings`
together. The API remains the authority: a refusal arrives as a readable 403/422, never a blank
region.

`platform.admin` is read from `/auth/me` (`user.is_platform_admin`); it is never inferred from a role
or an email address.

### Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `footer`, `section` with labelled headings) and a
  “Skip to main content” link.
- Always-visible focus rings (`:focus-visible`, 3px forest-teal outline with offset) — never removed.
- Every input has a visible label; hints and errors are wired with `aria-describedby`, errors announce
  with `role="alert"`, and the toast region is a polite live region.
- Minimum 44px touch targets, larger “I took it” and emergency buttons, 17px base font.
- `prefers-reduced-motion` respected; status is never communicated by colour alone (badges carry text).

### Values

Every number, date and label on screen comes from an API response. Absent fields render explicit
“not recorded / not returned” states or an intentional empty state. The emergency page states plainly
that CareCircle notifies the care circle and records acknowledgement — it gives no medical advice and
does not dispatch emergency services.

## Notes and known gaps

- `GET /platform/backups` and `GET /platform/failed-jobs` are documented only as endpoints, so those
  pages render every field the API actually returns and say “not returned” for the rest.
- `Appointment` has no owner field, so the dashboard cannot distinguish a member's own appointment
  from a shared one; create/edit/delete is gated on the role's appointment grant and the API decides.
- `CareCircleMember` returns names and emails but no phone numbers, so the emergency contacts panel
  offers email only — no invented `tel:` links.
- There is no profile-update endpoint on this surface, so `/settings` shows account values read-only.
