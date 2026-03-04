/**
 * Tests for admin pages list page.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { axe } from 'vitest-axe'
import AdminPagesPage from './page'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/admin/pages',
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

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn(), dismiss: vi.fn() }),
}))

describe('AdminPagesPage', () => {
  it('renders pages heading', () => {
    render(<AdminPagesPage />)
    expect(screen.getByRole('heading', { name: /pages/i })).toBeInTheDocument()
  })

  it('renders add page button', () => {
    render(<AdminPagesPage />)
    expect(screen.getByRole('button', { name: /add page/i })).toBeInTheDocument()
  })

  it('renders pages from API', async () => {
    render(<AdminPagesPage />)
    await waitFor(() => {
      expect(screen.getByText('About This Community')).toBeInTheDocument()
    })
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
  })

  it('renders page status badges', async () => {
    render(<AdminPagesPage />)
    await waitFor(() => {
      expect(screen.getAllByText('Published').length).toBeGreaterThan(0)
    })
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('navigates to new page editor on add button click', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    render(<AdminPagesPage />)
    await user.click(screen.getByRole('button', { name: /add page/i }))
    expect(mockPush).toHaveBeenCalledWith('/admin/pages/new')
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminPagesPage />)
    await waitFor(() => {
      expect(screen.getByText('About This Community')).toBeInTheDocument()
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
