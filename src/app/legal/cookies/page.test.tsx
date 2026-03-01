/**
 * Tests for cookie policy page.
 * @see decisions/legal.md
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import CookiePolicyPage from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/legal/cookies',
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

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

describe('CookiePolicyPage', () => {
  it('renders page heading', async () => {
    const page = await CookiePolicyPage()
    render(page)
    expect(screen.getByRole('heading', { name: /cookie policy/i, level: 1 })).toBeInTheDocument()
  })

  it('describes the single essential cookie', async () => {
    const page = await CookiePolicyPage()
    render(page)
    expect(screen.getByRole('heading', { name: /cookies we use/i })).toBeInTheDocument()
    // Table shows the refresh token cookie details
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Refresh token')).toBeInTheDocument()
  })

  it('lists cookie security properties', async () => {
    const page = await CookiePolicyPage()
    render(page)
    expect(screen.getByText(/HTTP-only/i)).toBeInTheDocument()
    expect(screen.getByText(/SameSite=Strict/i)).toBeInTheDocument()
  })

  it('states no tracking cookies are used', async () => {
    const page = await CookiePolicyPage()
    render(page)
    expect(screen.getByRole('heading', { name: /what we do not use/i })).toBeInTheDocument()
    expect(screen.getByText(/no tracking or advertising cookies/i)).toBeInTheDocument()
  })

  it('explains cookie consent exemption', async () => {
    const page = await CookiePolicyPage()
    render(page)
    expect(screen.getByRole('heading', { name: /cookie consent/i })).toBeInTheDocument()
    expect(screen.getByText(/ePrivacy Directive/i)).toBeInTheDocument()
  })

  it('renders breadcrumbs', async () => {
    const page = await CookiePolicyPage()
    render(page)
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const page = await CookiePolicyPage()
    const { container } = render(page)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
