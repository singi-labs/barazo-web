/**
 * Tests for topic detail page.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TopicPage from './page'
import { mockTopics, mockReplies, mockCategories } from '@/mocks/data'
import { createMockOnboardingContext } from '@/test/mock-onboarding'

vi.mock('@/context/onboarding-context', () => ({
  useOnboardingContext: () => createMockOnboardingContext(),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

vi.mock('@/lib/api/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api/client')>()),
  getReactions: vi.fn().mockResolvedValue({ reactions: [], cursor: null }),
  createReaction: vi.fn().mockResolvedValue({ uri: 'at://test', cid: 'bafyrei-test' }),
  deleteReaction: vi.fn().mockResolvedValue(undefined),
}))

// Mock useAuth hook
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    crossPostScopesGranted: false,
    getAccessToken: () => null,
    login: vi.fn(),
    logout: vi.fn(),
    setSessionFromCallback: vi.fn(),
    requestCrossPostAuth: vi.fn(),
    authFetch: vi.fn(),
  }),
}))

// Mock useToast (required by ReplyCard)
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn(), dismiss: vi.fn() }),
}))

// Mock notFound
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

const topic = mockTopics[0]!

describe('TopicPage', () => {
  const defaultParams = Promise.resolve({ slug: 'welcome-to-barazo-forums', rkey: topic.rkey })
  const defaultSearchParams = Promise.resolve({})

  it('renders topic title as h2', async () => {
    const Page = await TopicPage({ params: defaultParams, searchParams: defaultSearchParams })
    render(Page)
    expect(screen.getByRole('heading', { level: 2, name: topic.title })).toBeInTheDocument()
  })

  it('renders topic content', async () => {
    const Page = await TopicPage({ params: defaultParams, searchParams: defaultSearchParams })
    render(Page)
    expect(screen.getByText(topic.content)).toBeInTheDocument()
  })

  it('renders replies', async () => {
    const Page = await TopicPage({ params: defaultParams, searchParams: defaultSearchParams })
    render(Page)
    for (const reply of mockReplies) {
      expect(screen.getByText(reply.content)).toBeInTheDocument()
    }
  })

  it('renders breadcrumbs', async () => {
    const Page = await TopicPage({ params: defaultParams, searchParams: defaultSearchParams })
    render(Page)
    expect(screen.getByText('Home')).toBeInTheDocument()
    // Category should appear in breadcrumbs
    const categoryName = mockCategories.find((c) => c.slug === topic.category)?.name
    if (categoryName) {
      expect(screen.getAllByText(categoryName).length).toBeGreaterThan(0)
    }
  })

  it('renders JSON-LD DiscussionForumPosting', async () => {
    const Page = await TopicPage({ params: defaultParams, searchParams: defaultSearchParams })
    const { container } = render(Page)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).toBeInTheDocument()
    const jsonLd = JSON.parse(script!.innerHTML)
    expect(jsonLd['@type']).toBe('DiscussionForumPosting')
    expect(jsonLd.headline).toBe(topic.title)
  })

  it('handles topic not found', async () => {
    const params = Promise.resolve({ slug: 'nonexistent', rkey: 'notreal' })
    await expect(TopicPage({ params, searchParams: defaultSearchParams })).rejects.toThrow(
      'NEXT_NOT_FOUND'
    )
  })
})
