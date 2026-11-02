import { useMutation, useQuery } from '@tanstack/react-query'

import { apiGet, apiPost } from '../../lib/api'
import { queryClient, queryKeys } from '../../lib/queryClient'
import type { EmergencyAlert, EmergencyPayload } from '../../lib/types'

export function useEmergencyAlerts() {
  return useQuery({
    queryKey: queryKeys.emergency,
    queryFn: () => apiGet<EmergencyAlert[]>('/emergency'),
    // An open alert is time-critical: refresh while the page is open.
    refetchInterval: 30_000,
  })
}

function invalidateAlerts() {
  void queryClient.invalidateQueries({ queryKey: queryKeys.emergency })
}

/** One press, one alert. Notifies the whole circle (PRD §5.5). */
export function useRaiseEmergency() {
  return useMutation({
    mutationFn: (payload: EmergencyPayload) => apiPost<EmergencyAlert>('/emergency', payload),
    onSuccess: invalidateAlerts,
  })
}

export function useAcknowledgeAlert() {
  return useMutation({
    mutationFn: (id: number) => apiPost<EmergencyAlert>(`/emergency/${id}/acknowledge`),
    onSuccess: invalidateAlerts,
  })
}

export function useResolveAlert() {
  return useMutation({
    mutationFn: (id: number) => apiPost<EmergencyAlert>(`/emergency/${id}/resolve`),
    onSuccess: invalidateAlerts,
  })
}

export function useCancelAlert() {
  return useMutation({
    mutationFn: (id: number) => apiPost<EmergencyAlert>(`/emergency/${id}/cancel`),
    onSuccess: invalidateAlerts,
  })
}
