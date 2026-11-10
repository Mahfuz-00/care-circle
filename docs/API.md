# CareCircle — API reference

All responses are wrapped in `{ "data": ... }`. Validation failures return
`422 { "message": ..., "errors": { field: [...] } }`.

Every authenticated request should send `X-Care-Circle: <id>` to choose the active care circle.
When omitted, the acting user's first active circle is used.

## `/api/v1` — dashboard surface (ability `dashboard`)

### Public
| Method | Path | Notes |
|---|---|---|
| GET | `/plans` | the plan catalogue (PRD §8). **No token required** — this is the pricing the marketing page renders, read from the `plans` table so it cannot drift from the enforced limits. Exposes no tenant data. |

### Auth
| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | `{name,email,phone?,password,password_confirmation,role,timezone?,circle_name?}` → user, token, care circle |
| POST | `/auth/login` | `{email,password}` → user, token |
| POST | `/auth/logout` | revokes the current token |
| GET | `/auth/me` | user, their circles, and the active circle |

### Metadata
| Method | Path | Notes |
|---|---|---|
| GET | `/meta/roles` | the PRD §6 matrix, straight from `config/roles.php` |

### Care circle
| Method | Path | Notes |
|---|---|---|
| GET | `/care-circles` | only circles the user belongs to |
| POST | `/care-circles` | creator becomes Primary Caregiver |
| GET/PATCH | `/care-circles/{careCircle}` | PATCH sets name/timezone/quiet hours |
| GET | `/care-circles/{careCircle}/members` | a senior can always see who has access |
| POST | `/care-circles/{careCircle}/invitations` | `{email?,phone?,role}` — seat-capped by plan |
| PATCH/DELETE | `/care-circles/{careCircle}/members/{member}` | change role, or remove (owner cannot be removed) |
| GET | `/care-circles/{careCircle}/shared-medications` | every medication the circle can see |

### Invitations
| Method | Path | Notes |
|---|---|---|
| GET | `/invitations/{token}` | readable by the invitee before they are a member |
| POST | `/invitations/{token}/accept` | joins the circle |

### Medications
| Method | Path | Notes |
|---|---|---|
| GET | `/medications` | `?owner_user_id=&include_inactive=` |
| POST | `/medications` | capped by plan |
| GET/PATCH | `/medications/{medication}` | |
| DELETE | `/medications/{medication}` | **retires** (`is_active = false`) to preserve adherence history |
| POST | `/medications/{medication}/refill` | `{quantity,note?}` |

`Medication` carries computed `days_remaining` and `is_low_stock`, never stored.

### Doses
| Method | Path | Notes |
|---|---|---|
| GET | `/doses/today` | `?user_id=&date=` |
| POST | `/doses/{dose}/take` | `{photo?}` — consumes stock, closes the dose |
| POST | `/doses/{dose}/skip` | `{reason?}` — recorded with the reason |
| POST | `/doses/{dose}/snooze` | `{minutes}` |

### Adherence
| Method | Path | Notes |
|---|---|---|
| GET | `/adherence` | `?from=&to=&user_id=` → taken/skipped/missed/total/percentage |

Only doses that reached a decided state count; a still-pending dose is excluded rather than held
against the user, and `percentage` is `null` when nothing was measured.

### Appointments
| Method | Path | Notes |
|---|---|---|
| GET/POST | `/appointments` | `reminder_offsets` are minutes before the appointment |
| PATCH/DELETE | `/appointments/{appointment}` | |

### Emergency
| Method | Path | Notes |
|---|---|---|
| GET | `/emergency` | recent alerts |
| POST | `/emergency` | `{type,latitude?,longitude?,location_label?,note?}` — notifies the circle immediately |
| POST | `/emergency/{alert}/acknowledge` | first acknowledgement wins; time-to-ack is measured |
| POST | `/emergency/{alert}/resolve` | |
| POST | `/emergency/{alert}/cancel` | only the raiser |

## `/api/v1/platform` — landlord console (`dashboard` + `platform.admin`)

| Method | Path | Notes |
|---|---|---|
| GET | `/platform/system-health` | per-check `ok\|warn\|fail\|skipped`, with a reason |
| GET | `/platform/backups` | plus the newest verified dump |
| GET | `/platform/failed-jobs` | |
| GET | `/platform/audit-log` | for one circle, chosen with `X-Care-Circle` |
| GET | `/platform/metrics` | adherence, low-stock refill rate, emergency ack time, invitation acceptance |

The console does not exist on `/mobile/v1`.

## `/mobile/v1` — mobile surface (ability `mobile`)

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register`, `/auth/login` | register accepts `device_name` |
| POST | `/auth/logout`, GET `/auth/me` | |
| GET | `/today` | one payload: doses, appointments, the circle, open alert count |
| GET | `/medications`, `/appointments` | |
| GET | `/care-circle` | "who has access" |
| POST | `/doses/{dose}/take\|skip\|snooze` | same semantics as the dashboard |
| POST | `/emergency` | |
| GET | `/emergency/{alert}` | |
| POST | `/emergency/{alert}/acknowledge` | |
