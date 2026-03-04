/**
 * Tests for public page rendering.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import PublicPage from './page'

vi.mock('next/navigation', () => ({
  usePathname: () => '/p/about',
  useRouter: () => ({ push: vi.fn() }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
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

describe('PublicPage', () => {
  it('renders page title as heading', async () => {
    const page = await PublicPage({
      params: Promise.resolve({ slug: 'about' }),
    })
    render(page)
    expect(
      screen.getByRole('heading', { name: /about this community/i, level: 1 })
    ).toBeInTheDocument()
  })

  it('renders page content as markdown', async () => {
    const page = await PublicPage({
      params: Promise.resolve({ slug: 'about' }),
    })
    render(page)
    // The markdown content "# About\n\nWelcome to our community forum." should render
    expect(screen.getByText(/welcome to our community forum/i)).toBeInTheDocument()
  })

  it('renders breadcrumbs with Home and page title', async () => {
    const page = await PublicPage({
      params: Promise.resolve({ slug: 'about' }),
    })
    render(page)
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(nav).toHaveTextContent('Home')
  })

  it('renders JSON-LD structured data with absolute URL', async () => {
    const page = await PublicPage({
      params: Promise.resolve({ slug: 'about' }),
    })
    const { container } = render(page)
    const jsonLdScript = container.querySelector('script[type="application/ld+json"]')
    expect(jsonLdScript).not.toBeNull()
    const jsonLd = JSON.parse(jsonLdScript!.textContent ?? '{}')
    expect(jsonLd['@type']).toBe('WebPage')
    expect(jsonLd.name).toBe('About This Community')
    expect(jsonLd.url).toBe('https://barazo.forum/p/about')
  })

  it('calls notFound for non-existent page', async () => {
    const { notFound } = await import('next/navigation')
    await expect(
      PublicPage({
        params: Promise.resolve({ slug: 'nonexistent' }),
      })
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('passes axe accessibility check', async () => {
    const page = await PublicPage({
      params: Promise.resolve({ slug: 'about' }),
    })
    const { container } = render(page)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
