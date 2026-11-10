import { useId, useState } from 'react'

import { Button } from '../../components/ui/Button'
import { CheckboxField, CheckboxGroup, SelectField, TextAreaField, TextField } from '../../components/ui/Field'
import { ErrorState } from '../../components/ui/states'
import { toApiError } from '../../lib/api'
import type { AppointmentPayload } from '../../lib/types'
import {
  APPOINTMENT_TYPE_OPTIONS,
  REMINDER_OFFSET_OPTIONS,
  emptyAppointmentForm,
  formToAppointmentPayload,
  validateAppointmentForm,
} from './options'
import type { AppointmentFormState } from './options'

export function AppointmentForm({
  mode,
  initial,
  submitting,
  error,
  onSubmit,
  onCancel,
}: {
  mode: 'create' | 'edit'
  initial?: AppointmentFormState
  submitting: boolean
  error: unknown
  onSubmit: (payload: AppointmentPayload) => void
  onCancel: () => void
}) {
  const baseId = useId()
  const [form, setForm] = useState<AppointmentFormState>(initial ?? emptyAppointmentForm())
  const [touched, setTouched] = useState(false)

  const clientErrors = validateAppointmentForm(form)
  const apiError = error ? toApiError(error) : null

  function update<K extends keyof AppointmentFormState>(key: K, value: AppointmentFormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  function fieldError(field: string): string | undefined {
    return apiError?.fieldError(field) ?? (touched ? clientErrors[field] : undefined)
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    if (Object.keys(clientErrors).length > 0) return
    onSubmit(formToAppointmentPayload(form))
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {apiError ? <ErrorState error={apiError} title="The API rejected this appointment" /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={`${baseId}-title`}
          label="Title"
          required
          placeholder="e.g. Cardiology follow-up"
          value={form.title}
          onChange={(event) => update('title', event.target.value)}
          error={fieldError('title')}
        />
        <SelectField
          id={`${baseId}-type`}
          label="Type"
          required
          options={APPOINTMENT_TYPE_OPTIONS}
          value={form.type}
          onChange={(event) => update('type', event.target.value)}
          error={fieldError('type')}
        />
        <TextField
          id={`${baseId}-starts-at`}
          label="Starts at"
          type="datetime-local"
          required
          value={form.starts_at}
          onChange={(event) => update('starts_at', event.target.value)}
          error={fieldError('starts_at')}
        />
        <TextField
          id={`${baseId}-location`}
          label="Location"
          value={form.location}
          onChange={(event) => update('location', event.target.value)}
          error={fieldError('location')}
        />
      </div>

      <TextAreaField
        id={`${baseId}-notes`}
        label="Notes"
        value={form.notes}
        onChange={(event) => update('notes', event.target.value)}
        hint="Anything the circle should bring or ask. CareCircle stores notes; it does not interpret them."
        error={fieldError('notes')}
      />

      <CheckboxGroup
        legend="Remind us"
        id={`${baseId}-reminders`}
        hint="The server schedules each reminder; nothing is sent outside the care circle."
      >
        {REMINDER_OFFSET_OPTIONS.map((option) => (
          <CheckboxField
            key={option.value}
            id={`${baseId}-reminder-${option.value}`}
            label={option.label}
            checked={form.reminder_offsets.includes(option.value)}
            onChange={(event) => {
              const next = event.target.checked
                ? [...form.reminder_offsets, option.value]
                : form.reminder_offsets.filter((value) => value !== option.value)
              update('reminder_offsets', next)
            }}
          />
        ))}
      </CheckboxGroup>
      {fieldError('reminder_offsets') ? (
        <p role="alert" className="text-sm font-medium text-danger-600">
          {fieldError('reminder_offsets')}
        </p>
      ) : null}

      <CheckboxField
        id={`${baseId}-shared`}
        label="Share with the care circle"
        hint="Unshared appointments stay visible only to your account."
        checked={form.shared_with_circle}
        onChange={(event) => update('shared_with_circle', event.target.checked)}
      />

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="lg" loading={submitting}>
          {mode === 'create' ? 'Save appointment' : 'Save changes'}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
