import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Users,
  Search,
  Building2,
  DollarSign,
  Pill,
  ShieldAlert,
  ArrowRight,
  Filter,
  Download,
  Plus,
  PauseCircle,
  PlayCircle,
  X,
  RefreshCw,
} from 'lucide-react'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { LoadingState } from '../../components/ui/states'
import { formatCurrency } from '../../lib/format'
import { apiPost } from '../../lib/api'
import { useQueryClient } from '@tanstack/react-query'
import {
  useActivateClient,
  useBulkActivateClients,
  useBulkSuspendClients,
  usePlatformClients,
  useSuspendClient,
} from './hooks'

const PLAN_TONES: Record<string, 'sage' | 'teal' | 'warn'> = {
  starter: 'sage',
  essential: 'sage',
  family: 'teal',
  comprehensive: 'teal',
  concierge: 'warn',
}

export function PlatformClientsPage() {
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Modal states
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [enrollName, setEnrollName] = useState('')
  const [enrollEmail, setEnrollEmail] = useState('')
  const [enrollPlan, setEnrollPlan] = useState('starter')
  const [enrollTimezone, setEnrollTimezone] = useState('America/New_York')
  const [isSubmittingEnroll, setIsSubmittingEnroll] = useState(false)

  // Suspend modal state
  const [suspendTargetId, setSuspendTargetId] = useState<number | null>(null)
  const [suspendReason, setSuspendReason] = useState('')

  const qc = useQueryClient()
  const { data: clients, isPending, error, refetch, isFetching } = usePlatformClients()
  const suspendMutation = useSuspendClient()
  const activateMutation = useActivateClient()
  const bulkSuspendMutation = useBulkSuspendClients()
  const bulkActivateMutation = useBulkActivateClients()

  const filteredClients = useMemo(() => {
    if (!clients) return []
    return clients.filter((c) => {
      const matchesSearch =
        search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.owner.name.toLowerCase().includes(search.toLowerCase()) ||
        c.owner.email.toLowerCase().includes(search.toLowerCase())

      const matchesPlan = planFilter === '' || c.plan_code === planFilter
      const matchesStatus = statusFilter === '' || (c.status ?? 'active') === statusFilter

      return matchesSearch && matchesPlan && matchesStatus
    })
  }, [clients, search, planFilter, statusFilter])

  const totalMrr = useMemo(() => {
    if (!clients) return 0
    return clients.reduce((acc, c) => acc + (c.mrr || 29), 0)
  }, [clients])

  const totalMembers = useMemo(() => {
    if (!clients) return 0
    return clients.reduce((acc, c) => acc + (c.stats?.members_count || 1), 0)
  }, [clients])

  const openAlertsCount = useMemo(() => {
    if (!clients) return 0
    return clients.reduce((acc, c) => acc + (c.stats?.active_alerts_count || 0), 0)
  }, [clients])

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredClients.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredClients.map((c) => c.id))
    }
  }

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const handleBulkSuspend = async () => {
    if (!window.confirm(`Suspend ${selectedIds.length} selected care circles?`)) return
    await bulkSuspendMutation.mutateAsync(selectedIds)
    setSelectedIds([])
  }

  const handleBulkActivate = async () => {
    if (!window.confirm(`Activate ${selectedIds.length} selected care circles?`)) return
    await bulkActivateMutation.mutateAsync(selectedIds)
    setSelectedIds([])
  }

  const handleSingleSuspend = async () => {
    if (!suspendTargetId) return
    await suspendMutation.mutateAsync({
      id: suspendTargetId,
      reason: suspendReason.trim() || undefined,
    })
    setSuspendTargetId(null)
    setSuspendReason('')
  }

  const handleSingleActivate = async (id: number) => {
    if (!window.confirm('Activate this care circle household?')) return
    await activateMutation.mutateAsync(id)
  }

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enrollName || !enrollEmail) return
    setIsSubmittingEnroll(true)
    try {
      await apiPost('/platform/clients', {
        name: enrollName,
        owner_email: enrollEmail,
        plan_code: enrollPlan,
        timezone: enrollTimezone,
      })
      qc.invalidateQueries({ queryKey: ['platform', 'clients'] })
      setShowEnrollModal(false)
      setEnrollName('')
      setEnrollEmail('')
    } catch (err) {
      alert('Failed to enroll care circle: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsSubmittingEnroll(false)
    }
  }

  const handleExportCsv = () => {
    const token = localStorage.getItem('carecircle_token') || ''
    window.open(`/api/v1/platform/clients/export-csv?token=${encodeURIComponent(token)}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Client Households"
          description="Directory of family care circles, active members, medication regimens, subscription tiers, and operational statuses."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
          >
            <Download className="size-4" />
            <span>Export CSV</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setShowEnrollModal(true)}
          >
            <Plus className="size-4" />
            <span>Enroll Household</span>
          </Button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Total Clients</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">
                  {clients ? clients.length : '—'}
                </p>
                <p className="mt-0.5 text-xs text-teal-700">Enrolled care households</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                <Building2 className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Client Revenue (MRR)</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">
                  {formatCurrency(totalMrr)}
                </p>
                <p className="mt-0.5 text-xs text-teal-700">Monthly subscription volume</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-sage-100 text-sage-800">
                <DollarSign className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Members Monitored</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">
                  {totalMembers}
                </p>
                <p className="mt-0.5 text-xs text-teal-700">Seniors and caregivers</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                <Users className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Open Alerts</p>
                <p className="mt-1 text-2xl font-extrabold text-danger-700 font-mono">
                  {openAlertsCount}
                </p>
                <p className="mt-0.5 text-xs text-danger-600">Pending circle escalations</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-danger-100 text-danger-800">
                <ShieldAlert className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-teal-500 bg-teal-50/90 px-5 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-teal-950">
              {selectedIds.length === 1 ? '1 household selected' : `${selectedIds.length} households selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleBulkActivate}
              disabled={bulkActivateMutation.isPending}
              className="text-teal-800"
            >
              <PlayCircle className="size-3.5" />
              <span>Bulk Activate</span>
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleBulkSuspend}
              disabled={bulkSuspendMutation.isPending}
            >
              <PauseCircle className="size-3.5" />
              <span>Bulk Suspend</span>
            </Button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs font-semibold text-ink-600 hover:text-ink-900 pl-2"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH CONTROLS */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
              <input
                type="text"
                placeholder="Search by household name, caregiver, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-cream-300 bg-white pl-10 pr-4 py-2 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-600">
                <Filter className="size-3.5" />
                <span>Filters:</span>
              </div>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="rounded-lg border border-cream-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink-800"
              >
                <option value="">All Plan Tiers</option>
                <option value="starter">Starter / Essential ($19/mo)</option>
                <option value="family">Family / Comprehensive ($39/mo)</option>
                <option value="concierge">Concierge Care ($79/mo)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-cream-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink-800"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="past_due">Past Due</option>
              </select>

              {(search || planFilter || statusFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setPlanFilter('')
                    setStatusFilter('')
                  }}
                  className="rounded-lg bg-cream-200 px-2.5 py-1.5 text-xs font-bold text-ink-700 hover:bg-cream-300 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* CLIENTS DATA TABLE */}
      <Card>
        <CardHeader className="flex items-center justify-between border-b border-cream-300 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-ink-900">Enrolled Clients</h2>
            <p className="text-xs text-ink-500">
              Showing {filteredClients.length} of {clients ? clients.length : 0} registered households
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-ink-400 hover:text-ink-700"
            title="Refresh list"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </CardHeader>

        {isPending ? (
          <div className="p-8">
            <LoadingState label="Loading client directory..." />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-danger-700">
            Failed to load client households. Please ensure operator privileges are active.
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto size-10 text-ink-300" />
            <h3 className="mt-3 text-sm font-bold text-ink-900">No client households match your filters</h3>
            <p className="mt-1 text-xs text-ink-500">Try adjusting your search query or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink-800">
              <thead className="bg-cream-100/70 border-b border-cream-300 text-[10px] font-bold uppercase tracking-wider text-ink-600">
                <tr>
                  <th className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredClients.length && filteredClients.length > 0}
                      onChange={handleToggleSelectAll}
                      className="rounded-sm border-cream-300 text-teal-600"
                    />
                  </th>
                  <th className="px-4 py-3">Household / Client</th>
                  <th className="px-4 py-3">Plan Tier</th>
                  <th className="px-4 py-3">Primary Caregiver</th>
                  <th className="px-4 py-3 text-center">Members</th>
                  <th className="px-4 py-3 text-center">Meds</th>
                  <th className="px-4 py-3">MRR</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {filteredClients.map((client) => {
                  const tone = PLAN_TONES[client.plan_code] ?? 'teal'
                  const isSuspended = client.status === 'suspended'
                  const isSelected = selectedIds.includes(client.id)

                  return (
                    <tr
                      key={client.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-teal-50/70' : 'hover:bg-cream-50/60'
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(client.id)}
                          className="rounded-sm border-cream-300 text-teal-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to="/platform/clients/$clientId"
                          params={{ clientId: String(client.id) }}
                          className="font-bold text-ink-950 hover:text-teal-700 hover:underline flex items-center gap-1.5"
                        >
                          <span>{client.name}</span>
                        </Link>
                        <p className="text-[11px] text-ink-500 mt-0.5">{client.timezone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={tone}>{client.plan_name}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink-900">{client.owner.name}</p>
                        <p className="text-[11px] text-ink-500">{client.owner.email}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-semibold">
                        <span className="inline-flex items-center gap-1 text-ink-700">
                          <Users className="size-3 text-ink-400" />
                          {client.stats.members_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-semibold">
                        <span className="inline-flex items-center gap-1 text-ink-700">
                          <Pill className="size-3 text-teal-600" />
                          {client.stats.medications_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-ink-950">
                        {formatCurrency(client.mrr)}
                        <span className="text-[10px] font-normal text-ink-500">/mo</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={isSuspended ? 'danger' : 'teal'}>
                          {isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isSuspended ? (
                            <button
                              type="button"
                              onClick={() => handleSingleActivate(client.id)}
                              className="rounded-md border border-teal-300 bg-teal-50 px-2 py-1 text-[11px] font-bold text-teal-800 hover:bg-teal-100 transition-colors"
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSuspendTargetId(client.id)}
                              className="rounded-md border border-cream-300 bg-white px-2 py-1 text-[11px] font-bold text-danger-700 hover:bg-danger-50 transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                          <Link
                            to="/platform/clients/$clientId"
                            params={{ clientId: String(client.id) }}
                            className="inline-flex items-center gap-0.5 rounded-md border border-cream-300 bg-white px-2.5 py-1 text-[11px] font-bold text-ink-700 hover:bg-cream-100 transition-colors"
                          >
                            <span>Dossier</span>
                            <ArrowRight className="size-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ENROLL MODAL */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-bold text-ink-900 text-base">
                Enroll New Client Household
              </h3>
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="text-ink-400 hover:text-ink-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink-800 block mb-1">Household Name:</label>
                <input
                  type="text"
                  required
                  value={enrollName}
                  onChange={(e) => setEnrollName(e.target.value)}
                  placeholder="e.g. Miller Family Circle"
                  className="w-full rounded-xl border border-cream-300 p-2.5 text-xs text-ink-900 focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-ink-800 block mb-1">Primary Caregiver / Owner Email:</label>
                <input
                  type="email"
                  required
                  value={enrollEmail}
                  onChange={(e) => setEnrollEmail(e.target.value)}
                  placeholder="e.g. robert.miller@gmail.com"
                  className="w-full rounded-xl border border-cream-300 p-2.5 text-xs text-ink-900 focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-800 block mb-1">Plan Tier:</label>
                  <select
                    value={enrollPlan}
                    onChange={(e) => setEnrollPlan(e.target.value)}
                    className="w-full rounded-xl border border-cream-300 p-2 text-xs font-semibold text-ink-900"
                  >
                    <option value="starter">Starter ($19/mo)</option>
                    <option value="family">Family ($39/mo)</option>
                    <option value="concierge">Concierge ($79/mo)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink-800 block mb-1">Timezone:</label>
                  <select
                    value={enrollTimezone}
                    onChange={(e) => setEnrollTimezone(e.target.value)}
                    className="w-full rounded-xl border border-cream-300 p-2 text-xs font-semibold text-ink-900"
                  >
                    <option value="America/New_York">Eastern (ET)</option>
                    <option value="America/Chicago">Central (CT)</option>
                    <option value="America/Denver">Mountain (MT)</option>
                    <option value="America/Los_Angeles">Pacific (PT)</option>
                    <option value="Europe/London">London (GMT/BST)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-cream-200 pt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  disabled={isSubmittingEnroll}
                >
                  {isSubmittingEnroll ? 'Enrolling...' : 'Enroll Household'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUSPEND REASON MODAL */}
      {suspendTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-ink-900 text-base">
              Suspend Care Circle #{suspendTargetId}
            </h3>
            <p className="text-xs text-ink-600">
              Suspending this circle pauses automated dose reminders and voice check-in minutes. Clinical records remain safely preserved.
            </p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. Non-payment, patient request, or temporary hospitalization..."
              rows={3}
              className="w-full rounded-xl border border-cream-300 p-2.5 text-xs text-ink-900 focus:border-danger-500 focus:outline-hidden"
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSuspendTargetId(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={handleSingleSuspend}
                disabled={suspendMutation.isPending}
              >
                Confirm Suspension
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
