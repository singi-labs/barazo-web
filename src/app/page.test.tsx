import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock API client
vi.mock('@/lib/api/client', () => ({
  getCategories: vi.fn(),
  getTopics: vi.fn(),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock next/link
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

import { getCategories, getTopics } from '@/lib/api/client'
import { mockCategories, mockTopics } from '@/mocks/data'
import HomePage from './page'

const mockGetCategories = vi.mocked(getCategories)
const mockGetTopics = vi.mocked(getTopics)

beforeEach(() => {
  mockGetCategories.mockResolvedValue({ categories: mockCategories })
  mockGetTopics.mockResolvedValue({ topics: mockTopics, cursor: null })
})

describe('HomePage', () => {
  it('renders page heading', async () => {
    const page = await HomePage()
    render(page)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders recent topics', async () => {
    const page = await HomePage()
    render(page)
    expect(screen.getByText('Welcome to Barazo Forums')).toBeInTheDocument()
  })

  it('renders category navigation', async () => {
    const page = await HomePage()
    render(page)
    const navs = screen.getAllByRole('navigation', { name: /categories/i })
    expect(navs.length).toBeGreaterThan(0)
  })

  it('renders category links', async () => {
    const page = await HomePage()
    render(page)
    const generalLinks = screen.getAllByRole('link', { name: 'General Discussion' })
    expect(generalLinks.length).toBeGreaterThan(0)
    const devLinks = screen.getAllByRole('link', { name: 'Development' })
    expect(devLinks.length).toBeGreaterThan(0)
  })

  it('renders JSON-LD structured data', async () => {
    const page = await HomePage()
    const { container } = render(page)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).toBeInTheDocument()
    const jsonLd = JSON.parse(script!.textContent!)
    expect(jsonLd['@type']).toBe('WebSite')
  })
})
