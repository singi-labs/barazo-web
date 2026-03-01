/**
 * Tests for SetupGuard component.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { SetupGuard } from './setup-guard'

const API_URL = ''

const mockReplace = vi.fn()
let mockPathname = '/'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    back: vi.fn(),
  }),
  usePathname: () => mockPathname,
}))

describe('SetupGuard', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    mockPathname = '/'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('redirects to /setup when community is not initialized', async () => {
    server.use(
      http.get(`${API_URL}/api/setup/status`, () => {
        return HttpResponse.json({ initialized: false })
      })
    )

    render(
      <SetupGuard>
        <p>Child content</p>
      </SetupGuard>
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/setup')
    })
  })

  it('renders children when community is initialized', async () => {
    // Default handler returns initialized: true
    render(
      <SetupGuard>
        <p>Child content</p>
      </SetupGuard>
    )

    await waitFor(() => {
      expect(screen.getByText('Child content')).toBeInTheDocument()
    })
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('does not redirect when current path is /setup', async () => {
    mockPathname = '/setup'
    server.use(
      http.get(`${API_URL}/api/setup/status`, () => {
        return HttpResponse.json({ initialized: false })
      })
    )

    render(
      <SetupGuard>
        <p>Setup page</p>
      </SetupGuard>
    )

    await waitFor(() => {
      expect(screen.getByText('Setup page')).toBeInTheDocument()
    })
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('does not redirect when current path is /login', async () => {
    mockPathname = '/login'
    server.use(
      http.get(`${API_URL}/api/setup/status`, () => {
        return HttpResponse.json({ initialized: false })
      })
    )

    render(
      <SetupGuard>
        <p>Login page</p>
      </SetupGuard>
    )

    await waitFor(() => {
      expect(screen.getByText('Login page')).toBeInTheDocument()
    })
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('does not redirect when current path starts with /auth/', async () => {
    mockPathname = '/auth/callback'
    server.use(
      http.get(`${API_URL}/api/setup/status`, () => {
        return HttpResponse.json({ initialized: false })
      })
    )

    render(
      <SetupGuard>
        <p>Auth callback</p>
      </SetupGuard>
    )

    await waitFor(() => {
      expect(screen.getByText('Auth callback')).toBeInTheDocument()
    })
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('renders children when status check fails (allows through)', async () => {
    server.use(
      http.get(`${API_URL}/api/setup/status`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )

    render(
      <SetupGuard>
        <p>Child content</p>
      </SetupGuard>
    )

    await waitFor(() => {
      expect(screen.getByText('Child content')).toBeInTheDocument()
    })
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
