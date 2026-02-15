/**
 * Tests for accessibility statement page.
 * @see specs/prd-web.md Section M14
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import AccessibilityPage from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/accessibility',
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

describe('AccessibilityPage', () => {
  it('renders page heading', () => {
    render(<AccessibilityPage />)
    expect(screen.getByRole('heading', { name: /accessibility/i, level: 1 })).toBeInTheDocument()
  })

  it('states WCAG 2.2 AA conformance target', () => {
    render(<AccessibilityPage />)
    expect(screen.getByText(/wcag.*2\.2/i)).toBeInTheDocument()
    expect(screen.getByText(/level aa/i)).toBeInTheDocument()
  })

  it('lists testing methods', () => {
    render(<AccessibilityPage />)
    expect(screen.getByText(/automated testing/i)).toBeInTheDocument()
    expect(screen.getByText(/keyboard navigation/i)).toBeInTheDocument()
    expect(screen.getByText(/screen reader/i)).toBeInTheDocument()
  })

  it('includes contact information', () => {
    render(<AccessibilityPage />)
    expect(screen.getByRole('heading', { name: /contact/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /github issue tracker/i })).toBeInTheDocument()
  })

  it('renders breadcrumbs', () => {
    render(<AccessibilityPage />)
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<AccessibilityPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
