/**
 * Tests for user profile page.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import UserProfilePage from './page'

// Mock useAuth hook
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    getAccessToken: () => null,
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    authFetch: vi.fn(),
  }),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  redirect: vi.fn(),
}))

describe('UserProfilePage', () => {
  it('renders user handle in heading', () => {
    render(<UserProfilePage params={{ handle: 'alice.bsky.social' }} />)
    expect(screen.getByRole('heading', { name: /alice\.bsky\.social/i })).toBeInTheDocument()
  })

  it('renders breadcrumbs', () => {
    render(<UserProfilePage params={{ handle: 'alice.bsky.social' }} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    // Handle appears in both breadcrumbs and heading; check breadcrumb specifically
    const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(breadcrumb).toBeInTheDocument()
  })

  it('renders profile sections', () => {
    render(<UserProfilePage params={{ handle: 'alice.bsky.social' }} />)
    expect(screen.getByText(/recent activity/i)).toBeInTheDocument()
  })

  it('shows cross-community ban warning when user is banned elsewhere', () => {
    render(<UserProfilePage params={{ handle: 'dave.bsky.social' }} />)
    expect(screen.getByText(/banned from.*other communit/i)).toBeInTheDocument()
  })

  it('does not show ban warning for users with no cross-community bans', () => {
    render(<UserProfilePage params={{ handle: 'alice.bsky.social' }} />)
    expect(screen.queryByText(/banned from.*other communit/i)).not.toBeInTheDocument()
  })
})
