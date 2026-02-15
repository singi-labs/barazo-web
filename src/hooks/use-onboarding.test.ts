/**
 * Tests for useOnboarding hook.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { useOnboarding } from './use-onboarding'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

const mockStorage: Record<string, string> = {}

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => mockStorage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorage[key]
    }),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  })
  mockStorage['accessToken'] = 'test-token'
})

describe('useOnboarding', () => {
  it('loads onboarding status on mount', async () => {
    const { result } = renderHook(() => useOnboarding())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.complete).toBe(true)
    expect(result.current.status).not.toBeNull()
  })

  it('returns complete=false when onboarding is incomplete', async () => {
    server.use(
      http.get(`${API_URL}/api/onboarding/status`, () => {
        return HttpResponse.json({
          complete: false,
          fields: [
            {
              id: 'f1',
              communityDid: 'did:plc:test',
              fieldType: 'tos_acceptance',
              label: 'ToS',
              description: null,
              isMandatory: true,
              sortOrder: 0,
              config: null,
              createdAt: '2026-01-01T00:00:00Z',
              updatedAt: '2026-01-01T00:00:00Z',
            },
          ],
          responses: {},
          missingFields: [{ id: 'f1', label: 'ToS', fieldType: 'tos_acceptance' }],
        })
      })
    )

    const { result } = renderHook(() => useOnboarding())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.complete).toBe(false)
    expect(result.current.status?.missingFields).toHaveLength(1)
  })

  it('opens and closes modal', async () => {
    const { result } = renderHook(() => useOnboarding())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.showModal).toBe(false)

    act(() => {
      result.current.openModal()
    })
    expect(result.current.showModal).toBe(true)

    act(() => {
      result.current.closeModal()
    })
    expect(result.current.showModal).toBe(false)
  })

  it('submits responses and refreshes status', async () => {
    const { result } = renderHook(() => useOnboarding())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let success = false
    await act(async () => {
      success = await result.current.submit([{ fieldId: 'f1', response: true }])
    })

    expect(success).toBe(true)
    expect(result.current.showModal).toBe(false)
  })

  it('handles missing auth token gracefully', async () => {
    delete mockStorage['accessToken']

    const { result } = renderHook(() => useOnboarding())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Without token, complete defaults to false (no status loaded)
    expect(result.current.status).toBeNull()
  })
})
