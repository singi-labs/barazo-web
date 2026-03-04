/**
 * Tests for admin plugins page (P3 placeholder).
 * @see specs/prd-web.md Section M13
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import AdminPluginsPage from './page'

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/plugins',
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

describe('AdminPluginsPage', () => {
  it('renders page heading', () => {
    render(<AdminPluginsPage />)
    expect(screen.getByRole('heading', { name: /plugins/i, level: 1 })).toBeInTheDocument()
  })

  it('shows coming in P3 message', () => {
    render(<AdminPluginsPage />)
    expect(screen.getByRole('heading', { name: /coming in p3/i })).toBeInTheDocument()
    expect(screen.getByText(/planned for the p3\.2 milestone/i)).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AdminPluginsPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
