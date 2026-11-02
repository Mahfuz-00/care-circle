import { useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'

import { apiPost, apiGet } from '../../lib/api'
import { queryClient, queryKeys } from '../../lib/queryClient'
import type { AuthSession, LoginPayload, MeResponse, RegisterPayload } from '../../lib/types'
import { useAuthStore } from '../../stores/auth'

/** `GET /auth/me` — the authority on the signed-in user and their circles. */
export function useMe() {
  const token = useAuthStore((state) => state.token)
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => apiGet<MeResponse>('/auth/me'),
    enabled: Boolean(token),
    staleTime: 60_000,
  })
}

/**
 * Keeps the persisted session in step with the API: refreshes the user record
 * and guarantees the active care circle is one the API actually returned.
 */
export function useSessionBootstrap() {
  const me = useMe()
  const setUser = useAuthStore((state) => state.setUser)
  const setActiveCareCircle = useAuthStore((state) => state.setActiveCareCircle)
  const activeCareCircle = useAuthStore((state) => state.activeCareCircle)

  useEffect(() => {
    const data = me.data
    if (!data) return

    setUser(data.user)

    const knownCircle = activeCareCircle
      ? data.care_circles.find((circle) => circle.id === activeCareCircle.id)
      : undefined

    if (knownCircle) {
      // Refresh quiet hours / timezone that may have changed server-side.
      if (knownCircle.name !== activeCareCircle?.name || knownCircle.timezone !== activeCareCircle?.timezone) {
        setActiveCareCircle(knownCircle)
      }
      return
    }

    setActiveCareCircle(data.active_care_circle ?? data.care_circles[0] ?? null)
  }, [me.data, activeCareCircle, setUser, setActiveCareCircle])

  return me
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession)
  return useMutation({
    mutationFn: (payload: LoginPayload) => apiPost<AuthSession>('/auth/login', payload),
    onSuccess: (session) => {
      setSession({ token: session.token, user: session.user, careCircle: session.care_circle ?? null })
      void queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
  })
}

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession)
  return useMutation({
    mutationFn: (payload: RegisterPayload) => apiPost<AuthSession>('/auth/register', payload),
    onSuccess: (session) => {
      setSession({ token: session.token, user: session.user, careCircle: session.care_circle ?? null })
      void queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
  })
}

export function useLogout() {
  const clear = useAuthStore((state) => state.clear)
  return useMutation({
    mutationFn: () => apiPost<void>('/auth/logout'),
    // Even if the API call fails, the local session must end.
    onSettled: () => {
      clear()
      queryClient.clear()
    },
  })
}
