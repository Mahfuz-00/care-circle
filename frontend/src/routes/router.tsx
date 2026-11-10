import { createRoute, createRouter, redirect } from '@tanstack/react-router'

import { rootRoute } from './rootRoute'
import { appLayoutRoute, requireAuth } from './appLayoutRoute'
import { isPlatformAdmin } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'

import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { LandingPage } from '../features/marketing/LandingPage'
import { HowItWorksPage } from '../features/marketing/HowItWorksPage'
import { FeaturesPage } from '../features/marketing/FeaturesPage'
import { SolutionsPage } from '../features/marketing/SolutionsPage'
import { PricingPage } from '../features/marketing/PricingPage'
import { SecurityPage } from '../features/marketing/SecurityPage'
import { AccessibilityPage } from '../features/marketing/AccessibilityPage'
import { SafetyPage } from '../features/marketing/SafetyPage'
import { RefundPolicyPage } from '../features/marketing/RefundPolicyPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { MedicationsPage } from '../features/medications/MedicationsPage'
import { NewMedicationPage } from '../features/medications/NewMedicationPage'
import { medicationDetailRoute } from '../features/medications/medicationDetailRoute'
import { AppointmentsPage } from '../features/appointments/AppointmentsPage'
import { AdherencePage } from '../features/adherence/AdherencePage'
import { CareCirclePage } from '../features/care-circle/CareCirclePage'
import { EmergencyPage } from '../features/emergency/EmergencyPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { PlatformLayout } from '../features/platform/PlatformLayout'
import { PlatformOverviewPage } from '../features/platform/PlatformOverviewPage'
import { PlatformClientsPage } from '../features/platform/PlatformClientsPage'
import { PlatformClientDetailPage } from '../features/platform/PlatformClientDetailPage'
import { PlatformMarketingPage } from '../features/platform/PlatformMarketingPage'
import { PlatformAnalyticsPage } from '../features/platform/PlatformAnalyticsPage'
import { PlatformSettingsPage } from '../features/platform/PlatformSettingsPage'
import { PlatformPlansPage } from '../features/platform/PlatformPlansPage'
import { PlatformBillingPage } from '../features/platform/PlatformBillingPage'
import { PlatformFeedbackPage } from '../features/platform/PlatformFeedbackPage'
import { PlatformRefundsPage } from '../features/platform/PlatformRefundsPage'
import { PlatformPaymentGatewaysPage } from '../features/platform/PlatformPaymentGatewaysPage'
import { PlatformEmailPage } from '../features/platform/PlatformEmailPage'
import { PlatformNotificationsPage } from '../features/platform/PlatformNotificationsPage'
import { SystemHealthPage } from '../features/platform/SystemHealthPage'
import { BackupsPage } from '../features/platform/BackupsPage'
import { FailedJobsPage } from '../features/platform/FailedJobsPage'
import { AuditLogPage } from '../features/platform/AuditLogPage'

/** Signed-in users have no business on the sign-in screen. */
function requireGuest(): void {
  const { token, user } = useAuthStore.getState()
  if (token) {
    if (isPlatformAdmin(user)) {
      throw redirect({ to: '/platform' })
    }
    throw redirect({ to: '/dashboard' })
  }
}

/**
 * The landlord console requires the `platform.admin` ability (PRD §3). Without
 * it the route is not merely hidden — it refuses to load.
 */
function requirePlatformOperator(): void {
  requireAuth()
  if (!isPlatformAdmin(useAuthStore.getState().user)) {
    throw redirect({ to: '/dashboard' })
  }
}

/**
 * Household tenant views are reserved for patient & caregiver accounts.
 * Platform admins manage the multi-tenant business and have no household view.
 */
function requireHouseholdUser(): void {
  requireAuth()
  if (isPlatformAdmin(useAuthStore.getState().user)) {
    throw redirect({ to: '/platform' })
  }
}

/**
 * The public marketing surface. It is deliberately outside `appLayoutRoute`, so
 * it renders without the authenticated chrome and without a token.
 */
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

const howItWorksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/how-it-works',
  component: HowItWorksPage,
})

const featuresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/features',
  component: FeaturesPage,
})

const solutionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/solutions',
  component: SolutionsPage,
})

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: PricingPage,
})

const securityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/security',
  component: SecurityPage,
})

const accessibilityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accessibility',
  component: AccessibilityPage,
})

const safetyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/safety',
  component: SafetyPage,
})

const refundPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/refund-policy',
  component: RefundPolicyPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: () => {
    requireGuest()
  },
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
  validateSearch: (search: Record<string, unknown>): { plan?: string } => ({
    plan: typeof search.plan === 'string' ? search.plan : undefined,
  }),
  beforeLoad: () => {
    requireGuest()
  },
})

const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'dashboard',
  component: DashboardPage,
  beforeLoad: () => {
    requireHouseholdUser()
  },
})

const medicationsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'medications',
  component: MedicationsPage,
  beforeLoad: () => {
    requireHouseholdUser()
  },
})

const newMedicationRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'medications/new',
  component: NewMedicationPage,
  beforeLoad: () => {
    requireHouseholdUser()
  },
})

const appointmentsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'appointments',
  component: AppointmentsPage,
  beforeLoad: () => {
    requireHouseholdUser()
  },
})

const adherenceRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'adherence',
  component: AdherencePage,
  beforeLoad: () => {
    requireHouseholdUser()
  },
})

const careCircleRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'care-circle',
  component: CareCirclePage,
  beforeLoad: () => {
    requireHouseholdUser()
  },
})

const emergencyRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'emergency',
  component: EmergencyPage,
  beforeLoad: () => {
    requireHouseholdUser()
  },
})

const settingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'settings',
  component: SettingsPage,
  beforeLoad: () => {
    requireHouseholdUser()
  },
})

const platformRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'platform',
  component: PlatformLayout,
  beforeLoad: () => {
    requirePlatformOperator()
  },
})

const platformIndexRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: '/',
  component: PlatformOverviewPage,
})

const platformClientsRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'clients',
  component: PlatformClientsPage,
})

const platformClientDetailRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'clients/$clientId',
  component: PlatformClientDetailPage,
})

const platformMarketingRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'marketing',
  component: PlatformMarketingPage,
})

const platformAnalyticsRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'analytics',
  component: PlatformAnalyticsPage,
})

const platformSettingsRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'settings',
  component: PlatformSettingsPage,
})

const platformPlansRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'plans',
  component: PlatformPlansPage,
})

const platformBillingRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'billing',
  component: PlatformBillingPage,
})

const platformFeedbackRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'feedback',
  component: PlatformFeedbackPage,
})

const platformRefundsRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'refunds',
  component: PlatformRefundsPage,
})

const platformGatewaysRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'payment-gateways',
  component: PlatformPaymentGatewaysPage,
})

const platformEmailRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'email-settings',
  component: PlatformEmailPage,
})

const platformNotificationsRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'notifications',
  component: PlatformNotificationsPage,
})

const platformHealthRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'health',
  component: SystemHealthPage,
})

const platformBackupsRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'backups',
  component: BackupsPage,
})

const platformFailedJobsRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'failed-jobs',
  component: FailedJobsPage,
})

const platformAuditRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'audit',
  component: AuditLogPage,
})

const routeTree = rootRoute.addChildren([
  landingRoute,
  howItWorksRoute,
  featuresRoute,
  solutionsRoute,
  pricingRoute,
  securityRoute,
  accessibilityRoute,
  safetyRoute,
  refundPolicyRoute,
  loginRoute,
  registerRoute,
  appLayoutRoute.addChildren([
    dashboardRoute,
    medicationsRoute,
    newMedicationRoute,
    medicationDetailRoute,
    appointmentsRoute,
    adherenceRoute,
    careCircleRoute,
    emergencyRoute,
    settingsRoute,
    platformRoute.addChildren([
      platformIndexRoute,
      platformClientsRoute,
      platformClientDetailRoute,
      platformMarketingRoute,
      platformAnalyticsRoute,
      platformSettingsRoute,
      platformPlansRoute,
      platformBillingRoute,
      platformFeedbackRoute,
      platformRefundsRoute,
      platformGatewaysRoute,
      platformEmailRoute,
      platformNotificationsRoute,
      platformHealthRoute,
      platformBackupsRoute,
      platformFailedJobsRoute,
      platformAuditRoute,
    ]),
  ]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
