/**
 * Tests for UserMenu component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserMenu } from '@/components/auth/user-menu'
import {
  createMockAuthContext,
  createUnauthenticatedMockAuthContext,
  mockUser,
} from '@/test/mock-auth'

const mockUseAuth = vi.fn()

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
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

describe('UserMenu', () => {
  it('shows login link when not authenticated', () => {
    mockUseAuth.mockReturnValue(createUnauthenticatedMockAuthContext())

    render(<UserMenu />)
    const link = screen.getByRole('link', { name: /log in/i })
    expect(link).toHaveAttribute('href', '/login')
  })

  it('shows loading skeleton when auth is loading', () => {
    mockUseAuth.mockReturnValue(
      createMockAuthContext({ isLoading: true, user: null, isAuthenticated: false })
    )

    render(<UserMenu />)
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows user menu button when authenticated', () => {
    mockUseAuth.mockReturnValue(createMockAuthContext())

    render(<UserMenu />)
    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
  })

  it('opens dropdown on click', async () => {
    mockUseAuth.mockReturnValue(createMockAuthContext())
    const user = userEvent.setup()

    render(<UserMenu />)
    await user.click(screen.getByRole('button', { name: /user menu/i }))

    await waitFor(() => {
      expect(screen.getByText(`@${mockUser.handle}`)).toBeInTheDocument()
    })
  })

  it('shows display name and handle in dropdown', async () => {
    mockUseAuth.mockReturnValue(createMockAuthContext())
    const user = userEvent.setup()

    render(<UserMenu />)
    await user.click(screen.getByRole('button', { name: /user menu/i }))

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('@alice.bsky.social')).toBeInTheDocument()
    })
  })

  it('has profile link in dropdown', async () => {
    mockUseAuth.mockReturnValue(createMockAuthContext())
    const user = userEvent.setup()

    render(<UserMenu />)
    await user.click(screen.getByRole('button', { name: /user menu/i }))

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument()
    })
  })

  it('has account settings link in dropdown', async () => {
    mockUseAuth.mockReturnValue(createMockAuthContext())
    const user = userEvent.setup()

    render(<UserMenu />)
    await user.click(screen.getByRole('button', { name: /user menu/i }))

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /account settings/i })).toBeInTheDocument()
    })
  })

  it('shows admin panel link for admin users', async () => {
    mockUseAuth.mockReturnValue(createMockAuthContext({ user: { ...mockUser, role: 'admin' } }))
    const user = userEvent.setup()

    render(<UserMenu />)
    await user.click(screen.getByRole('button', { name: /user menu/i }))

    await waitFor(() => {
      const adminLink = screen.getByRole('menuitem', { name: /admin panel/i })
      expect(adminLink).toBeInTheDocument()
      expect(adminLink).toHaveAttribute('href', '/admin')
    })
  })

  it('hides admin panel link for non-admin users', async () => {
    mockUseAuth.mockReturnValue(createMockAuthContext())
    const user = userEvent.setup()

    render(<UserMenu />)
    await user.click(screen.getByRole('button', { name: /user menu/i }))

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /account settings/i })).toBeInTheDocument()
    })
    expect(screen.queryByRole('menuitem', { name: /admin panel/i })).not.toBeInTheDocument()
  })

  it('has logout option in dropdown', async () => {
    mockUseAuth.mockReturnValue(createMockAuthContext())
    const user = userEvent.setup()

    render(<UserMenu />)
    await user.click(screen.getByRole('button', { name: /user menu/i }))

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument()
    })
  })
})
