import { useEffect } from 'react'
import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'

import { useLogout, useSessionBootstrap } from '../../features/auth/hooks'
import { useSession } from '../../features/auth/useSession'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { buttonClasses } from '../ui/buttonStyles'
import { CareCircleSwitcher } from './CareCircleSwitcher'
import { ToastRegion } from './ToastRegion'

interface NavItem {
  to: string
  label: string
  /** Rendered with the danger accent — requesting help is a first-class action. */
  accent?: boolean
}

const PRIMARY_NAV: NavItem[] = [
  { to: '/', label: 'Dashboard' },
  { to: '/medications', label: 'Medications' },
  { to: '/appointments', label: 'Appointments' },
  { to: '/adherence', label: 'Adherence' },
  { to: '/care-circle', label: 'Care circle' },
  { to: '/emergency', label: 'Emergency', accent: true },
  { to: '/settings', label: 'Settings' },
]

/** Semantic shell: skip link, banner header, primary nav, main landmark. */
export function AppShell() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { user, roleName, isPlatformAdmin, isAuthenticated } = useSession()
  const session = useSessionBootstrap()
  const logout = useLogout()

  // A token revoked server-side (or expired) must land the user back on sign-in
  // instead of leaving dashboard chrome around a pile of 401 errors.
  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: '/login' })
    }
  }, [isAuthenticated, navigate])

  const navItems = isPlatformAdmin ? [...PRIMARY_NAV, { to: '/platform', label: 'Platform' }] : PRIMARY_NAV

  function isCurrent(to: string): boolean {
    if (to === '/') return pathname === '/'
    return pathname === to || pathname.startsWith(`${to}/`)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-cream-50">
      <a
        href="#main-content"
        className="sr-only sr-only-focusable absolute left-3 top-3 z-50 rounded-lg bg-sage-700 px-4 py-2 text-cream-50"
      >
        Skip to main content
      </a>

      <header className="border-b border-cream-300 bg-cream-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-sage-800">
              <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-sage-600 text-cream-50">
                CC
              </span>
              CareCircle
            </Link>
            <span className="hidden text-sm text-ink-500 sm:inline">Care coordination dashboard</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CareCircleSwitcher />
            {user ? (
              <span className="flex items-center gap-2 text-sm text-ink-700">
                <span className="font-semibold">{user.name}</span>
                <Badge tone="sage">{roleName}</Badge>
              </span>
            ) : null}
            {isPlatformAdmin ? <Badge tone="teal">Platform operator</Badge> : null}
            <Button
              variant="secondary"
              loading={logout.isPending}
              onClick={() => {
                logout.mutate(undefined, {
                  onSettled: () => {
                    void navigate({ to: '/login' })
                  },
                })
              }}
            >
              Sign out
            </Button>
          </div>
        </div>

        <nav aria-label="Primary" className="border-t border-cream-300 bg-cream-50">
          <ul className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 py-2 sm:px-6">
            {navItems.map((item) => {
              const current = isCurrent(item.to)
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={current ? 'page' : undefined}
                    className={buttonClasses(
                      current ? 'primary' : item.accent ? 'alert' : 'ghost',
                      'md',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </header>

      {session.isError ? (
        <p role="alert" className="bg-warn-100 px-4 py-2 text-center text-sm text-warn-600">
          We could not refresh your session details. Some values below may be out of date.
        </p>
      ) : null}

      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-cream-300 bg-cream-100 px-4 py-6 text-center text-sm text-ink-500 sm:px-6">
        <p>
          CareCircle coordinates schedules, refills and emergencies. It does not give medical advice or
          diagnose anything.
        </p>
        <p className="mt-1">If someone needs urgent medical help, contact your local emergency number.</p>
      </footer>

      <ToastRegion />
    </div>
  )
}
