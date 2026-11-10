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
  actor?: { id: number; name: string; email?: string } | null
  actor_user_id?: number | null
  actor_role?: string | null
  care_circle_id?: number | null
  care_circle_name?: string | null
  action?: string | null
  level?: string | null
  ip_address?: string | null
  created_at?: string | null
  payload?: Record<string, unknown> | null
  scope?: 'platform' | 'client' | string
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

/**
 * A row of the plan catalogue (PRD §8). A null cap means the plan does not cap
 * that dimension — the UI says so rather than printing a zero.
 */
export interface Plan {
  code: string
  name: string
  seats: number | null
  medications: number | null
  voice_minutes: number | null
  notes: string | null
}

export interface PlatformClientListItem {
  id: number
  name: string
  plan_code: string
  plan_name: string
  timezone: string
  created_at: string
  status: 'active' | 'suspended' | 'past_due' | 'cancelled'
  mrr: number
  owner: {
    id: number
    name: string
    email: string
  }
  stats: {
    members_count: number
    medications_count: number
    active_alerts_count: number
  }
}

export interface PlatformClientDetail {
  id: number
  name: string
  plan_code: string
  plan_name: string
  plan_limits: {
    seats: number | null
    medications: number | null
    voice_minutes: number | null
  }
  timezone: string
  quiet_hours_start?: string | null
  quiet_hours_end?: string | null
  created_at: string
  status: string
  mrr: number
  billing: {
    cycle: string
    next_billing_date: string
    payment_method: string
    payment_status: string
  }
  owner: {
    id: number
    name: string
    email: string
  }
  members: Array<{
    id: number
    role: string
    status: string
    created_at: string
    user_id: number
    name: string
    email: string
  }>
  medications: Array<{
    id: number
    name: string
    dosage: string
    frequency: string
    stock_quantity: number
    is_low_stock: boolean
    created_at: string
  }>
  recent_alerts: Array<{
    id: number
    type: string
    status: string
    created_at: string
    acknowledged_at?: string | null
    resolved_at?: string | null
  }>
}

export interface PlatformBillingInvoice {
  id: number
  care_circle_id: number
  invoice_number: string
  amount_cents: number
  currency: string
  status: 'draft' | 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: 'card' | 'bank_transfer' | 'cash'
  plan_code: string
  billing_period_start: string
  billing_period_end: string
  due_at: string
  paid_at?: string | null
  items: Array<{
    description: string
    amount_cents: number
    quantity?: number
  }>
  notes?: string | null
  created_at: string
  care_circle?: {
    id: number
    name: string
    plan_code: string
    status: string
  }
}

export interface InvoicesApiResponse {
  invoices: {
    data: PlatformBillingInvoice[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  stats: {
    total_count: number
    paid_count: number
    pending_cash_count: number
    pending_cash_cents: number
    total_revenue_cents: number
  }
}

export interface PaymentGatewaySettings {
  active_gateway: string
  mode: 'sandbox' | 'live'
  currency: string
  auto_billing_enabled: boolean
  gateways: {
    stripe: {
      enabled: boolean
      sandbox: boolean
      publishable_key: string
      secret_key?: string
      webhook_secret?: string
    }
    bank_transfer: {
      enabled: boolean
      bank_name: string
      account_name: string
      account_number: string
      routing_code: string
      instructions: string
    }
    cash: {
      enabled: boolean
      instructions: string
    }
  }
}

export interface EmailSettings {
  mailer: string
  host: string
  port: number
  encryption: string
  username: string
  password?: string
  from_address: string
  from_name: string
  templates: Array<{
    id: string
    name: string
    enabled: boolean
  }>
}

export interface RefundPolicy {
  policy_markdown: string
  refund_window_days: number
  monthly_refund_percent: number
  annual_refund_percent: number
  auto_approve_under_cents: number
  contact_email: string
}

export interface RefundRecord {
  id: number
  invoice_id: number
  care_circle_id: number
  user_id: number
  amount_cents: number
  currency: string
  status: 'pending' | 'approved' | 'rejected'
  reason: string
  admin_notes?: string | null
  processed_by?: number | null
  processed_at?: string | null
  created_at: string
  care_circle?: {
    id: number
    name: string
    plan_code: string
    status: string
  }
  user?: {
    id: number
    name: string
    email: string
  }
  processor?: {
    id: number
    name: string
  }
}

export interface RefundsPayload {
  policy: RefundPolicy
  refunds: {
    data: RefundRecord[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  stats: {
    total_refunded_cents: number
    pending_count: number
    approved_count: number
    rejected_count: number
    avg_turnaround_hours: number
  }
}

export interface RefundEligibilityCheck {
  eligible: boolean
  reasons: string[]
  max_refundable_cents: number
  days_since_invoice: number
  policy_window_days: number
}

export interface PlatformFeedbackReport {
  id: number
  care_circle_id?: number | null
  user_id?: number | null
  type: 'bug' | 'feedback' | 'feature_request'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'triaged' | 'in_progress' | 'resolved' | 'wont_fix'
  device_info?: Record<string, unknown> | null
  admin_notes?: string | null
  resolved_at?: string | null
  created_at: string
  care_circle?: {
    id: number
    name: string
    plan_code: string
    status: string
  }
  user?: {
    id: number
    name: string
    email: string
  }
  resolver?: {
    id: number
    name: string
  }
}

export interface PlatformFeedbackPayload {
  data: PlatformFeedbackReport[]
  meta: {
    current_page: number
    total: number
    per_page: number
    last_page: number
  }
  summary: {
    total: number
    open: number
    critical_open: number
    by_status: Record<string, number>
    by_type: Record<string, number>
  }
}

export interface MarketingOverview {
  total_leads: number
  new_leads: number
  converted_leads: number
  lead_conversion_rate: number
  active_promotions: number
  total_redemptions: number
  active_announcements: number
  total_impressions: number
  total_clicks: number
  banner_ctr_percent: number
}

export interface MarketingPromotion {
  id: number
  code: string
  name: string
  discount_type: 'percent' | 'fixed_cents'
  discount_value: number
  plan_restrictions?: string[] | null
  max_redemptions?: number | null
  redeemed_count: number
  expires_at?: string | null
  is_active: boolean
  created_at: string
}

export interface MarketingAnnouncement {
  id: number
  title: string
  message: string
  link_url?: string | null
  badge_text?: string | null
  theme: 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo'
  target_plans?: string[] | null
  is_active: boolean
  impressions_count: number
  clicks_count: number
  starts_at?: string | null
  ends_at?: string | null
  created_at: string
}

export interface MarketingLead {
  id: number
  name: string
  email: string
  phone?: string | null
  organization?: string | null
  estimated_seniors?: number | null
  notes?: string | null
  status: 'new' | 'contacted' | 'demo_scheduled' | 'converted' | 'lost'
  created_at: string
}


