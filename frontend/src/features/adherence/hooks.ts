import { useQuery } from '@tanstack/react-query'

import { apiGet } from '../../lib/api'
import { queryKeys } from '../../lib/queryClient'
import type { AdherenceSummary } from '../../lib/types'

/**
 * Adherence summary for a window. `user_id` selects whose records — the API
 * decides whether the viewer may ask for that member.
 */
export function useAdherence({
  from,
  to,
  userId,
}: {
  from: string
  to: string
  userId?: number | null
}) {
  return useQuery({
    queryKey: queryKeys.adherence(from, to, userId),
    queryFn: () =>
      apiGet<AdherenceSummary>('/adherence', {
        from,
        to,
        ...(userId ? { user_id: userId } : {}),
      }),
  })
}
