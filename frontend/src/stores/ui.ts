import { create } from 'zustand'

export type ToastTone = 'info' | 'success' | 'error'

export interface Toast {
  id: number
  message: string
  tone: ToastTone
}

/**
 * UI-only state: transient announcements. Server state never lives here
 * (TanStack Query owns it) — this store exists so an action somewhere can tell
 * the user what happened without prop-drilling.
 */
interface UiState {
  toasts: Toast[]
  pushToast: (message: string, tone?: ToastTone) => void
  dismissToast: (id: number) => void
}

let nextToastId = 1

export const useUiStore = create<UiState>()((set) => ({
  toasts: [],
  pushToast: (message, tone = 'info') => {
    const id = nextToastId++
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }))
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))

/** Imperative helper for non-component call sites (query/mutation callbacks). */
export function announce(message: string, tone: ToastTone = 'info'): void {
  useUiStore.getState().pushToast(message, tone)
}
