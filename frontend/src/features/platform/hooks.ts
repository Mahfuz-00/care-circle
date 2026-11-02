/**
 * Operator console client (PRD §3): `/api/v1/platform/*`.
 *
 * These endpoints require a `dashboard` token that also carries the
 * `platform.admin` ability. The route tree is gated on the same flag, so a
 * non-operator never reaches these hooks.
 */
import { useQuery } from '@tanstack/react-query'

import { apiGet } from '../../lib/api'
import { queryKeys } from '../../lib/queryClient'
import type {
  AuditLogEntry,
  BackupEntry,
  FailedJob,
  PlatformMetrics,
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

export function useAuditLog(careCircleId?: number | null) {
  return useOperatorQuery<AuditLogEntry[]>(
    queryKeys.platform.auditLog(careCircleId),
    '/platform/audit-log',
    careCircleId ? { care_circle_id: careCircleId } : undefined,
  )
}

export function usePlatformMetrics() {
  return useOperatorQuery<PlatformMetrics>(queryKeys.platform.metrics, '/platform/metrics')
}
