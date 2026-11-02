/**
 * SINGLE SOURCE OF TRUTH for role-based visibility (PRD §6).
 *
 * Every role-gated element in the dashboard — navigation, buttons, panels,
 * routes — resolves through this module. Nothing in `src/features/**` may
 * hardcode a role name in a visibility check.
 *
 * PRD §6 matrix (verbatim columns):
 *
 * | Role               | Manage own meds | View senior meds | Mark taken | Edit senior meds | Emergency contact | Manage care circle |
 * |--------------------|-----------------|------------------|------------|------------------|-------------------|--------------------|
 * | Self-user          | Yes             | —                | Yes        | —                | —                 | —                  |
 * | Senior             | Yes             | —                | Yes        | Limited          | —                 | Invite only        |
 * | Primary Caregiver  | Own             | Yes              | Yes        | Yes              | Yes               | Yes                |
 * | Caregiver          | Own             | Yes              | Yes        | No               | Yes               | No                 |
 *
 * The backend declares the same matrix once in `config/roles.php`; the two must
 * stay in step.
 */

import { ROLE_VALUES } from './types'
import type { Role, User } from './types'

/* ------------------------------------------------------------------ */
/* Roles                                                              */
/* ------------------------------------------------------------------ */

export const ROLES = ROLE_VALUES

export const ROLE_LABELS: Record<Role, string> = {
  self_user: 'Self-user',
  senior: 'Senior',
  primary_caregiver: 'Primary caregiver',
  caregiver: 'Caregiver',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  self_user: 'Manages their own medications and reminders. No access to anyone else’s records.',
  senior: 'Manages their own medications, can invite people into their circle, and sees who has access.',
  primary_caregiver: 'Manages the care circle, can view and edit the senior’s medications and appointments.',
  caregiver: 'Can view the senior’s medications and mark doses, but cannot edit them or manage the circle.',
}

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

export function roleLabel(role: Role | null | undefined): string {
  if (!role) return 'Unknown role'
  return ROLE_LABELS[role] ?? role
}

/* ------------------------------------------------------------------ */
/* Permissions                                                        */
/* ------------------------------------------------------------------ */

export const PERMISSIONS = [
  'manage_own_medications',
  'view_senior_medications',
  'mark_doses_taken',
  'edit_senior_medications',
  'emergency_contact',
  'manage_care_circle',
] as const

export type Permission = (typeof PERMISSIONS)[number]

export const PERMISSION_LABELS: Record<Permission, string> = {
  manage_own_medications: 'Manage own medications',
  view_senior_medications: 'View senior medications',
  mark_doses_taken: 'Mark doses taken',
  edit_senior_medications: 'Edit senior medications',
  emergency_contact: 'Emergency contact',
  manage_care_circle: 'Manage care circle',
}

export const PERMISSION_HINTS: Record<Permission, string> = {
  manage_own_medications: 'Create, edit and retire medications they own.',
  view_senior_medications: 'See another member’s medications, doses and adherence.',
  mark_doses_taken: 'Record a dose as taken, skipped or snoozed.',
  edit_senior_medications: 'Change a medication someone else owns.',
  emergency_contact: 'Acknowledge, resolve or cancel an emergency alert.',
  manage_care_circle: 'Change roles, invite and remove members, edit circle settings.',
}

/**
 * Grants map 1:1 onto the PRD cells, including the two qualified cells:
 * `own` (Self-user / Caregiver “Manage own meds”) and `invite_only` (Senior
 * “Manage care circle”). `limited` is the Senior’s “Edit senior meds” cell.
 */
export type Grant = 'yes' | 'no' | 'own' | 'limited' | 'invite_only'

export const GRANT_LABELS: Record<Grant, string> = {
  yes: 'Yes',
  no: '—',
  own: 'Own only',
  limited: 'Limited',
  invite_only: 'Invite only',
}

export const ROLE_MATRIX: Record<Role, Record<Permission, Grant>> = {
  self_user: {
    manage_own_medications: 'yes',
    view_senior_medications: 'no',
    mark_doses_taken: 'yes',
    edit_senior_medications: 'no',
    emergency_contact: 'no',
    manage_care_circle: 'no',
  },
  senior: {
    manage_own_medications: 'yes',
    view_senior_medications: 'no',
    mark_doses_taken: 'yes',
    edit_senior_medications: 'limited',
    emergency_contact: 'no',
    manage_care_circle: 'invite_only',
  },
  primary_caregiver: {
    manage_own_medications: 'own',
    view_senior_medications: 'yes',
    mark_doses_taken: 'yes',
    edit_senior_medications: 'yes',
    emergency_contact: 'yes',
    manage_care_circle: 'yes',
  },
  caregiver: {
    manage_own_medications: 'own',
    view_senior_medications: 'yes',
    mark_doses_taken: 'yes',
    edit_senior_medications: 'no',
    emergency_contact: 'yes',
    manage_care_circle: 'no',
  },
}

/** Raw PRD §6 cell for a role. */
export function grantFor(role: Role | null | undefined, permission: Permission): Grant {
  if (!role || !isRole(role)) return 'no'
  return ROLE_MATRIX[role][permission]
}

/** True when the cell grants anything at all (qualified cells count). */
export function allows(role: Role | null | undefined, permission: Permission): boolean {
  return grantFor(role, permission) !== 'no'
}

/** Every permission row for a role, ready to render as a matrix. */
export function permissionsForRole(role: Role): Array<{ permission: Permission; grant: Grant }> {
  return PERMISSIONS.map((permission) => ({ permission, grant: ROLE_MATRIX[role][permission] }))
}

/* ------------------------------------------------------------------ */
/* Derived capabilities                                               */
/* ------------------------------------------------------------------ */

export interface CapabilityInput {
  role: Role | null | undefined
  /** Id of the signed-in user, used to distinguish “own” from “someone else’s”. */
  currentUserId?: number | null
}

export interface Capabilities {
  /** Create and edit medications the signed-in user owns. */
  createOwnMedication: boolean
  /** See other members’ medications, doses and adherence. */
  viewOthersMedications: boolean
  /** Mark a dose taken / skipped / snoozed. */
  markDoses: boolean
  /** Add stock via the refill endpoint. */
  recordRefill: boolean
  /** Invite people into the circle (Senior: invite only). */
  inviteMembers: boolean
  /** Change member roles, remove members, edit circle settings. */
  manageCareCircle: boolean
  /** See the member list at all. */
  viewMembers: boolean
  /** Acknowledge / resolve / cancel an emergency alert. */
  respondToEmergencies: boolean
  /** Raise an emergency alert for the active circle. */
  raiseEmergency: boolean
  /** Create own appointments, and edit shared ones when allowed. */
  manageOwnAppointments: boolean
  /** Edit appointments created by another member. */
  manageOthersAppointments: boolean
}

export function capabilitiesFor({ role }: CapabilityInput): Capabilities {
  const inviteGrant = grantFor(role, 'manage_care_circle')
  const canManageCircle = inviteGrant === 'yes'
  const canInvite = canManageCircle || inviteGrant === 'invite_only'
  const canViewOthers = allows(role, 'view_senior_medications')

  return {
    createOwnMedication: allows(role, 'manage_own_medications'),
    viewOthersMedications: canViewOthers,
    markDoses: allows(role, 'mark_doses_taken'),
    recordRefill: allows(role, 'mark_doses_taken') || grantFor(role, 'edit_senior_medications') === 'yes',
    inviteMembers: canInvite,
    manageCareCircle: canManageCircle,
    // Anyone can see who has access to their own circle (PRD §5.3); caregivers
    // see the member list because they can already see the senior's records.
    viewMembers: canInvite || canViewOthers || grantFor(role, 'edit_senior_medications') !== 'no',
    respondToEmergencies: allows(role, 'emergency_contact'),
    // PRD §5.5/§13: every member can request help for their circle.
    raiseEmergency: role !== null && role !== undefined,
    manageOwnAppointments: allows(role, 'manage_own_medications'),
    manageOthersAppointments: grantFor(role, 'edit_senior_medications') === 'yes',
  }
}

/**
 * Whether the signed-in user may edit a specific medication.
 * Own medications follow `manage_own_medications`; someone else's follow
 * `edit_senior_medications` — the Senior’s `limited` grant covers only their
 * own medications, so it never widens access to a third party’s record.
 */
export function canEditMedication(
  input: CapabilityInput,
  medication: { owner: { id: number } },
): boolean {
  if (input.currentUserId != null && medication.owner.id === input.currentUserId) {
    return allows(input.role, 'manage_own_medications')
  }
  return grantFor(input.role, 'edit_senior_medications') === 'yes'
}

/* ------------------------------------------------------------------ */
/* Platform operator (PRD §3 landlord console)                        */
/* ------------------------------------------------------------------ */

/**
 * The operator console exists for `platform.admin` tokens only. The flag comes
 * from the API — it is never inferred from an email address or a role.
 */
export function isPlatformAdmin(user: User | null | undefined): boolean {
  return user?.is_platform_admin === true
}
