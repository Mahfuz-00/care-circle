# CareCircle — Product Requirements Document

**Version 1.0 · Medication & Care Coordination SaaS**  
**Date:** October 2026  
**Status:** Authoritative product requirements for MVP and first commercial release  
**Supersedes:** None (new product)  
**Base structure:** Adapted from Family Essentials Smart Reminder PRD v2 / v3

---

## 1. The Problem

Today’s world makes it hard to take care of yourself or your parents. People are busy. Seniors (and many adults) forget to take medicine. Stock runs out quietly. Doctor appointments slip. When something goes wrong for a senior living alone, the family often finds out too late.

Two failures dominate:

1. **The forgotten moment** — A reminder that arrives at the wrong time, in the wrong channel, or requires opening an app is ignored or never seen.
2. **The invisible stock and the silent emergency** — Nobody knows how many pills are left until the bottle is empty. Nobody knows a senior needs help until hours have passed.

CareCircle is built around those two failures: every medication has a clear schedule, stock level and owner; every senior has a reachable care circle; and the system uses the least intrusive effective channel first (push → voice → escalation to caregivers).

---

## 2. Who It Is For

| Persona | Needs | What they get |
|---|---|---|
| **Self-user** (adult managing own medications) | Reliable reminders, stock tracking, appointment memory | Full personal dashboard + mobile app |
| **Senior / parent** | Simple, large-interface reminders and a fast way to get help | Mobile app optimised for accessibility + voice |
| **Primary caregiver** (adult child or main caretaker) | Visibility without nagging, ability to help remotely | Caregiver dashboard, adherence view, escalation controls |
| **Secondary caregiver / family member** | Limited visibility and ability to respond to emergencies | Role-based access |
| **Platform operator** | System health, support, compliance visibility | Landlord / admin console |

---

## 3. Surfaces

| Surface | Audience | Prefix | Token ability |
|---|---|---|---|
| Web dashboard | Caregivers + self-users + platform admin | `/api/v1` | `dashboard` |
| Mobile app (iOS + Android) | Everyone, especially seniors | `/mobile/v1` | `mobile` |
| Landlord console | Platform admin only | `/api/v1/platform/*` | `dashboard` **and** `platform.admin` |

A token minted on one client surface is rejected by the other. The landlord console is deliberately absent from the mobile surface.

**There is one Laravel application serving two client surfaces.** Controllers are shared where appropriate; surface isolation is enforced by Sanctum abilities.

---

## 4. Core Product Promise & USP

**USP:**  
Reliable medication and care coordination for seniors and the people who love them — with voice that only speaks when it should, stock that never runs out silently, and a medical emergency button that actually reaches caregivers.

**Core promise:**  
No medication dose should be forgotten without a clear, multi-channel attempt. No senior living alone should face a medical emergency (heart attack, fall, severe symptoms, etc.) without being able to notify or call their care circle instantly. Stock should never reach zero without warning.

---

## 5. What Will Be Built (MVP Scope)

### 5.1 Medication Management (Core Loop) — **MVP**

| Requirement | Priority | Notes |
|---|---|---|
| Create medication with name, dosage, frequency, time windows, optional photo | P0 | |
| Support complex schedules (daily, specific weekdays, every other day, “with food”) | P0 | |
| Stock tracking: current quantity, units per dose, low-stock threshold | P0 | |
| Automatic “days remaining” calculation | P0 | |
| Proactive low-stock / refill reminders to senior **and** caregivers | P0 | |
| One-tap “I took it” / “Skip” / “Snooze” (button on notification or app screen) with optional photo confirmation | P0 | Voice confirmation is future scope |
| Medication history and simple adherence percentage | P0 | |
| Preferred pharmacy (name + phone) with one-tap call / SMS | P0 | |

### 5.2 Reminders & Channels — **MVP**

| Requirement | Priority | Notes |
|---|---|---|
| Multi-channel: in-app + system push + optional SMS + voice call | P0 | |
| Configurable quiet hours per user / household | P0 | |
| Server-enforced escalation policy (push → wait → voice → next caregiver) | P0 | |
| Voice scripts that are short, clear, and confirmable by voice or DTMF | P1 | Controlled beta |
| All skipped or failed attempts recorded **with the reason** | P0 | |

### 5.3 Care Relationships — **MVP**

| Requirement | Priority | Notes |
|---|---|---|
| Two primary modes: Self and Senior ↔ Caregiver(s) | P0 | |
| Invite caregivers by email / phone with clear permission levels | P0 | |
| Multiple caregivers supported; primary caregiver manages the circle | P0 | |
| Senior can always see who has access | P0 | |
| Roles: Self-user, Senior, Primary Caregiver, Caregiver | P0 | Declared once in config |

### 5.4 Appointments — **MVP**

| Requirement | Priority | Notes |
|---|---|---|
| Doctor / lab / procedure appointments with date, time, location, notes | P0 | |
| Automatic reminders at configurable intervals before the appointment | P0 | |
| Option to share appointment with the care circle | P0 | |

### 5.5 Emergency & Check-in — **MVP**

| Requirement | Priority | Notes |
|---|---|---|
| Prominent “I need help” / medical emergency button (heart attack, fall, severe symptoms, etc.) | P0 | One-tap notify + optional direct call to caregivers |
| Notifies the entire care circle with optional location | P0 | |
| Option for the senior to place a direct voice call to primary caregiver(s) | P0 | |
| Configurable escalation if no one acknowledges | P0 | |
| Optional scheduled wellness check-ins that the senior must confirm | P1 | |

### 5.6 Future Scope (Post-MVP)

- E-pharmacy API integrations for automatic ordering
- OCR prescription scanning to pre-fill medication data
- AI-assisted doctor search by health problem (with strong “not medical advice” disclaimers)
- Wearable / smart-bottle integrations
- Basic medication interaction and allergy warnings
- Exportable adherence reports for doctors
- Multi-language support expansion
- Travel / vacation mode
- Voice confirmation of doses (“I took it” spoken)

---

## 6. Roles & Permissions (Initial)

| Role | Manage own meds | View senior meds | Mark taken | Edit senior meds | Emergency contact | Manage care circle |
|---|---|---|---|---|---|---|
| Self-user | Yes | — | Yes | — | — | — |
| Senior | Yes | — | Yes | Limited | — | Invite only |
| Primary Caregiver | Own | Yes | Yes | Yes | Yes | Yes |
| Caregiver | Own | Yes | Yes | No | Yes | No |

Roles are declared once (config/roles.php style) and both API enforcement and the dashboard matrix are generated from that single source.

---

## 7. Escalation Policy (Server-Enforced)

A voice call or caregiver notification is only placed when **every** gate passes. Default behaviour is deliberately **non-aggressive** — the system must not annoy users.

| Gate | Behaviour |
|---|---|
| Time | Only after the dose is overdue (or emergency button pressed) |
| Priority / Type | High-priority meds or emergency |
| Consent | Recipient opted in and number is verified |
| Quiet hours | Never inside the configured quiet window |
| Attempts | Strict per-item / per-emergency attempt limit |
| Cooldown | Generous minimum gap between attempts |
| Budget | Daily household / care-circle call budget |
| State re-check | Task or emergency still active immediately before action |

Skipped actions are recorded **with the reason**. A skipped call is information.

**Medication visibility:** Seniors cannot hide individual medications from caregivers. Caregivers can see the medication list and confirm adherence. A caregiver marking a dose as taken (or the senior tapping “I took it”) is the source of truth.

---

## 8. Plans, Limits & Quotas (Initial Proposal)

| Tier | Care Circle Seats | Meds tracked | Voice minutes / month | Notes |
|---|---|---|---|---|
| Free / Starter | 2 | 5 | 0 (push only) | Self or very small circle |
| Family | 5 | 20 | Limited | Typical senior + children |
| Care Pro | 10 | Unlimited | Higher | Multiple seniors or heavy use |
| Enterprise / Org | Custom | Unlimited | Custom | Clinics, care homes later |

Exact numbers and pricing are catalogue values until a payment provider is connected. Caps are enforced by the API.

---

## 9. Non-Functional Requirements

| Requirement | How it is met |
|---|---|
| **Tenant / care-circle isolation is a database property** | Every care-circle table has `ENABLE` + `FORCE ROW LEVEL SECURITY` with policies keyed on session GUCs. Unset context returns zero rows. |
| **Least privilege at runtime** | App connects as a restricted role; migrations run as owner. |
| **Every privileged action is audited** | Append-only audit ledger with actor, care-circle, IP, level and payload. |
| **Two surfaces cannot be confused** | Sanctum token abilities match the prefix the token was minted on. |
| **Nothing is reported that was not measured** | Health checks that cannot run report `fail`; backups with no dump tool are `skipped`. |
| **Fail closed** | Missing care-circle context returns nothing, never everything. |
| **Accessibility first** | Large text, high contrast, screen-reader support, voice-first paths for seniors. |
| **No medical advice** | The product coordinates and reminds. It does not diagnose or prescribe. |

---

## 10. Success Measures (Observable)

These are the questions the platform console and product should be able to answer:

| Question | Where to look |
|---|---|
| Is the system healthy right now? | System Health — per-check status |
| What has failed in the background? | Failed jobs |
| Could we restore, and how much would we lose? | Backups readiness & newest verified dump |
| Medication confirmation rate within the scheduled window | Adherence reports |
| Percentage of low-stock events that result in a refill before zero | Stock events |
| Time from emergency button to first caregiver acknowledgement | Emergency logs |
| Caregiver invitation acceptance rate | Membership metrics |

Product analytics (activation, weekly active care circles) are collected only after the core loop is proven reliable.

---

## 11. Deliberately Not Built in MVP (Future Scope)

| Gap | Why it matters | What exists instead |
|---|---|---|
| Real e-pharmacy ordering & payment | Complexity + regulation | Preferred pharmacy + one-tap call |
| Full OCR pipeline | Accuracy & edge cases | Manual entry + photo attachment |
| AI doctor recommendations presented as advice | Liability | Future feature with strong disclaimers |
| Continuous vital-sign monitoring | Hardware + privacy | Manual check-ins + emergency button |
| Voice confirmation of doses (“I took it” by voice) | Complexity | One-tap button on notification or app screen |

---

## 12. Technology Direction (Aligned with Family Essentials)

| Layer | Technology |
|---|---|
| API | Laravel (latest stable), PHP 8.4+, Sanctum |
| Database | PostgreSQL 16 with Row-Level Security |
| Dashboard | React 19 + Vite + Tailwind + TanStack Router/Query + Zustand |
| Mobile | Flutter 3 (Clean Architecture, BLoC, GoRouter, get_it, dio) |
| Queue / Scheduler | Redis + Laravel queues + scheduler |
| Push | FCM / APNs behind interface (log implementation by default) |
| Voice | Provider adapter behind interface (log / fake in tests) |
| Design system | Warm Sage (calm cream + deep sage + forest teal) — already proven |

Provider seams, audit ledger, health checks, backup verification, and “nothing green that was not measured” rules are inherited directly from the Family Essentials operational philosophy.

---

## 13. Definition of MVP Success

A senior (or self-user) can add a medication in under a minute.  
Reminders arrive through the right channel at the right time.  
Stock never reaches zero without both the senior and at least one caregiver being notified.  
A medical emergency button press (heart attack, fall, severe symptoms, etc.) reaches the care circle, can place a direct call, and records acknowledgement.  
Completed or cancelled doses stop all further escalation.  
No care circle can ever see another care circle’s data.  
Confirmation of a dose is done by a simple tap on the notification or app screen.

---

**Document owner:** Product  
**Next artefacts:** Architecture adaptation, API surface, detailed user stories, design-system extensions for senior accessibility, and Phase-gated development plan.

*This PRD describes what should be built and what is deliberately left for later. Where something is unfinished it says so plainly.*
