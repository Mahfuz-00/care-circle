import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'

import { API_BASE_URL } from './config'
import { useAuthStore } from '../stores/auth'

/**
 * The one axios instance the dashboard uses. It is pinned to `/api/v1` — the
 * `dashboard`-ability surface (PRD §3). Requests to `/mobile/v1` are a bug, not
 * a configuration option.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 20_000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // An expired or revoked token must not leave the UI pretending to be signed in.
    if (error.response?.status === 401) {
      useAuthStore.getState().clear()
    }
    return Promise.reject(error)
  },
)

/** Every successful response is wrapped: `{ "data": ... }`. */
interface Envelope<T> {
  data: T
}

interface ValidationBody {
  message?: string
  errors?: Record<string, string[]>
}

/** Normalised error shape the whole UI can render. */
export class ApiError extends Error {
  readonly status: number | null
  readonly errors: Record<string, string[]>

  constructor(message: string, status: number | null, errors: Record<string, string[]> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }

  get isValidation(): boolean {
    return this.status === 422
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isOffline(): boolean {
    return this.status === null
  }

  /** First server message for a given field, if the API returned one. */
  fieldError(field: string): string | undefined {
    return this.errors[field]?.[0]
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null
    const body = error.response?.data as ValidationBody | undefined
    const message =
      body?.message ??
      (status === null
        ? 'We could not reach the CareCircle API. Check the connection and try again.'
        : `The request failed (HTTP ${status}).`)
    return new ApiError(message, status, body?.errors ?? {})
  }

  return new ApiError(error instanceof Error ? error.message : 'Something went wrong.', null)
}

async function unwrap<T>(promise: Promise<{ data: Envelope<T> | T }>): Promise<T> {
  const response = await promise
  const body = response.data
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as Envelope<T>).data
  }
  return body as unknown as T
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>

export function apiGet<T>(url: string, params?: QueryParams, config?: AxiosRequestConfig): Promise<T> {
  return unwrap<T>(api.get(url, { ...config, params }))
}

export function apiPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return unwrap<T>(api.post(url, body, config))
}

export function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  return unwrap<T>(api.patch(url, body))
}

export function apiPut<T>(url: string, body?: unknown): Promise<T> {
  return unwrap<T>(api.put(url, body))
}

export function apiDelete<T>(url: string): Promise<T> {
  return unwrap<T>(api.delete(url))
}
