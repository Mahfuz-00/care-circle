import type { Appointment, AppointmentPayload } from '../../lib/types'
import { formatDateTime, toDateTimeLocal } from '../../lib/format'

export const APPOINTMENT_TYPE_OPTIONS = [
  { value: 'doctor', label: 'Doctor visit' },
  { value: 'lab', label: 'Lab / blood test' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'therapy', label: 'Therapy' },
  { value: 'other', label: 'Other' },
]

/** Reminder lead times offered in the form; the server sends them. */
export const REMINDER_OFFSET_OPTIONS = [
  { value: 15, label: '15 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
  { value: 2880, label: '2 days before' },
]

export interface AppointmentFormState {
  title: string
  type: string
  location: string
  starts_at: string
  notes: string
  shared_with_circle: boolean
  reminder_offsets: number[]
}

export function emptyAppointmentForm(): AppointmentFormState {
  const start = new Date()
  start.setHours(start.getHours() + 24, 0, 0, 0)
  return {
    title: '',
    type: 'doctor',
    location: '',
    starts_at: toDateTimeLocal(start),
    notes: '',
    shared_with_circle: true,
    reminder_offsets: [60, 1440],
  }
}

export function appointmentToForm(appointment: Appointment): AppointmentFormState {
  const start = new Date(appointment.starts_at)
  return {
    title: appointment.title,
    type: appointment.type,
    location: appointment.location,
    starts_at: Number.isNaN(start.getTime()) ? '' : toDateTimeLocal(start),
    notes: appointment.notes ?? '',
    shared_with_circle: appointment.shared_with_circle,
    reminder_offsets: appointment.reminder_offsets,
  }
}

export function formToAppointmentPayload(state: AppointmentFormState): AppointmentPayload {
  const parsed = new Date(state.starts_at)
  return {
    title: state.title.trim(),
    type: state.type,
    location: state.location.trim(),
    starts_at: Number.isNaN(parsed.getTime()) ? state.starts_at : parsed.toISOString(),
    notes: state.notes.trim(),
    shared_with_circle: state.shared_with_circle,
    reminder_offsets: state.reminder_offsets,
  }
}

export function validateAppointmentForm(state: AppointmentFormState): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!state.title.trim()) errors.title = 'Give the appointment a title.'
  if (!state.starts_at.trim()) errors.starts_at = 'Choose the date and time.'
  else if (Number.isNaN(new Date(state.starts_at).getTime())) errors.starts_at = 'That date and time is not valid.'
  if (state.reminder_offsets.length === 0) {
    errors.reminder_offsets = 'Pick at least one reminder lead time.'
  }
  return errors
}

/** How the alert lead times read in a list (“1 hour before, 1 day before”). */
export function describeReminders(offsets: number[]): string {
  if (offsets.length === 0) return 'No reminders returned by the API'
  return offsets
    .slice()
    .sort((a, b) => a - b)
    .map((minutes) => {
      if (minutes % 1440 === 0) {
        const days = minutes / 1440
        return `${days} day${days === 1 ? '' : 's'} before`
      }
      if (minutes % 60 === 0) {
        const hours = minutes / 60
        return `${hours} hour${hours === 1 ? '' : 's'} before`
      }
      return `${minutes} minutes before`
    })
    .join(', ')
}

export function describeStartsAt(value: string): string {
  const formatted = formatDateTime(value)
  return formatted ?? 'Start time not returned by the API'
}
