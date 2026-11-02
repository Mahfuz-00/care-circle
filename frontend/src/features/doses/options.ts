import type { Dose, DoseStatus } from '../../lib/types'
import type { BadgeTone } from '../../components/ui/Badge'

export const DOSE_STATUS_LABELS: Record<DoseStatus, string> = {
  pending: 'Due',
  snoozed: 'Snoozed',
  taken: 'Taken',
  skipped: 'Skipped',
  missed: 'Missed',
}

export const DOSE_STATUS_TONES: Record<DoseStatus, BadgeTone> = {
  pending: 'warn',
  snoozed: 'teal',
  taken: 'ok',
  skipped: 'neutral',
  missed: 'danger',
}

/** `HH:MM` values used by the snooze control. */
export const SNOOZE_MINUTES = [5, 10, 15, 30, 60] as const

export function doseStatusLabel(status: DoseStatus): string {
  return DOSE_STATUS_LABELS[status] ?? status
}

export function isActionable(dose: Dose): boolean {
  return dose.status === 'pending' || dose.status === 'snoozed' || dose.status === 'missed'
}
