import { Badge } from '../../components/ui/Badge'
import type { BadgeTone } from '../../components/ui/Badge'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import { formatDateTime } from '../../lib/format'
import type { HealthStatus } from '../../lib/types'
import { useSystemHealth } from './hooks'

const STATUS_TONES: Record<HealthStatus, BadgeTone> = {
  ok: 'ok',
  warn: 'warn',
  fail: 'danger',
  skipped: 'neutral',
}

const STATUS_EXPLANATIONS: Record<HealthStatus, string> = {
  ok: 'Measured and healthy.',
  warn: 'Measured with a warning.',
  fail: 'Could not be measured or is failing — reported as fail.',
  skipped: 'Deliberately skipped: no tool configured for this check.',
}

export function SystemHealthPage() {
  const health = useSystemHealth()
  const checks = health.data ?? []

  return (
    <Card>
      <CardHeader
        title="System health"
        description="Every check the API reported, with the time it was measured. Nothing is shown green that was not measured."
      />
      <CardBody>
        {health.isPending ? <LoadingState label="Loading health checks…" /> : null}
        {health.isError ? (
          <ErrorState error={health.error} title="Health checks could not be loaded" onRetry={() => void health.refetch()} />
        ) : null}

        {health.isSuccess && checks.length === 0 ? (
          <EmptyState
            title="No checks returned"
            description="The platform reported no health checks. That is treated as unknown, not as healthy."
          />
        ) : null}

        {checks.length > 0 ? (
          <ul className="space-y-3">
            {checks.map((check) => {
              const measuredAt = formatDateTime(check.measured_at)
              return (
                <li key={check.key} className="rounded-[var(--radius-card)] border border-cream-300 bg-white px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-ink-900">{check.key}</p>
                      <p className="mt-1 text-sm text-ink-700">{check.message}</p>
                      <p className="mt-1 text-sm text-ink-500">
                        {measuredAt ? (
                          <>
                            Measured <time dateTime={check.measured_at}>{measuredAt}</time>
                          </>
                        ) : (
                          'Measurement time not returned by the API'
                        )}
                      </p>
                    </div>
                    <Badge tone={STATUS_TONES[check.status]}>{check.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-ink-500">{STATUS_EXPLANATIONS[check.status]}</p>
                </li>
              )
            })}
          </ul>
        ) : null}
      </CardBody>
    </Card>
  )
}
