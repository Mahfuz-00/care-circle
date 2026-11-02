import { useId } from 'react'

import { useAuthStore } from '../../stores/auth'
import { useMe } from '../../features/auth/hooks'
import { queryClient } from '../../lib/queryClient'

/**
 * Active care circle switcher. The options come from `GET /auth/me` — the API's
 * own list — and switching one invalidates every care-circle-scoped query so no
 * other circle's data can linger on screen.
 */
export function CareCircleSwitcher() {
  const selectId = useId()
  const me = useMe()
  const activeCareCircle = useAuthStore((state) => state.activeCareCircle)
  const setActiveCareCircle = useAuthStore((state) => state.setActiveCareCircle)

  const circles = me.data?.care_circles ?? []

  if (me.isPending) {
    return <span className="text-sm text-ink-500">Loading care circles…</span>
  }

  if (me.isError || circles.length === 0) {
    return <span className="text-sm text-ink-500">No care circle on this account yet.</span>
  }

  if (circles.length === 1) {
    return (
      <span className="text-sm text-ink-700">
        <span className="text-ink-500">Care circle: </span>
        <span className="font-semibold">{circles[0].name}</span>
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={selectId} className="text-sm text-ink-500">
        Care circle
      </label>
      <select
        id={selectId}
        value={activeCareCircle?.id ?? ''}
        onChange={(event) => {
          const next = circles.find((circle) => String(circle.id) === event.target.value) ?? null
          setActiveCareCircle(next)
          void queryClient.invalidateQueries()
        }}
        className="min-h-11 rounded-lg border border-sage-300 bg-white px-3 py-2 text-base text-ink-900"
      >
        {circles.map((circle) => (
          <option key={circle.id} value={circle.id}>
            {circle.name}
          </option>
        ))}
      </select>
    </div>
  )
}
