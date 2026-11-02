import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'sage' | 'teal' | 'warn' | 'danger' | 'ok'

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-cream-200 text-ink-700 border-cream-300',
  sage: 'bg-sage-100 text-sage-800 border-sage-200',
  teal: 'bg-teal-100 text-teal-800 border-teal-200',
  warn: 'bg-warn-100 text-warn-600 border-warn-200',
  danger: 'bg-danger-100 text-danger-700 border-danger-200',
  ok: 'bg-ok-100 text-ok-600 border-ok-100',
}

export function Badge({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
