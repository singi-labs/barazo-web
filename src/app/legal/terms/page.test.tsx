/**
 * Tests for terms of service page.
 * @see decisions/legal.md
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import TermsOfServicePage from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/legal/terms',
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

describe('TermsOfServicePage', () => {
  it('renders page heading', async () => {
    const page = await TermsOfServicePage()
    render(page)
    expect(screen.getByRole('heading', { name: /terms of service/i, level: 1 })).toBeInTheDocument()
  })

  it('states minimum age requirement', async () => {
    const page = await TermsOfServicePage()
    render(page)
    expect(screen.getByText(/at least 16 years old/i)).toBeInTheDocument()
  })

  it('covers content and conduct rules', async () => {
    const page = await TermsOfServicePage()
    render(page)
    expect(screen.getByRole('heading', { name: /content and conduct/i })).toBeInTheDocument()
  })

  it('discloses AI summary behavior', async () => {
    const page = await TermsOfServicePage()
    render(page)
    expect(screen.getByRole('heading', { name: /ai-generated summaries/i })).toBeInTheDocument()
    expect(screen.getByText(/summaries may persist/i)).toBeInTheDocument()
  })

  it('discloses moderation labels', async () => {
    const page = await TermsOfServicePage()
    render(page)
    expect(screen.getByRole('heading', { name: /moderation and labels/i })).toBeInTheDocument()
  })

  it('specifies governing law', async () => {
    const page = await TermsOfServicePage()
    render(page)
    expect(screen.getByText(/laws of the Netherlands/i)).toBeInTheDocument()
  })

  it('renders breadcrumbs', async () => {
    const page = await TermsOfServicePage()
    render(page)
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const page = await TermsOfServicePage()
    const { container } = render(page)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
