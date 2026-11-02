import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import { Badge } from '../../components/ui/Badge'
import { buttonClasses } from '../../components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, InlineNotice, LoadingState } from '../../components/ui/states'
import {
  compareAscending,
  daysAgo,
  formatDateTime,
  formatNumber,
  formatPercent,
  isUpcoming,
  toDateParam,
} from '../../lib/format'
import { useSession } from '../auth/useSession'
import { useAdherence } from '../adherence/hooks'
import { MemberSelector } from '../care-circle/MemberSelector'
import { TodayDoses } from '../doses/TodayDoses'
import { useAppointments } from '../appointments/hooks'
import { describeReminders } from '../appointments/options'
import { useEmergencyAlerts } from '../emergency/hooks'
import { EMERGENCY_STATUS_LABELS, EMERGENCY_TYPE_LABELS, isActiveAlert } from '../emergency/options'
import { useMedications } from '../medications/hooks'

/** The daily landing view: what is due, what is running out, what is next, what is urgent. */
export function DashboardPage() {
  const { user, capabilities, activeCareCircle, roleName } = useSession()
  const [viewingUserId, setViewingUserId] = useState<number | null>(null)
  const alerts = useEmergencyAlerts()
  const medications = useMedications()

  const activeAlerts = (alerts.data ?? []).filter((alert) => isActiveAlert(alert.status))
  const lowStock = (medications.data ?? []).filter((medication) => medication.is_low_stock)
  const viewingSelf = viewingUserId == null || viewingUserId === user?.id

  return (
    <div>
      <PageHeader
        title={user ? `Hello, ${user.name.split(' ')[0]}` : 'Dashboard'}
        description={
          activeCareCircle
            ? `${activeCareCircle.name} · timezone ${activeCareCircle.timezone} · signed in as ${roleName}`
            : 'No care circle is active yet.'
        }
        actions={
          <>
            <Link to="/emergency" className={buttonClasses('danger', 'lg')}>
              I need help
            </Link>
          </>
        }
      />

      {activeAlerts.length > 0 ? (
        <div className="mb-6">
          <InlineNotice tone="danger" title="An alert is open in this circle">
            <ul className="space-y-1">
              {activeAlerts.map((alert) => (
                <li key={alert.id}>
                  {EMERGENCY_TYPE_LABELS[alert.type] ?? alert.type} raised by {alert.raised_by.name} ·{' '}
                  {EMERGENCY_STATUS_LABELS[alert.status]}
                </li>
              ))}
            </ul>
            <p className="mt-2">
              <Link to="/emergency" className="font-semibold underline">
                Open the emergency page
              </Link>{' '}
              to acknowledge or resolve it.
            </p>
          </InlineNotice>
        </div>
      ) : null}

      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Today"
            description="Doses scheduled for today, taken straight from the API. Nothing is estimated here."
          />
          <CardBody>
            {capabilities.viewOthersMedications ? (
              <MemberSelector value={viewingUserId} onChange={setViewingUserId} />
            ) : (
              <p className="text-sm text-ink-500">
                Showing your own doses. Caregiver visibility of another member’s doses is not part of your role.
              </p>
            )}
          </CardBody>
        </Card>

        <TodayDoses
          userId={viewingUserId}
          heading={viewingSelf ? 'Your doses today' : 'Doses today for the selected member'}
          headingId="dashboard-doses"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <LowStockPanel
            loading={medications.isPending}
            error={medications.error}
            onRetry={() => void medications.refetch()}
            medications={lowStock}
          />
          <AdherencePanel userId={viewingUserId} />
        </div>

        <UpcomingAppointmentsPanel />
      </div>
    </div>
  )
}

function LowStockPanel({
  loading,
  error,
  onRetry,
  medications,
}: {
  loading: boolean
  error: unknown
  onRetry: () => void
  medications: Array<{ id: number; name: string; stock_quantity: number; days_remaining: number; low_stock_threshold: number }>
}) {
  return (
    <Card>
      <CardHeader
        title="Running low"
        description="Medications the API has flagged as low stock, with the days it calculated."
      />
      <CardBody>
        {loading ? <LoadingState label="Loading stock levels…" /> : null}
        {error ? <ErrorState error={error} title="Stock levels could not be loaded" onRetry={onRetry} /> : null}
        {!loading && !error && medications.length === 0 ? (
          <EmptyState
            title="No low-stock medication"
            description="Nothing in this circle is at or below its low-stock threshold right now."
            tone="sage"
          />
        ) : null}
        <ul className="space-y-3">
          {medications.map((medication) => (
            <li key={medication.id} className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-3">
              <p className="text-base font-semibold text-ink-900">{medication.name}</p>
              <p className="text-sm text-ink-700">
                {formatNumber(medication.stock_quantity)} units on hand · {formatNumber(medication.days_remaining)} days
                remaining · threshold {formatNumber(medication.low_stock_threshold)}
              </p>
              <Link
                to="/medications/$medicationId"
                params={{ medicationId: String(medication.id) }}
                className="mt-2 inline-block text-sm font-semibold text-teal-700 underline underline-offset-4"
              >
                Open {medication.name} to record a refill
              </Link>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}

function AdherencePanel({ userId }: { userId: number | null }) {
  const from = toDateParam(daysAgo(30))
  const to = toDateParam(new Date())
  const adherence = useAdherence({ from, to, userId })
  const summary = adherence.data

  return (
    <Card>
      <CardHeader
        title="Adherence, last 30 days"
        description={`Window ${from} → ${to}, exactly as reported by the adherence endpoint.`}
      />
      <CardBody>
        {adherence.isPending ? <LoadingState label="Loading adherence…" /> : null}
        {adherence.isError ? (
          <ErrorState error={adherence.error} title="Adherence could not be loaded" onRetry={() => void adherence.refetch()} />
        ) : null}
        {summary ? (
          summary.total === 0 ? (
            <EmptyState
              title="No doses in this window"
              description="There was nothing scheduled to confirm, so no rate is shown."
            />
          ) : (
            <div className="space-y-2">
              <p className="text-3xl font-semibold text-sage-800">
                {formatPercent(summary.percentage) ?? 'Not returned'}
              </p>
              <p className="text-sm text-ink-500">
                {formatNumber(summary.taken)} taken · {formatNumber(summary.skipped)} skipped ·{' '}
                {formatNumber(summary.missed)} missed · {formatNumber(summary.total)} scheduled
              </p>
              <Link to="/adherence" className="text-sm font-semibold text-teal-700 underline underline-offset-4">
                See the full adherence view
              </Link>
            </div>
          )
        ) : null}
      </CardBody>
    </Card>
  )
}

function UpcomingAppointmentsPanel() {
  const appointments = useAppointments()
  const upcoming = (appointments.data ?? [])
    .filter((appointment) => isUpcoming(appointment.starts_at))
    .sort((a, b) => compareAscending(a.starts_at, b.starts_at))
    .slice(0, 3)

  return (
    <Card>
      <CardHeader
        title="Next appointments"
        description="The three soonest appointments the API returned for this circle."
        actions={
          <Link to="/appointments" className={buttonClasses('secondary')}>
            All appointments
          </Link>
        }
      />
      <CardBody>
        {appointments.isPending ? <LoadingState label="Loading appointments…" /> : null}
        {appointments.isError ? (
          <ErrorState
            error={appointments.error}
            title="Appointments could not be loaded"
            onRetry={() => void appointments.refetch()}
          />
        ) : null}
        {appointments.isSuccess && upcoming.length === 0 ? (
          <EmptyState
            title="Nothing scheduled"
            description="No future appointment is recorded for this care circle yet."
          />
        ) : null}
        <ul className="space-y-3">
          {upcoming.map((appointment) => (
            <li key={appointment.id} className="rounded-lg border border-cream-300 bg-cream-50 px-3 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-ink-900">{appointment.title}</p>
                  <p className="text-sm text-ink-700">
                    {formatDateTime(appointment.starts_at) ?? 'Start time not returned'}
                    {appointment.location ? ` · ${appointment.location}` : ''}
                  </p>
                  <p className="text-sm text-ink-500">Reminders: {describeReminders(appointment.reminder_offsets)}</p>
                </div>
                <Badge tone={appointment.shared_with_circle ? 'teal' : 'neutral'}>
                  {appointment.shared_with_circle ? 'Shared' : 'Private'}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}
