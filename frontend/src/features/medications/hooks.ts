import { useMutation, useQuery } from '@tanstack/react-query'

import { apiDelete, apiGet, apiPatch, apiPost } from '../../lib/api'
import { queryClient, queryKeys } from '../../lib/queryClient'
import type { Medication, MedicationPayload, RefillPayload } from '../../lib/types'

export function useMedications() {
  return useQuery({
    queryKey: queryKeys.medications,
    queryFn: () => apiGet<Medication[]>('/medications'),
  })
}

export function useMedication(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.medication(id),
    queryFn: () => apiGet<Medication>(`/medications/${id}`),
    enabled: (options?.enabled ?? true) && Number.isFinite(id),
  })
}

function invalidateMedicationViews(id?: number) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.medications })
  if (id) void queryClient.invalidateQueries({ queryKey: queryKeys.medication(id) })
  void queryClient.invalidateQueries({ queryKey: ['doses'] })
  void queryClient.invalidateQueries({ queryKey: ['adherence'] })
}

export function useCreateMedication() {
  return useMutation({
    mutationFn: (payload: MedicationPayload) => apiPost<Medication>('/medications', payload),
    onSuccess: (medication) => invalidateMedicationViews(medication?.id),
  })
}

export function useUpdateMedication(id: number) {
  return useMutation({
    mutationFn: (payload: Partial<MedicationPayload>) => apiPatch<Medication>(`/medications/${id}`, payload),
    onSuccess: () => invalidateMedicationViews(id),
  })
}

export function useDeleteMedication() {
  return useMutation({
    mutationFn: (id: number) => apiDelete<void>(`/medications/${id}`),
    onSuccess: (_result, id) => invalidateMedicationViews(id),
  })
}

/** Stock top-up. The API is the only thing that computes days_remaining. */
export function useRefillMedication(id?: number) {
  return useMutation({
    mutationFn: ({ medicationId, payload }: { medicationId: number; payload: RefillPayload }) =>
      apiPost<Medication>(`/medications/${id ?? medicationId}/refill`, payload),
    onSuccess: (_result, variables) => invalidateMedicationViews(variables.medicationId),
  })
}
