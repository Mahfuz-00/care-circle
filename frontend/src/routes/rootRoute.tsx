import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

import { buttonClasses } from '../components/ui/buttonStyles'

/**
 * Router root. It renders the outlet only — the authenticated chrome lives in
 * the pathless `appLayoutRoute` so `/login` and `/register` stay chrome-free.
 */
function RootComponent() {
  return <Outlet />
}

function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-4 px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-sage-600">CareCircle</p>
      <h1 className="text-3xl font-semibold text-ink-900">That page does not exist</h1>
      <p className="text-base text-ink-500">
        The link may be out of date, or the page may not be part of the dashboard.
      </p>
      <Link to="/" className={buttonClasses('primary', 'lg')}>
        Back to the dashboard
      </Link>
    </main>
  )
}

export const rootRoute = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})
