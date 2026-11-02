import { Link, useNavigate } from '@tanstack/react-router'

import { buttonClasses } from '../../components/ui/buttonStyles'
import { Card, CardBody } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { AccessDenied } from '../../components/ui/states'
import type { MedicationPayload } from '../../lib/types'
import { useSession } from '../auth/useSession'
import { announce } from '../../stores/ui'
import { MedicationForm } from './MedicationForm'
import { useCreateMedication } from './hooks'

export function NewMedicationPage() {
  const navigate = useNavigate()
  const { capabilities } = useSession()
  const create = useCreateMedication()

  const mayCreate = capabilities.createOwnMedication || capabilities.manageOthersAppointments

  function submit(payload: MedicationPayload) {
    create.mutate(payload, {
      onSuccess: (medication) => {
        announce(`${payload.name} saved. Stock and days remaining come from the API.`, 'success')
        // The API decides the new id; without it we return to the list rather
        // than navigating to a medication we cannot name.
        if (medication?.id) {
          void navigate({
            to: '/medications/$medicationId',
            params: { medicationId: String(medication.id) },
          })
        } else {
          void navigate({ to: '/medications' })
        }
      },
    })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Add a medication"
        description="Schedule, stock level and owner. CareCircle reminds and tracks stock; it never advises on how or whether to take a medication."
        actions={
          <Link to="/medications" className={buttonClasses('secondary')}>
            Back to medications
          </Link>
        }
      />

      {!mayCreate ? (
        <AccessDenied
          title="Your role cannot create medications"
          description="Only a member who can manage their own medications or edit the circle’s medications can add one."
        />
      ) : (
        <Card>
          <CardBody>
            <MedicationForm mode="create" submitting={create.isPending} error={create.error} onSubmit={submit} />
          </CardBody>
        </Card>
      )}
    </div>
  )
}
