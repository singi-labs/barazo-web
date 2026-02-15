/**
 * Tests for privacy policy page.
 * @see decisions/legal.md
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import PrivacyPolicyPage from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/legal/privacy',
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

describe('PrivacyPolicyPage', () => {
  it('renders page heading', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: /privacy policy/i, level: 1 })).toBeInTheDocument()
  })

  it('describes what data is collected', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: /what we collect/i })).toBeInTheDocument()
    expect(screen.getByText(/AT Protocol identifiers/i)).toBeInTheDocument()
  })

  it('describes what data is not collected', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: /what we do not collect/i })).toBeInTheDocument()
  })

  it('lists user rights under GDPR', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: /your rights/i })).toBeInTheDocument()
    expect(screen.getByText(/right to be forgotten/i)).toBeInTheDocument()
  })

  it('mentions GDPR compliance', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByText(/General Data Protection Regulation/i)).toBeInTheDocument()
  })

  it('renders breadcrumbs', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<PrivacyPolicyPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
