import { useState } from 'react'
import {
  CheckCircle,
  RotateCcw,
  Clock,
  Calculator,
} from 'lucide-react'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { LoadingState } from '../../components/ui/states'
import { formatCurrency, formatDateTime } from '../../lib/format'
import type { RefundRecord, RefundsPayload } from '../../lib/types'
import {
  useApproveRefund,
  useCheckRefundEligibility,
  useRefunds,
  useRejectRefund,
  useUpdateRefundPolicy,
} from './hooks'

export function PlatformRefundsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data: refundsData, isPending } = useRefunds({
    status: statusFilter,
    page,
  })

  if (isPending || !refundsData) {
    return (
      <div className="py-12">
        <LoadingState label="Loading refund ledgers and satisfaction policies..." />
      </div>
    )
  }

  return (
    <RefundsPageContent
      refundsData={refundsData}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      setPage={setPage}
    />
  )
}

function RefundsPageContent({
  refundsData,
  statusFilter,
  setStatusFilter,
  setPage,
}: {
  refundsData: RefundsPayload
  statusFilter: string
  setStatusFilter: (s: string) => void
  setPage: (p: number) => void
}) {
  const [activeTab, setActiveTab] = useState<'requests' | 'policy' | 'calculator'>('requests')

  // Policy form state
  const [policyMarkdown, setPolicyMarkdown] = useState(refundsData.policy.policy_markdown || '')
  const [windowDays, setWindowDays] = useState(refundsData.policy.refund_window_days || 14)
  const [monthlyPercent, setMonthlyPercent] = useState(refundsData.policy.monthly_refund_percent || 100)
  const [annualPercent, setAnnualPercent] = useState(refundsData.policy.annual_refund_percent || 85)
  const [contactEmail, setContactEmail] = useState(refundsData.policy.contact_email || 'billing@carecircle.app')

  // Eligibility check state
  const [testInvoiceId, setTestInvoiceId] = useState<number>(0)
  const [inputInvoiceId, setInputInvoiceId] = useState('')

  // Approve / Reject modal state
  const [selectedRefund, setSelectedRefund] = useState<RefundRecord | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [actionNotes, setActionNotes] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  const { data: eligibilityData, isFetching: isCheckingEligibility } = useCheckRefundEligibility(testInvoiceId)

  const approveMutation = useApproveRefund()
  const rejectMutation = useRejectRefund()
  const updatePolicyMutation = useUpdateRefundPolicy()

  const refunds = refundsData.refunds.data ?? []
  const stats = refundsData.stats ?? {
    total_refunded_cents: 0,
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
    avg_turnaround_hours: 8,
  }

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updatePolicyMutation.mutateAsync({
        policy_markdown: policyMarkdown,
        refund_window_days: Number(windowDays),
        monthly_refund_percent: Number(monthlyPercent),
        annual_refund_percent: Number(annualPercent),
        contact_email: contactEmail,
      })
      setNotice('Refund policy terms updated and published.')
      setTimeout(() => setNotice(null), 4000)
    } catch (err) {
      alert('Failed to update policy: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleConfirmAction = async () => {
    if (!selectedRefund || !actionType) return
    try {
      if (actionType === 'approve') {
        await approveMutation.mutateAsync({
          id: selectedRefund.id,
          admin_notes: actionNotes.trim() || undefined,
        })
        setNotice(`Refund #${selectedRefund.id} approved. Gateway credit initiated.`)
      } else {
        await rejectMutation.mutateAsync({
          id: selectedRefund.id,
          reason: actionNotes.trim() || undefined,
        })
        setNotice(`Refund #${selectedRefund.id} marked as rejected.`)
      }
      setSelectedRefund(null)
      setActionType(null)
      setActionNotes('')
      setTimeout(() => setNotice(null), 4000)
    } catch (err) {
      alert('Action failed: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-300 pb-4">
        <PageHeader
          title="Refunds & Satisfaction Guarantees"
          description="Review patient family refund requests, calculate pro-rata eligibility, and manage subscription satisfaction terms."
        />

        <div className="flex rounded-xl bg-cream-200/80 p-1 text-xs font-bold text-ink-700">
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'requests' ? 'bg-white text-teal-800 shadow-xs' : 'hover:text-ink-900'
            }`}
          >
            Refund Requests ({stats.pending_count} Pending)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'calculator' ? 'bg-white text-teal-800 shadow-xs' : 'hover:text-ink-900'
            }`}
          >
            Eligibility Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('policy')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'policy' ? 'bg-white text-teal-800 shadow-xs' : 'hover:text-ink-900'
            }`}
          >
            Policy & Terms
          </button>
        </div>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-xl bg-ok-50 border border-ok-200 p-4 text-xs font-semibold text-ok-700 shadow-xs">
          <CheckCircle className="size-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Total Refunded</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">
                  {formatCurrency(stats.total_refunded_cents / 100)}
                </p>
                <p className="mt-0.5 text-xs text-ink-500">All-time processed credits</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-cream-200 text-ink-800">
                <RotateCcw className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Pending Review</p>
                <p className="mt-1 text-2xl font-extrabold text-amber-900 font-mono">
                  {stats.pending_count}
                </p>
                <p className="mt-0.5 text-xs text-amber-700">Awaiting operator decision</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <Clock className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Approved Guarantees</p>
                <p className="mt-1 text-2xl font-extrabold text-teal-900 font-mono">
                  {stats.approved_count}
                </p>
                <p className="mt-0.5 text-xs text-teal-700">Honored satisfaction claims</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                <CheckCircle className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Avg Resolution</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">
                  {stats.avg_turnaround_hours}h
                </p>
                <p className="mt-0.5 text-xs text-ink-500">Median turnaround time</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-cream-200 text-ink-800">
                <Clock className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* TAB 1: REQUESTS */}
      {activeTab === 'requests' && (
        <Card>
          <CardHeader className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink-700">Status Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-lg border border-cream-300 bg-white px-2.5 py-1 text-xs font-semibold text-ink-800"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <span className="text-xs text-ink-500 font-mono">
              {refundsData.refunds.total ?? 0} refund requests
            </span>
          </CardHeader>

          <CardBody className="p-0">
            {refunds.length === 0 ? (
              <div className="py-12 text-center text-sm text-ink-500">
                No refund requests match this criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream-100/70 border-b border-cream-200 text-[10px] font-bold uppercase tracking-wider text-ink-600">
                    <tr>
                      <th className="px-5 py-3">ID / Date</th>
                      <th className="px-4 py-3">Household / User</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200 text-ink-800">
                    {refunds.map((r) => (
                      <tr key={r.id} className="hover:bg-cream-50/60 transition-colors">
                        <td className="px-5 py-3 font-mono">
                          <span className="font-bold text-ink-900 block">#{r.id}</span>
                          <span className="text-[10px] text-ink-500">{formatDateTime(r.created_at)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-ink-900 block">
                            {r.care_circle?.name || 'Household Circle'}
                          </span>
                          <span className="text-[11px] text-ink-500">{r.user?.email}</span>
                        </td>
                        <td className="px-4 py-3 font-mono font-extrabold text-ink-900">
                          {formatCurrency(r.amount_cents / 100)} {r.currency}
                        </td>
                        <td className="px-4 py-3 max-w-xs text-ink-600 line-clamp-2">
                          {r.reason}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            tone={
                              r.status === 'approved'
                                ? 'teal'
                                : r.status === 'pending'
                                ? 'warn'
                                : 'danger'
                            }
                          >
                            {r.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {r.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRefund(r)
                                  setActionType('approve')
                                }}
                                className="rounded-md border border-teal-300 bg-teal-50 px-2 py-1 text-xs font-bold text-teal-800 hover:bg-teal-100 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRefund(r)
                                  setActionType('reject')
                                }}
                                className="rounded-md border border-cream-300 bg-white px-2 py-1 text-xs font-bold text-danger-700 hover:bg-danger-50 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-ink-400 font-medium italic">
                              Processed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* TAB 2: ELIGIBILITY CALCULATOR */}
      {activeTab === 'calculator' && (
        <Card>
          <CardHeader className="px-5 py-4 border-b border-cream-200">
            <div className="flex items-center gap-2">
              <Calculator className="size-4 text-teal-700" />
              <h3 className="font-bold text-ink-900 text-sm">Automated Refund Eligibility Checker</h3>
            </div>
          </CardHeader>
          <CardBody className="p-5 space-y-4 text-xs">
            <p className="text-ink-600">
              Input an invoice ID to evaluate satisfaction guarantee policy compliance (14-day enrollment window & pro-rata deduction).
            </p>

            <div className="flex gap-2 max-w-sm">
              <input
                type="number"
                value={inputInvoiceId}
                onChange={(e) => setInputInvoiceId(e.target.value)}
                placeholder="Enter Invoice ID (e.g. 1)"
                className="flex-1 rounded-xl border border-cream-300 p-2 text-xs text-ink-900 font-mono"
              />
              <Button
                size="sm"
                onClick={() => setTestInvoiceId(Number(inputInvoiceId))}
                disabled={!inputInvoiceId || isCheckingEligibility}
              >
                Check Eligibility
              </Button>
            </div>

            {testInvoiceId > 0 && eligibilityData && (
              <div className="bg-cream-50 rounded-xl p-4 border border-cream-200 space-y-3 mt-4">
                <div className="flex items-center gap-2">
                  <Badge tone={eligibilityData.eligible ? 'teal' : 'danger'}>
                    {eligibilityData.eligible ? 'ELIGIBLE FOR REFUND' : 'INELIGIBLE'}
                  </Badge>
                  <span className="font-mono text-ink-700">
                    Days elapsed since charge: {eligibilityData.days_since_invoice} days (Policy: {eligibilityData.policy_window_days} days)
                  </span>
                </div>

                <div>
                  <span className="text-ink-500 block">Maximum Allowable Refund:</span>
                  <span className="text-lg font-mono font-extrabold text-ink-900">
                    {formatCurrency(eligibilityData.max_refundable_cents / 100)}
                  </span>
                </div>

                <div>
                  <span className="font-bold text-ink-800 block mb-1">Audit Policy Evaluation:</span>
                  <ul className="list-disc list-inside space-y-1 text-ink-700">
                    {eligibilityData.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* TAB 3: POLICY & TERMS */}
      {activeTab === 'policy' && (
        <Card>
          <CardHeader className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-ink-900 text-sm">Customer Satisfaction Policy Editor</h3>
              <p className="text-[11px] text-ink-500">Public policy terms rendered to subscribing families</p>
            </div>
          </CardHeader>
          <CardBody className="p-5">
            <form onSubmit={handleSavePolicy} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-ink-800 block mb-1">Satisfaction Window (Days):</label>
                  <input
                    type="number"
                    value={windowDays}
                    onChange={(e) => setWindowDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink-800 block mb-1">Monthly Refund (%):</label>
                  <input
                    type="number"
                    value={monthlyPercent}
                    onChange={(e) => setMonthlyPercent(Number(e.target.value))}
                    className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink-800 block mb-1">Annual Refund (%):</label>
                  <input
                    type="number"
                    value={annualPercent}
                    onChange={(e) => setAnnualPercent(Number(e.target.value))}
                    className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink-800 block mb-1">Billing Support Email:</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink-800 block mb-1">Public Policy Markdown:</label>
                <textarea
                  rows={8}
                  value={policyMarkdown}
                  onChange={(e) => setPolicyMarkdown(e.target.value)}
                  className="w-full font-mono rounded-xl border border-cream-300 p-3 text-xs text-ink-900 focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  type="submit"
                  disabled={updatePolicyMutation.isPending}
                >
                  {updatePolicyMutation.isPending ? 'Saving...' : 'Update & Publish Policy'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* APPROVE / REJECT MODAL */}
      {selectedRefund && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-ink-900 text-base">
              {actionType === 'approve' ? 'Approve Refund Request' : 'Reject Refund Request'} #{selectedRefund.id}
            </h3>
            <p className="text-xs text-ink-600">
              Household: <strong>{selectedRefund.care_circle?.name || 'Household Circle'}</strong> · Amount:{' '}
              <strong className="font-mono">{formatCurrency(selectedRefund.amount_cents / 100)}</strong>
            </p>

            <div>
              <label className="font-bold text-ink-800 block mb-1">
                {actionType === 'approve' ? 'Operator Audit Notes (Optional):' : 'Rejection Reason (Required):'}
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={
                  actionType === 'approve'
                    ? 'e.g. 14-day satisfaction guarantee honored.'
                    : 'e.g. Request submitted after 14-day policy window...'
                }
                rows={3}
                className="w-full rounded-xl border border-cream-300 p-2.5 text-xs text-ink-900 focus:border-teal-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-cream-200 pt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedRefund(null)
                  setActionType(null)
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant={actionType === 'approve' ? 'primary' : 'danger'}
                onClick={handleConfirmAction}
                disabled={actionType === 'reject' && !actionNotes.trim()}
              >
                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
