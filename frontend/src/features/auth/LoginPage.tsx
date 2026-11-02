import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'

import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState } from '../../components/ui/states'
import { toApiError } from '../../lib/api'
import type { ApiError } from '../../lib/api'
import { useLogin } from './hooks'

/** Sign-in for the dashboard surface (`/api/v1`, `dashboard` ability). */
export function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const error = login.error ? toApiError(login.error) : null

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          void navigate({ to: '/' })
        },
      },
    )
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-5 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-sage-600">CareCircle</p>
      <PageHeader
        title="Sign in"
        description="Coordinate medication schedules, appointments and care-circle alerts. CareCircle reminds and coordinates — it does not give medical advice."
      />

      <form onSubmit={submit} className="space-y-4" noValidate>
        {error ? <ErrorState error={error} title="We could not sign you in" /> : null}

        <TextField
          id="login-email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldError(error, 'email')}
        />

        <TextField
          id="login-password"
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldError(error, 'password')}
        />

        <Button type="submit" size="lg" loading={login.isPending} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-base text-ink-500">
        No account yet?{' '}
        <Link to="/register" className="font-semibold text-teal-700 underline underline-offset-4">
          Create one
        </Link>
        .
      </p>
    </main>
  )
}

function fieldError(error: ApiError | null, field: string): string | undefined {
  return error?.fieldError(field)
}
