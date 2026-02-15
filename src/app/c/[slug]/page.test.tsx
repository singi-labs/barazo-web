import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock API client
vi.mock('@/lib/api/client', () => ({
  getCategoryBySlug: vi.fn(),
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

import { getCategoryBySlug, getCategories, getTopics } from '@/lib/api/client'
import { mockCategories, mockCategoryWithTopicCount, mockTopics } from '@/mocks/data'
import CategoryPage from './page'

const mockGetCategoryBySlug = vi.mocked(getCategoryBySlug)
const mockGetCategories = vi.mocked(getCategories)
const mockGetTopics = vi.mocked(getTopics)

beforeEach(() => {
  mockGetCategoryBySlug.mockResolvedValue(mockCategoryWithTopicCount)
  mockGetCategories.mockResolvedValue({ categories: mockCategories })
  mockGetTopics.mockResolvedValue({
    topics: mockTopics.filter((t) => t.category === 'general'),
    cursor: null,
  })
})

const params = Promise.resolve({ slug: 'general' })

describe('CategoryPage', () => {
  it('renders category name as heading', async () => {
    const page = await CategoryPage({ params })
    render(page)
    expect(
      screen.getByRole('heading', { level: 1, name: mockCategoryWithTopicCount.name })
    ).toBeInTheDocument()
  })

  it('renders category description', async () => {
    const page = await CategoryPage({ params })
    render(page)
    expect(screen.getByText(mockCategoryWithTopicCount.description!)).toBeInTheDocument()
  })

  it('renders breadcrumbs', async () => {
    const page = await CategoryPage({ params })
    render(page)
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument()
  })

  it('renders topic list for category', async () => {
    const page = await CategoryPage({ params })
    render(page)
    const articles = screen.getAllByRole('article')
    expect(articles.length).toBeGreaterThan(0)
  })

  it('renders topic count', async () => {
    const page = await CategoryPage({ params })
    render(page)
    expect(screen.getByText(`${mockCategoryWithTopicCount.topicCount} topics`)).toBeInTheDocument()
  })

  it('includes JSON-LD BreadcrumbList', async () => {
    const page = await CategoryPage({ params })
    const { container } = render(page)
    const scripts = container.querySelectorAll('script[type="application/ld+json"]')
    const breadcrumbScript = Array.from(scripts).find((s) => {
      const data = JSON.parse(s.textContent!)
      return data['@type'] === 'BreadcrumbList'
    })
    expect(breadcrumbScript).toBeTruthy()
  })
})
