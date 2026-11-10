import { useId } from 'react'

export interface AppLogoProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Show mark only or mark + wordmark */
  variant?: 'mark-only' | 'full'
  /** Whether to show the subtle branding subtitle */
  subtitle?: string
  /** Tone for light or dark backgrounds */
  tone?: 'default' | 'inverted' | 'monochrome'
  /** Whether to animate the inner orbital pulse */
  animated?: boolean
  /** Optional class names */
  className?: string
}

const SIZES = {
  sm: { mark: 26, text: 'text-base', sub: 'text-[10px]' },
  md: { mark: 32, text: 'text-lg', sub: 'text-[11px]' },
  lg: { mark: 42, text: 'text-2xl', sub: 'text-sm' },
  xl: { mark: 56, text: 'text-3xl', sub: 'text-base' },
}

/**
 * CareCircle Guardian Orbital Logo
 *
 * Geometric concept:
 * - Two interlocking, continuous harmonic arcs representing the unbroken circle of family care.
 * - The outer arc is Deep Sage (strength, calm vigilance).
 * - The inner arc is Forest Teal (vitality, coordination).
 * - The center anchor dot represents the loved one, always safeguarded at the center.
 */
export function AppLogo({
  size = 'md',
  variant = 'full',
  subtitle,
  tone = 'default',
  animated = false,
  className = '',
}: AppLogoProps) {
  const reactId = useId()
  const uid = reactId.replace(/[^a-zA-Z0-9-_]/g, '')
  const navyGradId = `cc-navy-grad-${uid}`
  const skyGradId = `cc-sky-grad-${uid}`
  const glowFilterId = `cc-soft-glow-${uid}`

  const { mark: markSize, text: textSize, sub: subSize } = SIZES[size]

  const navyColor = tone === 'inverted' ? '#e0ecf6' : '#1d4e89'
  const skyColor = tone === 'inverted' ? '#7dd3fc' : '#0284c7'
  const coreColor = tone === 'inverted' ? '#ffffff' : '#2563a8'
  const textColor = tone === 'inverted' ? 'text-cream-50' : 'text-sage-900'
  const subColor = tone === 'inverted' ? 'text-sage-200' : 'text-ink-500'

  return (
    <div className={`inline-flex items-center gap-2.5 font-semibold tracking-tight ${className}`}>
      {/* SVG Vector Mark */}
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="CareCircle Guardian Orbital Mark"
        className={`shrink-0 ${animated ? 'transition-transform duration-300 hover:scale-105' : ''}`}
      >
        <defs>
          <linearGradient id={navyGradId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor={navyColor} />
            <stop offset="1" stopColor="#102a4d" />
          </linearGradient>
          <linearGradient id={skyGradId} x1="12" y1="12" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor={skyColor} />
            <stop offset="1" stopColor="#0369a1" />
          </linearGradient>
          <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Guardian Orbital Arc */}
        <circle
          cx="24"
          cy="24"
          r="19"
          stroke={`url(#${navyGradId})`}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="98 22"
          transform="rotate(-40 24 24)"
        />

        {/* Inner Synchronized Care Arc */}
        <circle
          cx="24"
          cy="24"
          r="13"
          stroke={`url(#${skyGradId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="62 18"
          transform="rotate(130 24 24)"
        />

        {/* Central Anchor Node (The Loved One) */}
        <circle
          cx="24"
          cy="24"
          r="4.5"
          fill={coreColor}
          className={animated ? 'animate-pulse-subtle' : ''}
        />

        {/* Ambient Orbit Satellite (Active Vigilance Indicator) */}
        <circle
          cx="37.5"
          cy="15.5"
          r="2.5"
          fill={skyColor}
          filter={`url(#${glowFilterId})`}
          className={animated ? 'animate-pulse-subtle' : ''}
        />
      </svg>

      {/* Wordmark and Optional Subtitle */}
      {variant === 'full' && (
        <div className="flex flex-col justify-center leading-none select-none">
          <span className={`${textSize} font-bold tracking-tight ${textColor} font-sans flex items-center`}>
            Care<span className="text-teal-700">Circle</span>
          </span>
          {subtitle && (
            <span className={`mt-0.5 ${subSize} font-medium tracking-normal ${subColor} whitespace-nowrap`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
