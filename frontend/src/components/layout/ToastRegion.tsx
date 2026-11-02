import { useEffect } from 'react'

import { useUiStore } from '../../stores/ui'
import type { Toast } from '../../stores/ui'

/** Polite live region: announcements never steal focus, but always get read. */
export function ToastRegion() {
  const toasts = useUiStore((state) => state.toasts)

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismissToast = useUiStore((state) => state.dismissToast)

  useEffect(() => {
    const timer = window.setTimeout(() => dismissToast(toast.id), 6000)
    return () => window.clearTimeout(timer)
  }, [toast.id, dismissToast])

  const tones: Record<Toast['tone'], string> = {
    info: 'border-teal-300 bg-teal-700 text-cream-50',
    success: 'border-ok-500 bg-ok-600 text-cream-50',
    error: 'border-danger-700 bg-danger-600 text-white',
  }

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-[var(--radius-card)] border px-4 py-3 shadow-[var(--shadow-card)] ${tones[toast.tone]}`}
    >
      <p className="flex-1 text-base">{toast.message}</p>
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        className="grid size-11 shrink-0 place-items-center rounded-md border border-white/40 text-xl leading-none hover:bg-white/15"
      >
        <span aria-hidden="true">×</span>
        <span className="sr-only">Dismiss message</span>
      </button>
    </div>
  )
}
