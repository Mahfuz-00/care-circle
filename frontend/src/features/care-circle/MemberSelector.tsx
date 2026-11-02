import { useId } from 'react'

import { SelectField } from '../../components/ui/Field'
import { useSession } from '../auth/useSession'
import { useMembers } from './hooks'

export interface MemberOption {
  id: number
  label: string
}

/**
 * Picks which member's records to look at. Options come from the API's member
 * list plus the signed-in user; nothing is inferred from a name.
 */
export function MemberSelector({
  value,
  onChange,
  label = 'Show records for',
  includeSelf = true,
  disabled = false,
}: {
  value: number | null
  onChange: (userId: number | null) => void
  label?: string
  includeSelf?: boolean
  disabled?: boolean
}) {
  const selectId = useId()
  const { user, activeCareCircle, capabilities } = useSession()
  const members = useMembers(activeCareCircle?.id, { enabled: capabilities.viewMembers })

  const options: MemberOption[] = []

  if (includeSelf && user) {
    options.push({ id: user.id, label: `${user.name} (you)` })
  }

  for (const member of members.data ?? []) {
    if (member.user.id === user?.id) continue
    options.push({ id: member.user.id, label: member.user.name })
  }

  return (
    <div className="max-w-sm">
      <SelectField
        id={selectId}
        label={label}
        options={options.map((option) => ({ value: String(option.id), label: option.label }))}
        value={value == null ? String(user?.id ?? '') : String(value)}
        disabled={disabled || options.length <= 1}
        onChange={(event) => onChange(Number(event.target.value))}
        hint={
          members.isError
            ? 'The member list could not be loaded — only your own records are available.'
            : options.length <= 1
              ? 'No other member of this circle can be shown to your role.'
              : undefined
        }
      />
    </div>
  )
}
