import { useState, useRef, useEffect } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Pill,
  Clock,
  HeartPulse,
  Calendar,
  Sparkles,
  Users,
  Heart,
  UserCheck,
  ShieldAlert,
  Lock,
  Eye,
  FileCheck2,
  CreditCard,
  Calculator,
  RotateCcw,
  Banknote
} from 'lucide-react'

import { AppLogo } from '../../../components/ui/AppLogo'
import { buttonClasses } from '../../../components/ui/buttonStyles'
import { useSession } from '../../auth/useSession'

interface SubmenuItem {
  to: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavCategory {
  id: string
  label: string
  items: SubmenuItem[]
}

const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'features',
    label: 'Features',
    items: [
      {
        to: '/features',
        title: 'Medication Management',
        description: 'Complex schedules, food rules, time windows, and pill photos.',
        icon: Pill,
      },
      {
        to: '/features',
        title: 'Refill & Stock Forecasting',
        description: 'Burndown prediction and one-tap pharmacy connectivity.',
        icon: Sparkles,
      },
      {
        to: '/how-it-works',
        title: 'Fail-Safe Escalation Cascade',
        description: 'Server-enforced non-aggressive dispatch: app → push → voice call.',
        icon: Clock,
      },
      {
        to: '/features',
        title: 'Emergency Lifeline',
        description: 'Prominent 96dp+ button alerting the entire circle instantly.',
        icon: HeartPulse,
      },
      {
        to: '/features',
        title: 'Appointment Coordination',
        description: 'Specialist, lab, and clinic visits with shared calendar reminders.',
        icon: Calendar,
      },
    ],
  },
  {
    id: 'solutions',
    label: 'Solutions',
    items: [
      {
        to: '/solutions',
        title: 'For Seniors & Parents',
        description: '20sp large type, 3× OS font scaling, 48dp+ buttons, zero clutter.',
        icon: Heart,
      },
      {
        to: '/solutions',
        title: 'For Primary Caregivers',
        description: 'Adult children checking adherence remotely without nagging.',
        icon: Users,
      },
      {
        to: '/solutions',
        title: 'For Family Circles',
        description: 'Shared sibling duties, backup responders, and transparent access.',
        icon: UserCheck,
      },
      {
        to: '/solutions',
        title: 'For Self-Users',
        description: 'Personal regimen mastery, food alerts, and chronic care tracking.',
        icon: ShieldAlert,
      },
    ],
  },
  {
    id: 'trust',
    label: 'Security & Trust',
    items: [
      {
        to: '/security',
        title: 'Bank-Grade Family Privacy',
        description: 'Zero cross-family data sharing with complete cryptographic isolation.',
        icon: Lock,
      },
      {
        to: '/accessibility',
        title: 'Universal Accessibility',
        description: 'WCAG AAA contrast, no text truncation, and voice assistance.',
        icon: Eye,
      },
      {
        to: '/safety',
        title: 'Deliberate Boundaries',
        description: 'What we deliberately do not do: no diagnosis, no ads, no data sales.',
        icon: ShieldCheck,
      },
      {
        to: '/security',
        title: 'Tamperproof Verification History',
        description: 'Permanent timestamped logs of every care-circle action.',
        icon: FileCheck2,
      },
    ],
  },
  {
    id: 'pricing',
    label: 'Plans & Billing',
    items: [
      {
        to: '/pricing',
        title: 'Plans & Pricing Tiers',
        description: 'Transparent plans read straight from the live backend catalog.',
        icon: CreditCard,
      },
      {
        to: '/pricing',
        title: 'Adherence ROI Calculator',
        description: 'Estimate hospitalization prevention savings and clinical risk.',
        icon: Calculator,
      },
      {
        to: '/refund-policy',
        title: 'Refund Policy & Guarantee',
        description: 'Transparent 30-day money-back terms and satisfaction guarantee.',
        icon: RotateCcw,
      },
      {
        to: '/pricing',
        title: 'Payment Gateways & Cash',
        description: 'Online card checkout, bank wire transfers, and local clinic cash.',
        icon: Banknote,
      },
    ],
  },
]

export function MarketingNav() {
  const { isAuthenticated } = useSession()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      {/* Top Value / Status Announcement Banner */}
      <div className="bg-sage-800 text-sage-100 px-4 py-2 text-xs font-medium border-b border-sage-900/40">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 text-center">
          <ShieldCheck className="size-3.5 text-teal-300 shrink-0" aria-hidden="true" />
          <span className="truncate sm:overflow-visible">
            Bank-Grade Tenant Isolation & Multi-Channel Non-Aggressive Escalation.
          </span>
          <Link
            to="/how-it-works"
            className="hidden md:inline-flex items-center gap-1 font-semibold text-teal-200 underline underline-offset-4 hover:text-white shrink-0 ml-1"
          >
            Explore the engine <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 border-b border-cream-300 bg-cream-100/95 backdrop-blur-md">
        <div
          ref={navRef}
          className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 relative"
        >
          {/* Left: Brand Identity */}
          <Link
            to="/"
            onClick={() => setActiveDropdown(null)}
            className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg shrink-0"
          >
            <AppLogo size="md" animated />
          </Link>

          {/* Center: Desktop Navigation with TouchDine-style Context Submenus */}
          <nav aria-label="Marketing Primary" className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_CATEGORIES.map((category) => {
              const isOpen = activeDropdown === category.id
              const isCategoryActive = category.items.some((item) => pathname.startsWith(item.to))

              return (
                <div key={category.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isOpen ? null : category.id)}
                    onMouseEnter={() => setActiveDropdown(category.id)}
                    aria-expanded={isOpen}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs xl:text-sm font-semibold transition-all ${
                      isOpen || isCategoryActive
                        ? 'bg-cream-200 text-sage-900 font-bold shadow-2xs'
                        : 'text-ink-700 hover:bg-cream-200/60 hover:text-ink-900'
                    }`}
                  >
                    <span>{category.label}</span>
                    <ChevronDown
                      className={`size-3.5 text-ink-500 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-teal-700' : ''
                      }`}
                    />
                  </button>

                  {/* Rich Context Dropdown Submenu */}
                  {isOpen && (
                    <div
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="absolute left-0 top-full pt-2 w-80 xl:w-96 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <div className="rounded-2xl border border-cream-300 bg-cream-50 p-3 shadow-xl backdrop-blur-xl">
                        <div className="px-3 py-1.5 border-b border-cream-200 mb-1">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-sage-700">
                            {category.label} Overview
                          </p>
                        </div>
                        <div className="grid gap-1">
                          {category.items.map((item) => {
                            const Icon = item.icon
                            return (
                              <Link
                                key={item.title}
                                to={item.to}
                                onClick={() => setActiveDropdown(null)}
                                className="group flex items-start gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-cream-100"
                              >
                                <div className="mt-0.5 grid size-8 place-items-center rounded-lg bg-sage-100 text-sage-700 group-hover:bg-teal-100 group-hover:text-teal-800 transition-colors shrink-0">
                                  <Icon className="size-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-ink-900 group-hover:text-teal-800 transition-colors">
                                    {item.title}
                                  </p>
                                  <p className="mt-0.5 text-[11px] text-ink-500 leading-snug">
                                    {item.description}
                                  </p>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Direct How It Works Link */}
            <Link
              to="/how-it-works"
              onClick={() => setActiveDropdown(null)}
              className={`rounded-lg px-3 py-1.5 text-xs xl:text-sm font-semibold transition-colors ${
                pathname === '/how-it-works'
                  ? 'bg-cream-200 text-sage-900 shadow-2xs font-bold'
                  : 'text-ink-700 hover:bg-cream-200/60 hover:text-ink-900'
              }`}
            >
              How It Works
            </Link>
          </nav>

          {/* Right: Desktop Actions (>= 1024px only) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <Link to="/dashboard" className={buttonClasses('primary', 'sm')}>
                Open dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className={buttonClasses('ghost', 'sm')}>
                  Sign in
                </Link>
                <Link to="/register" className={buttonClasses('primary', 'sm')}>
                  Create circle
                </Link>
              </>
            )}
          </div>

          {/* Right: Mobile/Tablet Controls (< 1024px only) */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <Link to="/dashboard" className={buttonClasses('primary', 'sm')}>
                Dashboard
              </Link>
            ) : (
              <Link to="/register" className={buttonClasses('primary', 'sm')}>
                Start
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-cream-300 bg-cream-50 text-ink-700 hover:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer with Subcategories */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-cream-300 bg-cream-50 px-4 py-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <nav aria-label="Mobile Marketing Navigation" className="space-y-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm font-bold text-sage-900 hover:bg-cream-100"
              >
                Overview
              </Link>

              {NAV_CATEGORIES.map((category) => (
                <div key={category.id} className="pt-2 border-t border-cream-200">
                  <p className="px-3 text-xs font-extrabold uppercase tracking-wider text-sage-800 mb-2">
                    {category.label}
                  </p>
                  <div className="space-y-1">
                    {category.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.title}
                          to={item.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-cream-100"
                        >
                          <Icon className="size-4 text-teal-700 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-cream-200">
                <Link
                  to="/how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm font-bold text-sage-900 hover:bg-cream-100"
                >
                  How It Works
                </Link>
              </div>

              <div className="pt-4 border-t border-cream-200 flex flex-col gap-2">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className={buttonClasses('secondary', 'md', 'w-full text-center')}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className={buttonClasses('primary', 'md', 'w-full text-center')}
                    >
                      Create care circle
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={buttonClasses('primary', 'md', 'w-full text-center')}
                  >
                    Open dashboard
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
