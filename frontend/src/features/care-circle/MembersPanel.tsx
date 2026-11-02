import { useState } from 'react'

import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { SelectField } from '../../components/ui/Field'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import { ROLE_LABELS, ROLES } from '../../lib/permissions'
import type { CareCircleMember, Role } from '../../lib/types'
import { useSession } from '../auth/useSession'
import { announce } from '../../stores/ui'
import { InviteMemberForm } from './InviteMemberForm'
import { useMembers, useRemoveMember, useUpdateMemberRole } from './hooks'

const ROLE_OPTIONS = ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }))

/**
 * "The senior can always see who has access" (PRD §5.3) — so every role that may
 * know its circle sees the list; only `manage_care_circle` may change it.
 */
export function MembersPanel({ careCircleId }: { careCircleId: number }) {
  const { user, capabilities } = useSession()
  const members = useMembers(careCircleId, { enabled: capabilities.viewMembers })

  if (!capabilities.viewMembers) {
    return (
      <Card>
        <CardHeader title="Members" />
        <CardBody>
          <EmptyState
            title="Member list not available to your role"
            description="Your role does not include access to the care-circle member list."
          />
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Members"
        description="Roles here decide what each person can see and change inside this circle."
      />
      <CardBody>
        {members.isPending ? <LoadingState label="Loading members…" /> : null}

        {members.isError ? (
          <ErrorState
            error={members.error}
            title="Members could not be loaded"
            onRetry={() => void members.refetch()}
          />
        ) : null}

        {members.isSuccess && members.data.length === 0 ? (
          <EmptyState
            title="No members returned"
            description="The API returned an empty member list for this care circle."
          />
        ) : null}

        {members.isSuccess && members.data.length > 0 ? (
          <ul className="space-y-3">
            {members.data.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                careCircleId={careCircleId}
                canManage={capabilities.manageCareCircle}
                isSelf={member.user.id === user?.id}
              />
            ))}
          </ul>
        ) : null}

        {capabilities.inviteMembers ? (
          <div className="mt-6 border-t border-cream-200 pt-5">
            <h3 className="text-base font-semibold text-ink-900">Invite someone</h3>
            {capabilities.manageCareCircle ? null : (
              <p className="mt-1 text-sm text-ink-500">
                Your role can invite people. Changing an existing member’s role is limited to a primary caregiver.
              </p>
            )}
            <div className="mt-3">
              <InviteMemberForm careCircleId={careCircleId} />
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
  )
}

function MemberRow({
  member,
  careCircleId,
  canManage,
  isSelf,
}: {
  member: CareCircleMember
  careCircleId: number
  canManage: boolean
  isSelf: boolean
}) {
  const updateRole = useUpdateMemberRole(careCircleId)
  const removeMember = useRemoveMember(careCircleId)
  const [nextRole, setNextRole] = useState<Role>(member.role)
  const [confirming, setConfirming] = useState(false)

  const selectId = `member-role-${member.id}`
  const dirty = nextRole !== member.role

  return (
    <li className="rounded-[var(--radius-card)] border border-cream-300 bg-cream-50 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-ink-900">
            {member.user.name}
            {isSelf ? ' (you)' : ''}
          </p>
          <p className="text-sm text-ink-500">{member.user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={member.status === 'active' ? 'ok' : 'neutral'}>{member.status}</Badge>
          <Badge tone="sage">{ROLE_LABELS[member.role] ?? member.role}</Badge>
        </div>
      </div>

      {canManage ? (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="w-56">
            <SelectField
              id={selectId}
              label={`Role for ${member.user.name}`}
              options={ROLE_OPTIONS}
              value={nextRole}
              onChange={(event) => setNextRole(event.target.value as Role)}
            />
          </div>
          <Button
            disabled={!dirty}
            loading={updateRole.isPending}
            onClick={() =>
              updateRole.mutate(
                { memberId: member.id, role: nextRole },
                { onSuccess: () => announce(`${member.user.name} is now ${ROLE_LABELS[nextRole]}.`, 'success') },
              )
            }
          >
            Save role
          </Button>
          {confirming ? (
            <span className="flex flex-wrap items-center gap-2">
              <Button
                variant="danger"
                loading={removeMember.isPending}
                onClick={() =>
                  removeMember.mutate(member.id, {
                    onSuccess: () => announce(`${member.user.name} removed from the circle.`, 'info'),
                  })
                }
              >
                Confirm removal
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </span>
          ) : (
            <Button variant="ghost" onClick={() => setConfirming(true)}>
              Remove<span className="sr-only"> {member.user.name}</span>
            </Button>
          )}
        </div>
      ) : null}

      {updateRole.error ? (
        <div className="mt-3">
          <ErrorState error={updateRole.error} title="The role was not changed" />
        </div>
      ) : null}
      {removeMember.error ? (
        <div className="mt-3">
          <ErrorState error={removeMember.error} title="The member was not removed" />
        </div>
      ) : null}
    </li>
  )
}
