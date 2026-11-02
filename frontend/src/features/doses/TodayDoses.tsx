import { Card, CardHeader } from '../../components/ui/Card'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import { DoseCard } from './DoseCard'
import { useTodayDoses } from './hooks'

/**
 * Today's doses. The component owns its own query so no server data is threaded
 * through page props.
 */
export function TodayDoses({
  userId,
  heading,
  headingId,
}: {
  userId?: number | null
  heading: string
  headingId: string
}) {
  const doses = useTodayDoses(userId)

  const sorted = doses.data
    ? doses.data
        .slice()
        .sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime())
    : []

  return (
    <Card aria-labelledby={headingId}>
      <CardHeader
        id={headingId}
        title={heading}
        description={
          doses.data
            ? `${sorted.length} scheduled dose${sorted.length === 1 ? '' : 's'} returned by the API for today.`
            : 'Loading today’s schedule from the API.'
        }
      />

      <div className="space-y-3 px-4 py-4 sm:px-5">
        {doses.isPending ? <LoadingState label="Loading today’s doses…" /> : null}

        {doses.isError ? (
          <ErrorState
            error={doses.error}
            title="Today’s doses could not be loaded"
            onRetry={() => void doses.refetch()}
          />
        ) : null}

        {doses.isSuccess && sorted.length === 0 ? (
          <EmptyState
            title="Nothing scheduled for today"
            description="No doses were returned for today. Add a medication to build a schedule, or check the medication’s frequency."
          />
        ) : null}

        {sorted.map((dose) => (
          <DoseCard key={dose.id} dose={dose} />
        ))}
      </div>
    </Card>
  )
}
