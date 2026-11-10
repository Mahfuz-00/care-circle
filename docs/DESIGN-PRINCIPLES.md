# CareCircle — Design Principles

The working design doctrine for this product. `PRD.md` remains the product contract; this
document governs **how** the three surfaces look, behave and are changed.

Every claim about existing code below is grounded in a real file. Where something is a rule
rather than a description, it says so.

---

## 1. One design system, three workspaces

The organising idea is not a page list. It is **who is using the product and under what
pressure**.

| Workspace | Who | Optimised for | Surface |
|---|---|---|---|
| **Senior app** | the senior, often mid-task, possibly anxious, possibly holding a pill bottle | glanceability, one deliberate press, nothing to decipher | `mobile-app/` |
| **Caregiver dashboard** | adult children and self-users coordinating care | visibility, decisions, history, configuration | `frontend/` |
| **Landlord console** | the platform operator | operational truth, cross-tenant health | `frontend/src/features/platform/` |

The test for whether a change is correct: **the same design system, but a different layout where
the workflow demands it.**

- A senior must never have to read a dashboard to take a dose.
- A caregiver must never have to open the senior app to understand whether a dose was taken.
- An operator must never reach for a tenant screen to learn whether the platform is healthy.

The three are served by one palette, one type ramp and one set of states — not three products
that happen to share colours.

There is also a **public marketing page at `/`**, outside the authenticated shell and reachable
without a token (`frontend/src/features/marketing/LandingPage.tsx`). It is not a fourth workspace:
it exists to explain the product honestly, and it is held to the same rules — real data read from
the API, all five states, and a "what CareCircle does not do" section instead of a feature list
that implies more than exists.

---

## 2. Core philosophy

1. **Nothing is reported that was not measured.** This is PRD §9 and it is also a design rule. A
   missing value renders "Not recorded" / "Not returned by the API" / "Not calculated" — never
   `0`, never `N/A`, never a plausible-looking placeholder. Implemented in
   `frontend/src/lib/format.ts` (formatters return `null`, never a fabricated value) and
   `components/ui/states.tsx` (`ValueOrEmpty`).
2. **State is communicated in words, not colour.** Every status carries a text label. Colour is
   reinforcement, never the message — a caregiver printing the page or a colour-blind user must
   lose nothing. See `features/doses/options.ts` (`DOSE_STATUS_LABELS`) and
   `mobile-app/.../dose_card.dart` (`_StatusChip` renders `dose.status.label`).
3. **The urgent action is always reachable.** "I need help" is a first-class control in the
   dashboard header (`features/dashboard/DashboardPage.tsx`), and on mobile it is never smaller
   than `AppSizes.emergencyButtonHeight` (96dp) and always on the home screen.
4. **Large text is the default, not an accessibility mode.** The dashboard sets a 17px root
   (`index.css`); the app's body text is 20sp and scales with the OS up to 3×
   (`app_sizes.dart: maxSupportedTextScale`). Medication names **wrap, never truncate** —
   `mobile-app/lib/core/widgets/medication_name_text.dart`.
5. **No medical advice, ever.** The dashboard footer states what the product does and does not do,
   in the product itself (`AppShell.tsx`), and points to emergency services. This is repeated
   wherever a boundary could be misread.
6. **Motion is feedback, not decoration.** Animation only confirms that something happened. The
   whole app honours `prefers-reduced-motion` in one place (`index.css`).
7. **Density is earned.** Numbers and lists are laid out to be scanned — aligned figures, clear
   labels, restrained charts. A chart that does not change a decision is removed.

---

## 3. The visual system that exists

Do not invent a new one. **Warm Sage** is defined once per surface:

| | Source of truth |
|---|---|
| Dashboard tokens | `frontend/src/index.css` → Tailwind v4 `@theme` |
| Mobile palette | `mobile-app/lib/core/theme/app_colors.dart` |
| Mobile theme + type ramp | `mobile-app/lib/core/theme/app_theme.dart` |
| Mobile sizing rules | `mobile-app/lib/core/theme/app_sizes.dart` |

- **Canvas** calm cream · **Primary** deep sage · **Accent** forest teal · **Ink** three text
  weights · **Status** `danger` / `warn` / `ok`.
- Semantic tokens only: components use `sage-*`, `cream-*`, `ink-*`, `danger-*`, `warn-*`,
  `ok-*`. No raw hex in components.
- Two shared tokens carry most of the surface work: `--radius-card` and `--shadow-card`.
- Mobile ships a **high-contrast variant** (`AppTheme.scheme(highContrast: true)`) that reaches
  AAA on cream, switched by the user in Settings.

---

## 4. Rules of the interface

These are requirements for any new or changed screen.

**States.** Every data region handles all five: loading, empty, error-with-retry, denied, and
loaded. Reuse `components/ui/states.tsx`. An empty region is a bug; so is a blank one.

- Use `SkeletonList` / `SkeletonStats` when the content has a **known shape** (lists, stat
  grids), and `LoadingState` when it does not. Skeletons are `aria-hidden`; the loading state is
  announced once in words, so a screen reader hears "Loading medications…" rather than a stream
  of empty boxes.

**Focus and keyboard.** Focus is always visible (`:focus-visible`, 3px teal ring) and never
removed. Every interactive control is reachable and operable by keyboard. The shell provides a
skip link and real landmarks (`header` / `nav` / `main`).

**Numbers.** Quantities, percentages, counts and timestamps use **tabular figures**
(`tabular-nums` on the dashboard, `AppTheme.tabular(...)` on mobile). The two implementations
exist because the two surfaces have different styling systems; the rule is the same. Prose keeps
proportional figures — tabular numerals are only for values that sit in columns or change over
time.

**Forms.** Label every control. Field-level validation messages, shown next to the field.
Destructive actions are confirmed and named. Long forms are sectioned with sensible defaults.

**Latency.** Never show success before the server confirms it. The UI reflects persisted state,
not the click. This matters most for doses, refills and emergency alerts — a dose is "taken"
because the API said so.

**Copy.** Plain language, second person, no jargon. Say what happened and what happens next.
Never imply a diagnosis or a recommendation.

**Touch and scale (mobile).** Minimum 48dp targets, 64dp for primary actions, 96dp for the
emergency button. Respect OS text scale everywhere. Never truncate a medication name.

---

## 5. What we deliberately never do

Translated from a generic premium-SaaS doctrine, but the CareCircle-specific reasons matter more
than the aesthetics:

- No decorative gradients or glow — they compete with status colour, and status colour carries
  meaning here.
- No oversized metric tiles that push the emergency control below the fold.
- No nested cards, no cards inside cards.
- No oversized display type inside data-dense tables; no tiny type for anything a senior reads.
- No chart without a decision attached to it.
- No animation on the emergency path. Never animate a control that must be pressed *now*.
- No colour-only status, no icon-only status without a label.
- No dead navigation: an item that the current role cannot use is not rendered
  (`config/roles.php` drives this via `frontend/src/lib/permissions.ts`).
- No invented values. If the API did not return it, the UI says so.

---

## 6. Maintaining: contracts a redesign must not break

A visual change is a change to a running care system. These hold regardless of how the interface
looks.

**Product and data contracts**

- **Tenant isolation is a database property.** Never widen a query to make a screen easier. RLS
  returns zero rows without context *by design* — a UI that "needs" cross-circle data is asking
  the wrong question.
- **The two surfaces stay separate.** The dashboard calls `/api/v1`; the app calls `/mobile/v1`
  and enforces it in code
  (`mobile-app/lib/core/network/mobile_surface_guard_interceptor.dart`). The landlord console does
  not exist on mobile.
- **Use the API as the source of truth.** Do not recompute `days_remaining`, adherence, plan caps
  or escalation decisions in the client. The server computed them once; a second implementation
  will disagree with it.
- **No schema change for a visual improvement.** If a screen needs data the API does not return,
  that is an API conversation, not a component conversation.
- **No mock data in shipped code.** Fixtures live in tests only.
- **Roles come from one place.** `config/roles.php` (exposed at `/api/v1/meta/roles`) drives both
  enforcement and the dashboard matrix. Never hard-code a role check in a component.

**Engineering**

- Audit before changing: read the screen, the hook, the API resource and the policy behind it.
  Assume nothing works because the route exists — CareCircle's isolation makes an
  un-contextualised query *silently empty*, which looks identical to "no data".
- Reuse `components/ui/*` rather than adding a dependency or a parallel component.
- Prefer semantic elements and tokens over one-off CSS and magic values.
- Keep accessibility regressions out: focus visible, contrast held, text scaling intact, every
  state announced.
- Add a test for any changed behaviour. Backend: `php artisan test`. Dashboard: `npm run build`
  and `npm run lint`. Mobile: `flutter analyze` and `flutter test`.

---

## 7. How to change a screen

1. **Read** the page, its hooks, its API resource, and the policy/RLS behind the data.
2. **List** the states it already handles, and the ones it is missing.
3. **Reuse** the existing primitives; only add a component that two screens need.
4. **Change** one screen; keep the API contract, roles and copy honest.
5. **Verify**: build, lint, test, and check the four states by hand.

### Definition of done for a design change

- All five states are handled, and none of them is blank.
- Status is legible without colour; every number is either real or explicitly absent.
- Keyboard reaches everything; focus is visible; nothing fails under OS text scaling.
- The urgent path (a dose, a refill, an emergency) still works with one deliberate action.
- No API contract, role rule, or isolation guarantee was weakened.
- `php artisan test`, `npm run build`, `npm run lint`, `flutter analyze`, `flutter test` pass.
- Anything not done is written down, not left implied.

---

## Appendix: what did *not* transfer

The doctrine this was separated from was written for a restaurant POS, and several of its pillars
have no CareCircle equivalent. Recording that explicitly, so the mapping is not mistaken for a
description of this product:

| Restaurant pillar | Transfers? | CareCircle equivalent |
|---|---|---|
| POS terminal, speed under queue pressure | No | The senior app's dose action: one deliberate press, no confirmation maze |
| Kitchen display, glanceability at distance | Partly | The caregiver's "today" and low-stock panels: scannable at a glance, but read sitting down |
| Branch selector, cash registers, shifts | No | Care-circle switcher; per-user quiet hours |
| "Scan. Order. Track. Enjoy." / no app install | Partly | A public landing page now exists at `/`, but it carries no engagement funnel — no reviews, no loyalty scheme, no app-store prompt |
| Table QR, menu, bill request | No | Not applicable |
| Inventory, suppliers, financial accounts | No | Stock levels and refill; no financial module |
| Multi-branch tenancy | No | Care-circle tenancy, enforced by RLS rather than by a UI filter |
| Post-dining reviews and loyalty | No | Not applicable — no engagement funnels |

What did transfer is the part that is genuinely domain-independent: **one system across distinct
workspaces, restrained premium surfaces, words over colour, honest data, visible focus, and a
strict "preserve everything working" rule for redesigns.**
