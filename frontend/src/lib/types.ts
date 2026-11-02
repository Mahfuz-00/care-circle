/**
 * Strongly typed mirror of the backend API resources (CareCircle `/api/v1`).
 *
 * Every response is wrapped in `{ data: ... }` and unwrapped by `src/lib/api.ts`.
 * Optional fields are optional because the API may omit them — the UI must never
 * invent a value that the API did not return.
 */

/** Roles declared once in `config/roles.php` on the backend (PRD §6). */
export const ROLE_VALUES = ['self_user', 'senior', 'primary_caregiver', 'caregiver'] as const

export type Role = (typeof ROLE_VALUES)[number]

export interface User {
  id: number
  name: string
  email: string
  role: Role
  timezone?: string
  /** Present only when the API reports operator rights (`platform.admin`). */
  is_platform_admin?: boolean
}

export interface CareCircle {
  id: number
  name: string
  timezone: string
  quiet_hours_start?: string | null
  quiet_hours_end?: string | null
}

export type MemberStatus = 'invited' | 'active' | 'removed' | (string & {})

export interface CareCircleMember {
  id: number
  user: {
    id: number
    name: string
    email: string
  }
  role: Role
  status: MemberStatus
}

export const MEDICATION_FREQUENCIES = [
  'daily',
  'specific_weekdays',
  'every_other_day',
  'weekly',
  'as_needed',
] as const

export type MedicationFrequency = (typeof MEDICATION_FREQUENCIES)[number]

export interface Medication {
  id: number
  name: string
  dosage: string
  form: string
  frequency: MedicationFrequency
  times: string[]
  days_of_week: number[]
  with_food: boolean
  is_high_priority: boolean
  stock_quantity: number
  units_per_dose: number
  low_stock_threshold: number
  days_remaining: number
  is_low_stock: boolean
  pharmacy_name?: string | null
  pharmacy_phone?: string | null
  is_active: boolean
  owner: {
    id: number
    name: string
  }
}

export type DoseStatus = 'pending' | 'snoozed' | 'taken' | 'skipped' | 'missed'

export interface Dose {
  id: number
  medication: {
    id: number
    name: string
    dosage: string
  }
  scheduled_for: string
  status: DoseStatus
  taken_at?: string | null
  marked_by?: { id: number; name: string } | null
  skip_reason?: string | null
}

export interface AdherenceSummary {
  percentage: number
  taken: number
  skipped: number
  missed: number
  total: number
}

export interface Appointment {
  id: number
  title: string
  type: string
  location: string
  starts_at: string
  notes?: string | null
  shared_with_circle: boolean
  reminder_offsets: number[]
}

export const EMERGENCY_TYPES = ['medical', 'fall', 'heart_attack', 'severe_symptoms', 'other'] as const

export type EmergencyType = (typeof EMERGENCY_TYPES)[number]

export const EMERGENCY_STATUSES = ['open', 'acknowledged', 'resolved', 'cancelled'] as const

export type EmergencyStatus = (typeof EMERGENCY_STATUSES)[number]

export interface EmergencyAlert {
  id: number
  type: EmergencyType
  status: EmergencyStatus
  raised_by: { id: number; name: string }
  acknowledged_by?: { id: number; name: string } | null
  acknowledged_at?: string | null
  location_label?: string | null
  latitude?: number | null
  longitude?: number | null
  note?: string | null
  created_at: string
}

export type HealthStatus = 'ok' | 'warn' | 'fail' | 'skipped'

export interface SystemHealthEntry {
  key: string
  status: HealthStatus
  message: string
  measured_at: string
}

export interface BackupEntry {
  id: number | string
  /** Some fields are optional: the API only reports what it actually measured. */
  status?: HealthStatus | string
  created_at?: string | null
  verified_at?: string | null
  size_bytes?: number | null
  path?: string | null
  message?: string | null
}

export interface FailedJob {
  id: number | string
  queue?: string | null
  job?: string | null
  failed_at?: string | null
  exception?: string | null
}

export interface AuditLogEntry {
  id: number | string
  actor?: { id: number; name: string } | null
  care_circle_id?: number | null
  action?: string | null
  level?: string | null
  ip_address?: string | null
  created_at?: string | null
  payload?: Record<string, unknown> | null
}

export interface PlatformMetrics {
  adherence_percentage: number
  low_stock_refill_rate: number
  emergency_ack_seconds: number
  invitation_acceptance_rate: number
  care_circles: number
  users: number
}

/* ------------------------------------------------------------------ */
/* Auth payloads                                                       */
/* ------------------------------------------------------------------ */

export interface AuthSession {
  user: User
  token: string
  care_circle?: CareCircle | null
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role: Role
  timezone: string
}

export interface MeResponse {
  user: User
  care_circles: CareCircle[]
  active_care_circle: CareCircle | null
}

/* ------------------------------------------------------------------ */
/* Request payloads                                                    */
/* ------------------------------------------------------------------ */

export interface MedicationPayload {
  name: string
  dosage: string
  form: string
  frequency: MedicationFrequency
  times: string[]
  days_of_week: number[]
  with_food: boolean
  is_high_priority: boolean
  stock_quantity: number
  units_per_dose: number
  low_stock_threshold: number
  pharmacy_name?: string
  pharmacy_phone?: string
  is_active: boolean
}

export interface AppointmentPayload {
  title: string
  type: string
  location: string
  starts_at: string
  notes: string
  shared_with_circle: boolean
  reminder_offsets: number[]
}

export interface EmergencyPayload {
  type: EmergencyType
  latitude?: number
  longitude?: number
  location_label?: string
  note?: string
}

export interface RefillPayload {
  quantity: number
  note?: string
}
