import { QueryClient } from '@tanstack/react-query'

import { ApiError } from './api'

/**
 * Server-state cache. Retries transient failures only: a 4xx is a decision the
 * API already made, so retrying it would just confuse the user.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status !== null && error.status < 500) return false
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})

/** Query key factory — keeps invalidation honest and greppable. */
export const queryKeys = {
  me: ['auth', 'me'] as const,
  careCircles: ['care-circles'] as const,
  careCircle: (id: number) => ['care-circles', id] as const,
  members: (careCircleId: number) => ['care-circles', careCircleId, 'members'] as const,
  medications: ['medications'] as const,
  medication: (id: number) => ['medications', id] as const,
  dosesToday: (userId?: number | null) => ['doses', 'today', userId ?? 'self'] as const,
  adherence: (from: string, to: string, userId?: number | null) =>
    ['adherence', { from, to, userId: userId ?? 'self' }] as const,
  appointments: ['appointments'] as const,
  emergency: ['emergency'] as const,
  platform: {
    systemHealth: ['platform', 'system-health'] as const,
    backups: ['platform', 'backups'] as const,
    failedJobs: ['platform', 'failed-jobs'] as const,
    auditLog: (careCircleId?: number | null) =>
      ['platform', 'audit-log', careCircleId ?? 'all'] as const,
    metrics: ['platform', 'metrics'] as const,
  },
}
