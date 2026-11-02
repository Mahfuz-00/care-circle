import { createRoute, createRouter, redirect } from '@tanstack/react-router'

import { rootRoute } from './rootRoute'
import { appLayoutRoute, requireAuth } from './appLayoutRoute'
import { isPlatformAdmin } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'

import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
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
import { SystemHealthPage } from '../features/platform/SystemHealthPage'
import { BackupsPage } from '../features/platform/BackupsPage'
import { FailedJobsPage } from '../features/platform/FailedJobsPage'
import { AuditLogPage } from '../features/platform/AuditLogPage'

/** Signed-in users have no business on the sign-in screen. */
function requireGuest(): void {
  if (useAuthStore.getState().token) {
    throw redirect({ to: '/' })
  }
}

/**
 * The landlord console requires the `platform.admin` ability (PRD §3). Without
 * it the route is not merely hidden — it refuses to load.
 */
function requirePlatformOperator(): void {
  requireAuth()
  if (!isPlatformAdmin(useAuthStore.getState().user)) {
    throw redirect({ to: '/' })
  }
}

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
  beforeLoad: () => {
    requireGuest()
  },
})

const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  component: DashboardPage,
})

const medicationsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'medications',
  component: MedicationsPage,
})

const newMedicationRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'medications/new',
  component: NewMedicationPage,
})

const appointmentsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'appointments',
  component: AppointmentsPage,
})

const adherenceRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'adherence',
  component: AdherencePage,
})

const careCircleRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'care-circle',
  component: CareCirclePage,
})

const emergencyRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'emergency',
  component: EmergencyPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'settings',
  component: SettingsPage,
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
  loginRoute,
  registerRoute,
  appLayoutRoute.addChildren([
    indexRoute,
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
