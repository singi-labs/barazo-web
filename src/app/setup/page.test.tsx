/**
 * Tests for community setup wizard page.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import SetupPage from './page'

const API_URL = ''

const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    back: vi.fn(),
  }),
}))

const mockAuthState = {
  user: null as {
    did: string
    handle: string
    displayName: string
    avatarUrl: string | null
  } | null,
  isAuthenticated: false,
  isLoading: false,
  crossPostScopesGranted: false,
  getAccessToken: (): string | null => null,
  login: vi.fn(),
  logout: vi.fn(),
  setSessionFromCallback: vi.fn(),
  requestCrossPostAuth: vi.fn(),
  authFetch: vi.fn(),
}

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockAuthState,
}))

function setAuthenticated() {
  mockAuthState.user = {
    did: 'did:plc:user-jay-001',
    handle: 'jay.bsky.team',
    displayName: 'Jay',
    avatarUrl: null,
  }
  mockAuthState.isAuthenticated = true
  mockAuthState.getAccessToken = () => 'mock-access-token'
}

function setUnauthenticated() {
  mockAuthState.user = null
  mockAuthState.isAuthenticated = false
  mockAuthState.getAccessToken = () => null
}

describe('SetupPage', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    // Default to authenticated for most tests
    setAuthenticated()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('redirects to / when community is already initialized', async () => {
    // Default handler returns { initialized: true, communityName: '...' }
    render(<SetupPage />)

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/')
    })
  })

  it('shows login prompt when not authenticated and not initialized', async () => {
    server.use(
      http.get(`${API_URL}/api/setup/status`, () => {
        return HttpResponse.json({ initialized: false })
      })
    )
    setUnauthenticated()

    render(<SetupPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /community setup/i })).toBeInTheDocument()
    })
    expect(screen.getByText(/hasn't been set up yet/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute(
      'href',
      '/login?returnTo=%2Fsetup'
    )
  })

  it('shows setup form when authenticated and not initialized', async () => {
    server.use(
      http.get(`${API_URL}/api/setup/status`, () => {
        return HttpResponse.json({ initialized: false })
      })
    )

    render(<SetupPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /set up your community/i })).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/community name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /initialize community/i })).toBeInTheDocument()
  })

  it('calls initializeCommunity on form submit and redirects to /', async () => {
    server.use(
      http.get(`${API_URL}/api/setup/status`, () => {
        return HttpResponse.json({ initialized: false })
      })
    )

    const user = userEvent.setup()
    render(<SetupPage />)

    await waitFor(() => {
      expect(screen.getByLabelText(/community name/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/community name/i), 'My Test Forum')
    await user.click(screen.getByRole('button', { name: /initialize community/i }))

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/')
    })
  })

  it('shows error message when initialization fails', async () => {
    server.use(
      http.get(`${API_URL}/api/setup/status`, () => {
        return HttpResponse.json({ initialized: false })
      }),
      http.post(`${API_URL}/api/setup/initialize`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )

    const user = userEvent.setup()
    render(<SetupPage />)

    await waitFor(() => {
      expect(screen.getByLabelText(/community name/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /initialize community/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/failed to initialize/i)
    })
  })

  it('disables submit button while submitting', async () => {
    server.use(
      http.get(`${API_URL}/api/setup/status`, () => {
        return HttpResponse.json({ initialized: false })
      }),
      http.post(`${API_URL}/api/setup/initialize`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return HttpResponse.json({
          initialized: true,
          adminDid: 'did:plc:user-jay-001',
          communityName: 'Test',
        })
      })
    )

    const user = userEvent.setup()
    render(<SetupPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /initialize community/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /initialize community/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /initializing/i })).toBeDisabled()
    })
  })

  it('passes axe accessibility check', async () => {
    server.use(
      http.get(`${API_URL}/api/setup/status`, () => {
        return HttpResponse.json({ initialized: false })
      })
    )

    const { container } = render(<SetupPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /initialize community/i })).toBeInTheDocument()
    })

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
