import { useId, useState } from 'react'

import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { SelectField } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, SkeletonStats } from '../../components/ui/states'
import { daysAgo, formatNumber, formatPercent, toDateParam } from '../../lib/format'
import { useSession } from '../auth/useSession'
import { MemberSelector } from '../care-circle/MemberSelector'
import { useAdherence } from './hooks'

const RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

/** Adherence is the confirmation rate inside the scheduled window (PRD §10). */
export function AdherencePage() {
  const rangeId = useId()
  const { user, capabilities } = useSession()
  const [rangeDays, setRangeDays] = useState('30')
  const [userId, setUserId] = useState<number | null>(null)

  const from = toDateParam(daysAgo(Number(rangeDays)))
  const to = toDateParam(new Date())
  const adherence = useAdherence({ from, to, userId })

  const summary = adherence.data
  const viewingSelf = userId == null || userId === user?.id

  return (
    <div>
      <PageHeader
        title="Adherence"
        description="How many scheduled doses were confirmed, skipped or missed in the selected window. Reported exactly as the API calculates it."
      />

      <Card className="mb-6">
        <CardHeader title="Window" description={`${from} → ${to}`} />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="max-w-sm">
              <SelectField
                id={rangeId}
                label="Period"
                options={RANGE_OPTIONS}
                value={rangeDays}
                onChange={(event) => setRangeDays(event.target.value)}
              />
            </div>
            {capabilities.viewOthersMedications ? (
              <MemberSelector value={userId} onChange={setUserId} />
            ) : null}
          </div>
        </CardBody>
      </Card>

      {adherence.isPending ? <SkeletonStats label="Loading adherence…" /> : null}

      {adherence.isError ? (
        <ErrorState
          error={adherence.error}
          title="Adherence could not be loaded"
          onRetry={() => void adherence.refetch()}
        />
      ) : null}

      {adherence.isSuccess && !summary ? (
        <EmptyState
          title="No adherence figure returned"
          description="The API answered without a summary for this window. Nothing is displayed rather than a guessed number."
        />
      ) : null}

      {summary ? (
        <section aria-labelledby="adherence-summary" className="space-y-4">
          <h2 id="adherence-summary" className="text-xl font-semibold text-ink-900">
            {viewingSelf ? 'Your recorded doses' : 'Recorded doses for the selected member'}
          </h2>

          {summary.total === 0 ? (
            <EmptyState
              title="No doses in this window"
              description="There were no scheduled doses in the selected period, so there is no confirmation rate to show."
            />
          ) : (
            <>
              <div className="rounded-[var(--radius-card)] border border-sage-300 bg-sage-50 px-5 py-6">
                <p className="text-sm font-medium uppercase tracking-wide text-sage-700">Confirmed inside the window</p>
                <p className="mt-1 text-4xl font-semibold tabular-nums text-sage-800">
                  {formatPercent(summary.percentage) ?? 'Not returned'}
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  {formatNumber(summary.taken)} of {formatNumber(summary.total)} scheduled doses recorded as taken.
                </p>
              </div>

              <dl className="grid gap-4 sm:grid-cols-4">
                <Stat label="Taken" value={formatNumber(summary.taken)} tone="ok" />
                <Stat label="Skipped" value={formatNumber(summary.skipped)} tone="neutral" />
                <Stat label="Missed" value={formatNumber(summary.missed)} tone="danger" />
                <Stat label="Scheduled" value={formatNumber(summary.total)} tone="sage" />
              </dl>

              <p className="text-sm text-ink-500">
                A skipped dose is recorded with its reason and stops further escalation.
              </p>
            </>
          )}
        </section>
      ) : null}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string | null; tone: string }) {
  const tones: Record<string, string> = {
    ok: 'border-ok-100 bg-ok-50 text-ok-600',
    neutral: 'border-cream-300 bg-cream-100 text-ink-700',
    danger: 'border-danger-200 bg-danger-50 text-danger-700',
    sage: 'border-sage-200 bg-sage-50 text-sage-800',
  }

  return (
    <div className={`rounded-[var(--radius-card)] border px-4 py-4 ${tones[tone]}`}>
      <dt className="text-sm font-medium">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{value ?? 'Not returned'}</dd>
    </div>
  )
}
