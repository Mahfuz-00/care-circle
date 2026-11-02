import { useId, useState } from 'react'
import { Link } from '@tanstack/react-router'

import { buttonClasses } from '../../components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { SelectField } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import { useSession } from '../auth/useSession'
import { MedicationCard } from './MedicationCard'
import { useMedications } from './hooks'

const FILTER_OPTIONS = [
  { value: 'all', label: 'All medications' },
  { value: 'active', label: 'Active only' },
  { value: 'low_stock', label: 'Low stock' },
  { value: 'inactive', label: 'Inactive' },
]

export function MedicationsPage() {
  const filterId = useId()
  const { user, capabilities } = useSession()
  const medications = useMedications()
  const [filter, setFilter] = useState('all')

  const all = medications.data ?? []
  const visible = all.filter((medication) => {
    if (filter === 'active') return medication.is_active
    if (filter === 'inactive') return !medication.is_active
    if (filter === 'low_stock') return medication.is_low_stock
    return true
  })

  const mayCreate = capabilities.createOwnMedication || capabilities.manageOthersAppointments
  const lowStockCount = all.filter((medication) => medication.is_low_stock).length

  return (
    <div>
      <PageHeader
        title="Medications"
        description="Schedules, stock levels and the pharmacy on file. A caregiver’s view of a senior’s medications cannot be hidden from the circle (PRD §7)."
        actions={
          mayCreate ? (
            <Link to="/medications/new" className={buttonClasses('primary', 'lg')}>
              Add medication
            </Link>
          ) : null
        }
      />

      {!medications.isPending && !medications.isError ? (
        <p className="mb-4 text-sm text-ink-500">
          {all.length} medication{all.length === 1 ? '' : 's'} returned by the API
          {lowStockCount > 0 ? ` · ${lowStockCount} low on stock` : ''}
          {user ? ` · signed in as ${user.name}` : ''}
        </p>
      ) : null}

      <Card className="mb-5">
        <CardHeader
          title="Filter"
          description="Filtering happens on the records the API returned for your active care circle."
        />
        <CardBody>
          <div className="max-w-sm">
            <SelectField
              id={filterId}
              label="Show"
              options={FILTER_OPTIONS}
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      {medications.isPending ? <LoadingState label="Loading medications…" /> : null}

      {medications.isError ? (
        <ErrorState
          error={medications.error}
          title="Medications could not be loaded"
          onRetry={() => void medications.refetch()}
        />
      ) : null}

      {medications.isSuccess && all.length === 0 ? (
        <EmptyState
          title="No medications yet"
          description="This care circle has no medications. Add the first one to start tracking doses and stock."
          tone="sage"
          action={
            mayCreate ? (
              <Link to="/medications/new" className={buttonClasses('primary')}>
                Add medication
              </Link>
            ) : undefined
          }
        />
      ) : null}

      {medications.isSuccess && all.length > 0 && visible.length === 0 ? (
        <EmptyState
          title="Nothing matches this filter"
          description="No medication in this care circle matches the selected filter."
        />
      ) : null}

      <div className="space-y-3">
        {visible.map((medication) => (
          <MedicationCard key={medication.id} medication={medication} />
        ))}
      </div>
    </div>
  )
}
