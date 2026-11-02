import { useId, useState } from 'react'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { TextAreaField, TextField } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, InlineNotice, LoadingState } from '../../components/ui/states'
import { formatDateTime, relativeFromNow } from '../../lib/format'
import type { EmergencyAlert, EmergencyPayload, EmergencyType } from '../../lib/types'
import { useSession } from '../auth/useSession'
import { useMembers } from '../care-circle/hooks'
import { announce } from '../../stores/ui'
import {
  EMERGENCY_STATUS_LABELS,
  EMERGENCY_STATUS_TONES,
  EMERGENCY_TYPE_HELP,
  EMERGENCY_TYPE_LABELS,
  EMERGENCY_TYPE_ORDER,
  isActiveAlert,
} from './options'
import { useAcknowledgeAlert, useCancelAlert, useEmergencyAlerts, useRaiseEmergency, useResolveAlert } from './hooks'

/**
 * Emergency surface. One deliberate press notifies the whole care circle.
 * CareCircle never gives medical advice — the copy says what the button does and
 * what to do if the situation is life-threatening.
 */
export function EmergencyPage() {
  const { user, capabilities, activeCareCircle } = useSession()
  const alerts = useEmergencyAlerts()

  const items = alerts.data ?? []
  const active = items.filter((alert) => isActiveAlert(alert.status))
  const closed = items.filter((alert) => !isActiveAlert(alert.status))

  return (
    <div>
      <PageHeader
        title="Emergency"
        description="One press tells your care circle that you need help. Escalation, quiet hours and call limits stay server-enforced (PRD §7)."
      />

      <RaiseEmergencyPanel />

      <div className="mt-8 space-y-6">
        <section aria-labelledby="emergency-active">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="emergency-active" className="text-xl font-semibold text-ink-900">
              Active alerts
            </h2>
            <Button variant="secondary" onClick={() => void alerts.refetch()} loading={alerts.isFetching}>
              Refresh
            </Button>
          </div>

          {alerts.isPending ? <LoadingState label="Loading alerts…" /> : null}

          {alerts.isError ? (
            <ErrorState error={alerts.error} title="Alerts could not be loaded" onRetry={() => void alerts.refetch()} />
          ) : null}

          {alerts.isSuccess && active.length === 0 ? (
            <EmptyState
              title="No alert is waiting for a response"
              description="When someone in this circle raises an alert it appears here until it is acknowledged, resolved or cancelled."
              tone="sage"
            />
          ) : null}

          <div className="space-y-3">
            {active.map((alert) => (
              <AlertCard key={alert.id} alert={alert} canRespond={capabilities.respondToEmergencies} isRaiser={alert.raised_by.id === user?.id} />
            ))}
          </div>
        </section>

        {alerts.isSuccess ? (
          <section aria-labelledby="emergency-history">
            <h2 id="emergency-history" className="mb-3 text-xl font-semibold text-ink-900">
              Alert history
            </h2>
            {closed.length === 0 ? (
              <EmptyState
                title="No closed alerts yet"
                description="Resolved and cancelled alerts are kept here as a record of what the circle responded to."
              />
            ) : (
              <div className="space-y-3">
                {closed.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} canRespond={capabilities.respondToEmergencies} isRaiser={alert.raised_by.id === user?.id} />
                ))}
              </div>
            )}
          </section>
        ) : null}

        <ContactPanel careCircleId={activeCareCircle?.id ?? null} />
      </div>
    </div>
  )
}

function RaiseEmergencyPanel() {
  const baseId = useId()
  const raise = useRaiseEmergency()
  const { activeCareCircle } = useSession()

  const [type, setType] = useState<EmergencyType>('medical')
  const [locationLabel, setLocationLabel] = useState('')
  const [note, setNote] = useState('')

  function send() {
    const payload: EmergencyPayload = {
      type,
      ...(locationLabel.trim() ? { location_label: locationLabel.trim() } : {}),
      ...(note.trim() ? { note: note.trim() } : {}),
    }
    raise.mutate(payload, {
      onSuccess: () => {
        announce('Alert sent to your care circle.', 'success')
        setNote('')
      },
    })
  }

  return (
    <Card
      className="border-danger-200 bg-danger-50"
      aria-labelledby="raise-emergency-heading"
    >
      <CardHeader
        id="raise-emergency-heading"
        title="I need help"
        description="Press the button once. Every member of the circle is notified with the type you picked."
      />
      <CardBody>
        {!activeCareCircle ? (
          <InlineNotice tone="warn" title="No active care circle">
            An alert notifies the members of your active care circle. Create or select a circle first.
          </InlineNotice>
        ) : null}

        <fieldset className="mt-1">
          <legend className="text-base font-medium text-ink-900">What is happening?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {EMERGENCY_TYPE_ORDER.map((option) => (
              <label
                key={option}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 ${
                  type === option ? 'border-danger-500 bg-white' : 'border-cream-300 bg-white/70'
                }`}
              >
                <input
                  type="radio"
                  name={`${baseId}-type`}
                  value={option}
                  checked={type === option}
                  onChange={() => setType(option)}
                  className="mt-1 size-5 accent-danger-600"
                />
                <span>
                  <span className="block text-base font-semibold text-ink-900">
                    {EMERGENCY_TYPE_LABELS[option]}
                  </span>
                  <span className="block text-sm text-ink-500">{EMERGENCY_TYPE_HELP[option]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField
            id={`${baseId}-location`}
            label="Where are you? (optional)"
            value={locationLabel}
            onChange={(event) => setLocationLabel(event.target.value)}
            hint="Sent with the alert, for example “kitchen, upstairs”."
          />
          <TextAreaField
            id={`${baseId}-note`}
            label="Anything the circle should know (optional)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        {raise.error ? (
          <div className="mt-4">
            <ErrorState error={raise.error} title="The alert was not sent" />
          </div>
        ) : null}

        <div className="mt-5">
          <Button
            variant="emergency"
            size="lg"
            loading={raise.isPending}
            disabled={!activeCareCircle}
            onClick={send}
            className="w-full text-xl sm:w-auto"
          >
            Send emergency alert now
          </Button>
        </div>

        <p className="mt-4 text-sm text-ink-700">
          CareCircle notifies your care circle and records the acknowledgement. It does not provide medical advice
          and does not dispatch emergency services — if this is life-threatening, call your local emergency number.
        </p>

        {raise.isSuccess && raise.data ? (
          <div className="mt-4">
            <InlineNotice tone="ok" title="Alert sent">
              The API created alert #{raise.data.id} with status “{EMERGENCY_STATUS_LABELS[raise.data.status]}”.
            </InlineNotice>
          </div>
        ) : null}
      </CardBody>
    </Card>
  )
}

function AlertCard({
  alert,
  canRespond,
  isRaiser,
}: {
  alert: EmergencyAlert
  canRespond: boolean
  isRaiser: boolean
}) {
  const acknowledge = useAcknowledgeAlert()
  const resolve = useResolveAlert()
  const cancel = useCancelAlert()

  const raisedAt = formatDateTime(alert.created_at)
  const raisedAgo = relativeFromNow(alert.created_at)
  const acknowledgedAt = formatDateTime(alert.acknowledged_at)
  const pending = acknowledge.isPending || resolve.isPending || cancel.isPending

  return (
    <article
      className={`rounded-[var(--radius-card)] border px-4 py-4 ${
        isActiveAlert(alert.status) ? 'border-danger-300 bg-white' : 'border-cream-300 bg-white'
      }`}
      aria-labelledby={`alert-${alert.id}-title`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={`alert-${alert.id}-title`} className="text-lg font-semibold text-ink-900">
            {EMERGENCY_TYPE_LABELS[alert.type] ?? alert.type}
            <span className="ml-2 text-base font-normal text-ink-500">raised by {alert.raised_by.name}</span>
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            {raisedAt ? <time dateTime={alert.created_at}>{raisedAt}</time> : 'Creation time not returned'}
            {raisedAgo ? ` · ${raisedAgo}` : ''}
          </p>
          <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm text-ink-700 sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="text-ink-500">Location:</dt>
              <dd>
                {alert.location_label ? (
                  alert.location_label
                ) : (
                  <span className="italic text-ink-500">Not provided</span>
                )}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-ink-500">Coordinates:</dt>
              <dd>
                {alert.latitude != null && alert.longitude != null ? (
                  `${alert.latitude}, ${alert.longitude}`
                ) : (
                  <span className="italic text-ink-500">Not provided</span>
                )}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-ink-500">Acknowledged by:</dt>
              <dd>
                {alert.acknowledged_by ? (
                  <>
                    {alert.acknowledged_by.name}
                    {acknowledgedAt ? ` · ${acknowledgedAt}` : ''}
                  </>
                ) : (
                  <span className="italic text-ink-500">No acknowledgement yet</span>
                )}
              </dd>
            </div>
            {alert.note ? (
              <div className="flex gap-2">
                <dt className="text-ink-500">Note:</dt>
                <dd>{alert.note}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <Badge tone={EMERGENCY_STATUS_TONES[alert.status]}>
          {EMERGENCY_STATUS_LABELS[alert.status] ?? alert.status}
        </Badge>
      </div>

      {isActiveAlert(alert.status) && (canRespond || isRaiser) ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {canRespond && alert.status === 'open' ? (
            <Button
              loading={acknowledge.isPending}
              disabled={pending}
              onClick={() =>
                acknowledge.mutate(alert.id, {
                  onSuccess: () => announce('Alert acknowledged.', 'success'),
                })
              }
            >
              Acknowledge<span className="sr-only"> alert #{alert.id}</span>
            </Button>
          ) : null}
          {canRespond ? (
            <Button
              variant="secondary"
              loading={resolve.isPending}
              disabled={pending}
              onClick={() =>
                resolve.mutate(alert.id, { onSuccess: () => announce('Alert resolved.', 'success') })
              }
            >
              Mark resolved<span className="sr-only"> alert #{alert.id}</span>
            </Button>
          ) : null}
          <Button
            variant="ghost"
            loading={cancel.isPending}
            disabled={pending}
            onClick={() => cancel.mutate(alert.id, { onSuccess: () => announce('Alert cancelled.', 'info') })}
          >
            Cancel alert<span className="sr-only"> #{alert.id}</span>
          </Button>
        </div>
      ) : null}

      {acknowledge.error || resolve.error || cancel.error ? (
        <div className="mt-4">
          <ErrorState
            error={acknowledge.error ?? resolve.error ?? cancel.error}
            title="That change did not save"
          />
        </div>
      ) : null}
    </article>
  )
}

/**
 * Who to reach. The API returns member names and emails (no phone numbers on
 * this resource), so the only reachable channel offered is email — nothing is
 * invented.
 */
function ContactPanel({ careCircleId }: { careCircleId: number | null }) {
  const { capabilities } = useSession()
  const members = useMembers(careCircleId, { enabled: capabilities.viewMembers })

  if (!capabilities.viewMembers) return null

  return (
    <section aria-labelledby="emergency-contacts">
      <h2 id="emergency-contacts" className="mb-3 text-xl font-semibold text-ink-900">
        Care circle contacts
      </h2>

      {members.isPending ? <LoadingState label="Loading contacts…" /> : null}

      {members.isError ? (
        <ErrorState error={members.error} title="Contacts could not be loaded" onRetry={() => void members.refetch()} />
      ) : null}

      {members.isSuccess && members.data.length === 0 ? (
        <EmptyState
          title="No contacts returned"
          description="The API returned an empty member list for this care circle."
        />
      ) : null}

      {members.isSuccess && members.data.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {members.data.map((member) => (
            <li key={member.id} className="rounded-[var(--radius-card)] border border-cream-300 bg-white px-4 py-3">
              <p className="text-base font-semibold text-ink-900">{member.user.name}</p>
              <p className="text-sm text-ink-500">{member.status}</p>
              <a
                href={`mailto:${member.user.email}`}
                className="mt-2 inline-block text-sm font-semibold text-teal-700 underline underline-offset-4"
              >
                Email {member.user.name}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-sm text-ink-500">
        Phone numbers are not part of this API resource, so no call button is shown here. Voice escalation is handled
        server-side by the escalation policy.
      </p>
    </section>
  )
}
