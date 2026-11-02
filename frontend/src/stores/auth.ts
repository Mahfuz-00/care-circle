import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { CareCircle, User } from '../lib/types'

/**
 * Client session state: the Sanctum token, the signed-in user and the active
 * care circle. Persisted so a reload does not lose the session.
 *
 * This store holds no server data beyond the session itself — care circles,
 * members, medications, doses and appointments all live in TanStack Query.
 */
export interface AuthState {
  token: string | null
  user: User | null
  activeCareCircle: CareCircle | null
  setSession: (session: { token: string; user: User; careCircle?: CareCircle | null }) => void
  setUser: (user: User) => void
  setActiveCareCircle: (careCircle: CareCircle | null) => void
  clear: () => void
}

const STORAGE_KEY = 'carecircle.dashboard.session'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      activeCareCircle: null,
      setSession: ({ token, user, careCircle }) =>
        set((state) => ({
          token,
          user,
          activeCareCircle: careCircle ?? state.activeCareCircle ?? null,
        })),
      setUser: (user) => set({ user }),
      setActiveCareCircle: (activeCareCircle) => set({ activeCareCircle }),
      clear: () => set({ token: null, user: null, activeCareCircle: null }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        activeCareCircle: state.activeCareCircle,
      }),
    },
  ),
)

/** Token for the axios interceptor (module scope, no React required). */
export function currentToken(): string | null {
  return useAuthStore.getState().token
}

export function clearSession(): void {
  useAuthStore.getState().clear()
}
