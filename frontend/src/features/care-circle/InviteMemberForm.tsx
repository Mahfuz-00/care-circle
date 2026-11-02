import { useId, useState } from 'react'

import { Button } from '../../components/ui/Button'
import { SelectField, TextField } from '../../components/ui/Field'
import { ErrorState } from '../../components/ui/states'
import { toApiError } from '../../lib/api'
import { ROLES, ROLE_LABELS } from '../../lib/permissions'
import type { Role } from '../../lib/types'
import { announce } from '../../stores/ui'
import { useInviteMember } from './hooks'

const INVITE_ROLE_OPTIONS = ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }))

/** Invite by email or phone — one of the two, as the API requires. */
export function InviteMemberForm({ careCircleId }: { careCircleId: number }) {
  const baseId = useId()
  const invite = useInviteMember(careCircleId)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<Role>('caregiver')
  const [touched, setTouched] = useState(false)

  const error = invite.error ? toApiError(invite.error) : null
  const missingContact = touched && !email.trim() && !phone.trim()

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    if (!email.trim() && !phone.trim()) return
    invite.mutate(
      {
        role,
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      },
      {
        onSuccess: () => {
          announce('Invitation sent.', 'success')
          setEmail('')
          setPhone('')
        },
      },
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {error ? <ErrorState error={error} title="The invitation was not sent" /> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          id={`${baseId}-email`}
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={error?.fieldError('email') ?? (missingContact ? 'Provide an email or a phone number.' : undefined)}
        />
        <TextField
          id={`${baseId}-phone`}
          label="Phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          error={error?.fieldError('phone')}
          hint="Either email or phone is enough."
        />
        <SelectField
          id={`${baseId}-role`}
          label="Role"
          options={INVITE_ROLE_OPTIONS}
          value={role}
          onChange={(event) => setRole(event.target.value as Role)}
          error={error?.fieldError('role')}
        />
      </div>

      <Button type="submit" loading={invite.isPending}>
        Send invitation
      </Button>
    </form>
  )
}
