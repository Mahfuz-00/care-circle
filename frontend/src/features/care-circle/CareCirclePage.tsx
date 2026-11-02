import { useId, useState } from 'react'

import { RequirePermission } from '../../components/guards'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { TextField } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState } from '../../components/ui/states'
import { toApiError } from '../../lib/api'
import { useAuthStore } from '../../stores/auth'
import { announce } from '../../stores/ui'
import { useMe } from '../auth/hooks'
import { useSession } from '../auth/useSession'
import { CircleSettingsForm } from './CircleSettingsForm'
import { MembersPanel } from './MembersPanel'
import { useCreateCareCircle } from './hooks'

export function CareCirclePage() {
  const me = useMe()
  const { activeCareCircle, roleName } = useSession()

  if (!activeCareCircle) {
    return (
      <div>
        <PageHeader
          title="Care circle"
          description="A care circle groups the people who look after each other’s reminders and emergencies."
        />
        <CreateCirclePanel
          hasExistingCircles={(me.data?.care_circles?.length ?? 0) > 0}
          loading={me.isPending}
          error={me.error}
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={activeCareCircle.name}
        description={
          <>
            Timezone {activeCareCircle.timezone}. Your role in this circle is <strong>{roleName}</strong> — it decides
            what you can see and change below.
          </>
        }
        actions={<Badge tone="sage">Circle #{activeCareCircle.id}</Badge>}
      />

      <div className="space-y-6">
        <MembersPanel careCircleId={activeCareCircle.id} />
        <RequirePermission
          permission="manage_care_circle"
          description={
            activeCareCircle.quiet_hours_start || activeCareCircle.quiet_hours_end
              ? `Only a primary caregiver can change the circle’s name, timezone and quiet hours. Current quiet hours: ${activeCareCircle.quiet_hours_start ?? 'start not set'} → ${activeCareCircle.quiet_hours_end ?? 'end not set'}.`
              : 'Only a primary caregiver can change the circle’s name, timezone and quiet hours.'
          }
        >
          <CircleSettingsForm circle={activeCareCircle} />
        </RequirePermission>
      </div>
    </div>
  )
}

/**
 * Circle creation. The §6 matrix has no column for it — a new account needs at
 * least one circle to exist at all — so the API stays the authority on seats and
 * quotas (PRD §8) and its refusal is shown verbatim.
 */
function CreateCirclePanel({
  hasExistingCircles,
  loading,
  error,
}: {
  hasExistingCircles: boolean
  loading: boolean
  error: unknown
}) {
  const baseId = useId()
  const create = useCreateCareCircle()
  const setActiveCareCircle = useAuthStore((state) => state.setActiveCareCircle)
  const [name, setName] = useState('')
  const [timezone, setTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    } catch {
      return 'UTC'
    }
  })

  const apiError = create.error ? toApiError(create.error) : null

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    create.mutate(
      { name: name.trim(), timezone: timezone.trim() },
      {
        onSuccess: (circle) => {
          if (circle) setActiveCareCircle(circle)
          announce('Care circle created.', 'success')
        },
      },
    )
  }

  return (
    <Card>
      <CardHeader
        title="Create a care circle"
        description="Everyone who should see these reminders joins this circle."
      />
      <CardBody>
        {error ? <ErrorState error={error} title="Your circles could not be loaded" /> : null}

        {!loading && hasExistingCircles ? (
          <div className="mb-5">
            <EmptyState
              title="No circle is selected"
              description="Your account has care circles, but none is active. Choose one from the switcher in the header."
            />
          </div>
        ) : null}

        <form onSubmit={submit} className="space-y-4" noValidate>
          {apiError ? <ErrorState error={apiError} title="The care circle was not created" /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`${baseId}-circle-name`}
              label="Care circle name"
              required
              placeholder="e.g. Mum’s circle"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={apiError?.fieldError('name')}
            />
            <TextField
              id={`${baseId}-circle-timezone`}
              label="Timezone"
              required
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              error={apiError?.fieldError('timezone')}
            />
          </div>

          <Button type="submit" size="lg" loading={create.isPending}>
            Create care circle
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
