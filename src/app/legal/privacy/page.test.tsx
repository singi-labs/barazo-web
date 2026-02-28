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

  it('describes authentication cookie instead of generic session data', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByText(/Authentication cookie/i)).toBeInTheDocument()
    expect(screen.getByText(/HTTP-only, Secure, SameSite=Strict/i)).toBeInTheDocument()
  })

  it('lists age declaration and per-community preferences', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByText(/Age declaration/i)).toBeInTheDocument()
    expect(screen.getByText(/Per-community preferences/i)).toBeInTheDocument()
  })

  it('describes what data is not collected', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: /what we do not collect/i })).toBeInTheDocument()
    expect(screen.getByText(/device fingerprinting/i)).toBeInTheDocument()
  })

  it('describes anonymize-on-deletion approach', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: /data retention and deletion/i })).toBeInTheDocument()
    expect(screen.getByText(/deleted by author/i)).toBeInTheDocument()
    expect(screen.getByText(/personal data.*is stripped/i)).toBeInTheDocument()
    expect(screen.getByText(/anonymized content.*may be retained/i)).toBeInTheDocument()
  })

  it('describes AI features', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: /ai features/i })).toBeInTheDocument()
    expect(screen.getByText(/No training on your content/i)).toBeInTheDocument()
    expect(screen.getByText(/Local-first processing/i)).toBeInTheDocument()
    expect(screen.getByText(/Anonymized summaries/i)).toBeInTheDocument()
  })

  it('lists user rights under GDPR', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: /your rights/i })).toBeInTheDocument()
    expect(screen.getByText(/right to be forgotten/i)).toBeInTheDocument()
  })

  it('links to barazo-workspace for issue tracking', () => {
    render(<PrivacyPolicyPage />)
    const link = screen.getByRole('link', { name: /github issue tracker/i })
    expect(link).toHaveAttribute('href', 'https://github.com/barazo-forum/barazo-workspace/issues')
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
