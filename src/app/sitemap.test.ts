/**
 * Tests for sitemap generation.
 * @see specs/prd-web.md Section 5 (Sitemaps)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the API client before importing sitemap
vi.mock('@/lib/api/client', () => ({
  getCategories: vi.fn(),
  getTopics: vi.fn(),
}))

import sitemap from './sitemap'
import { getCategories, getTopics } from '@/lib/api/client'

const mockGetCategories = vi.mocked(getCategories)
const mockGetTopics = vi.mocked(getTopics)

beforeEach(() => {
  vi.clearAllMocks()

  mockGetCategories.mockResolvedValue({
    categories: [
      {
        id: '1',
        slug: 'general',
        name: 'General',
        description: null,
        parentId: null,
        sortOrder: 0,
        communityDid: 'did:plc:test',
        maturityRating: 'safe' as const,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-06-01T00:00:00Z',
        children: [
          {
            id: '2',
            slug: 'introductions',
            name: 'Introductions',
            description: null,
            parentId: '1',
            sortOrder: 0,
            communityDid: 'did:plc:test',
            maturityRating: 'safe' as const,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-05-01T00:00:00Z',
            children: [],
          },
        ],
      },
    ],
  })

  mockGetTopics.mockResolvedValue({
    topics: [
      {
        uri: 'at://did:plc:test/forum.barazo.topic/abc123',
        rkey: 'abc123',
        authorDid: 'did:plc:author1',
        title: 'Hello World',
        content: 'First post',
        contentFormat: null,
        category: 'general',
        tags: null,
        communityDid: 'did:plc:test',
        cid: 'bafyabc',
        replyCount: 5,
        reactionCount: 3,
        isAuthorDeleted: false,
        isModDeleted: false,
        categoryMaturityRating: 'safe' as const,
        lastActivityAt: '2025-06-15T12:00:00Z',
        createdAt: '2025-06-01T00:00:00Z',
        indexedAt: '2025-06-01T00:00:00Z',
      },
      {
        uri: 'at://did:plc:test/forum.barazo.topic/def456',
        rkey: 'def456',
        authorDid: 'did:plc:author2',
        title: 'Second Topic',
        content: 'Another post',
        contentFormat: null,
        category: 'general',
        tags: null,
        communityDid: 'did:plc:test',
        cid: 'bafydef',
        replyCount: 0,
        reactionCount: 1,
        isAuthorDeleted: false,
        isModDeleted: false,
        categoryMaturityRating: 'safe' as const,
        lastActivityAt: '2025-06-10T08:00:00Z',
        createdAt: '2025-06-10T00:00:00Z',
        indexedAt: '2025-06-10T00:00:00Z',
      },
    ],
    cursor: null,
  })
})

describe('sitemap', () => {
  it('includes the homepage', async () => {
    const result = await sitemap()
    const urls = result.map((entry) => entry.url)
    expect(urls).toContain('https://barazo.forum')
  })

  it('includes category pages', async () => {
    const result = await sitemap()
    const urls = result.map((entry) => entry.url)
    expect(urls).toContain('https://barazo.forum/c/general')
    expect(urls).toContain('https://barazo.forum/c/introductions')
  })

  it('includes topic pages with author handle and rkey', async () => {
    const result = await sitemap()
    const urls = result.map((entry) => entry.url)
    expect(urls).toContain('https://barazo.forum/did:plc:author1/abc123')
    expect(urls).toContain('https://barazo.forum/did:plc:author2/def456')
  })

  it('sets lastModified for topics', async () => {
    const result = await sitemap()
    const topicEntry = result.find((entry) => entry.url.includes('/did:plc:author1/abc123'))
    expect(topicEntry?.lastModified).toBeDefined()
  })

  it('sets appropriate changeFrequency', async () => {
    const result = await sitemap()
    const homeEntry = result.find((entry) => entry.url === 'https://barazo.forum')
    expect(homeEntry?.changeFrequency).toBe('hourly')

    const categoryEntry = result.find((entry) => entry.url.includes('/c/general'))
    expect(categoryEntry?.changeFrequency).toBe('daily')

    const topicEntry = result.find((entry) => entry.url.includes('/did:plc:author1/abc123'))
    expect(topicEntry?.changeFrequency).toBe('weekly')
  })

  it('sets priority values', async () => {
    const result = await sitemap()
    const homeEntry = result.find((entry) => entry.url === 'https://barazo.forum')
    expect(homeEntry?.priority).toBe(1.0)

    const categoryEntry = result.find((entry) => entry.url.includes('/c/general'))
    expect(categoryEntry?.priority).toBe(0.8)

    const topicEntry = result.find((entry) => entry.url.includes('/did:plc:author1/abc123'))
    expect(topicEntry?.priority).toBe(0.6)
  })

  it('flattens nested category children', async () => {
    const result = await sitemap()
    const urls = result.map((entry) => entry.url)
    // Both parent and child categories should be included
    expect(urls).toContain('https://barazo.forum/c/general')
    expect(urls).toContain('https://barazo.forum/c/introductions')
  })

  it('handles API errors gracefully', async () => {
    mockGetCategories.mockRejectedValue(new Error('API down'))
    mockGetTopics.mockRejectedValue(new Error('API down'))

    const result = await sitemap()
    // Should still return at least the homepage
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0]!.url).toBe('https://barazo.forum')
  })

  it('excludes adult-rated categories from sitemap', async () => {
    mockGetCategories.mockResolvedValue({
      categories: [
        {
          id: '1',
          slug: 'general',
          name: 'General',
          description: null,
          parentId: null,
          sortOrder: 0,
          communityDid: 'did:plc:test',
          maturityRating: 'safe' as const,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-06-01T00:00:00Z',
          children: [],
        },
        {
          id: '3',
          slug: 'adult-zone',
          name: 'Adult Zone',
          description: null,
          parentId: null,
          sortOrder: 1,
          communityDid: 'did:plc:test',
          maturityRating: 'adult' as const,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-06-01T00:00:00Z',
          children: [],
        },
      ],
    })

    const result = await sitemap()
    const urls = result.map((entry) => entry.url)
    expect(urls).toContain('https://barazo.forum/c/general')
    expect(urls).not.toContain('https://barazo.forum/c/adult-zone')
  })

  it('excludes topics with adult categoryMaturityRating from sitemap', async () => {
    mockGetTopics.mockResolvedValue({
      topics: [
        {
          uri: 'at://did:plc:test/forum.barazo.topic/safe1',
          rkey: 'safe1',
          authorDid: 'did:plc:author1',
          title: 'Safe Topic',
          content: 'Safe content',
          contentFormat: null,
          category: 'general',
          tags: null,
          communityDid: 'did:plc:test',
          cid: 'bafysafe',
          replyCount: 0,
          reactionCount: 0,
          isAuthorDeleted: false,
          isModDeleted: false,
          categoryMaturityRating: 'safe' as const,
          lastActivityAt: '2025-06-15T12:00:00Z',
          createdAt: '2025-06-01T00:00:00Z',
          indexedAt: '2025-06-01T00:00:00Z',
        },
        {
          uri: 'at://did:plc:test/forum.barazo.topic/adult1',
          rkey: 'adult1',
          authorDid: 'did:plc:author2',
          title: 'Adult Topic',
          content: 'Adult content',
          contentFormat: null,
          category: 'adult-zone',
          tags: null,
          communityDid: 'did:plc:test',
          cid: 'bafyadult',
          replyCount: 0,
          reactionCount: 0,
          isAuthorDeleted: false,
          isModDeleted: false,
          categoryMaturityRating: 'adult' as const,
          lastActivityAt: '2025-06-10T08:00:00Z',
          createdAt: '2025-06-10T00:00:00Z',
          indexedAt: '2025-06-10T00:00:00Z',
        },
      ],
      cursor: null,
    })

    const result = await sitemap()
    const urls = result.map((entry) => entry.url)
    expect(urls).toContain('https://barazo.forum/did:plc:author1/safe1')
    expect(urls).not.toContain('https://barazo.forum/did:plc:author2/adult1')
  })

  it('includes mature-rated categories in sitemap', async () => {
    mockGetCategories.mockResolvedValue({
      categories: [
        {
          id: '1',
          slug: 'mature-zone',
          name: 'Mature Zone',
          description: null,
          parentId: null,
          sortOrder: 0,
          communityDid: 'did:plc:test',
          maturityRating: 'mature' as const,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-06-01T00:00:00Z',
          children: [],
        },
      ],
    })

    const result = await sitemap()
    const urls = result.map((entry) => entry.url)
    expect(urls).toContain('https://barazo.forum/c/mature-zone')
  })
})
