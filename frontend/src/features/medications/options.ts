import type { Medication, MedicationFrequency, MedicationPayload } from '../../lib/types'
import { WEEKDAY_LABELS, formatScheduleTime, formatWeekdays } from '../../lib/format'

export const FREQUENCY_LABELS: Record<MedicationFrequency, string> = {
  daily: 'Every day',
  specific_weekdays: 'Specific weekdays',
  every_other_day: 'Every other day',
  weekly: 'Weekly',
  as_needed: 'As needed',
}

export const FREQUENCY_OPTIONS = (
  Object.keys(FREQUENCY_LABELS) as MedicationFrequency[]
).map((value) => ({ value, label: FREQUENCY_LABELS[value] }))

export const MEDICATION_FORM_OPTIONS = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'liquid', label: 'Liquid' },
  { value: 'drops', label: 'Drops' },
  { value: 'injection', label: 'Injection' },
  { value: 'inhaler', label: 'Inhaler' },
  { value: 'patch', label: 'Patch' },
  { value: 'other', label: 'Other' },
]

export const WEEKDAY_OPTIONS = WEEKDAY_LABELS.map((label, index) => ({ value: index, label }))

/** Human summary of a medication's schedule, built only from returned fields. */
export function describeSchedule(medication: Medication): string {
  const parts: string[] = [FREQUENCY_LABELS[medication.frequency] ?? medication.frequency]

  if (medication.frequency === 'specific_weekdays') {
    const days = formatWeekdays(medication.days_of_week)
    parts.push(days ? `on ${days}` : 'no weekdays returned')
  }

  if (medication.times.length > 0) {
    parts.push(`at ${medication.times.map(formatScheduleTime).join(', ')}`)
  } else {
    parts.push('no times returned')
  }

  if (medication.with_food) parts.push('with food')

  return parts.join(' · ')
}

export interface MedicationFormState {
  name: string
  dosage: string
  form: string
  frequency: MedicationFrequency
  times: string[]
  days_of_week: number[]
  with_food: boolean
  is_high_priority: boolean
  stock_quantity: string
  units_per_dose: string
  low_stock_threshold: string
  pharmacy_name: string
  pharmacy_phone: string
  is_active: boolean
}

export function emptyMedicationForm(): MedicationFormState {
  return {
    name: '',
    dosage: '',
    form: 'tablet',
    frequency: 'daily',
    times: ['08:00'],
    days_of_week: [],
    with_food: false,
    is_high_priority: false,
    stock_quantity: '',
    units_per_dose: '1',
    low_stock_threshold: '',
    pharmacy_name: '',
    pharmacy_phone: '',
    is_active: true,
  }
}

export function medicationToForm(medication: Medication): MedicationFormState {
  return {
    name: medication.name,
    dosage: medication.dosage,
    form: medication.form,
    frequency: medication.frequency,
    times: medication.times.length > 0 ? medication.times : ['08:00'],
    days_of_week: medication.days_of_week,
    with_food: medication.with_food,
    is_high_priority: medication.is_high_priority,
    stock_quantity: String(medication.stock_quantity),
    units_per_dose: String(medication.units_per_dose),
    low_stock_threshold: String(medication.low_stock_threshold),
    pharmacy_name: medication.pharmacy_name ?? '',
    pharmacy_phone: medication.pharmacy_phone ?? '',
    is_active: medication.is_active,
  }
}

function toNumber(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formToPayload(state: MedicationFormState): MedicationPayload {
  return {
    name: state.name.trim(),
    dosage: state.dosage.trim(),
    form: state.form,
    frequency: state.frequency,
    times: state.times.map((time) => time.trim()).filter(Boolean),
    days_of_week: state.frequency === 'specific_weekdays' ? state.days_of_week : [],
    with_food: state.with_food,
    is_high_priority: state.is_high_priority,
    stock_quantity: toNumber(state.stock_quantity),
    units_per_dose: toNumber(state.units_per_dose),
    low_stock_threshold: toNumber(state.low_stock_threshold),
    ...(state.pharmacy_name.trim() ? { pharmacy_name: state.pharmacy_name.trim() } : {}),
    ...(state.pharmacy_phone.trim() ? { pharmacy_phone: state.pharmacy_phone.trim() } : {}),
    is_active: state.is_active,
  }
}

/** Client-side checks that mirror the API's required fields (the API is still the judge). */
export function validateMedicationForm(state: MedicationFormState): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!state.name.trim()) errors.name = 'A medication name is required.'
  if (!state.dosage.trim()) errors.dosage = 'A dosage is required, for example “10 mg”.'
  if (state.frequency !== 'as_needed' && state.times.filter((time) => time.trim()).length === 0) {
    errors.times = 'Add at least one time, or choose “as needed”.'
  }
  if (state.frequency === 'specific_weekdays' && state.days_of_week.length === 0) {
    errors.days_of_week = 'Choose at least one weekday.'
  }
  if (state.units_per_dose.trim() === '' || toNumber(state.units_per_dose) <= 0) {
    errors.units_per_dose = 'Units per dose must be greater than zero.'
  }
  return errors
}
