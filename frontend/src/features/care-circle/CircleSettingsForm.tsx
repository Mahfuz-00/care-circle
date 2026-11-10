import { useId, useState } from 'react'

import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { TextField } from '../../components/ui/Field'
import { ErrorState } from '../../components/ui/states'
import { toApiError } from '../../lib/api'
import type { CareCircle } from '../../lib/types'
import { useAuthStore } from '../../stores/auth'
import { announce } from '../../stores/ui'
import { useUpdateCareCircle } from './hooks'

function timeValue(value: string | null | undefined): string {
  if (!value) return ''
  return value.slice(0, 5)
}

/** Circle name, timezone and quiet hours — the window escalation must respect (PRD §7). */
export function CircleSettingsForm({ circle }: { circle: CareCircle }) {
  const baseId = useId()
  const update = useUpdateCareCircle(circle.id)
  const setActiveCareCircle = useAuthStore((state) => state.setActiveCareCircle)

  const [name, setName] = useState(circle.name)
  const [timezone, setTimezone] = useState(circle.timezone)
  const [quietStart, setQuietStart] = useState(timeValue(circle.quiet_hours_start))
  const [quietEnd, setQuietEnd] = useState(timeValue(circle.quiet_hours_end))

  const error = update.error ? toApiError(update.error) : null

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    update.mutate(
      {
        id: circle.id,
        payload: {
          name: name.trim(),
          timezone: timezone.trim(),
          ...(quietStart ? { quiet_hours_start: quietStart } : {}),
          ...(quietEnd ? { quiet_hours_end: quietEnd } : {}),
        },
      },
      {
        onSuccess: (updated) => {
          if (updated) setActiveCareCircle(updated)
          announce('Care circle settings saved.', 'success')
        },
      },
    )
  }

  return (
    <Card>
      <CardHeader
        title="Care circle settings"
        description="Quiet hours are never bypassed by escalation, however high the priority."
      />
      <CardBody>
        <form onSubmit={submit} className="space-y-4" noValidate>
          {error ? <ErrorState error={error} title="The settings were not saved" /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`${baseId}-name`}
              label="Care circle name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={error?.fieldError('name')}
            />
            <TextField
              id={`${baseId}-timezone`}
              label="Timezone"
              required
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              hint="Reminder slots are interpreted in this timezone."
              error={error?.fieldError('timezone')}
            />
            <TextField
              id={`${baseId}-quiet-start`}
              label="Quiet hours start"
              type="time"
              value={quietStart}
              onChange={(event) => setQuietStart(event.target.value)}
              error={error?.fieldError('quiet_hours_start')}
            />
            <TextField
              id={`${baseId}-quiet-end`}
              label="Quiet hours end"
              type="time"
              value={quietEnd}
              onChange={(event) => setQuietEnd(event.target.value)}
              error={error?.fieldError('quiet_hours_end')}
            />
          </div>

          {circle.quiet_hours_start || circle.quiet_hours_end ? (
            <p className="text-sm text-ink-500">
              Currently returned by the API:{' '}
              {circle.quiet_hours_start ? `from ${timeValue(circle.quiet_hours_start)}` : 'start not set'}
              {circle.quiet_hours_end ? ` until ${timeValue(circle.quiet_hours_end)}` : ' · end not set'}.
            </p>
          ) : (
            <p className="text-sm italic text-ink-500">No quiet hours are set for this circle yet.</p>
          )}

          <Button type="submit" loading={update.isPending}>
            Save settings
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
