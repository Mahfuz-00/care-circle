import { useId, useState } from 'react'

import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/Field'
import { ErrorState } from '../../components/ui/states'
import { toApiError } from '../../lib/api'
import { useRefillMedication } from './hooks'

/** Records stock coming in. The API recomputes days_remaining — the UI never does. */
export function RefillForm({ medicationId, onDone }: { medicationId: number; onDone: () => void }) {
  const baseId = useId()
  const refill = useRefillMedication(medicationId)
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [touched, setTouched] = useState(false)

  const quantityError =
    touched && (!quantity.trim() || Number(quantity) <= 0) ? 'Enter how many units were added.' : undefined

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    if (!quantity.trim() || Number(quantity) <= 0) return
    refill.mutate(
      { medicationId, payload: { quantity: Number(quantity), ...(note.trim() ? { note: note.trim() } : {}) } },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 rounded-lg border border-cream-300 bg-cream-50 px-3 py-3" noValidate>
      {refill.error ? <ErrorState error={refill.error} title="The refill was not recorded" /> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          id={`${baseId}-quantity`}
          label="Units added"
          type="number"
          inputMode="numeric"
          min={1}
          required
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          error={quantityError ?? (refill.error ? toApiError(refill.error).fieldError('quantity') : undefined)}
        />
        <TextField
          id={`${baseId}-note`}
          label="Note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          hint="Optional — stored with the stock event."
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={refill.isPending}>
          Record refill
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
