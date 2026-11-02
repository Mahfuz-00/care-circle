import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { buttonClasses } from '../../components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { AccessDenied, ErrorState, LoadingState } from '../../components/ui/states'
import { formatNumber, formatWeekdays } from '../../lib/format'
import { canEditMedication } from '../../lib/permissions'
import type { MedicationPayload } from '../../lib/types'
import { useSession } from '../auth/useSession'
import { announce } from '../../stores/ui'
import { MedicationForm } from './MedicationForm'
import { RefillForm } from './RefillForm'
import { describeSchedule, medicationToForm } from './options'
import { useDeleteMedication, useMedication, useUpdateMedication } from './hooks'

/** Medication detail: live values from `GET /medications/{id}`, plus edit, refill and retire. */
export function MedicationDetailPage({ medicationId }: { medicationId: number }) {
  const navigate = useNavigate()
  const { user } = useSession()
  const medication = useMedication(medicationId)
  const update = useUpdateMedication(medicationId)
  const remove = useDeleteMedication()

  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (!Number.isFinite(medicationId)) {
    return <ErrorState error={new Error('That medication id is not a number.')} title="Invalid medication link" />
  }

  if (medication.isPending) return <LoadingState label="Loading medication…" />

  if (medication.isError) {
    return (
      <ErrorState
        error={medication.error}
        title="That medication could not be loaded"
        onRetry={() => void medication.refetch()}
      />
    )
  }

  const record = medication.data
  const editable = canEditMedication({ role: user?.role, currentUserId: user?.id }, record)

  function submit(payload: MedicationPayload) {
    update.mutate(payload, {
      onSuccess: () => {
        announce('Medication updated.', 'success')
        setMode('view')
      },
    })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={record.name}
        description={`${record.dosage} · ${describeSchedule(record)}`}
        actions={
          <>
            <Link to="/medications" className={buttonClasses('secondary')}>
              Back to medications
            </Link>
            {editable && mode === 'view' ? (
              <Button onClick={() => setMode('edit')}>
                Edit<span className="sr-only"> {record.name}</span>
              </Button>
            ) : null}
          </>
        }
      />

      {mode === 'view' ? (
        <>
          <Card className="mb-5">
            <CardHeader title="Record" description="Every value below is returned by the API for this medication." />
            <CardBody>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DetailRow label="Owner" value={record.owner.name} />
                <DetailRow label="Form" value={record.form} />
                <DetailRow
                  label="Frequency"
                  value={record.frequency.replaceAll('_', ' ')}
                />
                <DetailRow
                  label="Times"
                  value={record.times.length > 0 ? record.times.join(', ') : 'none returned'}
                />
                <DetailRow
                  label="Weekdays"
                  value={formatWeekdays(record.days_of_week) ?? 'not restricted to weekdays'}
                />
                <DetailRow label="With food" value={record.with_food ? 'yes' : 'no'} />
                <DetailRow label="High priority" value={record.is_high_priority ? 'yes' : 'no'} />
                <DetailRow
                  label="Stock on hand"
                  value={formatNumber(record.stock_quantity) ? `${formatNumber(record.stock_quantity)} units` : 'not returned'}
                />
                <DetailRow label="Units per dose" value={String(record.units_per_dose)} />
                <DetailRow
                  label="Days remaining"
                  value={formatNumber(record.days_remaining) ? `${formatNumber(record.days_remaining)} days` : 'not calculated'}
                />
                <DetailRow
                  label="Low-stock threshold"
                  value={formatNumber(record.low_stock_threshold) ?? 'not set'}
                />
                <DetailRow label="Pharmacy" value={record.pharmacy_name ?? 'not recorded'} />
                <DetailRow label="Pharmacy phone" value={record.pharmacy_phone ?? 'not recorded'} />
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                {record.is_low_stock ? <Badge tone="danger">Low stock</Badge> : null}
                {record.is_high_priority ? <Badge tone="warn">High priority</Badge> : null}
                <Badge tone={record.is_active ? 'ok' : 'neutral'}>{record.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
            </CardBody>
          </Card>

          {editable ? (
            <Card className="mb-5">
              <CardHeader
                title="Record a refill"
                description="Stock changes are recomputed by the API. Days remaining is never estimated here."
              />
              <CardBody>
                <RefillForm medicationId={record.id} onDone={() => undefined} />
              </CardBody>
            </Card>
          ) : null}

          {editable ? (
            <Card>
              <CardHeader title="Retire this medication" description="History stays; no new doses are scheduled." />
              <CardBody>
                {confirmingDelete ? (
                  <div className="space-y-3" role="alert">
                    <p className="text-base text-ink-700">
                      Remove <strong>{record.name}</strong> from the medication list?
                    </p>
                    {remove.error ? <ErrorState error={remove.error} title="The medication was not removed" /> : null}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="danger"
                        loading={remove.isPending}
                        onClick={() => {
                          remove.mutate(record.id, {
                            onSuccess: () => {
                              announce(`${record.name} removed.`, 'info')
                              void navigate({ to: '/medications' })
                            },
                          })
                        }}
                      >
                        Yes, remove it
                      </Button>
                      <Button variant="ghost" onClick={() => setConfirmingDelete(false)}>
                        Keep it
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
                    Remove medication
                  </Button>
                )}
              </CardBody>
            </Card>
          ) : (
            <AccessDenied
              title="Your role cannot change this medication"
              description="Someone else’s medication can only be edited by a member whose role allows editing the circle’s medications."
            />
          )}
        </>
      ) : (
        <Card>
          <CardHeader title="Edit medication" description="Changes are validated by the API before they are stored." />
          <CardBody>
            <MedicationForm
              mode="edit"
              initial={medicationToForm(record)}
              submitting={update.isPending}
              error={update.error}
              onSubmit={submit}
              onCancel={() => setMode('view')}
            />
          </CardBody>
        </Card>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="text-base text-ink-900">{value}</dd>
    </div>
  )
}
