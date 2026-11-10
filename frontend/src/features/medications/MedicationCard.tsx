import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatNumber } from '../../lib/format'
import { canEditMedication } from '../../lib/permissions'
import type { Medication } from '../../lib/types'
import { useSession } from '../auth/useSession'
import { describeSchedule } from './options'
import { RefillForm } from './RefillForm'

/**
 * One medication, rendered only from fields the API returned. Stock lines are
 * shown exactly as computed server-side (`stock_quantity`, `days_remaining`).
 */
export function MedicationCard({ medication }: { medication: Medication }) {
  const { user, capabilities } = useSession()
  const [showRefill, setShowRefill] = useState(false)

  const editable = canEditMedication({ role: user?.role, currentUserId: user?.id }, medication)
  const canRefill = capabilities.recordRefill && editable
  const stock = formatNumber(medication.stock_quantity)
  const daysRemaining = formatNumber(medication.days_remaining)
  const threshold = formatNumber(medication.low_stock_threshold)

  return (
    <article
      className="rounded-[var(--radius-card)] border border-cream-300 bg-white px-4 py-4"
      aria-labelledby={`medication-${medication.id}-name`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={`medication-${medication.id}-name`} className="text-lg font-semibold text-ink-900">
            {medication.name}
          </h3>
          <p className="text-base text-ink-700">{medication.dosage}</p>
          <p className="mt-1 text-sm text-ink-500">{describeSchedule(medication)}</p>
          <p className="mt-1 text-sm text-ink-500">
            Form: {medication.form} · Owned by {medication.owner.name}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {medication.is_low_stock ? <Badge tone="danger">Low stock</Badge> : null}
          {medication.is_high_priority ? <Badge tone="warn">High priority</Badge> : null}
          {medication.is_active ? <Badge tone="ok">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}
        </div>
      </div>

      <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm text-ink-700 sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="text-ink-500">Stock on hand:</dt>
          <dd className="tabular-nums">
            {stock !== null ? `${stock} units` : <span className="italic text-ink-500">Not returned by the API</span>}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-500">Days remaining:</dt>
          <dd className="tabular-nums">
            {daysRemaining !== null ? (
              `${daysRemaining} days`
            ) : (
              <span className="italic text-ink-500">Not calculated</span>
            )}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-500">Units per dose:</dt>
          <dd className="tabular-nums">{formatNumber(medication.units_per_dose)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-ink-500">Low-stock threshold:</dt>
          <dd className="tabular-nums">{threshold !== null ? `${threshold} units` : <span className="italic text-ink-500">Not set</span>}</dd>
        </div>
      </dl>

      {medication.pharmacy_name || medication.pharmacy_phone ? (
        <p className="mt-3 text-sm text-ink-700">
          <span className="text-ink-500">Pharmacy: </span>
          {medication.pharmacy_name ?? 'Name not recorded'}
          {medication.pharmacy_phone ? (
            <>
              {' · '}
              <a href={`tel:${medication.pharmacy_phone}`} className="font-semibold text-teal-700 underline">
                Call {medication.pharmacy_phone}
              </a>
            </>
          ) : null}
        </p>
      ) : (
        <p className="mt-3 text-sm italic text-ink-500">No pharmacy recorded for this medication.</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to="/medications/$medicationId"
          params={{ medicationId: String(medication.id) }}
          className="inline-flex min-h-11 items-center rounded-lg border border-sage-300 bg-cream-100 px-4 py-2 font-semibold text-ink-900 hover:bg-cream-200"
        >
          View details<span className="sr-only"> for {medication.name}</span>
        </Link>
        {canRefill ? (
          <Button
            variant="secondary"
            aria-expanded={showRefill}
            onClick={() => setShowRefill((open) => !open)}
          >
            Record refill<span className="sr-only"> for {medication.name}</span>
          </Button>
        ) : null}
      </div>

      {showRefill ? <RefillForm medicationId={medication.id} onDone={() => setShowRefill(false)} /> : null}
    </article>
  )
}
