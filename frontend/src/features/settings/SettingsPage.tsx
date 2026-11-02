import { Link, useNavigate } from '@tanstack/react-router'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { buttonClasses } from '../../components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, InlineNotice, LoadingState } from '../../components/ui/states'
import { ROLE_DESCRIPTIONS } from '../../lib/permissions'
import { API_BASE_URL } from '../../lib/config'
import { useLogout, useMe } from '../auth/hooks'
import { useSession } from '../auth/useSession'
import { PermissionsMatrix } from './PermissionsMatrix'

export function SettingsPage() {
  const navigate = useNavigate()
  const me = useMe()
  const { user, role, roleName, activeCareCircle, isPlatformAdmin } = useSession()
  const logout = useLogout()

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Your account, the active care circle and what your role is allowed to do."
        actions={
          <Button
            variant="secondary"
            loading={logout.isPending}
            onClick={() =>
              logout.mutate(undefined, {
                onSettled: () => {
                  void navigate({ to: '/login' })
                },
              })
            }
          >
            Sign out
          </Button>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Account"
            description="These values come from GET /auth/me. The dashboard surface has no profile-update endpoint, so they are read-only here."
          />
          <CardBody>
            {me.isPending ? <LoadingState label="Loading your account…" /> : null}
            {me.isError ? (
              <ErrorState error={me.error} title="Your account could not be loaded" onRetry={() => void me.refetch()} />
            ) : null}

            {user ? (
              <dl className="grid gap-3 sm:grid-cols-2">
                <Row label="Name" value={user.name} />
                <Row label="Email" value={user.email} />
                <Row label="Role" value={roleName} />
                <Row label="Timezone" value={user.timezone ?? 'not returned by the API'} />
                <Row label="User id" value={String(user.id)} />
                <Row label="Operator access" value={isPlatformAdmin ? 'platform.admin — true' : 'not granted'} />
              </dl>
            ) : null}

            {role ? (
              <p className="mt-4 text-sm text-ink-500">
                <strong className="text-ink-700">What that role means: </strong>
                {ROLE_DESCRIPTIONS[role]}
              </p>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Active care circle"
            description="Switch circles from the header. Members, roles and quiet hours are managed on the care-circle page."
            actions={
              <Link to="/care-circle" className={buttonClasses('secondary')}>
                Manage care circle
              </Link>
            }
          />
          <CardBody>
            {activeCareCircle ? (
              <dl className="grid gap-3 sm:grid-cols-2">
                <Row label="Name" value={activeCareCircle.name} />
                <Row label="Timezone" value={activeCareCircle.timezone} />
                <Row
                  label="Quiet hours"
                  value={
                    activeCareCircle.quiet_hours_start || activeCareCircle.quiet_hours_end
                      ? `${activeCareCircle.quiet_hours_start ?? 'not set'} → ${activeCareCircle.quiet_hours_end ?? 'not set'}`
                      : 'not set'
                  }
                />
                <Row label="Circles on this account" value={String(me.data?.care_circles.length ?? 0)} />
              </dl>
            ) : (
              <EmptyState
                title="No active care circle"
                description="Select a circle from the header switcher, or create one on the care-circle page."
                tone="sage"
                action={
                  <Link to="/care-circle" className={buttonClasses('primary')}>
                    Go to care circle
                  </Link>
                }
              />
            )}
          </CardBody>
        </Card>

        {isPlatformAdmin ? (
          <Card>
            <CardHeader
              title="Platform console"
              description="System health, backups, failed jobs, audit log and platform metrics."
              actions={
                <Link to="/platform" className={buttonClasses('primary')}>
                  Open the console
                </Link>
              }
            />
            <CardBody>
              <Badge tone="teal">platform.admin</Badge>
            </CardBody>
          </Card>
        ) : null}

        <Card>
          <CardHeader
            title="Roles and permissions"
            description="One matrix, defined once in the dashboard and enforced by the API. Your role is highlighted."
          />
          <CardBody>
            <PermissionsMatrix highlightRole={role} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Connection" description="Where this dashboard is talking." />
          <CardBody>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Row label="API base URL" value={API_BASE_URL} />
              <Row label="Token ability" value="dashboard (this surface only — /mobile/v1 is never called)" />
            </dl>
            <div className="mt-4">
              <InlineNotice tone="info">
                This browser holds a dashboard token in local storage. Signing out revokes it server-side and clears it
                here.
              </InlineNotice>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="text-base break-words text-ink-900">{value}</dd>
    </div>
  )
}
