import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'

import { Button } from '../../components/ui/Button'
import { SelectField, TextField } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState } from '../../components/ui/states'
import { toApiError } from '../../lib/api'
import type { Role } from '../../lib/types'
import { ROLE_DESCRIPTIONS, ROLES, ROLE_LABELS } from '../../lib/permissions'
import { useRegister } from './hooks'

const ROLE_OPTIONS = ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }))

function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

/** Account creation. The role chosen here is the role the API stores. */
export function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegister()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('self_user')
  const [timezone, setTimezone] = useState(browserTimezone)

  const error = register.error ? toApiError(register.error) : null

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    register.mutate(
      { name: name.trim(), email: email.trim(), password, role, timezone },
      {
        onSuccess: () => {
          void navigate({ to: '/' })
        },
      },
    )
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-5 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-sage-600">CareCircle</p>
      <PageHeader
        title="Create your account"
        description="Pick the role that describes you. Roles decide who can see and change what inside a care circle."
      />

      <form onSubmit={submit} className="space-y-4" noValidate>
        {error ? <ErrorState error={error} title="We could not create the account" /> : null}

        <TextField
          id="register-name"
          label="Full name"
          required
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={error?.fieldError('name')}
        />

        <TextField
          id="register-email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={error?.fieldError('email')}
        />

        <TextField
          id="register-password"
          label="Password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint="Use at least 8 characters."
          error={error?.fieldError('password')}
        />

        <SelectField
          id="register-role"
          label="Role"
          required
          options={ROLE_OPTIONS}
          value={role}
          onChange={(event) => setRole(event.target.value as Role)}
          hint={ROLE_DESCRIPTIONS[role]}
          error={error?.fieldError('role')}
        />

        <TextField
          id="register-timezone"
          label="Timezone"
          required
          value={timezone}
          onChange={(event) => setTimezone(event.target.value)}
          hint="Reminders are scheduled in this timezone. Quiet hours use the care circle’s timezone."
          error={error?.fieldError('timezone')}
        />

        <Button type="submit" size="lg" loading={register.isPending} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-base text-ink-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-teal-700 underline underline-offset-4">
          Sign in
        </Link>
        .
      </p>
    </main>
  )
}
