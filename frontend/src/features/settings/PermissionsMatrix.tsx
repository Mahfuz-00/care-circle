import { PERMISSIONS, PERMISSION_HINTS, PERMISSION_LABELS, ROLES, ROLE_LABELS, ROLE_MATRIX, GRANT_LABELS } from '../../lib/permissions'
import type { Role } from '../../lib/types'

/**
 * The PRD §6 matrix rendered from the same module the guards use. If a cell
 * changes in `src/lib/permissions.ts`, this table and every gated control change
 * together.
 */
export function PermissionsMatrix({ highlightRole }: { highlightRole: Role | null }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <caption className="sr-only">
          Role permissions. Rows are permissions, columns are roles; the highlighted column is your role.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="border-b border-cream-300 px-3 py-2 text-base font-semibold text-ink-900">
              Permission
            </th>
            {ROLES.map((role) => (
              <th
                key={role}
                scope="col"
                className={`border-b border-cream-300 px-3 py-2 text-base font-semibold ${
                  role === highlightRole ? 'bg-sage-100 text-sage-800' : 'text-ink-900'
                }`}
              >
                {ROLE_LABELS[role]}
                {role === highlightRole ? <span className="block text-sm font-normal">your role</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSIONS.map((permission) => (
            <tr key={permission}>
              <th scope="row" className="border-b border-cream-200 px-3 py-2 align-top font-medium text-ink-900">
                {PERMISSION_LABELS[permission]}
                <span className="block text-sm font-normal text-ink-500">{PERMISSION_HINTS[permission]}</span>
              </th>
              {ROLES.map((role) => {
                const grant = ROLE_MATRIX[role][permission]
                return (
                  <td
                    key={role}
                    className={`border-b border-cream-200 px-3 py-2 align-top ${
                      role === highlightRole ? 'bg-sage-50' : ''
                    } ${grant === 'no' ? 'text-ink-500' : 'text-ink-900'}`}
                  >
                    {GRANT_LABELS[grant]}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
