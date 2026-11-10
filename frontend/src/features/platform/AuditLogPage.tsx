import { useState, useMemo } from 'react'
import {
  Shield,
  Activity,
  Building2,
  Server,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Terminal,
  Clock,
  User,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { EmptyState, ErrorState, SkeletonList } from '../../components/ui/states'
import { formatDateTime } from '../../lib/format'
import type { AuditLogEntry } from '../../lib/types'
import { useAuditLog } from './hooks'

type ScopeFilter = 'all' | 'platform' | 'client'
type LevelFilter = 'all' | 'info' | 'notice' | 'warning' | 'alert' | 'emergency'

/**
 * Platform Audit Ledger & Immutable Trail (PRD §9).
 *
 * For platform admin, provides full cross-system visibility across both
 * platform/system operations (landlord) and household client events (tenant).
 * Append-only by design: entries can never be modified or deleted.
 */
export function AuditLogPage() {
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all')
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [expandedId, setExpandedId] = useState<string | number | null>(null)

  const audit = useAuditLog({
    scope: scopeFilter,
    level: levelFilter,
    search: searchQuery || undefined,
  })

  const entries: AuditLogEntry[] = useMemo(() => audit.data ?? [], [audit.data])

  // Metrics summary calculated from active dataset
  const metrics = useMemo(() => {
    let platformCount = 0
    let clientCount = 0
    let criticalCount = 0

    entries.forEach((entry) => {
      if (!entry.care_circle_id) {
        platformCount++
      } else {
        clientCount++
      }
      if (entry.level === 'alert' || entry.level === 'emergency' || entry.level === 'warning') {
        criticalCount++
      }
    })

    return {
      total: entries.length,
      platformCount,
      clientCount,
      criticalCount,
    }
  }, [entries])

  const toggleExpand = (id: string | number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-6">
      {/* Header and Telemetry Stats */}
      <Card>
        <CardHeader
          title="Audit Log & Immutable Ledger"
          description="Tamper-evident append-only ledger (PRD §9). Records every privileged action across both platform administration and client households."
        >
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-cream-200 bg-cream-50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                <Activity className="size-4 text-teal-600" aria-hidden="true" />
                <span>Total Recorded</span>
              </div>
              <p className="mt-1 text-2xl font-bold tabular-nums text-ink-950">{metrics.total}</p>
            </div>

            <div className="rounded-xl border border-cream-200 bg-cream-50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                <Server className="size-4 text-indigo-600" aria-hidden="true" />
                <span>Platform Operations</span>
              </div>
              <p className="mt-1 text-2xl font-bold tabular-nums text-indigo-900">{metrics.platformCount}</p>
            </div>

            <div className="rounded-xl border border-cream-200 bg-cream-50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                <Building2 className="size-4 text-sage-600" aria-hidden="true" />
                <span>Client Households</span>
              </div>
              <p className="mt-1 text-2xl font-bold tabular-nums text-sage-900">{metrics.clientCount}</p>
            </div>

            <div className="rounded-xl border border-cream-200 bg-cream-50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                <AlertTriangle className="size-4 text-amber-600" aria-hidden="true" />
                <span>Warnings & Alerts</span>
              </div>
              <p className="mt-1 text-2xl font-bold tabular-nums text-amber-900">{metrics.criticalCount}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Ledger Viewer */}
      <Card>
        <CardBody className="space-y-4">
          {/* Controls & Filter Toolbar */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Scope Filter Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-cream-200/70 p-1 border border-cream-300">
              <button
                type="button"
                onClick={() => setScopeFilter('all')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  scopeFilter === 'all'
                    ? 'bg-white text-ink-950 shadow-2xs'
                    : 'text-ink-600 hover:text-ink-950 hover:bg-white/40'
                }`}
              >
                All Audits
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('platform')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  scopeFilter === 'platform'
                    ? 'bg-white text-indigo-900 shadow-2xs'
                    : 'text-ink-600 hover:text-ink-950 hover:bg-white/40'
                }`}
              >
                Platform & System
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('client')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  scopeFilter === 'client'
                    ? 'bg-white text-teal-900 shadow-2xs'
                    : 'text-ink-600 hover:text-ink-950 hover:bg-white/40'
                }`}
              >
                Client Households
              </button>
            </div>

            {/* Search and Severity Filter */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-ink-400" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search actions, actors, IP…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 bg-white py-2 pl-9 pr-3 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="size-3.5 text-ink-500" aria-hidden="true" />
                <select
                  aria-label="Filter by severity level"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value as LevelFilter)}
                  className="rounded-xl border border-cream-300 bg-white px-2.5 py-2 text-xs font-semibold text-ink-700 focus:outline-hidden focus:ring-2 focus:ring-teal-600 cursor-pointer"
                >
                  <option value="all">All Severities</option>
                  <option value="info">Info</option>
                  <option value="notice">Notice</option>
                  <option value="warning">Warning</option>
                  <option value="alert">Alert</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => void audit.refetch()}
                title="Refresh audit ledger"
                aria-label="Refresh audit ledger"
                disabled={audit.isFetching}
                className="flex size-9 items-center justify-center rounded-xl border border-cream-300 bg-white text-ink-600 hover:bg-cream-100 hover:text-ink-950 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`size-4 ${audit.isFetching ? 'animate-spin text-teal-600' : ''}`} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Loading, Error, Empty, and Success states */}
          {audit.isPending ? <SkeletonList label="Loading audit ledger records…" rows={5} /> : null}

          {audit.isError ? (
            <ErrorState
              error={audit.error}
              title="The audit ledger could not be loaded"
              onRetry={() => void audit.refetch()}
            />
          ) : null}

          {audit.isSuccess && entries.length === 0 ? (
            <EmptyState
              title="No audit entries found"
              description="No audit records matched the selected filters. Change your filters or search keywords to view other events."
            />
          ) : null}

          {entries.length > 0 ? (
            <div className="divide-y divide-cream-200 rounded-2xl border border-cream-300 bg-white overflow-hidden shadow-2xs">
              {entries.map((entry) => {
                const isExpanded = expandedId === entry.id
                return (
                  <AuditLogItem
                    key={String(entry.id)}
                    entry={entry}
                    isExpanded={isExpanded}
                    onToggle={() => toggleExpand(entry.id)}
                  />
                )
              })}
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  )
}

function AuditLogItem({
  entry,
  isExpanded,
  onToggle,
}: {
  entry: AuditLogEntry
  isExpanded: boolean
  onToggle: () => void
}) {
  const isPlatform = !entry.care_circle_id
  const formattedDate = formatDateTime(entry.created_at ?? null)
  const payloadString = entry.payload && Object.keys(entry.payload).length > 0
    ? JSON.stringify(entry.payload, null, 2)
    : null

  // Level badge coloring
  const levelStyles: Record<string, { bg: string; text: string; border: string }> = {
    info: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
    notice: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    alert: { bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-300' },
    emergency: { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-300' },
  }

  const currentLevelStyle =
    levelStyles[entry.level?.toLowerCase() ?? 'info'] ?? levelStyles.info

  return (
    <div className="transition-colors hover:bg-cream-50/70 p-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Action Icon + Name + Scope Badge */}
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border ${
              isPlatform
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-teal-200 bg-teal-50 text-teal-700'
            }`}
          >
            {isPlatform ? (
              <Server className="size-4" aria-hidden="true" />
            ) : (
              <Building2 className="size-4" aria-hidden="true" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-ink-950">{entry.action}</span>
              {/* Scope Badge */}
              {isPlatform ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                  <Shield className="size-3" aria-hidden="true" /> Platform
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-900">
                  <Building2 className="size-3" aria-hidden="true" />
                  {entry.care_circle_name ? entry.care_circle_name : `Household #${entry.care_circle_id}`}
                </span>
              )}

              {/* Severity Level Badge */}
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${currentLevelStyle.bg} ${currentLevelStyle.text} ${currentLevelStyle.border}`}
              >
                {entry.level ?? 'info'}
              </span>
            </div>

            {/* Actor and Metadata Subtext */}
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-500">
              <span className="flex items-center gap-1">
                <User className="size-3 text-ink-400" aria-hidden="true" />
                {entry.actor ? (
                  <span className="font-medium text-ink-800">
                    {entry.actor.name}{' '}
                    {entry.actor.email && (
                      <span className="text-ink-400">({entry.actor.email})</span>
                    )}
                  </span>
                ) : (
                  <span className="italic text-ink-500">System Automated</span>
                )}
                {entry.actor_role && (
                  <span className="ml-1 rounded-sm bg-cream-200 px-1.5 py-0.2 text-[10px] font-semibold text-ink-700">
                    {entry.actor_role}
                  </span>
                )}
              </span>

              {entry.ip_address && (
                <span className="flex items-center gap-1 tabular-nums font-mono text-[11px] text-ink-500">
                  <Globe className="size-3 text-ink-400" aria-hidden="true" />
                  {entry.ip_address}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Timestamp & Payload Expand Button */}
        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-ink-500 tabular-nums">
            <Clock className="size-3.5 text-ink-400" aria-hidden="true" />
            <span>{formattedDate}</span>
          </div>

          {payloadString ? (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={isExpanded}
              aria-label={`Toggle payload for event #${entry.id}`}
              className="flex items-center gap-1 rounded-lg border border-cream-300 bg-white px-2.5 py-1 text-xs font-semibold text-ink-700 hover:bg-cream-100 hover:text-ink-950 transition-colors cursor-pointer"
            >
              <Terminal className="size-3.5 text-ink-500" aria-hidden="true" />
              <span>Payload</span>
              {isExpanded ? (
                <ChevronUp className="size-3.5 text-ink-500" aria-hidden="true" />
              ) : (
                <ChevronDown className="size-3.5 text-ink-500" aria-hidden="true" />
              )}
            </button>
          ) : null}
        </div>
      </div>

      {/* Expandable JSON Payload Drawer */}
      {isExpanded && payloadString ? (
        <div className="mt-3 rounded-xl border border-cream-300 bg-cream-100/60 p-3.5 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-cream-200">
            <span className="font-mono text-[11px] font-bold text-ink-600">Event Payload Parameters</span>
            <span className="text-[10px] text-ink-400 font-mono">Immutable Snapshot</span>
          </div>
          <pre className="max-h-64 overflow-auto rounded-lg bg-white p-3 font-mono text-xs text-ink-900 border border-cream-200/80 leading-relaxed">
            {payloadString}
          </pre>
        </div>
      ) : null}
    </div>
  )
}
