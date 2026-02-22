/**
 * Tests for admin trust seeds page.
 * TDD: written before implementation.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import AdminTrustSeedsPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/trust-seeds',
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

describe('AdminTrustSeedsPage', () => {
  it('renders heading and help text', async () => {
    render(<AdminTrustSeedsPage />)
    expect(screen.getByRole('heading', { name: /trust seeds/i })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(/trusted accounts/i)).toBeInTheDocument()
    })
  })

  it('renders seed list with implicit/explicit distinction', async () => {
    render(<AdminTrustSeedsPage />)
    await waitFor(() => {
      expect(screen.getByText(/trusted-mod\.bsky\.social/i)).toBeInTheDocument()
      expect(screen.getByText(/verified-expert\.bsky\.social/i)).toBeInTheDocument()
      expect(screen.getByText(/alice\.bsky\.social/i)).toBeInTheDocument()
    })
    // Check type badges - use exact text to avoid partial matches
    const manualBadges = screen.getAllByText('Manual')
    const automaticBadges = screen.getAllByText('Automatic')
    expect(manualBadges.length).toBe(2)
    expect(automaticBadges.length).toBe(3)
  })

  it('add seed dialog opens and submits', async () => {
    const user = userEvent.setup()
    render(<AdminTrustSeedsPage />)
    await waitFor(() => {
      expect(screen.getByText(/trusted-mod\.bsky\.social/i)).toBeInTheDocument()
    })
    // Open add dialog
    const addBtn = screen.getByRole('button', { name: /add trust seed/i })
    await user.click(addBtn)
    await waitFor(() => {
      expect(screen.getByLabelText(/handle/i)).toBeInTheDocument()
    })
    // Fill in the form
    await user.type(screen.getByLabelText(/handle/i), 'new-seed.bsky.social')
    await user.type(screen.getByLabelText(/reason/i), 'Known community contributor')
    // Submit
    const submitBtn = screen.getByRole('button', { name: /^add$/i })
    await user.click(submitBtn)
    await waitFor(() => {
      // Dialog should close
      expect(screen.queryByLabelText(/handle/i)).not.toBeInTheDocument()
    })
  })

  it('remove seed with confirmation', async () => {
    const user = userEvent.setup()
    render(<AdminTrustSeedsPage />)
    await waitFor(() => {
      expect(screen.getByText(/trusted-mod\.bsky\.social/i)).toBeInTheDocument()
    })
    // Find remove buttons (only for explicit seeds)
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    expect(removeButtons.length).toBeGreaterThan(0)
    await user.click(removeButtons[0]!)
    // Confirm dialog
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    })
    const confirmBtn = screen.getByRole('button', { name: /^confirm$/i })
    await user.click(confirmBtn)
    await waitFor(() => {
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument()
    })
  })

  it('implicit seeds cannot be removed', async () => {
    render(<AdminTrustSeedsPage />)
    await waitFor(() => {
      expect(screen.getByText(/alice\.bsky\.social/i)).toBeInTheDocument()
    })
    // Automatic seeds should not have remove buttons
    // There are 2 manual seeds, so 2 remove buttons
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    expect(removeButtons.length).toBe(2)
  })

  it('shows loading states', () => {
    render(<AdminTrustSeedsPage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows error states', async () => {
    const { server } = await import('@/mocks/server')
    const { http, HttpResponse } = await import('msw')
    server.use(
      http.get('/api/admin/trust-seeds', () => {
        return HttpResponse.json({ error: 'Internal error' }, { status: 500 })
      })
    )
    render(<AdminTrustSeedsPage />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminTrustSeedsPage />)
    await waitFor(() => {
      expect(screen.getByText(/trusted-mod\.bsky\.social/i)).toBeInTheDocument()
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
