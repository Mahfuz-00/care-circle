import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { apiGet } from '../../lib/api'
import { queryKeys } from '../../lib/queryClient'
import type { Plan } from '../../lib/types'
import { usePlanStore, type PlanItem } from '../../stores/plans'

/**
 * Authoritative Plan Catalogue Hook.
 *
 * Connects the public website (Pricing, Landing, Nav) to both the persistent
 * Platform Admin Plan Store and the live backend API `/api/v1/plans`.
 *
 * Uses stable selectors and memoization to ensure getSnapshot returns cached
 * references and avoids React re-render loops.
 */
export function usePlans() {
  // Always select the stable array reference directly from the Zustand store
  const allPlans = usePlanStore((s) => s.plans)

  // Memoize filtered active plans so the returned array reference is completely stable
  const activePlans = useMemo(
    () => allPlans.filter((p) => p.status === 'active'),
    [allPlans],
  )

  const query = useQuery({
    queryKey: queryKeys.plans,
    queryFn: async (): Promise<PlanItem[]> => {
      try {
        const remote = await apiGet<Plan[]>('/plans')
        if (Array.isArray(remote) && remote.length > 0) {
          const currentStore = usePlanStore.getState().plans
          return currentStore
            .filter((sp) => sp.status === 'active')
            .map((sp) => {
              const match = remote.find((r) => r.code === sp.code)
              if (!match) return sp
              return {
                ...sp,
                seats: match.seats,
                medications: match.medications,
                voice_minutes: match.voice_minutes,
                name: match.name,
                notes: match.notes ?? sp.notes,
              }
            })
        }
        return activePlans
      } catch {
        return activePlans
      }
    },
    staleTime: 60_000,
  })

  // Use query data if loaded, otherwise fall back to stable activePlans
  const effectivePlans = (query.data && query.data.length > 0) ? query.data : activePlans

  return {
    ...query,
    data: effectivePlans,
    plans: effectivePlans,
  }
}
