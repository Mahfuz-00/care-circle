import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { EmptyState, ErrorState, SkeletonList } from '../../components/ui/states'
import { formatBytes, formatDateTime } from '../../lib/format'
import type { BackupEntry } from '../../lib/types'
import { useBackups } from './hooks'

/**
 * “Could we restore, and how much would we lose?” (PRD §10).
 *
 * `GET /platform/backups` does not document a fixed shape beyond an array, so
 * each row renders only the fields the API actually returned and says plainly
 * when a field is absent.
 */
export function BackupsPage() {
  const backups = useBackups()
  const items = backups.data ?? []

  const verified = items.filter((entry) => Boolean(entry.verified_at))
  const newestVerified = verified
    .slice()
    .sort((a, b) => new Date(b.verified_at ?? 0).getTime() - new Date(a.verified_at ?? 0).getTime())[0]

  return (
    <Card>
      <CardHeader
        title="Backups"
        description="Restore readiness and the newest verified dump. Backups without a dump tool report “skipped”."
      />
      <CardBody>
        {backups.isPending ? <SkeletonList label="Loading backups…" rows={3} /> : null}
        {backups.isError ? (
          <ErrorState error={backups.error} title="Backups could not be loaded" onRetry={() => void backups.refetch()} />
        ) : null}

        {backups.isSuccess ? (
          <p className="mb-4 text-base text-ink-700">
            {items.length === 0
              ? 'The API returned no backup records.'
              : `${items.length} backup record${items.length === 1 ? '' : 's'} · ${verified.length} verified.`}
            {newestVerified?.verified_at
              ? ` Newest verified dump: ${formatDateTime(newestVerified.verified_at) ?? 'time not returned'}.`
              : ' No verified dump is reported — treat restore readiness as unknown.'}
          </p>
        ) : null}

        {backups.isSuccess && items.length === 0 ? (
          <EmptyState
            title="No backups reported"
            description="An empty list means no backup was measured. Nothing here claims a restore point exists."
          />
        ) : null}

        {items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((entry) => (
              <BackupRow key={String(entry.id)} entry={entry} />
            ))}
          </ul>
        ) : null}
      </CardBody>
    </Card>
  )
}

function BackupRow({ entry }: { entry: BackupEntry }) {
  const createdAt = formatDateTime(entry.created_at ?? null)
  const verifiedAt = formatDateTime(entry.verified_at ?? null)
  const size = formatBytes(entry.size_bytes ?? null)

  return (
    <li className="rounded-[var(--radius-card)] border border-cream-300 bg-white px-4 py-3">
      <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        <Field label="Reference">{String(entry.id)}</Field>
        <Field label="Status">{entry.status ?? 'not returned'}</Field>
        <Field label="Created">
          {createdAt ?? <span className="italic text-ink-500">not returned</span>}
        </Field>
        <Field label="Verified">
          {verifiedAt ?? <span className="italic text-ink-500">not verified</span>}
        </Field>
        <Field label="Size">{size ?? <span className="italic text-ink-500">not returned</span>}</Field>
        <Field label="Location">{entry.path ?? <span className="italic text-ink-500">not returned</span>}</Field>
        {entry.message ? <Field label="Message">{entry.message}</Field> : null}
      </dl>
    </li>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="text-ink-500">{label}:</dt>
      <dd className="tabular-nums text-ink-900">{children}</dd>
    </div>
  )
}
