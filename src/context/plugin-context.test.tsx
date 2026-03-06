/**
 * Tests for PluginProvider context.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import { PluginProvider, PluginContext } from './plugin-context'
import type { PluginContextValue } from './plugin-context'
import { getPlugins } from '@/lib/api/client'
import { useAuth } from '@/hooks/use-auth'
import { useContext, useEffect, useRef } from 'react'
import type { Plugin } from '@/lib/api/types'

vi.mock('@/lib/api/client', () => ({
  getPlugins: vi.fn(),
}))

vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

// Mutable container to capture context without TS control-flow narrowing
interface ContextRef {
  current: PluginContextValue | null
}

function createContextRef(): ContextRef {
  return { current: null }
}

// Test consumer component that renders plugin context values
function PluginConsumer({ ctxRef }: { ctxRef: ContextRef }) {
  const context = useContext(PluginContext)
  const ref = useRef(ctxRef)
  useEffect(() => {
    ref.current.current = context
  })
  return (
    <div>
      <span data-testid="loading">{String(context?.isLoading)}</span>
      <span data-testid="plugin-count">{context?.plugins.length ?? 0}</span>
    </div>
  )
}

const mockPlugins: Plugin[] = [
  {
    id: '1',
    name: 'analytics',
    displayName: 'Analytics',
    version: '1.0.0',
    description: 'Analytics plugin',
    source: 'core',
    enabled: true,
    category: 'analytics',
    dependencies: [],
    dependents: [],
    settingsSchema: {},
    settings: { trackPageViews: true, sampleRate: 0.5 },
    installedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'spam-filter',
    displayName: 'Spam Filter',
    version: '2.1.0',
    description: 'Spam filtering plugin',
    source: 'official',
    enabled: false,
    category: 'moderation',
    dependencies: [],
    dependents: [],
    settingsSchema: {},
    settings: { threshold: 0.8 },
    installedAt: '2026-01-15T00:00:00Z',
  },
]

function mockAuthUnauthenticated() {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    crossPostScopesGranted: false,
    getAccessToken: () => null,
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    requestCrossPostAuth: vi.fn(),
    authFetch: vi.fn(),
  } as ReturnType<typeof useAuth>)
}

function mockAuthAuthenticated() {
  vi.mocked(useAuth).mockReturnValue({
    user: {
      did: 'did:plc:test',
      handle: 'test.bsky.social',
      displayName: 'Test User',
      avatarUrl: null,
      role: 'user',
    },
    isAuthenticated: true,
    isLoading: false,
    crossPostScopesGranted: false,
    getAccessToken: () => 'mock-token',
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    requestCrossPostAuth: vi.fn(),
    authFetch: vi.fn(),
  } as ReturnType<typeof useAuth>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PluginProvider', () => {
  it('provides empty plugins array when not authenticated', async () => {
    mockAuthUnauthenticated()

    const ctxRef = createContextRef()
    render(
      <PluginProvider>
        <PluginConsumer ctxRef={ctxRef} />
      </PluginProvider>
    )

    await waitFor(() => {
      expect(ctxRef.current?.isLoading).toBe(false)
    })

    expect(ctxRef.current?.plugins).toEqual([])
    expect(getPlugins).not.toHaveBeenCalled()
  })

  it('fetches plugins when authenticated', async () => {
    mockAuthAuthenticated()
    vi.mocked(getPlugins).mockResolvedValue({ plugins: mockPlugins })

    const ctxRef = createContextRef()
    render(
      <PluginProvider>
        <PluginConsumer ctxRef={ctxRef} />
      </PluginProvider>
    )

    await waitFor(() => {
      expect(ctxRef.current?.isLoading).toBe(false)
    })

    expect(getPlugins).toHaveBeenCalledWith('mock-token')
    expect(ctxRef.current?.plugins).toHaveLength(2)
    expect(ctxRef.current?.plugins[0]!.name).toBe('analytics')
    expect(ctxRef.current?.plugins[1]!.name).toBe('spam-filter')
  })

  it('isPluginEnabled returns true for enabled plugin', async () => {
    mockAuthAuthenticated()
    vi.mocked(getPlugins).mockResolvedValue({ plugins: mockPlugins })

    const ctxRef = createContextRef()
    render(
      <PluginProvider>
        <PluginConsumer ctxRef={ctxRef} />
      </PluginProvider>
    )

    await waitFor(() => {
      expect(ctxRef.current?.isLoading).toBe(false)
    })

    expect(ctxRef.current?.isPluginEnabled('analytics')).toBe(true)
  })

  it('isPluginEnabled returns false for disabled plugin', async () => {
    mockAuthAuthenticated()
    vi.mocked(getPlugins).mockResolvedValue({ plugins: mockPlugins })

    const ctxRef = createContextRef()
    render(
      <PluginProvider>
        <PluginConsumer ctxRef={ctxRef} />
      </PluginProvider>
    )

    await waitFor(() => {
      expect(ctxRef.current?.isLoading).toBe(false)
    })

    expect(ctxRef.current?.isPluginEnabled('spam-filter')).toBe(false)
  })

  it('isPluginEnabled returns false for unknown plugin', async () => {
    mockAuthAuthenticated()
    vi.mocked(getPlugins).mockResolvedValue({ plugins: mockPlugins })

    const ctxRef = createContextRef()
    render(
      <PluginProvider>
        <PluginConsumer ctxRef={ctxRef} />
      </PluginProvider>
    )

    await waitFor(() => {
      expect(ctxRef.current?.isLoading).toBe(false)
    })

    expect(ctxRef.current?.isPluginEnabled('nonexistent')).toBe(false)
  })

  it('getPluginSettings returns settings for installed plugin', async () => {
    mockAuthAuthenticated()
    vi.mocked(getPlugins).mockResolvedValue({ plugins: mockPlugins })

    const ctxRef = createContextRef()
    render(
      <PluginProvider>
        <PluginConsumer ctxRef={ctxRef} />
      </PluginProvider>
    )

    await waitFor(() => {
      expect(ctxRef.current?.isLoading).toBe(false)
    })

    const settings = ctxRef.current?.getPluginSettings('analytics')
    expect(settings).toEqual({ trackPageViews: true, sampleRate: 0.5 })
  })

  it('getPluginSettings returns a copy, not the original object', async () => {
    mockAuthAuthenticated()
    vi.mocked(getPlugins).mockResolvedValue({ plugins: mockPlugins })

    const ctxRef = createContextRef()
    render(
      <PluginProvider>
        <PluginConsumer ctxRef={ctxRef} />
      </PluginProvider>
    )

    await waitFor(() => {
      expect(ctxRef.current?.isLoading).toBe(false)
    })

    const settings1 = ctxRef.current?.getPluginSettings('analytics')
    const settings2 = ctxRef.current?.getPluginSettings('analytics')
    expect(settings1).toEqual(settings2)
    expect(settings1).not.toBe(settings2)
  })

  it('getPluginSettings returns null for unknown plugin', async () => {
    mockAuthAuthenticated()
    vi.mocked(getPlugins).mockResolvedValue({ plugins: mockPlugins })

    const ctxRef = createContextRef()
    render(
      <PluginProvider>
        <PluginConsumer ctxRef={ctxRef} />
      </PluginProvider>
    )

    await waitFor(() => {
      expect(ctxRef.current?.isLoading).toBe(false)
    })

    expect(ctxRef.current?.getPluginSettings('nonexistent')).toBeNull()
  })

  it('refreshPlugins triggers re-fetch', async () => {
    mockAuthAuthenticated()
    vi.mocked(getPlugins)
      .mockResolvedValueOnce({ plugins: [mockPlugins[0]!] })
      .mockResolvedValueOnce({ plugins: mockPlugins })

    const ctxRef = createContextRef()
    render(
      <PluginProvider>
        <PluginConsumer ctxRef={ctxRef} />
      </PluginProvider>
    )

    // Wait for initial fetch
    await waitFor(() => {
      expect(ctxRef.current?.isLoading).toBe(false)
    })
    expect(ctxRef.current?.plugins).toHaveLength(1)

    // Trigger refresh
    await act(async () => {
      await ctxRef.current?.refreshPlugins()
    })

    await waitFor(() => {
      expect(ctxRef.current?.isLoading).toBe(false)
    })

    expect(getPlugins).toHaveBeenCalledTimes(2)
    expect(ctxRef.current?.plugins).toHaveLength(2)
  })

  it('keeps existing plugins on fetch error', async () => {
    mockAuthAuthenticated()
    vi.mocked(getPlugins)
      .mockResolvedValueOnce({ plugins: mockPlugins })
      .mockRejectedValueOnce(new Error('Network error'))

    const ctxRef = createContextRef()
    render(
      <PluginProvider>
        <PluginConsumer ctxRef={ctxRef} />
      </PluginProvider>
    )

    // Wait for initial fetch
    await waitFor(() => {
      expect(ctxRef.current?.isLoading).toBe(false)
    })
    expect(ctxRef.current?.plugins).toHaveLength(2)

    // Trigger refresh that fails
    await act(async () => {
      await ctxRef.current?.refreshPlugins()
    })

    await waitFor(() => {
      expect(ctxRef.current?.isLoading).toBe(false)
    })

    // Plugins should be preserved
    expect(ctxRef.current?.plugins).toHaveLength(2)
  })

  it('does not fetch while auth is still loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      crossPostScopesGranted: false,
      getAccessToken: () => null,
      login: vi.fn(),
      logout: vi.fn(),
      setSessionFromCallback: vi.fn(),
      requestCrossPostAuth: vi.fn(),
      authFetch: vi.fn(),
    } as ReturnType<typeof useAuth>)

    const ctxRef = createContextRef()
    render(
      <PluginProvider>
        <PluginConsumer ctxRef={ctxRef} />
      </PluginProvider>
    )

    expect(getPlugins).not.toHaveBeenCalled()
    expect(ctxRef.current?.isLoading).toBe(true)
  })
})
