import { useMutation, useQuery } from '@tanstack/react-query'

import { apiDelete, apiGet, apiPatch, apiPost } from '../../lib/api'
import { queryClient, queryKeys } from '../../lib/queryClient'
import type { CareCircle, CareCircleMember, Role } from '../../lib/types'

export function useCareCircles(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.careCircles,
    queryFn: () => apiGet<CareCircle[]>('/care-circles'),
    enabled: options?.enabled ?? true,
  })
}

function invalidateCircle(careCircleId?: number) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.careCircles })
  void queryClient.invalidateQueries({ queryKey: queryKeys.me })
  if (careCircleId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.members(careCircleId) })
  }
}

export function useCreateCareCircle() {
  return useMutation({
    mutationFn: (payload: { name: string; timezone: string }) => apiPost<CareCircle>('/care-circles', payload),
    onSuccess: () => invalidateCircle(),
  })
}

export function useUpdateCareCircle(careCircleId?: number | null) {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Partial<Pick<CareCircle, 'name' | 'timezone' | 'quiet_hours_start' | 'quiet_hours_end'>>
    }) => apiPatch<CareCircle>(`/care-circles/${id}`, payload),
    onSuccess: () => invalidateCircle(careCircleId ?? undefined),
  })
}

/**
 * Members of a circle. Only fetched when the viewer’s role is allowed to see the
 * member list (PRD §5.3) — the API enforces the same rule.
 */
export function useMembers(careCircleId?: number | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.members(careCircleId ?? 0),
    queryFn: () => apiGet<CareCircleMember[]>(`/care-circles/${careCircleId}/members`),
    enabled: Boolean(careCircleId) && (options?.enabled ?? true),
  })
}

export function useInviteMember(careCircleId?: number | null) {
  return useMutation({
    mutationFn: (payload: { email?: string; phone?: string; role: Role }) =>
      apiPost<CareCircleMember>(`/care-circles/${careCircleId}/invitations`, payload),
    onSuccess: () => invalidateCircle(careCircleId ?? undefined),
  })
}

export function useUpdateMemberRole(careCircleId?: number | null) {
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: number; role: Role }) =>
      apiPatch<CareCircleMember>(`/care-circles/${careCircleId}/members/${memberId}`, { role }),
    onSuccess: () => invalidateCircle(careCircleId ?? undefined),
  })
}

export function useRemoveMember(careCircleId?: number | null) {
  return useMutation({
    mutationFn: (memberId: number) => apiDelete<void>(`/care-circles/${careCircleId}/members/${memberId}`),
    onSuccess: () => invalidateCircle(careCircleId ?? undefined),
  })
}
