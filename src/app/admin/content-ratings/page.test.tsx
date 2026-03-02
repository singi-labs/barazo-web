/**
 * Tests for admin content ratings page.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { axe } from 'vitest-axe'
import AdminContentRatingsPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/content-ratings',
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

describe('AdminContentRatingsPage', () => {
  it('renders content ratings heading', () => {
    render(<AdminContentRatingsPage />)
    expect(screen.getByRole('heading', { name: /content ratings/i })).toBeInTheDocument()
  })

  it('renders community maturity rating', async () => {
    render(<AdminContentRatingsPage />)
    await waitFor(() => {
      expect(screen.getByText(/community rating/i)).toBeInTheDocument()
    })
  })

  it('renders category maturity ratings', async () => {
    render(<AdminContentRatingsPage />)
    await waitFor(() => {
      expect(screen.getByText('General Discussion')).toBeInTheDocument()
    })
  })

  it('renders maturity level explanation', () => {
    render(<AdminContentRatingsPage />)
    expect(screen.getByText(/safe/i)).toBeInTheDocument()
    expect(screen.getByText(/suitable for all audiences/i)).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminContentRatingsPage />)
    await waitFor(() => {
      expect(screen.getByText('General Discussion')).toBeInTheDocument()
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
