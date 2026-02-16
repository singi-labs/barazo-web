/**
 * Tests for user profile page.
 * The page fetches profile data via getUserProfile() (MSW-intercepted).
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
  it('renders user display name in heading', async () => {
    render(<UserProfilePage params={{ handle: 'alice.bsky.social' }} />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /alice/i })).toBeInTheDocument()
    })
  })

  it('renders breadcrumbs', async () => {
    render(<UserProfilePage params={{ handle: 'alice.bsky.social' }} />)
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument()
    })
    const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(breadcrumb).toBeInTheDocument()
  })

  it('renders profile sections', async () => {
    render(<UserProfilePage params={{ handle: 'alice.bsky.social' }} />)
    await waitFor(() => {
      expect(screen.getByText(/recent activity/i)).toBeInTheDocument()
    })
  })

  it('renders user bio when available', async () => {
    render(<UserProfilePage params={{ handle: 'alice.bsky.social' }} />)
    await waitFor(() => {
      expect(screen.getByText(/community admin and at protocol enthusiast/i)).toBeInTheDocument()
    })
  })

  it('renders post count from activity data', async () => {
    render(<UserProfilePage params={{ handle: 'alice.bsky.social' }} />)
    // alice has topicCount 15 + replyCount 42 = 57 posts
    await waitFor(() => {
      expect(screen.getByText(/57 posts/i)).toBeInTheDocument()
    })
  })

  it('shows error for unknown handle', async () => {
    render(<UserProfilePage params={{ handle: 'unknown.user.social' }} />)
    await waitFor(() => {
      expect(screen.getByText(/api 404/i)).toBeInTheDocument()
    })
  })
})
