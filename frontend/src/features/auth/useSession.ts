import { useAuthStore } from '../../stores/auth'
import { capabilitiesFor, isPlatformAdmin, roleLabel } from '../../lib/permissions'
import type { Capabilities } from '../../lib/permissions'
import type { CareCircle, Role, User } from '../../lib/types'

export interface Session {
  token: string | null
  user: User | null
  role: Role | null
  roleName: string
  activeCareCircle: CareCircle | null
  capabilities: Capabilities
  isPlatformAdmin: boolean
  isAuthenticated: boolean
}

/**
 * The signed-in session, with every role-derived flag resolved through
 * `src/lib/permissions.ts`. Features read capabilities from here — they never
 * compare role strings themselves.
 */
export function useSession(): Session {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const activeCareCircle = useAuthStore((state) => state.activeCareCircle)
  const role = user?.role ?? null

  return {
    token,
    user,
    role,
    roleName: roleLabel(role),
    activeCareCircle,
    capabilities: capabilitiesFor({ role, currentUserId: user?.id ?? null }),
    isPlatformAdmin: isPlatformAdmin(user),
    isAuthenticated: Boolean(token),
  }
}
