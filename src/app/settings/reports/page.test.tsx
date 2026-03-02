/**
 * Tests for My Reports page.
 * @see specs/prd-web.md Section M7 (Appeals process)
 * @see decisions/content-moderation.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import MyReportsPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  redirect: vi.fn(),
}))

vi.mock('@/hooks/use-auth', () => {
  const mockAuth = {
    user: {
      did: 'did:plc:user-jay-001',
      handle: 'jay.bsky.team',
      displayName: 'Jay',
      avatarUrl: null,
    },
    isAuthenticated: true,
    isLoading: false,
    getAccessToken: () => 'mock-access-token',
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    authFetch: vi.fn(),
  }
  return { useAuth: () => mockAuth }
})

describe('MyReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders page heading', async () => {
    render(<MyReportsPage />)
    expect(screen.getByRole('heading', { name: /my reports/i })).toBeInTheDocument()
  })

  it('renders breadcrumbs with link to settings', async () => {
    render(<MyReportsPage />)
    expect(screen.getByText('Account settings')).toBeInTheDocument()
  })

  it('loads and displays user reports from API', async () => {
    render(<MyReportsPage />)
    // Wait for reports to load -- check for exact reason type labels
    await waitFor(() => {
      expect(screen.getByText('Spam')).toBeInTheDocument()
    })
    expect(screen.getByText('Harassment')).toBeInTheDocument()
    expect(screen.getByText('Misleading')).toBeInTheDocument()
    expect(screen.getByText('Violation')).toBeInTheDocument()
  })

  it('shows report status badges', async () => {
    render(<MyReportsPage />)
    await waitFor(() => {
      const pendingBadges = screen.getAllByText('Pending')
      expect(pendingBadges.length).toBeGreaterThan(0)
    })
  })

  it('shows Appeal button only for dismissed reports', async () => {
    render(<MyReportsPage />)
    await waitFor(() => {
      expect(screen.getByText('Misleading')).toBeInTheDocument()
    })
    // Only the dismissed report (id: 3) should have an Appeal button
    const appealButtons = screen.getAllByRole('button', { name: /^appeal$/i })
    expect(appealButtons.length).toBe(1)
  })

  it('opens appeal form when Appeal button is clicked', async () => {
    const user = userEvent.setup()
    render(<MyReportsPage />)
    await waitFor(() => {
      expect(screen.getByText('Misleading')).toBeInTheDocument()
    })
    const appealButton = screen.getByRole('button', { name: /^appeal$/i })
    await user.click(appealButton)
    expect(screen.getByLabelText(/reason for appeal/i)).toBeInTheDocument()
  })

  it('submits appeal with reason text', async () => {
    const user = userEvent.setup()
    render(<MyReportsPage />)
    await waitFor(() => {
      expect(screen.getByText('Misleading')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /^appeal$/i }))
    await user.type(
      screen.getByLabelText(/reason for appeal/i),
      'I believe this was wrongly dismissed'
    )
    await user.click(screen.getByRole('button', { name: /submit appeal/i }))
    await waitFor(() => {
      expect(screen.getByText(/appeal submitted/i)).toBeInTheDocument()
    })
  })

  it('requires appeal reason text', async () => {
    const user = userEvent.setup()
    render(<MyReportsPage />)
    await waitFor(() => {
      expect(screen.getByText('Misleading')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /^appeal$/i }))
    await user.click(screen.getByRole('button', { name: /submit appeal/i }))
    expect(screen.getByText(/please provide a reason/i)).toBeInTheDocument()
  })

  it('shows appeal pending status for already-appealed reports', async () => {
    render(<MyReportsPage />)
    await waitFor(() => {
      expect(screen.getByText('Violation')).toBeInTheDocument()
    })
    // Report id: 4 has appealStatus: 'pending'
    expect(screen.getByText('Appeal pending')).toBeInTheDocument()
  })

  it('shows empty state when no reports exist', async () => {
    const { server } = await import('@/mocks/server')
    const { http, HttpResponse } = await import('msw')
    server.use(
      http.get('http://localhost:3000/api/moderation/my-reports', () => {
        return HttpResponse.json({ reports: [], cursor: null })
      })
    )
    render(<MyReportsPage />)
    await waitFor(() => {
      expect(screen.getByText(/no reports/i)).toBeInTheDocument()
    })
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<MyReportsPage />)
    await waitFor(() => {
      expect(screen.getByText('Spam')).toBeInTheDocument()
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('passes axe accessibility check with appeal form open', async () => {
    const user = userEvent.setup()
    const { container } = render(<MyReportsPage />)
    await waitFor(() => {
      expect(screen.getByText('Misleading')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /^appeal$/i }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
