/**
 * Tests for admin dashboard page.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { axe } from 'vitest-axe'
import AdminDashboardPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin',
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

describe('AdminDashboardPage', () => {
  it('renders dashboard heading', async () => {
    render(<AdminDashboardPage />)
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('renders stats cards from API', async () => {
    render(<AdminDashboardPage />)
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument()
    })
    expect(screen.getByText('187')).toBeInTheDocument()
    expect(screen.getByText('156')).toBeInTheDocument()
  })

  it('renders stat card labels', async () => {
    render(<AdminDashboardPage />)
    await waitFor(() => {
      expect(screen.getByText('Topics')).toBeInTheDocument()
    })
    expect(screen.getByText('Replies')).toBeInTheDocument()
    // "Users" appears in both sidebar and stat card
    expect(screen.getAllByText('Users').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Pending Reports')).toBeInTheDocument()
  })

  it('renders recent activity stats', async () => {
    render(<AdminDashboardPage />)
    await waitFor(() => {
      expect(screen.getByText(/8 new/i)).toBeInTheDocument()
    })
  })

  it('renders loading state', () => {
    render(<AdminDashboardPage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminDashboardPage />)
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument()
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
