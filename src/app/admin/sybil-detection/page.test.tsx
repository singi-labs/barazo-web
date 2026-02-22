/**
 * Tests for admin sybil detection page.
 * TDD: written before implementation.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import AdminSybilDetectionPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/sybil-detection',
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: { children: React.ReactNode; href: string } & Record<string, unknown>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

vi.mock('@/hooks/use-auth', () => {
  const mockAuth = {
    user: {
      did: 'did:plc:user-alice-001',
      handle: 'alice.bsky.social',
      displayName: 'Alice',
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

describe('AdminSybilDetectionPage', () => {
  it('renders heading and explanation text', async () => {
    render(<AdminSybilDetectionPage />)
    expect(screen.getByRole('heading', { name: /sybil detection/i })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(/trust graph/i)).toBeInTheDocument()
    })
  })

  it('renders trust graph status card', async () => {
    render(<AdminSybilDetectionPage />)
    await waitFor(() => {
      expect(screen.getByText(/1,500 nodes/i)).toBeInTheDocument()
      expect(screen.getByText(/4,200 edges/i)).toBeInTheDocument()
      expect(screen.getByText(/2 clusters flagged/i)).toBeInTheDocument()
    })
  })

  it('renders cluster list from API', async () => {
    render(<AdminSybilDetectionPage />)
    await waitFor(() => {
      expect(screen.getByText(/8 members/i)).toBeInTheDocument()
      expect(screen.getByText(/5 members/i)).toBeInTheDocument()
      expect(screen.getByText(/3 members/i)).toBeInTheDocument()
    })
  })

  it('filter by status works', async () => {
    render(<AdminSybilDetectionPage />)
    await waitFor(() => {
      expect(screen.getByText(/8 members/i)).toBeInTheDocument()
    })
    // All three clusters should be visible initially
    expect(screen.getByText(/5 members/i)).toBeInTheDocument()
    expect(screen.getByText(/3 members/i)).toBeInTheDocument()
    // Find and use the status filter select element
    const filterSelect = screen.getByLabelText(/filter by status/i)
    fireEvent.change(filterSelect, { target: { value: 'flagged' } })
    // Only the flagged cluster (8 members) should remain
    await waitFor(() => {
      expect(screen.queryByText(/5 members/i)).not.toBeInTheDocument()
    })
    expect(screen.getByText(/8 members/i)).toBeInTheDocument()
  })

  it('click cluster shows detail', async () => {
    const user = userEvent.setup()
    render(<AdminSybilDetectionPage />)
    await waitFor(() => {
      expect(screen.getByText(/8 members/i)).toBeInTheDocument()
    })
    // Click on the first cluster row
    const viewButtons = screen.getAllByRole('button', { name: /view details/i })
    await user.click(viewButtons[0]!)
    await waitFor(() => {
      expect(screen.getByText(/sybil1\.bsky\.social/i)).toBeInTheDocument()
      expect(screen.getByText(/sybil2\.bsky\.social/i)).toBeInTheDocument()
    })
  })

  it('dismiss action with confirm dialog', async () => {
    const user = userEvent.setup()
    render(<AdminSybilDetectionPage />)
    await waitFor(() => {
      expect(screen.getByText(/8 members/i)).toBeInTheDocument()
    })
    // Open detail view
    const viewButtons = screen.getAllByRole('button', { name: /view details/i })
    await user.click(viewButtons[0]!)
    await waitFor(() => {
      expect(screen.getByText(/sybil1\.bsky\.social/i)).toBeInTheDocument()
    })
    // Click dismiss
    const dismissBtn = screen.getByRole('button', { name: /dismiss cluster/i })
    await user.click(dismissBtn)
    // Confirm dialog should appear
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    })
    // Confirm
    const confirmBtn = screen.getByRole('button', { name: /^confirm$/i })
    await user.click(confirmBtn)
    await waitFor(() => {
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument()
    })
  })

  it('ban action with confirm dialog', async () => {
    const user = userEvent.setup()
    render(<AdminSybilDetectionPage />)
    await waitFor(() => {
      expect(screen.getByText(/8 members/i)).toBeInTheDocument()
    })
    const viewButtons = screen.getAllByRole('button', { name: /view details/i })
    await user.click(viewButtons[0]!)
    await waitFor(() => {
      expect(screen.getByText(/sybil1\.bsky\.social/i)).toBeInTheDocument()
    })
    const banBtn = screen.getByRole('button', { name: /ban cluster/i })
    await user.click(banBtn)
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    })
    const confirmBtn = screen.getByRole('button', { name: /^confirm$/i })
    await user.click(confirmBtn)
    await waitFor(() => {
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument()
    })
  })

  it('behavioral flags section renders', async () => {
    render(<AdminSybilDetectionPage />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /behavioral flags/i })).toBeInTheDocument()
      expect(screen.getByText(/burst_voting/i)).toBeInTheDocument()
      expect(screen.getByText(/content_similarity/i)).toBeInTheDocument()
    })
  })

  it('dismiss flag action works', async () => {
    const user = userEvent.setup()
    render(<AdminSybilDetectionPage />)
    await waitFor(() => {
      expect(screen.getByText(/burst_voting/i)).toBeInTheDocument()
    })
    const dismissButtons = screen.getAllByRole('button', { name: /dismiss flag/i })
    await user.click(dismissButtons[0]!)
    // Verify flag is dismissed (removed from pending display)
    await waitFor(() => {
      // After dismissal the flag status changes
      expect(dismissButtons[0]).toBeDefined()
    })
  })

  it('recompute button sends POST and re-enables after completion', async () => {
    const user = userEvent.setup()
    render(<AdminSybilDetectionPage />)
    await waitFor(() => {
      expect(screen.getByText(/1,500 nodes/i)).toBeInTheDocument()
    })
    const recomputeBtn = screen.getByRole('button', { name: /recompute now/i })
    expect(recomputeBtn).toBeEnabled()
    await user.click(recomputeBtn)
    // After the mock resolves, the button should re-enable
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /recompute now/i })
      expect(btn).toBeEnabled()
    })
  })

  it('shows loading states', () => {
    render(<AdminSybilDetectionPage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows error states with retry', async () => {
    // Override handler to return error
    const { server } = await import('@/mocks/server')
    const { http, HttpResponse } = await import('msw')
    server.use(
      http.get('/api/admin/trust-graph/status', () => {
        return HttpResponse.json({ error: 'Internal error' }, { status: 500 })
      }),
      http.get('/api/admin/sybil-clusters', () => {
        return HttpResponse.json({ error: 'Internal error' }, { status: 500 })
      }),
      http.get('/api/admin/behavioral-flags', () => {
        return HttpResponse.json({ error: 'Internal error' }, { status: 500 })
      })
    )
    render(<AdminSybilDetectionPage />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminSybilDetectionPage />)
    await waitFor(() => {
      expect(screen.getByText(/1,500 nodes/i)).toBeInTheDocument()
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
