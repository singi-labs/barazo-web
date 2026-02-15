/**
 * Auth-aware fetch wrapper with 401 interception and silent token refresh.
 * Wraps apiFetch to automatically retry on 401 after refreshing the session.
 * @see specs/prd-web.md Section M3 (Auth Flow)
 */

import { refreshSession } from './client'
import type { AuthSession } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

interface AuthFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  signal?: AbortSignal
}

interface AuthFetchDeps {
  getToken: () => string | null
  setToken: (session: AuthSession) => void
  onAuthFailure: () => void
}

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function rawFetch(
  path: string,
  accessToken: string | null,
  options: AuthFetchOptions = {}
): Promise<Response> {
  const url = `${API_URL}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  return fetch(url, {
    method: options.method ?? 'GET',
    headers,
    signal: options.signal,
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  })
}

/**
 * Creates an auth-aware fetch function that automatically handles 401 responses
 * by refreshing the session token and retrying the request once.
 */
export function createAuthFetch(deps: AuthFetchDeps) {
  let refreshPromise: Promise<AuthSession> | null = null

  return async function authFetch<T>(path: string, options: AuthFetchOptions = {}): Promise<T> {
    const token = deps.getToken()
    const response = await rawFetch(path, token, options)

    if (response.ok) {
      if (response.status === 204) {
        return undefined as T
      }
      return response.json() as Promise<T>
    }

    if (response.status !== 401 || !token) {
      const body = await response.text().catch(() => 'Unknown error')
      throw new ApiError(response.status, `API ${response.status}: ${body}`)
    }

    // 401 -- attempt refresh (deduplicate concurrent refreshes)
    try {
      if (!refreshPromise) {
        refreshPromise = refreshSession()
      }
      const session = await refreshPromise
      deps.setToken(session)
    } catch {
      deps.onAuthFailure()
      throw new ApiError(401, 'Session expired')
    } finally {
      refreshPromise = null
    }

    // Retry with new token
    const retryToken = deps.getToken()
    const retryResponse = await rawFetch(path, retryToken, options)

    if (retryResponse.ok) {
      if (retryResponse.status === 204) {
        return undefined as T
      }
      return retryResponse.json() as Promise<T>
    }

    const body = await retryResponse.text().catch(() => 'Unknown error')
    throw new ApiError(retryResponse.status, `API ${retryResponse.status}: ${body}`)
  }
}

export { ApiError }
