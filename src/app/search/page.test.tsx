/**
 * Tests for search results page.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import { axe } from 'vitest-axe'
import SearchPage from './page'

// Mock next/navigation
const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
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

// Mock API client
vi.mock('@/lib/api/client', () => ({
  searchContent: vi.fn(),
  getPublicSettings: vi.fn().mockResolvedValue({
    communityDid: 'did:plc:test-community-123',
    communityName: 'Test Community',
    maturityRating: 'safe',
    communityDescription: null,
    communityLogoUrl: null,
  }),
}))

import { searchContent } from '@/lib/api/client'

const mockSearchContent = vi.mocked(searchContent)

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
    // Reset search params to empty
    mockSearchParams.delete('q')
  })

  it('renders search heading', () => {
    render(<SearchPage />)
    expect(screen.getByRole('heading', { level: 1, name: /search/i })).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<SearchPage />)
    const comboboxes = screen.getAllByRole('combobox')
    // One in header, one on search page
    expect(comboboxes.length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state when no query', () => {
    render(<SearchPage />)
    expect(screen.getByText(/enter a search term/i)).toBeInTheDocument()
  })

  it('displays results from API', async () => {
    mockSearchParams.set('q', 'barazo')
    mockSearchContent.mockResolvedValue({
      results: [
        {
          type: 'topic',
          uri: 'at://did:plc:user/forum.barazo.topic.post/abc',
          rkey: 'abc',
          authorDid: 'did:plc:user',
          authorHandle: 'jay.bsky.team',
          title: 'Welcome to Barazo',
          content: 'First topic on barazo forums.',
          category: 'general',
          communityDid: 'did:plc:community',
          replyCount: 5,
          reactionCount: 12,
          publishedAt: '2026-02-14T00:00:00Z',
          rank: 0.95,
          rootUri: null,
          rootTitle: null,
        },
      ],
      cursor: null,
      total: 1,
      searchMode: 'fulltext',
    })

    render(<SearchPage />)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100))
    })

    expect(await screen.findByText('Welcome to Barazo')).toBeInTheDocument()
    expect(screen.getByText(/1 result/i)).toBeInTheDocument()
  })

  it('shows no results message', async () => {
    mockSearchParams.set('q', 'nonexistent')
    mockSearchContent.mockResolvedValue({
      results: [],
      cursor: null,
      total: 0,
      searchMode: 'fulltext',
    })

    render(<SearchPage />)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100))
    })

    expect(await screen.findByText(/no results found/i)).toBeInTheDocument()
  })

  it('displays reply results with root topic reference', async () => {
    mockSearchParams.set('q', 'reply')
    mockSearchContent.mockResolvedValue({
      results: [
        {
          type: 'reply',
          uri: 'at://did:plc:user/forum.barazo.reply.post/xyz',
          rkey: 'xyz',
          authorDid: 'did:plc:user',
          authorHandle: 'jay.bsky.team',
          title: null,
          content: 'This is a reply about the topic.',
          category: null,
          communityDid: 'did:plc:community',
          replyCount: null,
          reactionCount: 4,
          publishedAt: '2026-02-14T00:00:00Z',
          rank: 0.8,
          rootUri: 'at://did:plc:user/forum.barazo.topic.post/abc',
          rootTitle: 'Original Topic',
        },
      ],
      cursor: null,
      total: 1,
      searchMode: 'fulltext',
    })

    render(<SearchPage />)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100))
    })

    expect(await screen.findByText(/original topic/i)).toBeInTheDocument()
    // Verify the result type badge shows "reply"
    expect(screen.getByText('reply')).toBeInTheDocument()
  })

  it('renders breadcrumbs', () => {
    render(<SearchPage />)
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(nav).toBeInTheDocument()
  })

  it('passes axe accessibility check', async () => {
    const { container } = render(<SearchPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
