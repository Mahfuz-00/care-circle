import { Link, Outlet, useRouterState } from '@tanstack/react-router'

import { useSession } from '../auth/useSession'

const CONSOLE_NAV = [
  { to: '/platform', label: 'Overview' },
  { to: '/platform/health', label: 'System health' },
  { to: '/platform/backups', label: 'Backups' },
  { to: '/platform/failed-jobs', label: 'Failed jobs' },
  { to: '/platform/audit', label: 'Audit log' },
]

/**
 * Landlord console shell (PRD §3). The parent route already refuses entry to
 * anyone without the `platform.admin` ability.
 */
export function PlatformLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { user } = useSession()

  return (
    <div>
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Platform console</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
          Operator view
        </h1>
        <p className="mt-2 max-w-prose text-base text-ink-500">
          Read-only operational surfaces for {user?.name ?? 'the operator'}. Nothing here is shown to care circles, and
          nothing is reported that was not measured.
        </p>
      </header>

      <nav aria-label="Platform console" className="mb-6">
        <ul className="flex flex-wrap gap-1 border-b border-cream-300 pb-2">
          {CONSOLE_NAV.map((item) => {
            const current = pathname === item.to
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  aria-current={current ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center rounded-lg px-4 py-2 font-semibold ${
                    current ? 'bg-teal-700 text-cream-50' : 'text-teal-800 hover:bg-teal-50'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <Outlet />
    </div>
  )
}
