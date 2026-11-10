import type { ReactNode } from 'react'
import { MarketingNav } from './MarketingNav'
import { MarketingFooter } from './MarketingFooter'

interface MarketingLayoutProps {
  children: ReactNode
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-cream-50 text-ink-900 selection:bg-teal-200 selection:text-ink-900">
      {/* Skip link for screen-reader and keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only sr-only-focusable absolute left-3 top-3 z-50 rounded-lg bg-sage-700 px-4 py-2 text-cream-50 font-semibold shadow-lg"
      >
        Skip to main content
      </a>

      <MarketingNav />

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>

      <MarketingFooter />
    </div>
  )
}
