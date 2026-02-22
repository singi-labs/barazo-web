/**
 * Tests for admin user management page.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { axe } from 'vitest-axe'
import AdminUsersPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/users',
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

describe('AdminUsersPage', () => {
  it('renders user management heading', () => {
    render(<AdminUsersPage />)
    expect(screen.getByRole('heading', { name: /user management/i })).toBeInTheDocument()
  })

  it('renders user list from API', async () => {
    render(<AdminUsersPage />)
    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument()
    })
    expect(screen.getByText('Bob Moderator')).toBeInTheDocument()
    expect(screen.getByText('Carol Member')).toBeInTheDocument()
  })

  it('shows user roles', async () => {
    render(<AdminUsersPage />)
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })
    expect(screen.getByText('moderator')).toBeInTheDocument()
  })

  it('shows banned status', async () => {
    render(<AdminUsersPage />)
    await waitFor(() => {
      expect(screen.getByText('Eve Banned')).toBeInTheDocument()
    })
    // Eve should show as banned
    expect(screen.getByText('Banned')).toBeInTheDocument()
  })

  it('shows cross-community ban warning', async () => {
    render(<AdminUsersPage />)
    await waitFor(() => {
      expect(screen.getByText(/banned from 2 other communities/i)).toBeInTheDocument()
    })
  })

  it('shows ban/unban buttons', async () => {
    render(<AdminUsersPage />)
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /ban/i }).length).toBeGreaterThan(0)
    })
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminUsersPage />)
    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument()
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
