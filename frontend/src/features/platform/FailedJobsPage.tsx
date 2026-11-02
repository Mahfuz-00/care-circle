import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import { formatDateTime } from '../../lib/format'
import type { FailedJob } from '../../lib/types'
import { useFailedJobs } from './hooks'

/** “What has failed in the background?” (PRD §10). */
export function FailedJobsPage() {
  const jobs = useFailedJobs()
  const items = jobs.data ?? []

  return (
    <Card>
      <CardHeader
        title="Failed jobs"
        description="Queue jobs that exhausted their retries. The raw exception is shown unchanged."
      />
      <CardBody>
        {jobs.isPending ? <LoadingState label="Loading failed jobs…" /> : null}
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
              <JobRow key={String(job.id)} job={job} />
            ))}
          </ul>
        ) : null}
      </CardBody>
    </Card>
  )
}

function JobRow({ job }: { job: FailedJob }) {
  const failedAt = formatDateTime(job.failed_at ?? null)

  return (
    <li className="rounded-[var(--radius-card)] border border-danger-200 bg-danger-50 px-4 py-3">
      <p className="text-base font-semibold text-ink-900">{job.job ?? 'Job name not returned'}</p>
      <dl className="mt-1 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="text-ink-500">Queue:</dt>
          <dd className="text-ink-900">{job.queue ?? 'not returned'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-500">Failed at:</dt>
          <dd className="text-ink-900">
            {failedAt ?? <span className="italic text-ink-500">not returned</span>}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-500">Reference:</dt>
          <dd className="text-ink-900">{String(job.id)}</dd>
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
