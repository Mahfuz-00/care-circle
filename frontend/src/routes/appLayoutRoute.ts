import { createRoute, redirect } from '@tanstack/react-router'

import { AppShell } from '../components/layout/AppShell'
import { rootRoute } from './rootRoute'
import { useAuthStore } from '../stores/auth'

/**
 * Pathless layout route for everything behind the sign-in wall. The guard runs
 * in `beforeLoad`, before any page component (and therefore any query) mounts.
 */
export function requireAuth(): void {
  const { token } = useAuthStore.getState()
  if (!token) {
    throw redirect({ to: '/login' })
  }
}

export const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: AppShell,
  beforeLoad: () => {
    requireAuth()
  },
})
