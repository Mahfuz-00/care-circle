import { useState, useEffect, useRef, type ComponentType } from 'react'
import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Pill,
  Calendar,
  Activity,
  Users,
  AlertTriangle,
  Settings,
  CreditCard,
  Receipt,
  Wallet,
  Mail,
  Bell,
  HeartPulse,
  Database,
  Flame,
  FileText,
  BarChart3,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  Building2,
  Target,
  TrendingUp,
  MessageSquare,
  RotateCcw,
  LogOut,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

import { useLogout, useSessionBootstrap } from '../../features/auth/hooks'
import { useSession } from '../../features/auth/useSession'
import { AppLogo } from '../ui/AppLogo'
import { CareCircleSwitcher } from './CareCircleSwitcher'
import { ToastRegion } from './ToastRegion'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
  accent?: boolean
  exact?: boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const PRIMARY_TENANT_GROUPS: NavGroup[] = [
  {
    title: 'Care & Schedule',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/medications', label: 'Medications', icon: Pill },
      { to: '/appointments', label: 'Appointments', icon: Calendar },
      { to: '/adherence', label: 'Adherence', icon: Activity },
    ],
  },
  {
    title: 'Circle & Safety',
    items: [
      { to: '/care-circle', label: 'Care circle', icon: Users },
      { to: '/emergency', label: 'Emergency Lifeline', icon: AlertTriangle, accent: true },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

const PLATFORM_OPERATOR_GROUPS: NavGroup[] = [
  {
    title: 'Operations & Directory',
    items: [
      { to: '/platform', label: 'Business Dashboard', icon: BarChart3, exact: true },
      { to: '/platform/clients', label: 'Client Directory', icon: Building2 },
    ],
  },
  {
    title: 'Financials & Revenue',
    items: [
      { to: '/platform/billing', label: 'Invoices & Billing', icon: Receipt },
      { to: '/platform/plans', label: 'Plans & Pricing', icon: CreditCard },
      { to: '/platform/payment-gateways', label: 'Payment Gateways', icon: Wallet },
      { to: '/platform/refunds', label: 'Refunds & Policy', icon: RotateCcw },
    ],
  },
  {
    title: 'Growth & Triage',
    items: [
      { to: '/platform/marketing', label: 'Marketing Module', icon: Target },
      { to: '/platform/analytics', label: 'Analytics Module', icon: TrendingUp },
      { to: '/platform/feedback', label: 'Feedback & Triage', icon: MessageSquare },
    ],
  },
  {
    title: 'System & Security',
    items: [
      { to: '/platform/health', label: 'System Health', icon: HeartPulse },
      { to: '/platform/failed-jobs', label: 'Failed Jobs', icon: Flame },
      { to: '/platform/backups', label: 'Backups', icon: Database },
      { to: '/platform/email-settings', label: 'Email Configuration', icon: Mail },
      { to: '/platform/notifications', label: 'Notification System', icon: Bell },
      { to: '/platform/settings', label: 'Settings Hub', icon: Settings },
      { to: '/platform/audit', label: 'Audit Log', icon: FileText },
    ],
  },
]

interface BreadcrumbItem {
  label: string
  to?: string
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === '/platform') {
    return [{ label: 'CareCircle', to: '/platform' }, { label: 'Business Dashboard' }]
  }
  if (pathname === '/platform/clients') {
    return [{ label: 'CareCircle', to: '/platform' }, { label: 'Clients & Households' }]
  }
  if (pathname === '/platform/billing') {
    return [{ label: 'CareCircle', to: '/platform' }, { label: 'Invoices & Billing' }]
  }
  if (pathname === '/platform/feedback') {
    return [{ label: 'CareCircle', to: '/platform' }, { label: 'Feedback & Triage' }]
  }
  if (pathname.startsWith('/platform/clients/')) {
    return [
      { label: 'CareCircle', to: '/platform' },
      { label: 'Clients & Households', to: '/platform/clients' },
      { label: 'Client Details' },
    ]
  }
  if (pathname === '/platform/marketing') {
    return [{ label: 'CareCircle', to: '/platform' }, { label: 'Marketing & Growth' }]
  }
  if (pathname === '/platform/analytics') {
    return [{ label: 'CareCircle', to: '/platform' }, { label: 'Analytics & Intelligence' }]
  }
  if (pathname === '/platform/settings') {
    return [{ label: 'CareCircle', to: '/platform' }, { label: 'Platform Settings' }]
  }
  if (pathname === '/platform/plans') {
    return [
      { label: 'CareCircle', to: '/platform' },
      { label: 'Settings', to: '/platform/settings' },
      { label: 'Plans & Pricing' },
    ]
  }
  if (pathname === '/platform/payment-gateways') {
    return [
      { label: 'CareCircle', to: '/platform' },
      { label: 'Settings', to: '/platform/settings' },
      { label: 'Payment Gateways' },
    ]
  }
  if (pathname === '/platform/refunds') {
    return [
      { label: 'CareCircle', to: '/platform' },
      { label: 'Settings', to: '/platform/settings' },
      { label: 'Refunds & Policy' },
    ]
  }
  if (pathname === '/platform/email-settings') {
    return [
      { label: 'CareCircle', to: '/platform' },
      { label: 'Settings', to: '/platform/settings' },
      { label: 'Email Configuration' },
    ]
  }
  if (pathname === '/platform/notifications') {
    return [
      { label: 'CareCircle', to: '/platform' },
      { label: 'Settings', to: '/platform/settings' },
      { label: 'Notification System' },
    ]
  }
  if (pathname === '/platform/health') {
    return [
      { label: 'CareCircle', to: '/platform' },
      { label: 'Settings', to: '/platform/settings' },
      { label: 'System Health' },
    ]
  }
  if (pathname === '/platform/backups') {
    return [
      { label: 'CareCircle', to: '/platform' },
      { label: 'Settings', to: '/platform/settings' },
      { label: 'Backups' },
    ]
  }
  if (pathname === '/platform/failed-jobs') {
    return [
      { label: 'CareCircle', to: '/platform' },
      { label: 'Settings', to: '/platform/settings' },
      { label: 'Failed Jobs' },
    ]
  }
  if (pathname === '/platform/audit') {
    return [
      { label: 'CareCircle', to: '/platform' },
      { label: 'Settings', to: '/platform/settings' },
      { label: 'Audit Log' },
    ]
  }

  // Household routes
  if (pathname === '/dashboard') {
    return [{ label: 'CareCircle', to: '/dashboard' }, { label: 'Dashboard' }]
  }
  if (pathname === '/medications') {
    return [{ label: 'CareCircle', to: '/dashboard' }, { label: 'Medications' }]
  }
  if (pathname === '/medications/new') {
    return [
      { label: 'CareCircle', to: '/dashboard' },
      { label: 'Medications', to: '/medications' },
      { label: 'New Medication' },
    ]
  }
  if (pathname.startsWith('/medications/')) {
    return [
      { label: 'CareCircle', to: '/dashboard' },
      { label: 'Medications', to: '/medications' },
      { label: 'Medication Details' },
    ]
  }
  if (pathname === '/appointments') {
    return [{ label: 'CareCircle', to: '/dashboard' }, { label: 'Appointments' }]
  }
  if (pathname === '/adherence') {
    return [{ label: 'CareCircle', to: '/dashboard' }, { label: 'Adherence' }]
  }
  if (pathname === '/care-circle') {
    return [{ label: 'CareCircle', to: '/dashboard' }, { label: 'Care Circle' }]
  }
  if (pathname === '/emergency') {
    return [{ label: 'CareCircle', to: '/dashboard' }, { label: 'Emergency Alerts' }]
  }
  if (pathname === '/settings') {
    return [{ label: 'CareCircle', to: '/dashboard' }, { label: 'Account Settings' }]
  }

  return [{ label: 'CareCircle' }]
}

/**
 * Semantic shell with responsive collapsible sidebar.
 * Clean SaaS navigation: Logo on sidebar header -> Modules directly beneath -> Profile & Sign out at the bottom.
 * Top bar renders a functional navigation breadcrumb with zero landlord/tenant jargon.
 */
export function AppShell() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { user, roleName, isPlatformAdmin, isAuthenticated } = useSession()
  const session = useSessionBootstrap()
  const logout = useLogout()

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('carecircle_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)

  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const isOperator = isPlatformAdmin || pathname.startsWith('/platform')

  // Close dropdowns on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false)
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // A token revoked server-side (or expired) must land the user back on sign-in
  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: '/login' })
    }
  }, [isAuthenticated, navigate])

  // Close mobile drawer on escape
  useEffect(() => {
    if (!mobileOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen])

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('carecircle_sidebar_collapsed', String(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        void navigate({ to: '/login' })
      },
    })
  }

  const navGroups: NavGroup[] = isOperator ? PLATFORM_OPERATOR_GROUPS : PRIMARY_TENANT_GROUPS
  const breadcrumbs = getBreadcrumbs(pathname)

  function isCurrent(item: NavItem): boolean {
    if (item.exact) {
      return pathname === item.to
    }
    return pathname === item.to || pathname.startsWith(`${item.to}/`)
  }

  return (
    <div className="flex min-h-dvh bg-cream-50 text-ink-900">
      <a
        href="#main-content"
        className="sr-only sr-only-focusable absolute left-3 top-3 z-50 rounded-lg bg-sage-700 px-4 py-2 text-cream-50"
      >
        Skip to main content
      </a>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MOBILE DRAWER SLIDE-OVER */}
      <aside
        id="mobile-navigation"
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-cream-300 bg-cream-100 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-cream-300 px-4">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2"
            title="CareCircle"
          >
            <AppLogo size="md" animated />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="flex size-10 items-center justify-center rounded-lg text-ink-600 hover:bg-cream-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Mobile Navigation Links Grouped by Module */}
        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto p-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 pb-1">
                <p className="text-[10px] font-extrabold tracking-wider text-ink-400 uppercase select-none">
                  {group.title}
                </p>
              </div>
              {group.items.map((item) => {
                const current = isCurrent(item)
                const Icon = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={current ? 'page' : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                      current
                        ? 'bg-teal-700 text-cream-50 shadow-xs'
                        : item.accent
                        ? 'border border-danger-200 bg-danger-50/70 text-danger-700 hover:bg-danger-100'
                        : 'text-ink-700 hover:bg-cream-200 hover:text-ink-950'
                    }`}
                  >
                    <Icon className="size-5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                    {item.accent && (
                      <span className="ml-auto rounded-full bg-danger-200/80 px-2 py-0.5 text-[10px] font-extrabold text-danger-900 uppercase">
                        SOS
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Mobile Sidebar Bottom: User Profile with Sign out */}
        <div className="border-t border-cream-300 p-4 bg-cream-50">
          {user && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-cream-50 font-bold text-xs shadow-2xs">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0 truncate">
                  <p className="truncate text-sm font-bold text-ink-950">{user.name}</p>
                  <p className="truncate text-xs text-ink-500">{isOperator ? 'Administrator' : roleName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-600 hover:text-danger-700 hover:bg-danger-50 transition-colors"
              >
                <LogOut className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* DESKTOP COLLAPSIBLE SIDEBAR */}
      <aside
        aria-label="Sidebar navigation"
        className={`hidden md:flex flex-col shrink-0 sticky top-0 h-dvh border-r border-cream-300 bg-cream-100 transition-all duration-300 ease-in-out z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand / Logo + Collapse Toggle */}
        <div
          className={`flex h-16 items-center border-b border-cream-300 ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          {isCollapsed ? (
            <Link
              to="/"
              className="flex items-center justify-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg shrink-0"
              title="CareCircle"
            >
              <AppLogo size="md" variant="mark-only" animated />
            </Link>
          ) : (
            <>
              <Link
                to="/"
                className="flex items-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg shrink-0"
                title="CareCircle"
              >
                <AppLogo size="md" variant="full" animated />
              </Link>
              <button
                type="button"
                onClick={toggleCollapse}
                aria-label="Collapse sidebar"
                className="flex size-9 items-center justify-center rounded-lg text-ink-500 hover:bg-cream-200 hover:text-ink-900 transition-colors cursor-pointer shrink-0"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="size-4.5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {/* Modules Navigation directly under the header */}
        <nav
          aria-label="Sidebar modules navigation"
          className={`flex-1 overflow-y-auto py-3 ${isCollapsed ? 'px-2' : 'px-3'}`}
        >
          {isCollapsed ? (
            <>
              {/* Expand Toggle Button fixed at the top of the collapsed navigation column */}
              <button
                type="button"
                onClick={toggleCollapse}
                aria-label="Expand sidebar"
                className="flex size-11 items-center justify-center mx-auto mb-3 rounded-xl text-ink-500 hover:bg-cream-200 hover:text-ink-900 transition-colors cursor-pointer"
                title="Expand sidebar"
              >
                <PanelLeft className="size-5" aria-hidden="true" />
              </button>

              {navGroups.map((group, groupIdx) => (
                <div key={group.title} className={groupIdx > 0 ? 'pt-2 mt-2 border-t border-cream-200/80' : ''}>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const current = isCurrent(item)
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          title={`${group.title}: ${item.label}`}
                          aria-current={current ? 'page' : undefined}
                          className={`flex size-11 items-center justify-center mx-auto rounded-xl transition-all ${
                            current
                              ? 'bg-teal-700 text-cream-50 shadow-xs'
                              : item.accent
                              ? 'border border-danger-300 bg-danger-50 text-danger-700 hover:bg-danger-100'
                              : 'text-ink-700 hover:bg-cream-200 hover:text-ink-950'
                          }`}
                        >
                          <Icon className="size-5 shrink-0" aria-hidden="true" />
                          <span className="sr-only">{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="space-y-4">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <div className="px-3 pb-1">
                    <p className="text-[10px] font-extrabold tracking-wider text-ink-400 uppercase select-none">
                      {group.title}
                    </p>
                  </div>
                  {group.items.map((item) => {
                    const current = isCurrent(item)
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        aria-current={current ? 'page' : undefined}
                        className={`flex min-h-[38px] items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                          current
                            ? 'bg-teal-700 text-cream-50 shadow-xs'
                            : item.accent
                            ? 'border border-danger-200 bg-danger-50/70 text-danger-700 hover:bg-danger-100'
                            : 'text-ink-700 hover:bg-cream-200 hover:text-ink-950'
                        }`}
                      >
                        <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.label}</span>
                        {item.accent && (
                          <span className="ml-auto rounded-full bg-danger-200/80 px-2 py-0.5 text-[10px] font-extrabold text-danger-900 uppercase">
                            SOS
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* Desktop Sidebar Bottom: Profile with Logout Button */}
        <div className="border-t border-cream-300 p-2.5 bg-cream-100/90">
          {/* User Profile + Logout */}
          {user && (
            isCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                <div
                  className="flex size-9 items-center justify-center rounded-full bg-teal-700 text-cream-50 font-bold text-xs shadow-2xs"
                  title={`${user.name} (${isOperator ? 'Administrator' : roleName})`}
                >
                  {user.name.charAt(0)}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out"
                  className="flex size-9 items-center justify-center rounded-lg text-ink-500 hover:text-danger-700 hover:bg-danger-50 transition-colors cursor-pointer"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 rounded-xl bg-white/70 border border-cream-200/80 p-2 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-cream-50 font-bold text-xs shadow-2xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0 truncate">
                    <p className="truncate text-xs font-bold text-ink-950">{user.name}</p>
                    <p className="truncate text-[11px] text-ink-500 font-medium">{isOperator ? 'Administrator' : roleName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out"
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:text-danger-700 hover:bg-danger-50 transition-colors cursor-pointer"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                </button>
              </div>
            )
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* TOP APP BAR WITH BREADCRUMB, NOTIFICATIONS & PROFILE */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-cream-300 bg-cream-100/95 backdrop-blur-xs px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-controls="mobile-navigation"
              aria-expanded={mobileOpen}
              className="flex size-10 items-center justify-center rounded-lg text-ink-700 hover:bg-cream-200 md:hidden cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 shrink-0"
            >
              <Menu className="size-6" aria-hidden="true" />
            </button>

            {/* Mobile Brand Mark */}
            <Link
              to="/"
              className="flex items-center gap-2 md:hidden shrink-0"
              title="CareCircle"
            >
              <AppLogo size="md" animated />
            </Link>

            {/* Navigation Breadcrumb */}
            <nav aria-label="Breadcrumb navigation" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-ink-600 min-w-0 overflow-hidden">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1
                return (
                  <div key={crumb.label} className="flex items-center gap-1.5 min-w-0">
                    {idx > 0 && <ChevronRight className="size-3.5 text-ink-400 shrink-0" aria-hidden="true" />}
                    {crumb.to && !isLast ? (
                      <Link
                        to={crumb.to}
                        className="text-ink-600 hover:text-teal-700 transition-colors hover:underline shrink-0"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={`truncate ${isLast ? 'font-bold text-ink-950' : 'text-ink-600'}`}>
                        {crumb.label}
                      </span>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>

          {/* Right Header: Circle Switcher (household) + Notification Bell + Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {!isOperator && <CareCircleSwitcher />}

            {/* Notification Bell with Interactive Tray */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev)
                  setProfileOpen(false)
                }}
                aria-label={`Notifications ${hasUnread ? '(unread notifications available)' : ''}`}
                aria-expanded={notificationsOpen}
                className="relative flex size-9 items-center justify-center rounded-lg text-ink-600 hover:bg-cream-200 hover:text-ink-950 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="size-5" aria-hidden="true" />
                {hasUnread && (
                  <span
                    className="absolute top-1.5 right-1.5 size-2 rounded-full bg-teal-600 ring-2 ring-cream-100"
                    aria-hidden="true"
                  />
                )}
              </button>

              {notificationsOpen && (
                <div
                  role="region"
                  aria-label="Notifications tray"
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-xl border border-cream-300 z-50 text-left animate-in fade-in slide-in-from-top-2"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-ink-950">Notifications</h3>
                      {hasUnread && (
                        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-extrabold text-teal-800 uppercase">
                          Active
                        </span>
                      )}
                    </div>
                    {hasUnread && (
                      <button
                        type="button"
                        onClick={() => setHasUnread(false)}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-cream-100 max-h-72 overflow-y-auto py-1">
                    {isOperator ? (
                      <>
                        <div className="py-2.5 text-xs">
                          <div className="flex items-center justify-between font-semibold text-ink-900">
                            <span>Medication Adherence Audit</span>
                            <span className="text-[11px] text-ink-400 font-normal">10m ago</span>
                          </div>
                          <p className="mt-0.5 text-ink-600 text-[11px]">
                            Daily cross-circle adherence check completed at 94.6% adherence rate.
                          </p>
                        </div>
                        <div className="py-2.5 text-xs">
                          <div className="flex items-center justify-between font-semibold text-ink-900">
                            <span>Database Backup Verified</span>
                            <span className="text-[11px] text-ink-400 font-normal">2h ago</span>
                          </div>
                          <p className="mt-0.5 text-ink-600 text-[11px]">
                            PostgreSQL snapshot archive verified with SHA-256 integrity check.
                          </p>
                        </div>
                        <div className="py-2.5 text-xs">
                          <div className="flex items-center justify-between font-semibold text-ink-900">
                            <span>Gateway Health Check</span>
                            <span className="text-[11px] text-ink-400 font-normal">5h ago</span>
                          </div>
                          <p className="mt-0.5 text-ink-600 text-[11px]">
                            Stripe and Cash gateway webhook delivery operational.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="py-2.5 text-xs">
                          <div className="flex items-center justify-between font-semibold text-ink-900">
                            <span>Medication Taken</span>
                            <span className="text-[11px] text-ink-400 font-normal">30m ago</span>
                          </div>
                          <p className="mt-0.5 text-ink-600 text-[11px]">
                            Morning dose recorded on schedule.
                          </p>
                        </div>
                        <div className="py-2.5 text-xs">
                          <div className="flex items-center justify-between font-semibold text-ink-900">
                            <span>Refill Reminder</span>
                            <span className="text-[11px] text-ink-400 font-normal">3h ago</span>
                          </div>
                          <p className="mt-0.5 text-ink-600 text-[11px]">
                            Atorvastatin has 5 days of supply remaining.
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-cream-200 text-center">
                    <Link
                      to={isOperator ? '/platform/notifications' : '/emergency'}
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                    >
                      {isOperator ? 'Manage notification system →' : 'View emergency contacts & alerts →'}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar with Dropdown */}
            {user && (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((prev) => !prev)
                    setNotificationsOpen(false)
                  }}
                  aria-label="User profile and account menu"
                  aria-expanded={profileOpen}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-cream-200 transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-teal-700 text-cream-50 font-bold text-xs shadow-2xs ring-2 ring-cream-300">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:flex flex-col text-left pr-1">
                    <span className="text-xs font-bold text-ink-950 leading-tight truncate max-w-[120px]">
                      {user.name}
                    </span>
                    <span className="text-[11px] text-ink-500 font-medium leading-none truncate max-w-[120px]">
                      {isOperator ? 'Administrator' : roleName}
                    </span>
                  </div>
                  <ChevronDown className="hidden sm:block size-3.5 text-ink-400" aria-hidden="true" />
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    aria-label="User account menu"
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-3 shadow-xl border border-cream-300 z-50 text-left animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-2 py-1.5 border-b border-cream-200">
                      <p className="text-xs font-bold text-ink-950 truncate">{user.name}</p>
                      <p className="text-[11px] text-ink-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        {isOperator ? 'Administrator' : roleName}
                      </span>
                    </div>

                    <div className="py-1">
                      {isOperator ? (
                        <>
                          <Link
                            to="/platform"
                            role="menuitem"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-ink-700 hover:bg-cream-100 rounded-lg transition-colors"
                          >
                            <BarChart3 className="size-4 text-ink-500" aria-hidden="true" />
                            <span>Business Dashboard</span>
                          </Link>
                          <Link
                            to="/platform/settings"
                            role="menuitem"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-ink-700 hover:bg-cream-100 rounded-lg transition-colors"
                          >
                            <Settings className="size-4 text-ink-500" aria-hidden="true" />
                            <span>Platform Settings</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/dashboard"
                            role="menuitem"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-ink-700 hover:bg-cream-100 rounded-lg transition-colors"
                          >
                            <LayoutDashboard className="size-4 text-ink-500" aria-hidden="true" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/settings"
                            role="menuitem"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-ink-700 hover:bg-cream-100 rounded-lg transition-colors"
                          >
                            <Settings className="size-4 text-ink-500" aria-hidden="true" />
                            <span>Account Settings</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="pt-1 border-t border-cream-200">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setProfileOpen(false)
                          handleLogout()
                        }}
                        className="flex w-full items-center gap-2 px-2.5 py-2 text-xs font-bold text-danger-700 hover:bg-danger-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <LogOut className="size-4" aria-hidden="true" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {session.isError ? (
          <p role="alert" className="bg-warn-100 px-4 py-2 text-center text-sm text-warn-600">
            We could not refresh your session details. Some values below may be out of date.
          </p>
        ) : null}

        {/* MAIN BODY CONTENT */}
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8"
        >
          <Outlet />
        </main>

        {/* FOOTER (Clean administrative notice) */}
        <footer className="border-t border-cream-300 bg-cream-100 px-4 py-6 text-center text-sm text-ink-500 sm:px-6">
          {isOperator ? (
            <p className="font-semibold text-teal-800">
              CareCircle Administration · System telemetry and operations
            </p>
          ) : (
            <>
              <p>
                CareCircle coordinates schedules, refills and emergencies. It does not give medical advice or
                diagnose anything.
              </p>
              <p className="mt-1">If someone needs urgent medical help, contact your local emergency number.</p>
            </>
          )}
        </footer>
      </div>

      <ToastRegion />
    </div>
  )
}
