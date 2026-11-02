/**
 * API surface configuration.
 *
 * The dashboard only ever talks to the `/api/v1` surface with a Sanctum token
 * that carries the `dashboard` ability (PRD §3). `/mobile/v1` is a different
 * surface with a different token ability and is never called from here.
 */
export const API_ORIGIN: string = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '')

/** Versioned dashboard prefix. */
export const API_PREFIX = '/api/v1'

/** Absolute base URL for every dashboard request. */
export const API_BASE_URL = `${API_ORIGIN}${API_PREFIX}`

/** Operator-only console prefix (requires the `platform.admin` ability). */
export const PLATFORM_PREFIX = '/platform'
