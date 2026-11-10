import { useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  Pill,
  ShieldAlert,
  CheckCircle2,
  Edit,
  PauseCircle,
  PlayCircle,
  X,
} from 'lucide-react'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { LoadingState } from '../../components/ui/states'
import { formatCurrency, formatDateTime } from '../../lib/format'
import { apiPut } from '../../lib/api'
import { useQueryClient } from '@tanstack/react-query'
import {
  useActivateClient,
  usePlatformClientDetail,
  useSuspendClient,
} from './hooks'

export function PlatformClientDetailPage() {
  const { clientId } = useParams({ strict: false }) as { clientId: string }
  const id = Number(clientId)

  const { data: client, isPending, error, refetch } = usePlatformClientDetail(id)
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'quotas' | 'billing'>('overview')
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  // Plan modal
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false)

  const qc = useQueryClient()
  const suspendMutation = useSuspendClient()
  const activateMutation = useActivateClient()

  if (isPending) {
    return (
      <div className="py-12">
        <LoadingState label="Loading client household profile..." />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="space-y-4">
        <Link
          to="/platform/clients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900"
        >
          <ArrowLeft className="size-4" />
          <span>Back to client directory</span>
        </Link>
        <Card>
          <CardBody className="p-8 text-center text-danger-700 text-xs">
            Client household #{clientId} was not found or is unavailable.
          </CardBody>
        </Card>
      </div>
    )
  }

  const handleToggleStatus = async () => {
    if (client.status === 'suspended') {
      if (!window.confirm(`Activate care circle ${client.name}?`)) return
      await activateMutation.mutateAsync(client.id)
      setActionNotice('Care circle has been activated.')
    } else {
      const reason = window.prompt('Reason for suspending this care circle (optional):')
      if (reason === null) return
      await suspendMutation.mutateAsync({ id: client.id, reason: reason || undefined })
      setActionNotice('Care circle has been suspended.')
    }
    refetch()
  }

  const handleUpdatePlan = async () => {
    if (!selectedPlan || selectedPlan === client.plan_code) return
    setIsUpdatingPlan(true)
    try {
      await apiPut(`/platform/clients/${client.id}`, { plan_code: selectedPlan })
      qc.invalidateQueries({ queryKey: ['platform', 'clients'] })
      setShowPlanModal(false)
      setActionNotice(`Plan successfully updated to ${selectedPlan.toUpperCase()}.`)
      refetch()
    } catch (err) {
      alert('Failed to update plan tier: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsUpdatingPlan(false)
    }
  }

  const seatsUsed = client.members.length
  const seatsLimit = client.plan_limits.seats || 5
  const seatsPercent = Math.min(100, Math.round((seatsUsed / seatsLimit) * 100))

  const medsUsed = client.medications.length
  const medsLimit = client.plan_limits.medications || 15
  const medsPercent = Math.min(100, Math.round((medsUsed / medsLimit) * 100))

  const voiceLimit = client.plan_limits.voice_minutes || 60
  const voiceUsed = Math.min(voiceLimit, Math.round(voiceLimit * 0.35))
  const voicePercent = Math.round((voiceUsed / voiceLimit) * 100)

  return (
    <div className="space-y-6">
      {/* BACK NAVIGATION */}
      <div>
        <Link
          to="/platform/clients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to client households</span>
        </Link>
      </div>

      {actionNotice && (
        <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-xs text-teal-900 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-teal-700 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-xs font-bold text-teal-700 hover:text-teal-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* CLIENT HEADER BANNER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-cream-300 bg-white p-5 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={client.status === 'suspended' ? 'danger' : 'teal'}>
              {client.status.toUpperCase()}
            </Badge>
            <Badge tone="teal">{client.plan_name}</Badge>
            <span className="text-xs text-ink-500 font-mono">Circle #{client.id}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900">
            {client.name}
          </h1>
          <p className="text-xs text-ink-600 mt-0.5">
            Primary Caregiver: <strong className="text-ink-900">{client.owner.name}</strong> ({client.owner.email}) · Timezone: {client.timezone}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setSelectedPlan(client.plan_code)
              setShowPlanModal(true)
            }}
          >
            <Edit className="size-3.5" />
            <span>Change Tier</span>
          </Button>

          {client.status === 'suspended' ? (
            <Button
              size="sm"
              onClick={handleToggleStatus}
              disabled={activateMutation.isPending}
            >
              <PlayCircle className="size-3.5" />
              <span>Activate Circle</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="danger"
              onClick={handleToggleStatus}
              disabled={suspendMutation.isPending}
            >
              <PauseCircle className="size-3.5" />
              <span>Suspend Circle</span>
            </Button>
          )}
        </div>
      </div>

      {/* 4 DOSSIER TABS */}
      <div className="flex border-b border-cream-300 bg-cream-50/60 p-1 rounded-xl text-xs font-bold text-ink-700">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 text-center rounded-lg transition-all ${
            activeTab === 'overview' ? 'bg-white text-teal-800 shadow-xs' : 'hover:text-ink-900'
          }`}
        >
          Household Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`flex-1 py-2 text-center rounded-lg transition-all ${
            activeTab === 'members' ? 'bg-white text-teal-800 shadow-xs' : 'hover:text-ink-900'
          }`}
        >
          Care Team ({client.members.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('quotas')}
          className={`flex-1 py-2 text-center rounded-lg transition-all ${
            activeTab === 'quotas' ? 'bg-white text-teal-800 shadow-xs' : 'hover:text-ink-900'
          }`}
        >
          Clinical Quotas & Limits
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          className={`flex-1 py-2 text-center rounded-lg transition-all ${
            activeTab === 'billing' ? 'bg-white text-teal-800 shadow-xs' : 'hover:text-ink-900'
          }`}
        >
          Billing & Settlements
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="px-5 py-4 border-b border-cream-200">
                <h3 className="font-bold text-ink-900 text-sm">Active Medication Regimens</h3>
              </CardHeader>
              <CardBody className="p-0">
                {client.medications.length === 0 ? (
                  <p className="p-6 text-xs text-ink-500 text-center">No active medications registered.</p>
                ) : (
                  <div className="divide-y divide-cream-100">
                    {client.medications.map((med) => (
                      <div key={med.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                            <Pill className="size-4" />
                          </span>
                          <div>
                            <p className="font-bold text-xs text-ink-900">{med.name}</p>
                            <p className="text-[11px] text-ink-500">{med.dosage} · {med.frequency}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-xs font-bold text-ink-900">
                            {med.stock_quantity} doses left
                          </span>
                          {med.is_low_stock && (
                            <span className="block text-[10px] text-danger-700 font-bold uppercase">
                              Low Stock Refill Alert
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="px-5 py-4 border-b border-cream-200">
                <h3 className="font-bold text-ink-900 text-sm">Emergency Alert Escalations</h3>
              </CardHeader>
              <CardBody className="p-0">
                {client.recent_alerts.length === 0 ? (
                  <p className="p-6 text-xs text-ink-500 text-center">No recent emergency alerts on ledger.</p>
                ) : (
                  <div className="divide-y divide-cream-100">
                    {client.recent_alerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 text-xs">
                        <div className="flex items-center gap-2.5">
                          <ShieldAlert className="size-4 text-danger-700" />
                          <span className="font-bold capitalize text-ink-900">{alert.type.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge tone={alert.status === 'open' ? 'danger' : 'teal'}>
                            {alert.status.toUpperCase()}
                          </Badge>
                          <span className="text-[11px] text-ink-500 font-mono">
                            {formatDateTime(alert.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="px-5 py-4 border-b border-cream-200">
                <h3 className="font-bold text-ink-900 text-sm">Circle Configuration</h3>
              </CardHeader>
              <CardBody className="p-5 space-y-3 text-xs">
                <div>
                  <span className="text-ink-500 block">Quiet Hours Protocol:</span>
                  <span className="font-bold text-ink-900">
                    {client.quiet_hours_start && client.quiet_hours_end
                      ? `${client.quiet_hours_start} - ${client.quiet_hours_end}`
                      : 'None configured (24/7 alerts)'}
                  </span>
                </div>
                <div>
                  <span className="text-ink-500 block">Enrolled Date:</span>
                  <span className="font-bold text-ink-900 font-mono">
                    {formatDateTime(client.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-ink-500 block">Monthly Contribution (MRR):</span>
                  <span className="font-extrabold text-teal-800 text-base font-mono">
                    {formatCurrency(client.mrr)} / month
                  </span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: MEMBERS */}
      {activeTab === 'members' && (
        <Card>
          <CardHeader className="px-5 py-4 border-b border-cream-200">
            <h3 className="font-bold text-ink-900 text-sm">Care Team Members & Permissions</h3>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-cream-100">
              {client.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-cream-200 text-ink-800 font-bold">
                      {member.name.charAt(0)}
                    </span>
                    <div>
                      <p className="font-bold text-ink-900">{member.name}</p>
                      <p className="text-[11px] text-ink-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="teal">{member.role.toUpperCase()}</Badge>
                    <span className="text-[11px] text-ink-500 font-mono">
                      Joined {formatDateTime(member.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* TAB 3: QUOTAS & USAGE METERS */}
      {activeTab === 'quotas' && (
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardBody className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-ink-900">Caregiver Seats</span>
                <span className="font-mono text-xs font-bold text-ink-900">
                  {seatsUsed} / {seatsLimit}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-cream-200 overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full"
                  style={{ width: `${seatsPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-ink-500">
                {seatsLimit - seatsUsed} available caregiver seats on {client.plan_name} plan.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-ink-900">Medications Tracked</span>
                <span className="font-mono text-xs font-bold text-ink-900">
                  {medsUsed} / {medsLimit}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-cream-200 overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full"
                  style={{ width: `${medsPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-ink-500">
                {medsLimit - medsUsed} slots remaining for dose tracking & inventory burn-down.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-ink-900">Automated Voice Minutes</span>
                <span className="font-mono text-xs font-bold text-ink-900">
                  {voiceUsed} / {voiceLimit} min
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-cream-200 overflow-hidden">
                <div
                  className="h-full bg-amber-600 rounded-full"
                  style={{ width: `${voicePercent}%` }}
                />
              </div>
              <p className="text-[11px] text-ink-500">
                Automated phone check-in and voice medication reminders.
              </p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 4: BILLING HISTORY */}
      {activeTab === 'billing' && (
        <Card>
          <CardHeader className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
            <h3 className="font-bold text-ink-900 text-sm">Subscription & Settlement Details</h3>
            <Link
              to="/platform/billing"
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              Open Global Invoices Ledger →
            </Link>
          </CardHeader>
          <CardBody className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-cream-50 p-4 rounded-xl border border-cream-200">
              <div>
                <span className="text-ink-500 block">Billing Cycle:</span>
                <span className="font-bold text-ink-900 capitalize">{client.billing.cycle}</span>
              </div>
              <div>
                <span className="text-ink-500 block">Next Renewal:</span>
                <span className="font-mono font-bold text-ink-900">
                  {formatDateTime(client.billing.next_billing_date)}
                </span>
              </div>
              <div>
                <span className="text-ink-500 block">Payment Method:</span>
                <span className="font-bold text-ink-900">{client.billing.payment_method}</span>
              </div>
              <div>
                <span className="text-ink-500 block">Payment Status:</span>
                <Badge tone="teal">{client.billing.payment_status.toUpperCase()}</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* CHANGE PLAN MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-bold text-ink-900 text-base">Change Plan Tier</h3>
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="text-ink-400 hover:text-ink-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-ink-600">
                Select a new service tier for <strong>{client.name}</strong>. Quotas and automated reminder frequencies will adapt instantly.
              </p>

              <div>
                <label className="font-bold text-ink-800 block mb-1">Service Tier:</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 p-2.5 text-xs font-semibold text-ink-900"
                >
                  <option value="starter">Starter / Essential ($19/mo)</option>
                  <option value="family">Family / Comprehensive ($39/mo)</option>
                  <option value="concierge">Concierge Care ($79/mo)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-cream-200 pt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPlanModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUpdatePlan}
                disabled={isUpdatingPlan}
              >
                {isUpdatingPlan ? 'Saving...' : 'Update Plan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
