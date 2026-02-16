/**
 * Tests for auth-aware fetch wrapper.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { createAuthFetch } from '@/lib/api/auth-fetch'
import { mockAuthSession } from '@/mocks/data'
import type { AuthSession } from '@/lib/api/types'

const API_URL = ''

describe('createAuthFetch', () => {
  let getToken: Mock<() => string | null>
  let setToken: Mock<(session: AuthSession) => void>
  let onAuthFailure: Mock<() => void>
  let authFetch: ReturnType<typeof createAuthFetch>

  beforeEach(() => {
    getToken = vi.fn(() => 'valid-token')
    setToken = vi.fn()
    onAuthFailure = vi.fn()
    authFetch = createAuthFetch({ getToken, setToken, onAuthFailure })
  })

  it('makes successful requests with token', async () => {
    server.use(
      http.get(`${API_URL}/api/test`, ({ request }) => {
        const auth = request.headers.get('Authorization')
        if (auth !== 'Bearer valid-token') {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return HttpResponse.json({ data: 'success' })
      })
    )

    const result = await authFetch<{ data: string }>('/api/test')
    expect(result.data).toBe('success')
  })

  it('retries on 401 after successful refresh', async () => {
    let callCount = 0
    server.use(
      http.get(`${API_URL}/api/test`, () => {
        callCount++
        if (callCount === 1) {
          return HttpResponse.json({ error: 'Expired' }, { status: 401 })
        }
        return HttpResponse.json({ data: 'refreshed' })
      })
    )

    // After refresh, getToken returns new token
    getToken.mockReturnValueOnce('old-token').mockReturnValue('new-token')

    const result = await authFetch<{ data: string }>('/api/test')
    expect(result.data).toBe('refreshed')
    expect(setToken).toHaveBeenCalledWith(mockAuthSession)
    expect(callCount).toBe(2)
  })

  it('calls onAuthFailure when refresh fails', async () => {
    server.use(
      http.get(`${API_URL}/api/test`, () => {
        return HttpResponse.json({ error: 'Expired' }, { status: 401 })
      }),
      http.post(`${API_URL}/api/auth/refresh`, () => {
        return HttpResponse.json({ error: 'No session' }, { status: 401 })
      })
    )

    await expect(authFetch('/api/test')).rejects.toThrow('Session expired')
    expect(onAuthFailure).toHaveBeenCalled()
  })

  it('does not retry when no token exists', async () => {
    getToken.mockReturnValue(null)
    server.use(
      http.get(`${API_URL}/api/test`, () => {
        return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
      })
    )

    await expect(authFetch('/api/test')).rejects.toThrow('API 401')
    expect(onAuthFailure).not.toHaveBeenCalled()
  })

  it('throws on non-401 errors without retrying', async () => {
    server.use(
      http.get(`${API_URL}/api/test`, () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 })
      })
    )

    await expect(authFetch('/api/test')).rejects.toThrow('API 404')
  })

  it('handles 204 responses', async () => {
    server.use(
      http.delete(`${API_URL}/api/test`, () => {
        return new HttpResponse(null, { status: 204 })
      })
    )

    const result = await authFetch('/api/test', { method: 'DELETE' })
    expect(result).toBeUndefined()
  })
})
