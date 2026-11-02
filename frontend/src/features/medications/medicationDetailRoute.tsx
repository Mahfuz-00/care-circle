import { createRoute } from '@tanstack/react-router'

import { appLayoutRoute } from '../../routes/appLayoutRoute'
import { MedicationDetailPage } from './MedicationDetailPage'

/**
 * `/medications/{id}`. The route is defined next to the page so the params stay
 * end-to-end typed (`medicationDetailRoute.useParams()`).
 */
function MedicationDetailRouteComponent() {
  const { medicationId } = medicationDetailRoute.useParams()
  return <MedicationDetailPage medicationId={Number(medicationId)} />
}

export const medicationDetailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'medications/$medicationId',
  component: MedicationDetailRouteComponent,
})
