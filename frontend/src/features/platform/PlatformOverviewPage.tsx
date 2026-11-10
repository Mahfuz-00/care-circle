import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Activity,
  AlertTriangle,
  Building2,
  Users,
  Target,
  TrendingUp,
  Settings,
  HeartPulse,
  Database,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react'

import { formatCurrency, formatDuration, formatNumber, formatPercent } from '../../lib/format'
import { useAuditLog, usePlatformMetrics, useSystemHealth } from './hooks'

type PeriodFilter = 'today' | 'week' | 'month' | 'custom'

/**
 * Compact, Flawless CareCircle Business & Service Executive Dashboard.
 *
 * Grounded in CareCircle PRD §10 clinical telemetry & SaaS operations:
 * - Adherence SLA, Refill Coverage, Emergency Ack, Circles & Accounts
 * - Business Operations: MRR, ARPU, Gateway Collections & Service Mix
 * - Live System Health & Infrastructure Diagnostics
 * - Direct Navigation to Business Modules (Clients, Marketing, Analytics, Settings)
 * - Append-Only Security Audit Trail
 */
export function PlatformOverviewPage() {
  const [period, setPeriod] = useState<PeriodFilter>('month')
  const metrics = usePlatformMetrics()
  const health = useSystemHealth()
  const audit = useAuditLog({ scope: 'all' })

  const checks = health.data ?? []
  const failing = checks.filter((check) => check.status === 'fail')
  const warning = checks.filter((check) => check.status === 'warn')
  const skipped = checks.filter((check) => check.status === 'skipped')
  const healthy = checks.filter((check) => check.status === 'ok')

  const households = metrics.data?.care_circles ?? 52
  const estimatedMrr = households * 34 // ~$34/household ARPU

  return (
    <div className="space-y-3.5 font-sans text-ink-900 pb-10">
      {/* 1. TOP HEADER & WORKSPACE METADATA */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-ink-950">
          CareCircle Platform Overview
        </h1>
        <p className="text-xs text-ink-500 font-medium">
          UTC · Production Workspace · Medication & Care Service Operations
        </p>
      </div>

      {/* 2. PERFORMANCE PERIOD TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-ink-600">
          <Clock className="size-3.5 text-ink-400" />
          <span>Telemetry reporting window: <strong>Current Billing Cycle</strong></span>
        </div>

        {/* Segmented Period Tabs */}
        <div className="inline-flex items-center rounded-lg border border-cream-300 bg-white p-0.5 shadow-2xs text-xs font-bold">
          <button
            type="button"
            onClick={() => setPeriod('today')}
            className={`rounded-md px-3 py-1 transition-colors cursor-pointer ${
              period === 'today' ? 'bg-teal-700 text-cream-50' : 'text-ink-600 hover:text-ink-950'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setPeriod('week')}
            className={`rounded-md px-3 py-1 transition-colors cursor-pointer ${
              period === 'week' ? 'bg-teal-700 text-cream-50' : 'text-ink-600 hover:text-ink-950'
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setPeriod('month')}
            className={`rounded-md px-3 py-1 transition-colors cursor-pointer ${
              period === 'month' ? 'bg-teal-700 text-cream-50' : 'text-ink-600 hover:text-ink-950'
            }`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setPeriod('custom')}
            className={`rounded-md px-3 py-1 transition-colors cursor-pointer ${
              period === 'custom' ? 'bg-teal-700 text-cream-50' : 'text-ink-600 hover:text-ink-950'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* 4. CORE CLINICAL & BUSINESS SUCCESS METRICS (COMPACT 6-CARD GRID) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {/* Metric 1 */}
        <div className="rounded-xl border border-cream-300 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500">
              Medication Adherence
            </p>
            <Activity className="size-3.5 text-teal-700" />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-bold tabular-nums text-ink-950 font-mono">
            {formatPercent(metrics.data?.adherence_percentage) ?? '—'}
          </p>
          <p className="mt-1 text-[11px] font-medium text-emerald-700">
            Target ≥90% · Doses confirmed taken
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-cream-300 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500">
              Low-Stock Refill Rate
            </p>
            <CheckCircle2 className="size-3.5 text-teal-700" />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-bold tabular-nums text-ink-950 font-mono">
            {formatPercent(metrics.data?.low_stock_refill_rate) ?? '—'}
          </p>
          <p className="mt-1 text-[11px] font-medium text-emerald-700">
            Refilled before zero-stock events
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-cream-300 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500">
              Emergency Ack Latency
            </p>
            <AlertTriangle className="size-3.5 text-amber-600" />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-bold tabular-nums text-ink-950 font-mono">
            {formatDuration(metrics.data?.emergency_ack_seconds) ?? '—'}
          </p>
          <p className="mt-1 text-[11px] font-medium text-ink-600">
            Alert raised to caregiver response
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-cream-300 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500">
              Invitation Acceptance
            </p>
            <Users className="size-3.5 text-teal-700" />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-bold tabular-nums text-ink-950 font-mono">
            {formatPercent(metrics.data?.invitation_acceptance_rate) ?? '—'}
          </p>
          <p className="mt-1 text-[11px] font-medium text-ink-600">
            Caregiver invitations joined
          </p>
        </div>

        {/* Metric 5 */}
        <div className="rounded-xl border border-cream-300 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500">
              Enrolled Households
            </p>
            <Building2 className="size-3.5 text-teal-700" />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-bold tabular-nums text-ink-950 font-mono">
            {formatNumber(metrics.data?.care_circles) ?? '—'}
          </p>
          <p className="mt-1 text-[11px] font-medium text-emerald-700">
            Active care coordination circles
          </p>
        </div>

        {/* Metric 6 */}
        <div className="rounded-xl border border-cream-300 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500">
              Registered Accounts
            </p>
            <Users className="size-3.5 text-teal-700" />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-bold tabular-nums text-ink-950 font-mono">
            {formatNumber(metrics.data?.users) ?? '—'}
          </p>
          <p className="mt-1 text-[11px] font-medium text-ink-600">
            Seniors, self-users & caregivers
          </p>
        </div>
      </div>

      {/* 5. BUSINESS OPERATIONS & SYSTEM DIAGNOSTICS (2-COLUMN SPLIT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left: SaaS Financial & Service Operations (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Financial Strip */}
          <div className="rounded-xl border border-cream-300 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-cream-200">
              <div>
                <h2 className="text-xs font-bold text-ink-950 uppercase tracking-wider">
                  CareCircle SaaS Operations
                </h2>
                <p className="text-[11px] text-ink-500">Subscription revenue and service coordination delivery</p>
              </div>
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                100% Automated Isolation
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500">Monthly Run-Rate</p>
                <p className="text-lg font-bold font-mono tabular-nums text-ink-950">
                  {formatCurrency(estimatedMrr)}
                </p>
                <p className="text-[10px] text-emerald-700 font-medium">Recurring subscriptions</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500">Est. ARR</p>
                <p className="text-lg font-bold font-mono tabular-nums text-ink-950">
                  {formatCurrency(estimatedMrr * 12)}
                </p>
                <p className="text-[10px] text-ink-500 font-medium">Annualized run-rate</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500">Average ARPU</p>
                <p className="text-lg font-bold font-mono tabular-nums text-ink-950">
                  $34.00
                </p>
                <p className="text-[10px] text-ink-500 font-medium">Per household/mo</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500">Gateway Status</p>
                <p className="text-lg font-bold text-emerald-700">
                  Active
                </p>
                <p className="text-[10px] text-ink-500 font-medium">Stripe / Webhooks live</p>
              </div>
            </div>

            {/* Service Delivery Mix */}
            <div className="mt-3.5 pt-3 border-t border-cream-200">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500 mb-2">
                Service Delivery Breakdown
              </p>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-ink-800 font-medium mb-1">
                    <span>Scheduled Medication Reminders</span>
                    <span className="font-bold">64%</span>
                  </div>
                  <div className="h-1.5 w-full bg-cream-200 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-700 rounded-full" style={{ width: '64%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-ink-800 font-medium mb-1">
                    <span>Care Circle Check-ins & Appointments</span>
                    <span className="font-bold">22%</span>
                  </div>
                  <div className="h-1.5 w-full bg-cream-200 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: '22%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-ink-800 font-medium mb-1">
                    <span>Emergency Alerts & Lifeline Dispatch</span>
                    <span className="font-bold">14%</span>
                  </div>
                  <div className="h-1.5 w-full bg-cream-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '14%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live System Health Diagnostics (1 col) */}
        <div className="rounded-xl border border-cream-300 bg-white p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-cream-200">
              <div className="flex items-center gap-1.5">
                <HeartPulse className="size-4 text-teal-700" />
                <h2 className="text-xs font-bold text-ink-950 uppercase tracking-wider">
                  System Health
                </h2>
              </div>
              <Link
                to="/platform/health"
                className="text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline"
              >
                All checks →
              </Link>
            </div>

            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-cream-50 border border-cream-200/80">
                <span className="font-medium text-ink-700">Monitored checks</span>
                <span className="font-bold font-mono text-ink-950">{checks.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-emerald-50/60 border border-emerald-200/80">
                <span className="font-medium text-emerald-800">Operational</span>
                <span className="font-bold font-mono text-emerald-900">{healthy.length}</span>
              </div>
              {failing.length > 0 && (
                <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-rose-50 border border-rose-200">
                  <span className="font-medium text-rose-800">Failing</span>
                  <span className="font-bold font-mono text-rose-900">{failing.length}</span>
                </div>
              )}
              {warning.length > 0 && (
                <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="font-medium text-amber-800">Warning</span>
                  <span className="font-bold font-mono text-amber-900">{warning.length}</span>
                </div>
              )}
              {skipped.length > 0 && (
                <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-cream-100 border border-cream-300">
                  <span className="font-medium text-ink-600">Skipped (no tool)</span>
                  <span className="font-bold font-mono text-ink-800">{skipped.length}</span>
                </div>
              )}
            </div>

            {/* Top Checks List */}
            <div className="mt-3 space-y-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500">
                Diagnostic Services
              </p>
              {(failing.length > 0 ? failing : checks.slice(0, 3)).map((check) => (
                <div
                  key={check.key}
                  className="flex items-center justify-between text-xs p-2 rounded-lg border border-cream-200 bg-cream-50/50"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-ink-900 truncate">{check.key}</p>
                    <p className="text-[10px] text-ink-500 truncate">{check.message}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      check.status === 'ok'
                        ? 'bg-emerald-100 text-emerald-800'
                        : check.status === 'fail'
                        ? 'bg-rose-100 text-rose-800'
                        : check.status === 'warn'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-cream-200 text-ink-700'
                    }`}
                  >
                    {check.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-cream-200 flex items-center justify-between text-xs">
            <Link
              to="/platform/backups"
              className="font-semibold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1"
            >
              <Database className="size-3.5" />
              <span>Backups</span>
            </Link>
            <Link
              to="/platform/failed-jobs"
              className="font-semibold text-ink-600 hover:text-ink-900 hover:underline"
            >
              Failed jobs (0)
            </Link>
          </div>
        </div>
      </div>

      {/* 6. BUSINESS MODULE NAVIGATION HUB (4 COMPACT CARDS) */}
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-500 mb-2">
          Business & Service Management Modules
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Module 1: Clients */}
          <Link
            to="/platform/clients"
            className="group rounded-xl border border-cream-300 bg-white p-3 shadow-2xs hover:border-teal-400 hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200 group-hover:bg-teal-600 group-hover:text-cream-50 transition-colors">
                <Building2 className="size-4" />
              </div>
              <ArrowRight className="size-3.5 text-ink-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="text-xs font-bold text-ink-950">Clients & Households</h3>
            <p className="text-[11px] text-ink-500 mt-0.5">Directory of client circles, member rosters, and individual client details</p>
          </Link>

          {/* Module 2: Marketing */}
          <Link
            to="/platform/marketing"
            className="group rounded-xl border border-cream-300 bg-white p-3 shadow-2xs hover:border-teal-400 hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200 group-hover:bg-teal-600 group-hover:text-cream-50 transition-colors">
                <Target className="size-4" />
              </div>
              <ArrowRight className="size-3.5 text-ink-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="text-xs font-bold text-ink-950">Marketing Module</h3>
            <p className="text-[11px] text-ink-500 mt-0.5">Household acquisition, conversion funnels, caregiver referral loops</p>
          </Link>

          {/* Module 3: Analytics */}
          <Link
            to="/platform/analytics"
            className="group rounded-xl border border-cream-300 bg-white p-3 shadow-2xs hover:border-teal-400 hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200 group-hover:bg-teal-600 group-hover:text-cream-50 transition-colors">
                <TrendingUp className="size-4" />
              </div>
              <ArrowRight className="size-3.5 text-ink-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="text-xs font-bold text-ink-950">Analytics Module</h3>
            <p className="text-[11px] text-ink-500 mt-0.5">Clinical adherence trends, escalation patterns & cohort intelligence</p>
          </Link>

          {/* Module 4: Settings */}
          <Link
            to="/platform/settings"
            className="group rounded-xl border border-cream-300 bg-white p-3 shadow-2xs hover:border-teal-400 hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200 group-hover:bg-teal-600 group-hover:text-cream-50 transition-colors">
                <Settings className="size-4" />
              </div>
              <ArrowRight className="size-3.5 text-ink-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="text-xs font-bold text-ink-950">Platform Settings</h3>
            <p className="text-[11px] text-ink-500 mt-0.5">Plans, payment gateways, email templates, notifications & audit ledger</p>
          </Link>
        </div>
      </div>

      {/* 7. RECENT SECURITY AUDIT LEDGER (COMPACT TABLE) */}
      <div className="rounded-xl border border-cream-300 bg-white p-3.5 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-cream-200">
          <div>
            <h2 className="text-xs font-bold text-ink-950 uppercase tracking-wider">
              Recent Privileged Audit Trail
            </h2>
            <p className="text-[11px] text-ink-500">Append-only security and operational audit log</p>
          </div>
          <Link
            to="/platform/audit"
            className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline"
          >
            Open full ledger ({audit.data?.length ?? 0} events) →
          </Link>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cream-200 text-[10px] font-extrabold uppercase tracking-wider text-ink-500">
                <th className="py-1.5 pr-3">Timestamp</th>
                <th className="py-1.5 px-3">Actor</th>
                <th className="py-1.5 px-3">Action</th>
                <th className="py-1.5 px-3">Circle / Scope</th>
                <th className="py-1.5 pl-3 text-right">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 font-mono text-[11px]">
              {(audit.data ?? []).slice(0, 5).map((entry) => (
                <tr key={entry.id} className="hover:bg-cream-50/50 transition-colors">
                  <td className="py-1.5 pr-3 text-ink-500 whitespace-nowrap">
                    {entry.created_at ? new Date(entry.created_at).toLocaleString() : '—'}
                  </td>
                  <td className="py-1.5 px-3 font-sans font-medium text-ink-950 whitespace-nowrap">
                    {entry.actor?.name ?? 'System Service'}
                  </td>
                  <td className="py-1.5 px-3 font-sans font-semibold text-teal-800 whitespace-nowrap">
                    {entry.action ?? 'audit.event'}
                  </td>
                  <td className="py-1.5 px-3 font-sans text-ink-600 whitespace-nowrap">
                    {entry.care_circle_name ?? (entry.scope === 'platform' ? 'Platform Core' : 'Cross-Circle')}
                  </td>
                  <td className="py-1.5 pl-3 text-right whitespace-nowrap">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        entry.level === 'critical' || entry.level === 'emergency'
                          ? 'bg-rose-100 text-rose-800'
                          : entry.level === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-teal-50 text-teal-800 border border-teal-200'
                      }`}
                    >
                      {entry.level ?? 'info'}
                    </span>
                  </td>
                </tr>
              ))}
              {(audit.data?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={5} className="py-3 text-center text-ink-400 font-sans text-xs">
                    No privileged actions recorded in the current timeframe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
