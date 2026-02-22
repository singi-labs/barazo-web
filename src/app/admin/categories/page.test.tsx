/**
 * Tests for admin categories page.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import AdminCategoriesPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/categories',
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

describe('AdminCategoriesPage', () => {
  it('renders categories heading', () => {
    render(<AdminCategoriesPage />)
    expect(screen.getByRole('heading', { name: /categories/i })).toBeInTheDocument()
  })

  it('renders categories from API', async () => {
    render(<AdminCategoriesPage />)
    await waitFor(() => {
      expect(screen.getByText('General Discussion')).toBeInTheDocument()
    })
    expect(screen.getByText('Development')).toBeInTheDocument()
    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('Backend')).toBeInTheDocument()
  })

  it('renders maturity rating for each category', async () => {
    render(<AdminCategoriesPage />)
    await waitFor(() => {
      expect(screen.getAllByText(/safe/i).length).toBeGreaterThan(0)
    })
  })

  it('renders add category button', () => {
    render(<AdminCategoriesPage />)
    expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument()
  })

  it('shows edit form when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<AdminCategoriesPage />)
    await waitFor(() => {
      expect(screen.getByText('General Discussion')).toBeInTheDocument()
    })
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0]!)
    expect(screen.getByLabelText(/category name/i)).toBeInTheDocument()
  })

  it('shows child categories indented', async () => {
    render(<AdminCategoriesPage />)
    await waitFor(() => {
      expect(screen.getByText('Frontend')).toBeInTheDocument()
    })
    // Frontend and Backend are children of Development
    const frontend = screen.getByText('Frontend')
    const container = frontend.closest('[data-depth]')
    expect(container).toHaveAttribute('data-depth', '1')
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminCategoriesPage />)
    await waitFor(() => {
      expect(screen.getByText('General Discussion')).toBeInTheDocument()
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
