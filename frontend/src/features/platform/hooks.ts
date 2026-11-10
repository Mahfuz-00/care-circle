/**
 * Operator console client (PRD §3): `/api/v1/platform/*`.
 *
 * These endpoints require a `dashboard` token that also carries the
 * `platform.admin` ability. The route tree is gated on the same flag, so a
 * non-operator never reaches these hooks.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../../lib/api'
import { queryKeys } from '../../lib/queryClient'
import type {
  AuditLogEntry,
  BackupEntry,
  EmailSettings,
  FailedJob,
  InvoicesApiResponse,
  MarketingAnnouncement,
  MarketingLead,
  MarketingOverview,
  MarketingPromotion,
  PaymentGatewaySettings,
  PlatformBillingInvoice,
  PlatformClientDetail,
  PlatformClientListItem,
  PlatformFeedbackPayload,
  PlatformMetrics,
  RefundEligibilityCheck,
  RefundPolicy,
  RefundRecord,
  RefundsPayload,
  SystemHealthEntry,
} from '../../lib/types'

function useOperatorQuery<T>(key: readonly unknown[], url: string, params?: Record<string, string | number>) {
  return useQuery({
    queryKey: key,
    queryFn: () => apiGet<T>(url, params),
    staleTime: 30_000,
  })
}

export function useSystemHealth() {
  return useOperatorQuery<SystemHealthEntry[]>(queryKeys.platform.systemHealth, '/platform/system-health')
}

export function useBackups() {
  return useOperatorQuery<BackupEntry[]>(queryKeys.platform.backups, '/platform/backups')
}

export function useFailedJobs() {
  return useOperatorQuery<FailedJob[]>(queryKeys.platform.failedJobs, '/platform/failed-jobs')
}

export interface AuditLogFilters {
  careCircleId?: number | string | null
  scope?: 'all' | 'platform' | 'client' | string
  level?: string
  action?: string
  search?: string
}

export function useAuditLog(filters?: AuditLogFilters | number | null) {
  const normalized: AuditLogFilters =
    typeof filters === 'number'
      ? { careCircleId: filters }
      : (filters ?? {})

  const params: Record<string, string | number> = {}
  if (normalized.careCircleId && normalized.careCircleId !== 'all') {
    params.care_circle_id = normalized.careCircleId
  }
  if (normalized.scope && normalized.scope !== 'all') {
    params.scope = normalized.scope
  }
  if (normalized.level && normalized.level !== 'all') {
    params.level = normalized.level
  }
  if (normalized.action) {
    params.action = normalized.action
  }
  if (normalized.search) {
    params.search = normalized.search
  }

  return useOperatorQuery<AuditLogEntry[]>(
    ['platform', 'audit-log', params],
    '/platform/audit-log',
    Object.keys(params).length > 0 ? params : undefined,
  )
}

export function usePlatformMetrics() {
  return useOperatorQuery<PlatformMetrics>(queryKeys.platform.metrics, '/platform/metrics')
}

export function usePlatformClients(search?: string, plan?: string) {
  const params: Record<string, string> = {}
  if (search) params.search = search
  if (plan) params.plan = plan

  return useOperatorQuery<PlatformClientListItem[]>(
    queryKeys.platform.clients(search, plan),
    '/platform/clients',
    params,
  )
}

export function usePlatformClientDetail(id: number) {
  return useOperatorQuery<PlatformClientDetail>(
    queryKeys.platform.client(id),
    `/platform/clients/${id}`,
  )
}

// ---------------------------------------------------------------------------
// Client Management Actions
// ---------------------------------------------------------------------------
export function useSuspendClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      apiPost<{ message: string; client: unknown }>(`/platform/clients/${id}/suspend`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform', 'clients'] })
      qc.invalidateQueries({ queryKey: queryKeys.platform.metrics })
    },
  })
}

export function useActivateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiPost<{ message: string; client: unknown }>(`/platform/clients/${id}/activate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform', 'clients'] })
      qc.invalidateQueries({ queryKey: queryKeys.platform.metrics })
    },
  })
}

export function useBulkSuspendClients() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) =>
      apiPost<{ message: string; count: number }>('/platform/clients/bulk-suspend', { ids }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform', 'clients'] })
      qc.invalidateQueries({ queryKey: queryKeys.platform.metrics })
    },
  })
}

export function useBulkActivateClients() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) =>
      apiPost<{ message: string; count: number }>('/platform/clients/bulk-activate', { ids }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform', 'clients'] })
      qc.invalidateQueries({ queryKey: queryKeys.platform.metrics })
    },
  })
}

// ---------------------------------------------------------------------------
// Billing & Invoices
// ---------------------------------------------------------------------------
export function useBillingInvoices(params?: {
  page?: number
  status?: string
  payment_method?: string
  search?: string
}) {
  const queryParams: Record<string, string | number> = {}
  if (params?.page) queryParams.page = params.page
  if (params?.status && params.status !== 'all') queryParams.status = params.status
  if (params?.payment_method && params.payment_method !== 'all') queryParams.payment_method = params.payment_method
  if (params?.search) queryParams.search = params.search

  return useQuery({
    queryKey: queryKeys.platform.billing(queryParams),
    queryFn: () => apiGet<InvoicesApiResponse>('/platform/billing', queryParams),
    staleTime: 15_000,
  })
}

export function usePendingCashInvoices() {
  return useQuery({
    queryKey: queryKeys.platform.pendingCash,
    queryFn: () => apiGet<{ data: PlatformBillingInvoice[]; count: number }>('/platform/billing/pending-cash'),
    staleTime: 15_000,
  })
}

export function useApproveCashInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiPost<{ message: string; invoice: PlatformBillingInvoice }>(`/platform/billing/invoices/${id}/approve-cash`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform', 'billing'] })
      qc.invalidateQueries({ queryKey: ['platform', 'clients'] })
    },
  })
}

export function useRejectCashInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      apiPost<{ message: string; invoice: PlatformBillingInvoice }>(`/platform/billing/invoices/${id}/reject-cash`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform', 'billing'] })
    },
  })
}

// ---------------------------------------------------------------------------
// Payment Gateway Settings
// ---------------------------------------------------------------------------
export function usePaymentSettings() {
  return useQuery({
    queryKey: queryKeys.platform.paymentSettings,
    queryFn: () => apiGet<PaymentGatewaySettings>('/platform/payment-settings'),
    staleTime: 30_000,
  })
}

export function useUpdatePaymentSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<PaymentGatewaySettings>) =>
      apiPut<{ message: string; data: PaymentGatewaySettings }>('/platform/payment-settings', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.platform.paymentSettings })
    },
  })
}

export function useTestPaymentGateway() {
  return useMutation({
    mutationFn: (gateway?: string) =>
      apiPost<{ status: string; gateway: string; latency_ms: number; message: string }>('/platform/payment-settings/test', { gateway }),
  })
}

// ---------------------------------------------------------------------------
// Email Settings
// ---------------------------------------------------------------------------
export function useEmailSettings() {
  return useQuery({
    queryKey: queryKeys.platform.emailSettings,
    queryFn: () => apiGet<EmailSettings>('/platform/email-settings'),
    staleTime: 30_000,
  })
}

export function useUpdateEmailSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<EmailSettings>) =>
      apiPut<{ message: string; data: EmailSettings }>('/platform/email-settings', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.platform.emailSettings })
    },
  })
}

export function useTestEmail() {
  return useMutation({
    mutationFn: (email: string) =>
      apiPost<{ status: string; recipient: string; message: string; sent_at: string }>('/platform/email-settings/test', { recipient: email }),
  })
}

// ---------------------------------------------------------------------------
// Refunds & Satisfaction Guarantees
// ---------------------------------------------------------------------------
export function useRefunds(params?: { status?: string; page?: number }) {
  const queryParams: Record<string, string | number> = {}
  if (params?.status && params.status !== 'all') queryParams.status = params.status
  if (params?.page) queryParams.page = params.page

  return useQuery({
    queryKey: queryKeys.platform.refunds(queryParams),
    queryFn: () => apiGet<RefundsPayload>('/platform/refunds', queryParams),
    staleTime: 15_000,
  })
}

export function useUpdateRefundPolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<RefundPolicy>) =>
      apiPut<{ message: string; policy: RefundPolicy }>('/platform/refunds/policy', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform', 'refunds'] })
    },
  })
}

export function useCheckRefundEligibility(invoiceId: number) {
  return useQuery({
    queryKey: ['platform', 'refunds', 'eligibility', invoiceId],
    queryFn: () => apiGet<RefundEligibilityCheck>(`/platform/refunds/eligibility/${invoiceId}`),
    enabled: invoiceId > 0,
  })
}

export function useApproveRefund() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, admin_notes }: { id: number; admin_notes?: string }) =>
      apiPost<{ message: string; refund: RefundRecord }>(`/platform/refunds/${id}/approve`, { admin_notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform', 'refunds'] })
      qc.invalidateQueries({ queryKey: ['platform', 'billing'] })
    },
  })
}

export function useRejectRefund() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      apiPost<{ message: string; refund: RefundRecord }>(`/platform/refunds/${id}/reject`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform', 'refunds'] })
    },
  })
}

// ---------------------------------------------------------------------------
// Feedback & Bug Triage
// ---------------------------------------------------------------------------
export function usePlatformFeedback(params?: {
  type?: string
  priority?: string
  status?: string
  open_only?: boolean
  page?: number
}) {
  const queryParams: Record<string, string | number | boolean> = {}
  if (params?.type && params.type !== 'all') queryParams.type = params.type
  if (params?.priority && params.priority !== 'all') queryParams.priority = params.priority
  if (params?.status && params.status !== 'all') queryParams.status = params.status
  if (params?.open_only) queryParams.open_only = true
  if (params?.page) queryParams.page = params.page

  return useQuery({
    queryKey: queryKeys.platform.feedback(queryParams),
    queryFn: () => apiGet<PlatformFeedbackPayload>('/platform/feedback', queryParams),
    staleTime: 15_000,
  })
}

export function useUpdateFeedbackReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      priority,
      admin_notes,
    }: {
      id: number
      status?: string
      priority?: string
      admin_notes?: string
    }) =>
      apiPatch<{ message: string; data: unknown }>(`/platform/feedback/${id}`, {
        status,
        priority,
        admin_notes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform', 'feedback'] })
    },
  })
}

// ---------------------------------------------------------------------------
// Marketing Operations
// ---------------------------------------------------------------------------
export function useMarketingOverview() {
  return useQuery({
    queryKey: queryKeys.platform.marketing,
    queryFn: () => apiGet<MarketingOverview>('/platform/marketing/overview'),
    staleTime: 30_000,
  })
}

export function useMarketingPromotions(status?: string) {
  return useQuery({
    queryKey: queryKeys.platform.promotions(status),
    queryFn: () =>
      apiGet<MarketingPromotion[]>('/platform/marketing/promotions', status && status !== 'all' ? { status } : undefined),
    staleTime: 30_000,
  })
}

export function useCreatePromotion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<MarketingPromotion>) =>
      apiPost<{ message: string; data: MarketingPromotion }>('/platform/marketing/promotions', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform', 'marketing'] })
    },
  })
}

export function useTogglePromotion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiPatch<{ message: string; data: MarketingPromotion }>(`/platform/marketing/promotions/${id}/toggle`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform', 'marketing'] })
    },
  })
}

export function useMarketingAnnouncements() {
  return useQuery({
    queryKey: queryKeys.platform.announcements,
    queryFn: () => apiGet<MarketingAnnouncement[]>('/platform/marketing/announcements'),
    staleTime: 30_000,
  })
}

export function useCreateAnnouncement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<MarketingAnnouncement>) =>
      apiPost<{ message: string; data: MarketingAnnouncement }>('/platform/marketing/announcements', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform', 'marketing'] })
    },
  })
}

export function useToggleAnnouncement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiPatch<{ message: string; data: MarketingAnnouncement }>(`/platform/marketing/announcements/${id}/toggle`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform', 'marketing'] })
    },
  })
}

export function useMarketingLeads(status?: string) {
  return useQuery({
    queryKey: queryKeys.platform.leads(status),
    queryFn: () =>
      apiGet<MarketingLead[]>('/platform/marketing/leads', status && status !== 'all' ? { status } : undefined),
    staleTime: 30_000,
  })
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: string; notes?: string }) =>
      apiPatch<{ message: string; data: MarketingLead }>(`/platform/marketing/leads/${id}`, { status, notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform', 'marketing'] })
    },
  })
}

// ---------------------------------------------------------------------------
// Health & Jobs Actions
// ---------------------------------------------------------------------------
export function useClearSystemCache() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiPost<{ message: string; cleared_at: string }>('/platform/system-health/clear-cache'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.platform.systemHealth })
    },
  })
}

export function useRetryFailedJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) =>
      apiPost<{ message: string; uuid: string }>(`/platform/failed-jobs/${id}/retry`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.platform.failedJobs })
    },
  })
}

export function useRetryAllFailedJobs() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiPost<{ message: string; count: number }>('/platform/failed-jobs/retry-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.platform.failedJobs })
    },
  })
}

export function useFlushFailedJobs() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiDelete<{ message: string; count: number }>('/platform/failed-jobs/flush'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.platform.failedJobs })
    },
  })
}

