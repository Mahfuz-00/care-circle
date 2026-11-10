import { useState } from 'react'
import { CheckCircle, RefreshCw, Trash2 } from 'lucide-react'

import { Badge } from '../../components/ui/Badge'
import type { BadgeTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { EmptyState, ErrorState, SkeletonList } from '../../components/ui/states'
import { formatDateTime } from '../../lib/format'
import type { HealthStatus } from '../../lib/types'
import { useClearSystemCache, useSystemHealth } from './hooks'

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
  const clearCacheMutation = useClearSystemCache()
  const [notice, setNotice] = useState<string | null>(null)

  const handleClearCache = async () => {
    if (!window.confirm('Flush runtime application and health telemetry cache?')) return
    try {
      const res = await clearCacheMutation.mutateAsync()
      setNotice(res.message)
      setTimeout(() => setNotice(null), 4000)
    } catch (err) {
      alert('Failed to clear cache: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  return (
    <div className="space-y-4">
      {notice && (
        <div className="flex items-center gap-2 rounded-xl bg-ok-50 border border-ok-200 p-4 text-xs font-semibold text-ok-700 shadow-xs">
          <CheckCircle className="size-4" />
          <span>{notice}</span>
        </div>
      )}

      <Card>
        <CardHeader
          title="System health"
          description="Every check the API reported, with the time it was measured. Nothing is shown green that was not measured."
          actions={
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleClearCache}
                disabled={clearCacheMutation.isPending}
              >
                <Trash2 className="size-3.5" />
                <span>{clearCacheMutation.isPending ? 'Clearing...' : 'Clear Cache'}</span>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void health.refetch()}
                disabled={health.isFetching}
              >
                <RefreshCw className={`size-3.5 ${health.isFetching ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          }
        />
        <CardBody>
          {health.isPending ? <SkeletonList label="Loading health checks…" rows={4} /> : null}
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
                              Measured <time dateTime={check.measured_at} className="tabular-nums">{measuredAt}</time>
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
    </div>
  )
}
