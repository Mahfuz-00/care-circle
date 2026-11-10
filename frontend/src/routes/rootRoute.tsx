import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'

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
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700 font-bold">CareCircle</p>
      <h1 className="text-3xl font-extrabold text-ink-900">That page does not exist</h1>
      <p className="text-base text-ink-700">
        The link may be out of date, or the page may not be part of the dashboard.
      </p>
      <Link to="/" className={buttonClasses('primary', 'lg')}>
        Back to Home
      </Link>
    </main>
  )
}

function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-4 px-6">
      <p className="text-sm font-bold uppercase tracking-wider text-danger-700">Application Notice</p>
      <h1 className="text-3xl font-extrabold text-ink-900">Something went wrong</h1>
      <p className="text-base text-ink-700">
        {error instanceof Error ? error.message : 'An unexpected error occurred while loading this view.'}
      </p>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            reset()
            window.location.reload()
          }}
          className={buttonClasses('primary', 'md')}
        >
          Try Again
        </button>
        <Link to="/" className={buttonClasses('secondary', 'md')}>
          Return to Home
        </Link>
      </div>
    </main>
  )
}

export const rootRoute = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: RootErrorComponent,
})
