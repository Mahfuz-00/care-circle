import { useId, useState } from 'react'

import { Button } from '../../components/ui/Button'
import { CheckboxField, CheckboxGroup, SelectField, TextField } from '../../components/ui/Field'
import { ErrorState } from '../../components/ui/states'
import { toApiError } from '../../lib/api'
import type { MedicationPayload } from '../../lib/types'
import {
  FREQUENCY_OPTIONS,
  MEDICATION_FORM_OPTIONS,
  WEEKDAY_OPTIONS,
  emptyMedicationForm,
  formToPayload,
  validateMedicationForm,
} from './options'
import type { MedicationFormState } from './options'

/**
 * Medication editor. `mode` only changes the copy and whether the active flag is
 * offered — the payload is the same shape the API documents.
 */
export function MedicationForm({
  mode,
  initial,
  submitting,
  error,
  onSubmit,
  onCancel,
}: {
  mode: 'create' | 'edit'
  initial?: MedicationFormState
  submitting: boolean
  error: unknown
  onSubmit: (payload: MedicationPayload) => void
  onCancel?: () => void
}) {
  const baseId = useId()
  const [form, setForm] = useState<MedicationFormState>(initial ?? emptyMedicationForm())
  const [touched, setTouched] = useState(false)

  const clientErrors = validateMedicationForm(form)
  const apiError = error ? toApiError(error) : null

  function update<K extends keyof MedicationFormState>(key: K, value: MedicationFormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  function fieldError(field: string): string | undefined {
    if (apiError?.fieldError(field)) return apiError.fieldError(field)
    if (touched && clientErrors[field]) return clientErrors[field]
    return undefined
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    if (Object.keys(clientErrors).length > 0) return
    onSubmit(formToPayload(form))
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {apiError ? <ErrorState error={apiError} title="The API rejected this medication" /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={`${baseId}-name`}
          label="Medication name"
          required
          value={form.name}
          onChange={(event) => update('name', event.target.value)}
          error={fieldError('name')}
        />
        <TextField
          id={`${baseId}-dosage`}
          label="Dosage"
          required
          placeholder="e.g. 10 mg"
          value={form.dosage}
          onChange={(event) => update('dosage', event.target.value)}
          error={fieldError('dosage')}
        />
        <SelectField
          id={`${baseId}-form`}
          label="Form"
          required
          options={MEDICATION_FORM_OPTIONS}
          value={form.form}
          onChange={(event) => update('form', event.target.value)}
          error={fieldError('form')}
        />
        <SelectField
          id={`${baseId}-frequency`}
          label="Frequency"
          required
          options={FREQUENCY_OPTIONS}
          value={form.frequency}
          onChange={(event) => update('frequency', event.target.value as MedicationFormState['frequency'])}
          error={fieldError('frequency')}
        />
      </div>

      <fieldset className="rounded-lg border border-cream-300 px-3 py-3">
        <legend className="px-1 text-base font-medium text-ink-900">Reminder times</legend>
        <p className="text-sm text-ink-500">
          {form.frequency === 'as_needed'
            ? 'As-needed medications are recorded without fixed reminder times.'
            : 'Each time is a reminder slot in the care circle’s timezone.'}
        </p>

        <div className="mt-3 space-y-2">
          {form.times.map((time, index) => (
            <div key={`${baseId}-time-${index}`} className="flex flex-wrap items-end gap-2">
              <div className="min-w-40 flex-1">
                <TextField
                  id={`${baseId}-time-${index}`}
                  label={`Time ${index + 1}`}
                  type="time"
                  value={time}
                  onChange={(event) => {
                    const next = form.times.slice()
                    next[index] = event.target.value
                    update('times', next)
                  }}
                />
              </div>
              {form.times.length > 1 ? (
                <Button
                  variant="secondary"
                  onClick={() => update('times', form.times.filter((_, i) => i !== index))}
                >
                  Remove time {index + 1}
                </Button>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-3">
          <Button variant="secondary" onClick={() => update('times', [...form.times, '20:00'])}>
            Add another time
          </Button>
        </div>

        {fieldError('times') ? (
          <p role="alert" className="mt-2 text-sm font-medium text-danger-600">
            {fieldError('times')}
          </p>
        ) : null}
      </fieldset>

      {form.frequency === 'specific_weekdays' ? (
        <CheckboxGroup legend="Days of the week" id={`${baseId}-days`} hint="Pick every day this medication is due.">
          {WEEKDAY_OPTIONS.map((day) => (
            <CheckboxField
              key={day.value}
              id={`${baseId}-day-${day.value}`}
              label={day.label}
              checked={form.days_of_week.includes(day.value)}
              onChange={(event) => {
                const next = event.target.checked
                  ? [...form.days_of_week, day.value]
                  : form.days_of_week.filter((value) => value !== day.value)
                update('days_of_week', next)
              }}
            />
          ))}
          {fieldError('days_of_week') ? (
            <p role="alert" className="text-sm font-medium text-danger-600 sm:col-span-2">
              {fieldError('days_of_week')}
            </p>
          ) : null}
        </CheckboxGroup>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          id={`${baseId}-stock`}
          label="Stock on hand"
          type="number"
          inputMode="numeric"
          min={0}
          value={form.stock_quantity}
          onChange={(event) => update('stock_quantity', event.target.value)}
          error={fieldError('stock_quantity')}
          hint="Units currently in the container."
        />
        <TextField
          id={`${baseId}-units`}
          label="Units per dose"
          type="number"
          inputMode="numeric"
          min={1}
          required
          value={form.units_per_dose}
          onChange={(event) => update('units_per_dose', event.target.value)}
          error={fieldError('units_per_dose')}
        />
        <TextField
          id={`${baseId}-threshold`}
          label="Low-stock threshold"
          type="number"
          inputMode="numeric"
          min={0}
          value={form.low_stock_threshold}
          onChange={(event) => update('low_stock_threshold', event.target.value)}
          error={fieldError('low_stock_threshold')}
          hint="The API raises a low-stock event at or below this."
        />
      </div>

      <div className="grid gap-3">
        <CheckboxField
          id={`${baseId}-with-food`}
          label="Take with food"
          checked={form.with_food}
          onChange={(event) => update('with_food', event.target.checked)}
        />
        <CheckboxField
          id={`${baseId}-high-priority`}
          label="High priority (escalation is allowed for this medication)"
          hint="Escalation is still server-enforced and never runs inside quiet hours (PRD §7)."
          checked={form.is_high_priority}
          onChange={(event) => update('is_high_priority', event.target.checked)}
        />
        {mode === 'edit' ? (
          <CheckboxField
            id={`${baseId}-active`}
            label="Active"
            hint="Unchecking keeps the record and its history but stops new reminders."
            checked={form.is_active}
            onChange={(event) => update('is_active', event.target.checked)}
          />
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={`${baseId}-pharmacy-name`}
          label="Pharmacy name"
          value={form.pharmacy_name}
          onChange={(event) => update('pharmacy_name', event.target.value)}
          error={fieldError('pharmacy_name')}
        />
        <TextField
          id={`${baseId}-pharmacy-phone`}
          label="Pharmacy phone"
          type="tel"
          value={form.pharmacy_phone}
          onChange={(event) => update('pharmacy_phone', event.target.value)}
          error={fieldError('pharmacy_phone')}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="lg" loading={submitting}>
          {mode === 'create' ? 'Save medication' : 'Save changes'}
        </Button>
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}
