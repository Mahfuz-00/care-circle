import { useState } from 'react'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import { compareAscending, compareDescending, formatDateTime, isUpcoming } from '../../lib/format'
import type { Appointment, AppointmentPayload } from '../../lib/types'
import { useSession } from '../auth/useSession'
import { announce } from '../../stores/ui'
import { AppointmentForm } from './AppointmentForm'
import { appointmentToForm, describeReminders } from './options'
import { useAppointments, useCreateAppointment, useDeleteAppointment, useUpdateAppointment } from './hooks'

/**
 * Appointments for the active care circle.
 *
 * Note: the API resource does not expose an owner, so the dashboard cannot tell
 * “my appointment” from “a shared one”. Creation and editing are gated on the
 * role's `manage_own_medications` grant and the API remains the authority — a
 * refusal comes back as a readable 403 rather than a hidden control.
 */
export function AppointmentsPage() {
  const { capabilities } = useSession()
  const appointments = useAppointments()
  const create = useCreateAppointment()
  const update = useUpdateAppointment()
  const remove = useDeleteAppointment()

  const [mode, setMode] = useState<{ kind: 'none' | 'create' | 'edit'; id?: number }>({ kind: 'none' })

  const items = appointments.data ?? []
  // Partitioning keeps every record visible: anything whose start time is not in
  // the future lands in the past section, including unparseable timestamps.
  const upcoming = items
    .filter((item) => isUpcoming(item.starts_at))
    .sort((a, b) => compareAscending(a.starts_at, b.starts_at))
  const past = items
    .filter((item) => !isUpcoming(item.starts_at))
    .sort((a, b) => compareDescending(a.starts_at, b.starts_at))

  function submitCreate(payload: AppointmentPayload) {
    create.mutate(payload, {
      onSuccess: () => {
        announce('Appointment saved. Reminders are scheduled by the server.', 'success')
        setMode({ kind: 'none' })
      },
    })
  }

  function submitEdit(id: number, payload: AppointmentPayload) {
    update.mutate(
      { id, payload },
      {
        onSuccess: () => {
          announce('Appointment updated.', 'success')
          setMode({ kind: 'none' })
        },
      },
    )
  }

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Doctor, lab and procedure visits with the reminder lead times the circle asked for."
        actions={
          capabilities.manageOwnAppointments ? (
            <Button
              size="lg"
              aria-expanded={mode.kind === 'create'}
              onClick={() => setMode(mode.kind === 'create' ? { kind: 'none' } : { kind: 'create' })}
            >
              Add appointment
            </Button>
          ) : null
        }
      />

      {mode.kind === 'create' ? (
        <Card className="mb-6">
          <CardHeader title="New appointment" description="Shared appointments appear to every member of the circle." />
          <CardBody>
            <AppointmentForm
              mode="create"
              submitting={create.isPending}
              error={create.error}
              onSubmit={submitCreate}
              onCancel={() => setMode({ kind: 'none' })}
            />
          </CardBody>
        </Card>
      ) : null}

      {appointments.isPending ? <LoadingState label="Loading appointments…" /> : null}

      {appointments.isError ? (
        <ErrorState
          error={appointments.error}
          title="Appointments could not be loaded"
          onRetry={() => void appointments.refetch()}
        />
      ) : null}

      {appointments.isSuccess && items.length === 0 ? (
        <EmptyState
          title="No appointments recorded"
          description="Nothing has been scheduled in this care circle yet. Add the next visit so reminders are not left to memory."
          tone="sage"
        />
      ) : null}

      {appointments.isSuccess && items.length > 0 ? (
        <div className="space-y-6">
          <section aria-labelledby="appointments-upcoming">
            <h2 id="appointments-upcoming" className="mb-3 text-xl font-semibold text-ink-900">
              Upcoming
            </h2>
            {upcoming.length === 0 ? (
              <EmptyState title="Nothing upcoming" description="No appointment in this circle has a future start time." />
            ) : (
              <div className="space-y-3">
                {upcoming.map((appointment) => (
                  <AppointmentRow
                    key={appointment.id}
                    appointment={appointment}
                    editing={mode.kind === 'edit' && mode.id === appointment.id}
                    canEdit={capabilities.manageOwnAppointments}
                    submitting={update.isPending}
                    updateError={update.error}
                    deletePending={remove.isPending}
                    deleteError={remove.error}
                    onEdit={() => setMode({ kind: 'edit', id: appointment.id })}
                    onCancelEdit={() => setMode({ kind: 'none' })}
                    onSubmitEdit={(payload) => submitEdit(appointment.id, payload)}
                    onDelete={() =>
                      remove.mutate(appointment.id, { onSuccess: () => announce('Appointment removed.', 'info') })
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {past.length > 0 ? (
            <section aria-labelledby="appointments-past">
              <h2 id="appointments-past" className="mb-3 text-xl font-semibold text-ink-900">
                Past
              </h2>
              <div className="space-y-3">
                {past.map((appointment) => (
                  <AppointmentRow
                    key={appointment.id}
                    appointment={appointment}
                    editing={mode.kind === 'edit' && mode.id === appointment.id}
                    canEdit={capabilities.manageOwnAppointments}
                    submitting={update.isPending}
                    updateError={update.error}
                    deletePending={remove.isPending}
                    deleteError={remove.error}
                    onEdit={() => setMode({ kind: 'edit', id: appointment.id })}
                    onCancelEdit={() => setMode({ kind: 'none' })}
                    onSubmitEdit={(payload) => submitEdit(appointment.id, payload)}
                    onDelete={() =>
                      remove.mutate(appointment.id, { onSuccess: () => announce('Appointment removed.', 'info') })
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function AppointmentRow({
  appointment,
  editing,
  canEdit,
  submitting,
  updateError,
  deletePending,
  deleteError,
  onEdit,
  onCancelEdit,
  onSubmitEdit,
  onDelete,
}: {
  appointment: Appointment
  editing: boolean
  canEdit: boolean
  submitting: boolean
  updateError: unknown
  deletePending: boolean
  deleteError: unknown
  onEdit: () => void
  onCancelEdit: () => void
  onSubmitEdit: (payload: AppointmentPayload) => void
  onDelete: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const startsAt = formatDateTime(appointment.starts_at)

  return (
    <article
      className="rounded-[var(--radius-card)] border border-cream-300 bg-white px-4 py-4"
      aria-labelledby={`appointment-${appointment.id}-title`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={`appointment-${appointment.id}-title`} className="text-lg font-semibold text-ink-900">
            {appointment.title}
          </h3>
          <p className="text-base text-ink-700">
            {startsAt ? <time dateTime={appointment.starts_at}>{startsAt}</time> : 'Start time not returned'}
            {appointment.location ? ` · ${appointment.location}` : ' · location not recorded'}
          </p>
          <p className="mt-1 text-sm text-ink-500">
            Type: {appointment.type} · Reminders: {describeReminders(appointment.reminder_offsets)}
          </p>
          {appointment.notes ? <p className="mt-2 text-sm text-ink-700">{appointment.notes}</p> : null}
        </div>
        <Badge tone={appointment.shared_with_circle ? 'teal' : 'neutral'}>
          {appointment.shared_with_circle ? 'Shared with circle' : 'Private'}
        </Badge>
      </div>

      {canEdit && !editing ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={onEdit}>
            Edit<span className="sr-only"> {appointment.title}</span>
          </Button>
          {confirming ? (
            <span className="flex flex-wrap items-center gap-2">
              <Button variant="danger" loading={deletePending} onClick={onDelete}>
                Confirm removal
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                Keep it
              </Button>
            </span>
          ) : (
            <Button variant="ghost" onClick={() => setConfirming(true)}>
              Remove<span className="sr-only"> {appointment.title}</span>
            </Button>
          )}
        </div>
      ) : null}

      {deleteError && confirming ? (
        <div className="mt-3">
          <ErrorState error={deleteError} title="The appointment was not removed" />
        </div>
      ) : null}

      {editing ? (
        <div className="mt-4 border-t border-cream-200 pt-4">
          <AppointmentForm
            mode="edit"
            initial={appointmentToForm(appointment)}
            submitting={submitting}
            error={updateError}
            onSubmit={onSubmitEdit}
            onCancel={onCancelEdit}
          />
        </div>
      ) : null}
    </article>
  )
}
