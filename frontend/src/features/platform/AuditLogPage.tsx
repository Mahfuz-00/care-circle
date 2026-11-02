import { useId, useState } from 'react'

import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { TextField } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import { formatDateTime } from '../../lib/format'
import type { AuditLogEntry } from '../../lib/types'
import { useSession } from '../auth/useSession'
import { useMe } from '../auth/hooks'
import { useAuditLog } from './hooks'

/**
 * Append-only privileged-action ledger (PRD §9). Read-only by design: there is no
 * delete or edit path, here or in the API.
 */
export function AuditLogPage() {
  const circleIdInput = useId()
  const { activeCareCircle } = useSession()
  const me = useMe()
  const [circleFilter, setCircleFilter] = useState<string>('')
  const audit = useAuditLog(circleFilter ? Number(circleFilter) : null)

  const circles = me.data?.care_circles ?? []
  const entries = audit.data ?? []

  return (
    <Card>
      <CardHeader
        title="Audit log"
        description="Actor, care circle, level and timestamp for every privileged action. Entries cannot be changed or removed."
      />
      <CardBody>
        <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,16rem)_auto] sm:items-end">
          <TextField
            id={circleIdInput}
            label="Filter by care circle id"
            type="number"
            inputMode="numeric"
            min={1}
            value={circleFilter}
            onChange={(event) => setCircleFilter(event.target.value)}
            hint={
              circles.length > 0
                ? `Your circles: ${circles.map((circle) => `${circle.name} (#${circle.id})`).join(', ')}`
                : 'Leave empty to read the full ledger.'
            }
          />
          <div className="flex flex-wrap gap-2">
            {activeCareCircle ? (
              <Button variant="secondary" onClick={() => setCircleFilter(String(activeCareCircle.id))}>
                Use active circle (#{activeCareCircle.id})
              </Button>
            ) : null}
            <Button variant="ghost" onClick={() => setCircleFilter('')}>
              Clear filter
            </Button>
          </div>
        </div>

        {audit.isPending ? <LoadingState label="Loading audit entries…" /> : null}
        {audit.isError ? (
          <ErrorState error={audit.error} title="The audit log could not be loaded" onRetry={() => void audit.refetch()} />
        ) : null}

        {audit.isSuccess && entries.length === 0 ? (
          <EmptyState
            title="No audit entries"
            description="The API returned no ledger entries for this filter. Tenant isolation returns zero rows rather than everything."
          />
        ) : null}

        {entries.length > 0 ? (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <EntryRow key={String(entry.id)} entry={entry} />
            ))}
          </ul>
        ) : null}
      </CardBody>
    </Card>
  )
}

function EntryRow({ entry }: { entry: AuditLogEntry }) {
  const createdAt = formatDateTime(entry.created_at ?? null)
  const payload = entry.payload ? JSON.stringify(entry.payload, null, 2) : null

  return (
    <li className="rounded-[var(--radius-card)] border border-cream-300 bg-white px-4 py-3">
      <p className="text-base font-semibold text-ink-900">{entry.action ?? 'Action not returned'}</p>
      <dl className="mt-1 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="text-ink-500">Actor:</dt>
          <dd className="text-ink-900">
            {entry.actor ? `${entry.actor.name} (#${entry.actor.id})` : 'system or not returned'}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-500">Care circle:</dt>
          <dd className="text-ink-900">{entry.care_circle_id ?? 'not returned'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-500">Level:</dt>
          <dd className="text-ink-900">{entry.level ?? 'not returned'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-500">IP:</dt>
          <dd className="text-ink-900">{entry.ip_address ?? 'not returned'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-500">When:</dt>
          <dd className="text-ink-900">
            {createdAt ?? <span className="italic text-ink-500">not returned</span>}
          </dd>
        </div>
      </dl>

      {payload ? (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm font-semibold text-teal-700">Show payload</summary>
          <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-cream-300 bg-cream-50 p-3 text-xs text-ink-900">
            {payload}
          </pre>
        </details>
      ) : null}
    </li>
  )
}
