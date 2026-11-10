import { useState } from 'react'
import { CheckCircle, RefreshCw, RotateCcw, Trash2 } from 'lucide-react'

import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { EmptyState, ErrorState, SkeletonList } from '../../components/ui/states'
import { formatDateTime } from '../../lib/format'
import type { FailedJob } from '../../lib/types'
import {
  useFailedJobs,
  useFlushFailedJobs,
  useRetryAllFailedJobs,
  useRetryFailedJob,
} from './hooks'

/** “What has failed in the background?” (PRD §10). */
export function FailedJobsPage() {
  const jobs = useFailedJobs()
  const items = jobs.data ?? []
  const retryMutation = useRetryFailedJob()
  const retryAllMutation = useRetryAllFailedJobs()
  const flushMutation = useFlushFailedJobs()
  const [notice, setNotice] = useState<string | null>(null)

  const handleRetryAll = async () => {
    if (!window.confirm(`Attempt retrying all ${items.length} failed jobs?`)) return
    try {
      const res = await retryAllMutation.mutateAsync()
      setNotice(res.message)
      setTimeout(() => setNotice(null), 4000)
    } catch (err) {
      alert('Retry all failed: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleFlushAll = async () => {
    if (!window.confirm('Permanently purge and flush all failed jobs from queue storage?')) return
    try {
      const res = await flushMutation.mutateAsync()
      setNotice(res.message)
      setTimeout(() => setNotice(null), 4000)
    } catch (err) {
      alert('Flush failed: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleRetrySingle = async (id: string | number) => {
    try {
      const res = await retryMutation.mutateAsync(id)
      setNotice(res.message)
      setTimeout(() => setNotice(null), 4000)
    } catch (err) {
      alert('Retry failed: ' + (err instanceof Error ? err.message : String(err)))
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
          title="Failed jobs"
          description="Queue jobs that exhausted their retries. The raw exception is shown unchanged."
          actions={
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleRetryAll}
                    disabled={retryAllMutation.isPending}
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Retry All</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleFlushAll}
                    disabled={flushMutation.isPending}
                  >
                    <Trash2 className="size-3.5" />
                    <span>Flush All</span>
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void jobs.refetch()}
                disabled={jobs.isFetching}
              >
                <RefreshCw className={`size-3.5 ${jobs.isFetching ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          }
        />
        <CardBody>
          {jobs.isPending ? <SkeletonList label="Loading failed jobs…" rows={3} /> : null}
          {jobs.isError ? (
            <ErrorState error={jobs.error} title="Failed jobs could not be loaded" onRetry={() => void jobs.refetch()} />
          ) : null}

          {jobs.isSuccess && items.length === 0 ? (
            <EmptyState
              title="No failed jobs"
              description="The API reported no failed background jobs. This is a measured result, not a default."
              tone="sage"
            />
          ) : null}

          {items.length > 0 ? (
            <ul className="space-y-3">
              {items.map((job) => (
                <JobRow
                  key={String(job.id)}
                  job={job}
                  onRetry={() => handleRetrySingle(job.id)}
                  isRetrying={retryMutation.isPending}
                />
              ))}
            </ul>
          ) : null}
        </CardBody>
      </Card>
    </div>
  )
}

function JobRow({
  job,
  onRetry,
  isRetrying,
}: {
  job: FailedJob
  onRetry: () => void
  isRetrying: boolean
}) {
  const failedAt = formatDateTime(job.failed_at ?? null)

  return (
    <li className="rounded-[var(--radius-card)] border border-danger-200 bg-danger-50 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold text-ink-900">{job.job ?? 'Job name not returned'}</p>
        <Button
          size="sm"
          variant="secondary"
          onClick={onRetry}
          disabled={isRetrying}
          className="text-teal-800"
        >
          <RotateCcw className="size-3" />
          <span>Retry Job</span>
        </Button>
      </div>
      <dl className="mt-1 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="text-ink-500">Queue:</dt>
          <dd className="text-ink-900">{job.queue ?? 'not returned'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-500">Failed at:</dt>
          <dd className="tabular-nums text-ink-900">
            {failedAt ?? <span className="italic text-ink-500">not returned</span>}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-500">Reference:</dt>
          <dd className="tabular-nums text-ink-900">{String(job.id)}</dd>
        </div>
      </dl>

      {job.exception ? (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm font-semibold text-danger-700">Show exception</summary>
          <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-danger-200 bg-white p-3 text-xs text-ink-900">
            {job.exception}
          </pre>
        </details>
      ) : (
        <p className="mt-2 text-sm italic text-ink-500">No exception detail returned by the API.</p>
      )}
    </li>
  )
}
