import { useState } from 'react'
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Filter,
  Clock,
  ShieldAlert,
  Edit3,
  X,
  RefreshCw,
} from 'lucide-react'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { LoadingState } from '../../components/ui/states'
import { formatDateTime } from '../../lib/format'
import type { PlatformFeedbackReport } from '../../lib/types'
import { usePlatformFeedback, useUpdateFeedbackReport } from './hooks'

export function PlatformFeedbackPage() {
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [openOnly, setOpenOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [selectedReport, setSelectedReport] = useState<PlatformFeedbackReport | null>(null)

  // Edit triage modal state
  const [triageReport, setTriageReport] = useState<PlatformFeedbackReport | null>(null)
  const [triageStatus, setTriageStatus] = useState<string>('triaged')
  const [triagePriority, setTriagePriority] = useState<string>('medium')
  const [adminNotes, setAdminNotes] = useState<string>('')

  const { data: feedbackData, isPending, refetch, isFetching } = usePlatformFeedback({
    type: typeFilter,
    priority: priorityFilter,
    status: statusFilter,
    open_only: openOnly,
    page,
  })

  const updateReportMutation = useUpdateFeedbackReport()

  const reports = feedbackData?.data ?? []
  const summary = feedbackData?.summary ?? {
    total: 0,
    open: 0,
    critical_open: 0,
    by_status: {},
    by_type: {},
  }

  const handleOpenTriage = (report: PlatformFeedbackReport) => {
    setTriageReport(report)
    setTriageStatus(report.status)
    setTriagePriority(report.priority)
    setAdminNotes(report.admin_notes || '')
  }

  const handleSaveTriage = async () => {
    if (!triageReport) return
    await updateReportMutation.mutateAsync({
      id: triageReport.id,
      status: triageStatus,
      priority: triagePriority,
      admin_notes: adminNotes.trim() || undefined,
    })
    setTriageReport(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Feedback & Bug Triage"
          description="Inbound user feedback, reported mobile anomalies, usability tickets, and clinical feature requests."
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

      {/* SUMMARY KPI CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Open Tickets</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">
                  {summary.open}
                </p>
                <p className="mt-0.5 text-xs text-amber-700">Awaiting resolution</p>
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
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Critical Issues</p>
                <p className="mt-1 text-2xl font-extrabold text-danger-800 font-mono">
                  {summary.critical_open}
                </p>
                <p className="mt-0.5 text-xs text-danger-700">Needs immediate attention</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-danger-100 text-danger-800">
                <ShieldAlert className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Bug Reports</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900 font-mono">
                  {summary.by_type?.bug ?? 0}
                </p>
                <p className="mt-0.5 text-xs text-ink-500">Software anomalies</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-cream-200 text-ink-800">
                <Bug className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Feature Requests</p>
                <p className="mt-1 text-2xl font-extrabold text-teal-800 font-mono">
                  {summary.by_type?.feature_request ?? 0}
                </p>
                <p className="mt-0.5 text-xs text-teal-700">Client improvements</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                <Lightbulb className="size-6" />
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* FILTER BAR */}
      <Card>
        <CardBody className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-ink-600 font-bold">
                <Filter className="size-3.5" />
                <span>Filters:</span>
              </div>

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-lg border border-cream-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-800"
              >
                <option value="all">All Types</option>
                <option value="bug">Bugs</option>
                <option value="feedback">General Feedback</option>
                <option value="feature_request">Feature Requests</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-lg border border-cream-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-800"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-lg border border-cream-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-800"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="triaged">Triaged</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="wont_fix">Won't Fix</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs font-medium text-ink-700 cursor-pointer pl-2">
                <input
                  type="checkbox"
                  checked={openOnly}
                  onChange={(e) => {
                    setOpenOnly(e.target.checked)
                    setPage(1)
                  }}
                  className="rounded-sm border-cream-300 text-teal-600 focus:ring-teal-500"
                />
                <span>Open Only</span>
              </label>
            </div>

            <span className="text-xs text-ink-500 font-mono">
              {feedbackData?.meta?.total ?? 0} total tickets
            </span>
          </div>
        </CardBody>
      </Card>

      {/* FEEDBACK REPORTS TABLE */}
      <Card>
        <CardBody className="p-0">
          {isPending ? (
            <div className="py-12">
              <LoadingState label="Loading feedback reports..." />
            </div>
          ) : reports.length === 0 ? (
            <div className="py-12 text-center text-sm text-ink-500">
              No feedback reports match the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100/70 border-b border-cream-200 text-ink-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">ID / Type</th>
                    <th className="px-4 py-3.5">Title & Description</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Household / User</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200 text-ink-800">
                  {reports.map((item) => (
                    <tr key={item.id} className="hover:bg-cream-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {item.type === 'bug' && <Bug className="size-3.5 text-danger-700 shrink-0" />}
                          {item.type === 'feature_request' && <Lightbulb className="size-3.5 text-teal-700 shrink-0" />}
                          {item.type === 'feedback' && <MessageSquare className="size-3.5 text-ink-500 shrink-0" />}
                          <span className="font-mono font-bold text-ink-900">#{item.id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs sm:max-w-md">
                        <p className="font-bold text-ink-900 text-xs truncate">{item.title}</p>
                        <p className="text-ink-600 line-clamp-1 text-[11px] mt-0.5">{item.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            item.priority === 'critical'
                              ? 'danger'
                              : item.priority === 'high'
                              ? 'warn'
                              : item.priority === 'medium'
                              ? 'teal'
                              : 'neutral'
                          }
                        >
                          {item.priority.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-ink-900 block truncate">
                          {item.care_circle?.name || item.user?.name || 'Anonymous User'}
                        </span>
                        {item.user?.email && (
                          <span className="text-[10px] text-ink-500 font-mono">{item.user.email}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            item.status === 'resolved'
                              ? 'teal'
                              : item.status === 'in_progress'
                              ? 'teal'
                              : item.status === 'triaged'
                              ? 'warn'
                              : item.status === 'new'
                              ? 'danger'
                              : 'neutral'
                          }
                        >
                          {item.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-ink-500 font-mono text-[11px]">
                        {formatDateTime(item.created_at)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReport(item)}
                            className="rounded-md border border-cream-300 bg-white px-2.5 py-1 text-xs font-semibold text-ink-700 hover:bg-cream-100 transition-colors"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenTriage(item)}
                            className="rounded-md border border-teal-300 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 hover:bg-teal-100 transition-colors"
                          >
                            Triage
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

      {/* VIEW DETAILS MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-teal-800 text-sm">#{selectedReport.id}</span>
                <h3 className="font-bold text-ink-900 text-base">{selectedReport.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="text-ink-400 hover:text-ink-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Badge tone={selectedReport.priority === 'critical' ? 'danger' : 'teal'}>
                  Priority: {selectedReport.priority.toUpperCase()}
                </Badge>
                <Badge tone="neutral">Type: {selectedReport.type.toUpperCase()}</Badge>
                <Badge tone="teal">Status: {selectedReport.status.replace('_', ' ').toUpperCase()}</Badge>
              </div>

              <div className="bg-cream-50 p-3 rounded-xl border border-cream-200">
                <span className="text-ink-500 font-bold block mb-1">Description:</span>
                <p className="text-ink-900 whitespace-pre-wrap leading-relaxed">
                  {selectedReport.description}
                </p>
              </div>

              {selectedReport.device_info && (
                <div className="bg-cream-50 p-3 rounded-xl border border-cream-200">
                  <span className="text-ink-500 font-bold block mb-1">Diagnostic Device Info:</span>
                  <pre className="font-mono text-[11px] text-ink-800 overflow-x-auto">
                    {JSON.stringify(selectedReport.device_info, null, 2)}
                  </pre>
                </div>
              )}

              {selectedReport.admin_notes && (
                <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl">
                  <span className="text-teal-900 font-bold block mb-1">Operator / Dev Notes:</span>
                  <p className="text-teal-800">{selectedReport.admin_notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-cream-200 pt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const rep = selectedReport
                  setSelectedReport(null)
                  handleOpenTriage(rep)
                }}
              >
                <Edit3 className="size-3.5" />
                <span>Update Triage</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TRIAGE ACTION MODAL */}
      {triageReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-ink-900 text-base">
              Triage Ticket #{triageReport.id}: {triageReport.title}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink-800 block mb-1">Ticket Status:</label>
                <select
                  value={triageStatus}
                  onChange={(e) => setTriageStatus(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 p-2 text-xs font-semibold text-ink-900"
                >
                  <option value="new">New</option>
                  <option value="triaged">Triaged</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="wont_fix">Won't Fix</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink-800 block mb-1">Priority Level:</label>
                <select
                  value={triagePriority}
                  onChange={(e) => setTriagePriority(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 p-2 text-xs font-semibold text-ink-900"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink-800 block mb-1">Operator Notes / Resolution Reason:</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Patch dispatched to mobile release v1.4.2..."
                  rows={3}
                  className="w-full rounded-xl border border-cream-300 p-2.5 text-xs text-ink-900 focus:border-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-cream-200 pt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTriageReport(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveTriage}
                disabled={updateReportMutation.isPending}
              >
                Save Triage
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
