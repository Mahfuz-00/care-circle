import type { ReactNode } from 'react'

import { ApiError, toApiError } from '../../lib/api'
import { Button } from './Button'

/**
 * Empty, loading, error and denied states.
 *
 * A missing value renders one of these — never a blank region and never an
 * invented placeholder like “N/A 0mg”. If the API did not return it, the UI
 * says so plainly.
 */

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 px-4 py-6 text-ink-500">
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-sage-500 border-t-transparent"
      />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
  tone = 'neutral',
}: {
  title: string
  description?: ReactNode
  action?: ReactNode
  tone?: 'neutral' | 'sage'
}) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-dashed px-5 py-8 text-center ${
        tone === 'sage' ? 'border-sage-300 bg-sage-50' : 'border-cream-300 bg-cream-100/60'
      }`}
    >
      <p className="text-base font-semibold text-ink-900">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-prose text-sm text-ink-500">{description}</p> : null}
      {action ? <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  )
}

export function ErrorState({
  error,
  title = 'That did not load',
  onRetry,
}: {
  error: unknown
  title?: string
  onRetry?: () => void
}) {
  const apiError = error instanceof ApiError ? error : toApiError(error)
  const fieldErrors = Object.entries(apiError.errors)

  return (
    <div role="alert" className="rounded-[var(--radius-card)] border border-danger-200 bg-danger-50 px-5 py-5">
      <p className="text-base font-semibold text-danger-700">{title}</p>
      <p className="mt-1 text-sm text-danger-700">{apiError.message}</p>
      {fieldErrors.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-danger-700">
          {fieldErrors.map(([field, messages]) => (
            <li key={field}>
              <span className="font-medium">{field}</span>: {messages.join(' ')}
            </li>
          ))}
        </ul>
      ) : null}
      {onRetry ? (
        <div className="mt-4">
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function AccessDenied({
  title = 'Not available for your role',
  description,
}: {
  title?: string
  description: ReactNode
}) {
  return (
    <div
      role="note"
      className="rounded-[var(--radius-card)] border border-warn-200 bg-warn-50 px-5 py-5"
      aria-live="polite"
    >
      <p className="text-base font-semibold text-warn-600">{title}</p>
      <p className="mt-1 max-w-prose text-sm text-warn-600">{description}</p>
    </div>
  )
}

export function InlineNotice({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warn' | 'danger' | 'ok'
  title?: string
  children: ReactNode
}) {
  const tones: Record<string, string> = {
    info: 'border-teal-200 bg-teal-50 text-teal-800',
    warn: 'border-warn-200 bg-warn-50 text-warn-600',
    danger: 'border-danger-200 bg-danger-50 text-danger-700',
    ok: 'border-ok-100 bg-ok-50 text-ok-600',
  }
  const role = tone === 'danger' || tone === 'warn' ? 'alert' : 'note'
  return (
    <div role={role} className={`rounded-[var(--radius-card)] border px-4 py-3 ${tones[tone]}`}>
      {title ? <p className="text-base font-semibold">{title}</p> : null}
      <div className={title ? 'mt-1 text-sm' : 'text-sm'}>{children}</div>
    </div>
  )
}

/** Renders a value the API returned, or an explicit “not recorded” marker. */
export function ValueOrEmpty({ value, label }: { value: ReactNode; label: string }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-ink-500 italic">Not recorded</span>
  }
  return (
    <>
      {value}
      <span className="sr-only"> {label}</span>
    </>
  )
}
