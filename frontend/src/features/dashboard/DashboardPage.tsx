import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Pill,
  Plus,
  ShieldAlert,
  Users,
  ArrowRight,
} from 'lucide-react'

import { Badge } from '../../components/ui/Badge'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
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
import { useTodayDoses } from '../doses/hooks'
import { useAppointments } from '../appointments/hooks'
import { useEmergencyAlerts } from '../emergency/hooks'
import { EMERGENCY_STATUS_LABELS, EMERGENCY_TYPE_LABELS, isActiveAlert } from '../emergency/options'
import { useMedications } from '../medications/hooks'

export function DashboardPage() {
  const { user, capabilities, activeCareCircle, roleName } = useSession()
  const [viewingUserId, setViewingUserId] = useState<number | null>(null)

  const alerts = useEmergencyAlerts()
  const medications = useMedications()
  const appointments = useAppointments()
  const todayDoses = useTodayDoses(viewingUserId)

  const from = toDateParam(daysAgo(30))
  const to = toDateParam(new Date())
  const adherence = useAdherence({ from, to, userId: viewingUserId })
  const adherenceData = adherence.data

  const activeAlerts = (alerts.data ?? []).filter((alert) => isActiveAlert(alert.status))
  const lowStock = (medications.data ?? []).filter((medication) => medication.is_low_stock)
  const viewingSelf = viewingUserId == null || viewingUserId === user?.id

  // Doses KPI
  const dosesList = todayDoses.data ?? []
  const takenCount = dosesList.filter((d) => d.status === 'taken').length
  const totalDosesCount = dosesList.length
  const dosesPercent = totalDosesCount > 0 ? Math.round((takenCount / totalDosesCount) * 100) : 100

  // Appointments KPI
  const upcomingAppointments = (appointments.data ?? [])
    .filter((a) => isUpcoming(a.starts_at))
    .sort((a, b) => compareAscending(a.starts_at, b.starts_at))
  const nextAppointment = upcomingAppointments[0]

  return (
    <div className="space-y-4 font-sans text-ink-900 pb-10">
      {/* 1. COMPACT PAGE HEADER */}
      <PageHeader
        title={user ? `Hello, ${user.name.split(' ')[0]}` : 'Care Circle Dashboard'}
        description={
          activeCareCircle
            ? `${activeCareCircle.name} · Timezone: ${activeCareCircle.timezone} · Active Role: ${roleName}`
            : 'No care circle selected.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {capabilities.createOwnMedication && (
              <Link
                to="/medications/new"
                className="inline-flex items-center gap-1.5 rounded-lg border border-cream-300 bg-white px-3 py-1.5 text-xs font-bold text-ink-800 shadow-2xs hover:bg-cream-100 transition-colors"
              >
                <Plus className="size-3.5 text-teal-700" />
                <span>Add Medication</span>
              </Link>
            )}
            <Link
              to="/emergency"
              className="inline-flex items-center gap-1.5 rounded-lg border border-danger-300 bg-danger-50 px-3 py-1.5 text-xs font-bold text-danger-700 shadow-2xs hover:bg-danger-100 transition-colors"
            >
              <ShieldAlert className="size-3.5 text-danger-600" />
              <span>Emergency Help</span>
            </Link>
          </div>
        }
      />

      {/* 2. EMERGENCY ALERT BANNER (IF ACTIVE) */}
      {activeAlerts.length > 0 && (
        <div className="rounded-xl border-2 border-danger-400 bg-danger-50/90 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-danger-600 text-white animate-pulse">
                <ShieldAlert className="size-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-danger-950">
                  {activeAlerts.length} Active Emergency Alert Raised
                </p>
                <p className="text-[11px] text-danger-800">
                  {activeAlerts.map((a) => (
                    <span key={a.id}>
                      {EMERGENCY_TYPE_LABELS[a.type] ?? a.type} by <strong>{a.raised_by.name}</strong> ({EMERGENCY_STATUS_LABELS[a.status]})
                    </span>
                  ))}
                </p>
              </div>
            </div>
            <Link
              to="/emergency"
              className="rounded-lg bg-danger-600 px-3 py-1 text-xs font-bold text-white hover:bg-danger-700 transition-colors"
            >
              Respond Now →
            </Link>
          </div>
        </div>
      )}

      {/* 3. COMPACT 4-CARD TELEMETRY ROW */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Metric 1: Today's Schedule */}
        <div className="rounded-xl border border-cream-300 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500">
              Today's Schedule
            </p>
            <Pill className="size-3.5 text-teal-700" />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-bold tabular-nums text-ink-950 font-mono">
            {totalDosesCount === 0 ? '0 Doses' : `${takenCount} / ${totalDosesCount}`}
          </p>
          <p className="mt-1 text-[11px] font-medium text-teal-700">
            {totalDosesCount === 0
              ? 'Nothing due today'
              : `${dosesPercent}% completed · ${totalDosesCount - takenCount} pending`}
          </p>
        </div>

        {/* Metric 2: Adherence SLA */}
        <div className="rounded-xl border border-cream-300 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500">
              30-Day Adherence
            </p>
            <Activity className="size-3.5 text-teal-700" />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-bold tabular-nums text-ink-950 font-mono">
            {formatPercent(adherenceData?.percentage) ?? '—'}
          </p>
          <p className="mt-1 text-[11px] font-medium text-emerald-700">
            Target ≥90% · {adherenceData ? `${adherenceData.taken} taken of ${adherenceData.total}` : 'Calculating...'}
          </p>
        </div>

        {/* Metric 3: Regimens & Refills */}
        <div className="rounded-xl border border-cream-300 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500">
              Inventory Health
            </p>
            {lowStock.length === 0 ? (
              <CheckCircle2 className="size-3.5 text-emerald-600" />
            ) : (
              <AlertTriangle className="size-3.5 text-amber-600" />
            )}
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-bold tabular-nums text-ink-950 font-mono">
            {medications.data ? `${medications.data.length} Meds` : '—'}
          </p>
          <p
            className={`mt-1 text-[11px] font-medium ${
              lowStock.length === 0 ? 'text-emerald-700' : 'text-amber-700 font-bold'
            }`}
          >
            {lowStock.length === 0 ? 'All stocks sufficient' : `${lowStock.length} low-stock alert(s)`}
          </p>
        </div>

        {/* Metric 4: Next Appointment */}
        <div className="rounded-xl border border-cream-300 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500">
              Next Visit
            </p>
            <Calendar className="size-3.5 text-teal-700" />
          </div>
          <p className="mt-1 text-sm font-bold text-ink-950 truncate">
            {nextAppointment ? nextAppointment.title : 'None Scheduled'}
          </p>
          <p className="mt-1 text-[11px] font-medium text-ink-500 font-mono">
            {nextAppointment ? formatDateTime(nextAppointment.starts_at) : 'No future visits recorded'}
          </p>
        </div>
      </div>

      {/* 4. CAREGIVER MEMBER SELECTOR (IF MULTI-MEMBER PERMISSION) */}
      {capabilities.viewOthersMedications && (
        <div className="rounded-xl border border-cream-300 bg-white p-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-teal-700" />
              <span className="text-xs font-bold text-ink-900">Viewing Schedule For:</span>
            </div>
            <div className="w-full sm:w-72">
              <MemberSelector value={viewingUserId} onChange={setViewingUserId} />
            </div>
          </div>
        </div>
      )}

      {/* 5. MAIN 2-COLUMN GRID */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* LEFT COLUMN (2/3): DOSES & REFILLS */}
        <div className="lg:col-span-2 space-y-4">
          {/* Today's Doses */}
          <TodayDoses
            userId={viewingUserId}
            heading={viewingSelf ? 'Today’s Medication Schedule' : 'Schedule for Selected Member'}
            headingId="dashboard-doses"
          />

          {/* Low Stock Panel */}
          <LowStockPanel
            loading={medications.isPending}
            error={medications.error}
            onRetry={() => void medications.refetch()}
            medications={lowStock}
          />
        </div>

        {/* RIGHT COLUMN (1/3): ADHERENCE & APPOINTMENTS */}
        <div className="space-y-4">
          <AdherencePanel userId={viewingUserId} />
          <UpcomingAppointmentsPanel appointments={upcomingAppointments} />
        </div>
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
  medications: Array<{
    id: number
    name: string
    stock_quantity: number
    days_remaining: number
    low_stock_threshold: number
  }>
}) {
  return (
    <Card>
      <CardHeader
        title="Medication Stock Alerts"
        description="Medications at or below threshold requiring pharmacy refills."
      />
      <CardBody className="p-3.5">
        {loading ? <LoadingState label="Checking medication stock levels…" /> : null}
        {error ? <ErrorState error={error} title="Stock levels could not be loaded" onRetry={onRetry} /> : null}
        {!loading && !error && medications.length === 0 ? (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span>All active medications have sufficient stock. Zero immediate refills needed.</span>
          </div>
        ) : null}

        {medications.length > 0 && (
          <ul className="space-y-2">
            {medications.map((medication) => (
              <li
                key={medication.id}
                className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs"
              >
                <div>
                  <p className="font-bold text-ink-950 text-sm">{medication.name}</p>
                  <p className="text-ink-600 font-mono mt-0.5">
                    {formatNumber(medication.stock_quantity)} units left ·{' '}
                    <span className="font-bold text-amber-900">
                      {formatNumber(medication.days_remaining)} days remaining
                    </span>
                  </p>
                </div>
                <Link
                  to="/medications/$medicationId"
                  params={{ medicationId: String(medication.id) }}
                  className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                >
                  Record Refill →
                </Link>
              </li>
            ))}
          </ul>
        )}
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
        title="Adherence (30 Days)"
        description={`Reported compliance window ${from} → ${to}.`}
      />
      <CardBody className="p-4 space-y-3">
        {adherence.isPending ? <LoadingState label="Calculating compliance SLA…" /> : null}
        {adherence.isError ? (
          <ErrorState error={adherence.error} title="Adherence could not be loaded" onRetry={() => void adherence.refetch()} />
        ) : null}
        {summary ? (
          summary.total === 0 ? (
            <EmptyState
              title="No doses in window"
              description="No confirmed doses scheduled in this 30-day window."
            />
          ) : (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-teal-800">
                  {formatPercent(summary.percentage) ?? '—'}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {summary.percentage >= 90 ? 'Healthy SLA' : 'Needs Attention'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-cream-200 overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full"
                  style={{ width: `${Math.min(100, summary.percentage)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                <div className="rounded-lg bg-cream-50 p-2 border border-cream-200">
                  <span className="text-[10px] uppercase font-bold text-ink-500 block">Taken</span>
                  <span className="font-extrabold text-ink-900 text-sm">{formatNumber(summary.taken)}</span>
                </div>
                <div className="rounded-lg bg-cream-50 p-2 border border-cream-200">
                  <span className="text-[10px] uppercase font-bold text-ink-500 block">Skipped</span>
                  <span className="font-extrabold text-ink-900 text-sm">{formatNumber(summary.skipped)}</span>
                </div>
                <div className="rounded-lg bg-cream-50 p-2 border border-cream-200">
                  <span className="text-[10px] uppercase font-bold text-ink-500 block">Missed</span>
                  <span className="font-extrabold text-danger-700 text-sm">{formatNumber(summary.missed)}</span>
                </div>
              </div>

              <div className="pt-1 text-right">
                <Link
                  to="/adherence"
                  className="text-xs font-bold text-teal-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>Full adherence report</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          )
        ) : null}
      </CardBody>
    </Card>
  )
}

function UpcomingAppointmentsPanel({
  appointments,
}: {
  appointments: Array<{
    id: number
    title: string
    starts_at: string
    location?: string | null
    reminder_offsets?: number[] | null
    shared_with_circle?: boolean
  }>
}) {
  const upcoming = appointments.slice(0, 3)

  return (
    <Card>
      <CardHeader
        title="Upcoming Care Visits"
        description="The three soonest scheduled clinical appointments."
        actions={
          <Link
            to="/appointments"
            className="text-xs font-bold text-teal-700 hover:underline"
          >
            All Visits →
          </Link>
        }
      />
      <CardBody className="p-3.5">
        {upcoming.length === 0 ? (
          <p className="text-xs text-ink-500 p-2 text-center">No upcoming visits scheduled.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-cream-200 bg-cream-50/60 p-2.5 text-xs hover:bg-cream-100/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-ink-900 text-xs">{a.title}</p>
                    <p className="text-[11px] text-ink-500 font-mono mt-0.5">
                      {formatDateTime(a.starts_at) ?? 'Time not set'}
                    </p>
                    {a.location && (
                      <p className="text-[11px] text-ink-600 mt-0.5">📍 {a.location}</p>
                    )}
                  </div>
                  <Badge tone={a.shared_with_circle ? 'teal' : 'neutral'}>
                    {a.shared_with_circle ? 'Shared' : 'Private'}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}
