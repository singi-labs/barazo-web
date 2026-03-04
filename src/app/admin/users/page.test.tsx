/**
 * Tests for admin user management page (P3 placeholder).
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

describe('AdminUsersPage', () => {
  it('renders user management heading', () => {
    render(<AdminUsersPage />)
    expect(screen.getByRole('heading', { name: /user management/i })).toBeInTheDocument()
  })

  it('shows coming in P3 message', () => {
    render(<AdminUsersPage />)
    expect(screen.getByRole('heading', { name: /coming in p3/i })).toBeInTheDocument()
    expect(screen.getByText(/planned for the p3\.2 milestone/i)).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminUsersPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
