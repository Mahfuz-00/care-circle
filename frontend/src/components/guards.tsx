import type { ReactNode } from 'react'

import { PERMISSION_LABELS, allows } from '../lib/permissions'
import type { Permission } from '../lib/permissions'
import { useSession } from '../features/auth/useSession'
import { AccessDenied } from './ui/states'

/**
 * Role gate for a block of UI. The decision always comes from the PRD §6 matrix
 * via `src/lib/permissions.ts` — no feature renders a role comparison of its own.
 */
export function RequirePermission({
  permission,
  children,
  description,
}: {
  permission: Permission
  children: ReactNode
  description?: ReactNode
}) {
  const { role } = useSession()

  if (!allows(role, permission)) {
    return (
      <AccessDenied
        title={`${PERMISSION_LABELS[permission]} is not part of your role`}
        description={
          description ?? 'Your role in this care circle does not include this. A primary caregiver can change this.'
        }
      />
    )
  }

  return <>{children}</>
}
