/**
 * Tests for admin community settings page.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { axe } from 'vitest-axe'
import AdminSettingsPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/settings',
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

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
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
  }),
}))

describe('AdminSettingsPage', () => {
  it('renders community settings heading', () => {
    render(<AdminSettingsPage />)
    expect(screen.getByRole('heading', { name: /community settings/i })).toBeInTheDocument()
  })

  it('renders community name input with value', async () => {
    render(<AdminSettingsPage />)
    await waitFor(() => {
      const input = screen.getByLabelText(/community name/i) as HTMLInputElement
      expect(input.value).toBe('Barazo Test Community')
    })
  })

  it('renders community description textarea', async () => {
    render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })
  })

  it('renders maturity rating select', async () => {
    render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByLabelText(/community maturity rating/i)).toBeInTheDocument()
    })
  })

  it('renders reaction set configuration', async () => {
    render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByLabelText(/reaction set/i)).toBeInTheDocument()
    })
  })

  it('renders save button', async () => {
    render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    })
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminSettingsPage />)
    await waitFor(() => {
      expect(screen.getByLabelText(/community name/i)).toBeInTheDocument()
    })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
