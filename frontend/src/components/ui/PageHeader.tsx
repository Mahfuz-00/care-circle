import type { ReactNode } from 'react'

/** Page-level heading block. Every page has exactly one <h1>. */
export function PageHeader({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="mb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight text-ink-950 sm:text-xl">{title}</h1>
          {description ? <div className="mt-0.5 max-w-2xl text-xs font-medium text-ink-500">{description}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </header>
  )
}
