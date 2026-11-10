import type { ElementType, ReactNode } from 'react'

export function Card({
  as: Tag = 'section',
  className = '',
  children,
  ...rest
}: {
  as?: ElementType
  className?: string
  children: ReactNode
  'aria-labelledby'?: string
}) {
  return (
    <Tag
      {...rest}
      className={`rounded-[var(--radius-card)] border border-cream-300 bg-white/80 shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({
  title,
  description,
  actions,
  id,
  children,
  className = '',
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  id?: string
  children?: ReactNode
  className?: string
}) {
  if (children) {
    return (
      <div className={`border-b border-cream-200 px-4 py-3 sm:px-5 ${className}`}>
        {children}
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 border-b border-cream-200 px-4 py-3 sm:px-5 ${className}`}>
      <div className="min-w-0">
        {title ? (
          <h2 id={id} className="text-lg font-semibold text-ink-900">
            {title}
          </h2>
        ) : null}
        {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function CardBody({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`px-4 py-4 sm:px-5 ${className}`}>{children}</div>
}

export function CardFooter({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 border-t border-cream-200 px-4 py-3 sm:px-5 ${className}`}>
      {children}
    </div>
  )
}
