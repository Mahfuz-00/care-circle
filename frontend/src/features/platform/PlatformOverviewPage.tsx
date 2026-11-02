import { Link } from '@tanstack/react-router'

import { buttonClasses } from '../../components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import { formatDuration, formatNumber, formatPercent } from '../../lib/format'
import { usePlatformMetrics, useSystemHealth } from './hooks'

/**
 * Answers the PRD §10 questions that have a metric behind them. Every figure is
 * printed exactly as `/platform/metrics` returned it.
 */
export function PlatformOverviewPage() {
  const metrics = usePlatformMetrics()
  const health = useSystemHealth()

  const checks = health.data ?? []
  const failing = checks.filter((check) => check.status === 'fail')
  const warning = checks.filter((check) => check.status === 'warn')
  const skipped = checks.filter((check) => check.status === 'skipped')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Success measures"
          description="Adherence, refill coverage, emergency acknowledgement time, invitation acceptance and tenancy size."
        />
        <CardBody>
          {metrics.isPending ? <LoadingState label="Loading platform metrics…" /> : null}
          {metrics.isError ? (
            <ErrorState
              error={metrics.error}
              title="Metrics could not be loaded"
              onRetry={() => void metrics.refetch()}
            />
          ) : null}

          {metrics.data ? (
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Metric
                label="Medication confirmation rate"
                value={formatPercent(metrics.data.adherence_percentage)}
                hint="Percentage of scheduled doses recorded as taken (adherence reports)."
              />
              <Metric
                label="Low-stock refill rate"
                value={formatPercent(metrics.data.low_stock_refill_rate)}
                hint="Share of low-stock events that ended in a refill before zero."
              />
              <Metric
                label="Emergency acknowledgement time"
                value={formatDuration(metrics.data.emergency_ack_seconds)}
                hint="From alert raised to first caregiver acknowledgement."
              />
              <Metric
                label="Invitation acceptance rate"
                value={formatPercent(metrics.data.invitation_acceptance_rate)}
                hint="Caregiver invitations that were accepted."
              />
              <Metric label="Care circles" value={formatNumber(metrics.data.care_circles)} hint="Tenants on the platform." />
              <Metric label="Users" value={formatNumber(metrics.data.users)} hint="Accounts across all circles." />
            </dl>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="System health right now"
          description="Per-check status. Checks that could not run report “fail”; checks with no tooling report “skipped”."
          actions={
            <Link to="/platform/health" className={buttonClasses('secondary')}>
              All checks
            </Link>
          }
        />
        <CardBody>
          {health.isPending ? <LoadingState label="Loading health checks…" /> : null}
          {health.isError ? (
            <ErrorState error={health.error} title="Health checks could not be loaded" onRetry={() => void health.refetch()} />
          ) : null}

          {health.isSuccess ? (
            checks.length === 0 ? (
              <EmptyState
                title="No health checks returned"
                description="The API returned an empty health list. Nothing is green that was not measured, so nothing is shown."
              />
            ) : (
              <div className="space-y-2">
                <p className="text-base text-ink-700">
                  {formatNumber(checks.length)} checks · {formatNumber(failing.length)} failing ·{' '}
                  {formatNumber(warning.length)} warning · {formatNumber(skipped.length)} skipped
                </p>
                <ul className="space-y-2">
                  {(failing.length > 0 ? failing : checks.slice(0, 4)).map((check) => (
                    <li key={check.key} className="rounded-lg border border-cream-300 bg-cream-50 px-3 py-2 text-sm">
                      <span className="font-semibold text-ink-900">{check.key}</span> · {check.status} · {check.message}
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : null}
        </CardBody>
      </Card>
    </div>
  )
}

function Metric({ label, value, hint }: { label: string; value: string | null; hint: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-teal-200 bg-teal-50 px-4 py-4">
      <dt className="text-sm font-medium text-teal-800">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold text-teal-900">{value ?? 'Not returned'}</dd>
      <p className="mt-1 text-sm text-ink-500">{hint}</p>
    </div>
  )
}
