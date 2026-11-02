import type { BadgeTone } from '../../components/ui/Badge'
import type { EmergencyStatus, EmergencyType } from '../../lib/types'

export const EMERGENCY_TYPE_LABELS: Record<EmergencyType, string> = {
  medical: 'Medical emergency',
  fall: 'Fall',
  heart_attack: 'Heart-attack symptoms',
  severe_symptoms: 'Severe symptoms',
  other: 'Something else',
}

export const EMERGENCY_TYPE_HELP: Record<EmergencyType, string> = {
  medical: 'Notifies the whole care circle with the alert type “medical”.',
  fall: 'Notifies the circle that a fall happened.',
  heart_attack: 'Notifies the circle with the highest urgency label.',
  severe_symptoms: 'Use when symptoms are severe enough that someone should know now.',
  other: 'Anything else the circle should respond to.',
}

export const EMERGENCY_TYPE_ORDER: EmergencyType[] = [
  'medical',
  'fall',
  'heart_attack',
  'severe_symptoms',
  'other',
]

export const EMERGENCY_STATUS_LABELS: Record<EmergencyStatus, string> = {
  open: 'Waiting for acknowledgement',
  acknowledged: 'Acknowledged',
  resolved: 'Resolved',
  cancelled: 'Cancelled',
}

export const EMERGENCY_STATUS_TONES: Record<EmergencyStatus, BadgeTone> = {
  open: 'danger',
  acknowledged: 'warn',
  resolved: 'ok',
  cancelled: 'neutral',
}

export function isActiveAlert(status: EmergencyStatus): boolean {
  return status === 'open' || status === 'acknowledged'
}
