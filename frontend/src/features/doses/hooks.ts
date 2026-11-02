import { useMutation, useQuery } from '@tanstack/react-query'

import { apiGet, apiPost } from '../../lib/api'
import { queryClient, queryKeys } from '../../lib/queryClient'
import type { Dose } from '../../lib/types'

/**
 * Doses for today. `userId` lets a caregiver look at a member of their circle;
 * the API decides whether that request is allowed (permission is enforced
 * server-side, the UI only mirrors it).
 */
export function useTodayDoses(userId?: number | null) {
  return useQuery({
    queryKey: queryKeys.dosesToday(userId),
    queryFn: () => apiGet<Dose[]>('/doses/today', userId ? { user_id: userId } : undefined),
  })
}

function refetchDoseViews() {
  void queryClient.invalidateQueries({ queryKey: ['doses'] })
  void queryClient.invalidateQueries({ queryKey: ['adherence'] })
  void queryClient.invalidateQueries({ queryKey: ['medications'] })
}

/** "I took it" — the source of truth for adherence (PRD §7). */
export function useTakeDose() {
  return useMutation({
    mutationFn: ({ id, photo }: { id: number; photo?: string }) =>
      apiPost<Dose>(`/doses/${id}/take`, photo ? { photo } : {}),
    onSuccess: refetchDoseViews,
  })
}

/** Skipping requires a reason in the ledger; the reason is stored, not judged. */
export function useSkipDose() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      apiPost<Dose>(`/doses/${id}/skip`, reason ? { reason } : {}),
    onSuccess: refetchDoseViews,
  })
}

export function useSnoozeDose() {
  return useMutation({
    mutationFn: ({ id, minutes }: { id: number; minutes: number }) =>
      apiPost<Dose>(`/doses/${id}/snooze`, { minutes }),
    onSuccess: refetchDoseViews,
  })
}
