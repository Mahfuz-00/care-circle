/**
 * Button styling lives outside the component so `<Link>` can wear the same
 * skin without a component/hook boundary in between.
 *
 * Every size clears the 44px minimum touch target (§9 accessibility).
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'emergency' | 'alert'
export type ButtonSize = 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-sage-600 text-cream-50 border border-sage-700 hover:bg-sage-700',
  secondary: 'bg-cream-100 text-ink-900 border border-sage-300 hover:bg-cream-200',
  ghost: 'bg-transparent text-sage-700 border border-transparent hover:bg-sage-100',
  danger: 'bg-danger-500 text-white border border-danger-600 hover:bg-danger-600',
  emergency: 'bg-danger-600 text-white border border-danger-700 hover:bg-danger-700',
  // Quiet until it matters: the emergency navigation entry and similar paths.
  alert: 'bg-transparent text-danger-700 border border-danger-300 hover:bg-danger-50',
}

const SIZES: Record<ButtonSize, string> = {
  md: 'min-h-11 px-4 py-2 text-base gap-2',
  lg: 'min-h-14 px-6 py-3 text-lg gap-2.5',
}

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra = '',
): string {
  return [
    'inline-flex items-center justify-center rounded-lg font-semibold transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    extra,
  ]
    .filter(Boolean)
    .join(' ')
}
