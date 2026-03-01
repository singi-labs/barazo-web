/**
 * Tests for API client auth functions.
 * Verifies the contract between client functions and the API response shape.
 */

import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { initiateLogin, refreshSession, initiateCrossPostAuth } from '@/lib/api/client'

const API_URL = ''

describe('initiateLogin', () => {
  it('returns the redirect URL from the API', async () => {
    const expectedUrl = 'https://bsky.social/oauth/authorize?client_id=test&request_uri=urn:test'

    server.use(
      http.get(`${API_URL}/api/auth/login`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('handle')).toBe('jay.bsky.team')
        return HttpResponse.json({ url: expectedUrl })
      })
    )

    const result = await initiateLogin('jay.bsky.team')
    expect(result).toEqual({ url: expectedUrl })
    expect(result.url).toBe(expectedUrl)
  })

  it('passes handle as query parameter', async () => {
    let receivedHandle: string | null = null

    server.use(
      http.get(`${API_URL}/api/auth/login`, ({ request }) => {
        const url = new URL(request.url)
        receivedHandle = url.searchParams.get('handle')
        return HttpResponse.json({ url: 'https://example.com/oauth' })
      })
    )

    await initiateLogin('gui.do')
    expect(receivedHandle).toBe('gui.do')
  })

  it('throws on API error', async () => {
    server.use(
      http.get(`${API_URL}/api/auth/login`, () => {
        return HttpResponse.json({ error: 'Failed to initiate login' }, { status: 502 })
      })
    )

    await expect(initiateLogin('bad.handle')).rejects.toThrow('API 502')
  })

  it('throws on invalid handle', async () => {
    server.use(
      http.get(`${API_URL}/api/auth/login`, () => {
        return HttpResponse.json({ error: 'Invalid handle' }, { status: 400 })
      })
    )

    await expect(initiateLogin('')).rejects.toThrow('API 400')
  })
})

describe('refreshSession', () => {
  it('returns session data on success', async () => {
    const result = await refreshSession()
    expect(result).toHaveProperty('accessToken')
    expect(result).toHaveProperty('did')
    expect(result).toHaveProperty('handle')
  })

  it('throws on expired session', async () => {
    server.use(
      http.post(`${API_URL}/api/auth/refresh`, () => {
        return HttpResponse.json({ error: 'No refresh token' }, { status: 401 })
      })
    )

    await expect(refreshSession()).rejects.toThrow('API 401')
  })
})

describe('initiateCrossPostAuth', () => {
  it('returns the redirect URL with auth header', async () => {
    const expectedUrl = 'https://bsky.social/oauth/authorize?scope=crosspost'

    server.use(
      http.get(`${API_URL}/api/auth/crosspost-authorize`, ({ request }) => {
        const auth = request.headers.get('Authorization')
        expect(auth).toBe('Bearer test-token-123')
        return HttpResponse.json({ url: expectedUrl })
      })
    )

    const result = await initiateCrossPostAuth('test-token-123')
    expect(result).toEqual({ url: expectedUrl })
    expect(result.url).toBe(expectedUrl)
  })
})
