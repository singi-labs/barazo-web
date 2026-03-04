/**
 * Tests for page not found component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import PageNotFound from './not-found'

vi.mock('next/navigation', () => ({
  usePathname: () => '/p/nonexistent',
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
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

describe('PageNotFound', () => {
  it('renders not found heading', () => {
    render(<PageNotFound />)
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
  })

  it('renders helpful message', () => {
    render(<PageNotFound />)
    expect(
      screen.getByText(/the page you are looking for does not exist or has been removed/i)
    ).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<PageNotFound />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
