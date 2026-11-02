import { useId, useState } from 'react'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { SelectField, TextAreaField } from '../../components/ui/Field'
import { ErrorState } from '../../components/ui/states'
import { formatTime } from '../../lib/format'
import type { Dose } from '../../lib/types'
import { useSession } from '../auth/useSession'
import { announce } from '../../stores/ui'
import { SNOOZE_MINUTES, DOSE_STATUS_LABELS, DOSE_STATUS_TONES, isActionable } from './options'
import { useSkipDose, useSnoozeDose, useTakeDose } from './hooks'

const SNOOZE_OPTIONS = SNOOZE_MINUTES.map((minutes) => ({
  value: String(minutes),
  label: `${minutes} minutes`,
}))

/**
 * One scheduled dose with the three recorded actions: take, skip (with reason)
 * and snooze. Every value shown comes straight from `Dose`.
 */
export function DoseCard({ dose }: { dose: Dose }) {
  const { capabilities } = useSession()
  const take = useTakeDose()
  const skip = useSkipDose()
  const snooze = useSnoozeDose()

  const [panel, setPanel] = useState<'none' | 'skip' | 'snooze'>('none')
  const [reason, setReason] = useState('')
  const [minutes, setMinutes] = useState<string>('15')

  const reasonId = useId()
  const minutesId = useId()

  const busy = take.isPending || skip.isPending || snooze.isPending
  const failure = take.error ?? skip.error ?? snooze.error
  const scheduledTime = formatTime(dose.scheduled_for)
  const takenAt = formatTime(dose.taken_at)

  function recordTaken() {
    take.mutate(
      { id: dose.id },
      { onSuccess: () => announce(`${dose.medication.name} recorded as taken.`, 'success') },
    )
  }

  function confirmSkip() {
    skip.mutate(
      { id: dose.id, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          announce(
            reason.trim()
              ? `${dose.medication.name} skipped. Reason recorded.`
              : `${dose.medication.name} skipped. No reason recorded.`,
            'info',
          )
          setPanel('none')
          setReason('')
        },
      },
    )
  }

  function confirmSnooze() {
    snooze.mutate(
      { id: dose.id, minutes: Number(minutes) },
      {
        onSuccess: () => {
          announce(`${dose.medication.name} snoozed for ${minutes} minutes.`, 'info')
          setPanel('none')
        },
      },
    )
  }

  return (
    <article
      className="rounded-[var(--radius-card)] border border-cream-300 bg-white px-4 py-4"
      aria-labelledby={`dose-${dose.id}-name`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={`dose-${dose.id}-name`} className="text-lg font-semibold text-ink-900">
            {dose.medication.name}
          </h3>
          <p className="text-base text-ink-500">{dose.medication.dosage}</p>
          <p className="mt-1 text-sm text-ink-500">
            {scheduledTime ? (
              <>
                Scheduled for <time dateTime={dose.scheduled_for}>{scheduledTime}</time>
              </>
            ) : (
              'Scheduled time not returned by the API'
            )}
            {dose.taken_at && takenAt ? (
              <>
                {' · '}
                Taken at <time dateTime={dose.taken_at}>{takenAt}</time>
                {dose.marked_by?.name ? `, recorded by ${dose.marked_by.name}` : ''}
              </>
            ) : null}
            {dose.skip_reason ? ` · Reason: ${dose.skip_reason}` : null}
          </p>
        </div>
        <Badge tone={DOSE_STATUS_TONES[dose.status]}>{DOSE_STATUS_LABELS[dose.status] ?? dose.status}</Badge>
      </div>

      {capabilities.markDoses && isActionable(dose) ? (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            <Button size="lg" loading={take.isPending} disabled={busy} onClick={recordTaken}>
              I took it
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              aria-expanded={panel === 'skip'}
              onClick={() => setPanel(panel === 'skip' ? 'none' : 'skip')}
            >
              Skip dose
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              aria-expanded={panel === 'snooze'}
              onClick={() => setPanel(panel === 'snooze' ? 'none' : 'snooze')}
            >
              Snooze
            </Button>
          </div>

          {panel === 'skip' ? (
            <div className="mt-3 rounded-lg border border-cream-300 bg-cream-50 px-3 py-3">
              <TextAreaField
                id={reasonId}
                label="Why is this dose being skipped?"
                hint="Recorded with the dose so the care circle can see the reason (PRD §7)."
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="danger" loading={skip.isPending} onClick={confirmSkip}>
                  Record skip
                </Button>
                <Button variant="ghost" onClick={() => setPanel('none')}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}

          {panel === 'snooze' ? (
            <div className="mt-3 rounded-lg border border-cream-300 bg-cream-50 px-3 py-3">
              <SelectField
                id={minutesId}
                label="Snooze for"
                options={SNOOZE_OPTIONS}
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button loading={snooze.isPending} onClick={confirmSnooze}>
                  Snooze dose
                </Button>
                <Button variant="ghost" onClick={() => setPanel('none')}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!capabilities.markDoses ? (
        <p className="mt-3 text-sm text-ink-500">
          Your role can see this dose but not record an outcome for it.
        </p>
      ) : null}

      {failure ? (
        <div className="mt-3">
          <ErrorState error={failure} title="That action did not save" />
        </div>
      ) : null}
    </article>
  )
}
