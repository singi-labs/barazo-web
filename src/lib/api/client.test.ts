import { describe, it, expect } from 'vitest'
import { getCategories, getCategoryBySlug, getTopics, ApiError } from './client'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { mockCategories } from '@/mocks/data'

const API_URL = ''

describe('API client', () => {
  describe('getCategories', () => {
    it('returns category tree', async () => {
      const result = await getCategories()
      expect(result.categories).toHaveLength(mockCategories.length)
      expect(result.categories[0]!.name).toBe('General Discussion')
    })

    it('includes nested children', async () => {
      const result = await getCategories()
      const dev = result.categories.find((c) => c.slug === 'development')
      expect(dev?.children).toHaveLength(2)
      expect(dev?.children[0]!.name).toBe('Frontend')
    })
  })

  describe('getCategoryBySlug', () => {
    it('returns a single category with topic count', async () => {
      const result = await getCategoryBySlug('general')
      expect(result.name).toBe('General Discussion')
      expect(result.topicCount).toBeGreaterThan(0)
    })

    it('throws ApiError for unknown slug', async () => {
      await expect(getCategoryBySlug('nonexistent')).rejects.toThrow(ApiError)
    })
  })

  describe('getTopics', () => {
    it('returns paginated topics', async () => {
      const result = await getTopics()
      expect(result.topics.length).toBeGreaterThan(0)
      expect(result.topics[0]).toHaveProperty('uri')
      expect(result.topics[0]).toHaveProperty('title')
    })

    it('filters by category', async () => {
      const result = await getTopics({ category: 'general' })
      for (const topic of result.topics) {
        expect(topic.category).toBe('general')
      }
    })

    it('respects limit parameter', async () => {
      const result = await getTopics({ limit: 2 })
      expect(result.topics.length).toBeLessThanOrEqual(2)
    })
  })

  describe('error handling', () => {
    it('throws ApiError on server error', async () => {
      server.use(
        http.get(`${API_URL}/api/categories`, () => {
          return HttpResponse.json({ error: 'Internal server error' }, { status: 500 })
        })
      )
      await expect(getCategories()).rejects.toThrow(ApiError)
    })

    it('includes status code in ApiError', async () => {
      server.use(
        http.get(`${API_URL}/api/categories`, () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 })
        })
      )
      try {
        await getCategories()
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).status).toBe(404)
      }
    })
  })
})
