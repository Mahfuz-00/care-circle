import { useMutation, useQuery } from '@tanstack/react-query'

import { apiDelete, apiGet, apiPatch, apiPost } from '../../lib/api'
import { queryClient, queryKeys } from '../../lib/queryClient'
import type { Appointment, AppointmentPayload } from '../../lib/types'

export function useAppointments() {
  return useQuery({
    queryKey: queryKeys.appointments,
    queryFn: () => apiGet<Appointment[]>('/appointments'),
  })
}

function invalidateAppointments() {
  void queryClient.invalidateQueries({ queryKey: queryKeys.appointments })
}

export function useCreateAppointment() {
  return useMutation({
    mutationFn: (payload: AppointmentPayload) => apiPost<Appointment>('/appointments', payload),
    onSuccess: invalidateAppointments,
  })
}

export function useUpdateAppointment() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AppointmentPayload> }) =>
      apiPatch<Appointment>(`/appointments/${id}`, payload),
    onSuccess: invalidateAppointments,
  })
}

export function useDeleteAppointment() {
  return useMutation({
    mutationFn: (id: number) => apiDelete<void>(`/appointments/${id}`),
    onSuccess: invalidateAppointments,
  })
}
