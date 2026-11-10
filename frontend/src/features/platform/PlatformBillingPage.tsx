import { useState } from 'react'
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
  CreditCard,
  Banknote,
  Printer,
  ShieldCheck,
  RefreshCw,
  X,
} from 'lucide-react'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { LoadingState } from '../../components/ui/states'
import { formatCurrency, formatDateTime } from '../../lib/format'
import type { PlatformBillingInvoice } from '../../lib/types'
import {
  useApproveCashInvoice,
  useBillingInvoices,
  usePendingCashInvoices,
  useRejectCashInvoice,
} from './hooks'

export function PlatformBillingPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedInvoice, setSelectedInvoice] = useState<PlatformBillingInvoice | null>(null)
  const [showRejectModal, setShowRejectModal] = useState<PlatformBillingInvoice | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data: billingData, isPending, refetch, isFetching } = useBillingInvoices({
    page,
    status: statusFilter,
    payment_method: methodFilter,
    search: search.trim() || undefined,
  })

  const { data: pendingCashData } = usePendingCashInvoices()
  const approveCashMutation = useApproveCashInvoice()
  const rejectCashMutation = useRejectCashInvoice()

  const invoices = billingData?.invoices?.data ?? []
  const stats = billingData?.stats ?? {
    total_count: 0,
    paid_count: 0,
    pending_cash_count: 0,
    pending_cash_cents: 0,
    total_revenue_cents: 0,
  }

  const handleApproveCash = async (invoiceId: number) => {
    if (!window.confirm('Confirm approving cash payment? This will mark the invoice as paid and activate the household care circle.')) {
      return
    }
    await approveCashMutation.mutateAsync(invoiceId)
  }

  const handleRejectCash = async () => {
    if (!showRejectModal) return
    await rejectCashMutation.mutateAsync({
      id: showRejectModal.id,
      reason: rejectReason.trim() || undefined,
    })
    setShowRejectModal(null)
    setRejectReason('')
  }

  const openHtmlInvoice = (invoiceId: number) => {
    const token = localStorage.getItem('carecircle_token') || ''
    window.open(`/api/v1/platform/billing/invoices/${invoiceId}/html?token=${encodeURIComponent(token)}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Billing & Invoices"
          description="Global financial ledger, payment settlement queues, manual cash reconciliations, and printable tax invoices."
        />
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* FINANCIAL METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Collected Revenue</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">
                  {formatCurrency(stats.total_revenue_cents / 100)}
                </p>
                <p className="mt-0.5 text-xs text-teal-700">All settled payments</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                <DollarSign className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Pending Cash Queue</p>
                <p className="mt-1 text-2xl font-extrabold text-amber-900 font-mono">
                  {formatCurrency(stats.pending_cash_cents / 100)}
                </p>
                <p className="mt-0.5 text-xs text-amber-700">{stats.pending_cash_count} invoices awaiting clinic verification</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <Banknote className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Settled Invoices</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">
                  {stats.paid_count}
                </p>
                <p className="mt-0.5 text-xs text-ink-500">of {stats.total_count} total generated</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-sage-100 text-sage-800">
                <CheckCircle2 className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Collection Rate</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">
                  {stats.total_count > 0 ? Math.round((stats.paid_count / stats.total_count) * 100) : 100}%
                </p>
                <p className="mt-0.5 text-xs text-teal-700">Financial fulfillment</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-cream-200 text-ink-800">
                <ShieldCheck className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* PENDING CASH APPROVAL ALERT BANNER */}
      {pendingCashData && pendingCashData.data && pendingCashData.data.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-amber-200 text-amber-900 font-bold">
                <Clock className="size-4" />
              </span>
              <div>
                <h3 className="font-bold text-amber-950 text-sm sm:text-base">
                  Action Required: {pendingCashData.count} Pending Cash & Voucher Settlements
                </h3>
                <p className="text-xs text-amber-800">
                  Payments made via on-site partner clinic or cash transfer need platform verification before care circle upgrade.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingCashData.data.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col justify-between rounded-xl border border-amber-200 bg-white p-4 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-900">{inv.invoice_number}</span>
                    <span className="text-sm font-extrabold font-mono text-ink-900">
                      {formatCurrency(inv.amount_cents / 100)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-ink-900">
                    {inv.care_circle?.name || 'Household Circle'}
                  </p>
                  <p className="text-xs text-ink-500">Plan: {inv.plan_code.toUpperCase()}</p>
                  {inv.notes && (
                    <p className="mt-1 text-xs italic text-ink-600 bg-cream-50 p-1.5 rounded-md border border-cream-200">
                      &quot;{inv.notes}&quot;
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 pt-2 border-t border-cream-200">
                  <Button
                    size="sm"
                    onClick={() => handleApproveCash(inv.id)}
                    disabled={approveCashMutation.isPending}
                    className="flex-1"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>Approve</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setShowRejectModal(inv)}
                  >
                    Reject
                  </Button>
                  <button
                    type="button"
                    onClick={() => openHtmlInvoice(inv.id)}
                    className="p-1 text-ink-400 hover:text-ink-700 transition-colors"
                    title="Print Invoice"
                  >
                    <Printer className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTERS & SEARCH */}
      <Card>
        <CardBody className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search invoice number, household name..."
                className="w-full rounded-xl border border-cream-300 bg-cream-50/50 py-2 pl-9 pr-4 text-xs font-medium text-ink-900 focus:border-teal-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-ink-600">
                <Filter className="size-3.5" />
                <span>Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-lg border border-cream-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-800"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>

              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-lg border border-cream-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-800"
              >
                <option value="all">All Methods</option>
                <option value="card">Credit Card (Stripe)</option>
                <option value="cash">Cash / Clinic Voucher</option>
                <option value="bank_transfer">Bank Wire</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* INVOICES TABLE */}
      <Card>
        <CardHeader className="flex items-center justify-between border-b border-cream-200 px-5 py-4">
          <div>
            <h3 className="font-bold text-ink-900 text-base">Invoices Ledger</h3>
            <p className="text-xs text-ink-500">Every charge, subscription installment, and settlement.</p>
          </div>
          <span className="text-xs text-ink-500 font-mono">
            {billingData?.invoices?.total ?? 0} invoices recorded
          </span>
        </CardHeader>

        <CardBody className="p-0">
          {isPending ? (
            <div className="py-12">
              <LoadingState label="Loading financial ledger..." />
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-12 text-center text-sm text-ink-500">
              No invoices match the chosen filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100/70 border-b border-cream-200 text-ink-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Invoice #</th>
                    <th className="px-4 py-3.5">Household Circle</th>
                    <th className="px-4 py-3.5">Plan</th>
                    <th className="px-4 py-3.5">Amount</th>
                    <th className="px-4 py-3.5">Method</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200 text-ink-800">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-cream-50/60 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-ink-900">
                        {inv.invoice_number}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-ink-900">
                          {inv.care_circle?.name || `Circle #${inv.care_circle_id}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="teal">{inv.plan_code}</Badge>
                      </td>
                      <td className="px-4 py-3 font-mono font-extrabold text-ink-900">
                        {formatCurrency(inv.amount_cents / 100)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 font-medium capitalize text-ink-700">
                          {inv.payment_method === 'card' && <CreditCard className="size-3.5 text-teal-700" />}
                          {inv.payment_method === 'cash' && <Banknote className="size-3.5 text-amber-700" />}
                          {inv.payment_method === 'bank_transfer' && <FileText className="size-3.5 text-ink-600" />}
                          {inv.payment_method.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            inv.status === 'paid'
                              ? 'teal'
                              : inv.status === 'pending'
                              ? 'warn'
                              : inv.status === 'refunded'
                              ? 'neutral'
                              : 'danger'
                          }
                        >
                          {inv.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-ink-500 font-mono text-[11px]">
                        {formatDateTime(inv.created_at)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            className="rounded-md border border-cream-300 bg-white px-2.5 py-1 text-xs font-semibold text-ink-700 hover:bg-cream-100 transition-colors"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => openHtmlInvoice(inv.id)}
                            className="rounded-md border border-cream-300 bg-white p-1 text-ink-500 hover:text-teal-700 hover:bg-cream-100 transition-colors"
                            title="Print HTML Invoice"
                          >
                            <Printer className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* DETAIL MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="size-5 text-teal-700" />
                <h3 className="font-bold text-ink-900 text-lg">
                  Invoice {selectedInvoice.invoice_number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="text-ink-400 hover:text-ink-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-cream-50 p-3 rounded-xl border border-cream-200">
                <div>
                  <span className="text-ink-500 block">Household Circle:</span>
                  <span className="font-bold text-ink-900 text-sm">
                    {selectedInvoice.care_circle?.name || `Circle #${selectedInvoice.care_circle_id}`}
                  </span>
                </div>
                <div>
                  <span className="text-ink-500 block">Status:</span>
                  <Badge tone={selectedInvoice.status === 'paid' ? 'teal' : 'warn'}>
                    {selectedInvoice.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-ink-500 block">Amount Due / Paid:</span>
                  <span className="font-extrabold text-ink-900 text-base font-mono">
                    {formatCurrency(selectedInvoice.amount_cents / 100)} {selectedInvoice.currency}
                  </span>
                </div>
                <div>
                  <span className="text-ink-500 block">Payment Method:</span>
                  <span className="font-semibold text-ink-900 capitalize">
                    {selectedInvoice.payment_method.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-ink-900 block mb-1">Line Items:</span>
                <div className="border border-cream-200 rounded-xl divide-y divide-cream-100 overflow-hidden">
                  {(selectedInvoice.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between p-2.5 bg-white">
                      <span className="text-ink-700 font-medium">{item.description}</span>
                      <span className="font-mono font-bold text-ink-900">
                        {formatCurrency(item.amount_cents / 100)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <span className="font-bold text-amber-900 block">Admin / Client Notes:</span>
                  <p className="text-amber-800 mt-0.5">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-cream-200 pt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openHtmlInvoice(selectedInvoice.id)}
              >
                <Printer className="size-4" />
                <span>Open Printable Invoice</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setSelectedInvoice(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-ink-900 text-base">
              Reject Cash Settlement: {showRejectModal.invoice_number}
            </h3>
            <p className="text-xs text-ink-600">
              Provide an explanation for rejecting this cash settlement. The invoice will remain unpaid and the care circle will not be upgraded.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Voucher invalid or clinic receipt not received..."
              className="w-full rounded-xl border border-cream-300 p-3 text-xs text-ink-900 focus:border-danger-500 focus:outline-hidden"
              rows={3}
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowRejectModal(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={handleRejectCash}
                disabled={rejectCashMutation.isPending}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
