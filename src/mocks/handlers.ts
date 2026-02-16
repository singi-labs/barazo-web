/**
 * MSW request handlers for API mocking during tests.
 * Tier 3: Hand-written handlers matching barazo-api response shapes.
 * @see plans/2026-02-09-mvp-implementation.md API Mock Strategy
 */

import { http, HttpResponse } from 'msw'
import {
  mockAuthSession,
  mockAuthUser,
  mockCategories,
  mockCategoryWithTopicCount,
  mockTopics,
  mockReplies,
  mockSearchResults,
  mockNotifications,
  mockCommunitySettings,
  mockCommunityStats,
  mockReports,
  mockFirstPostQueue,
  mockModerationLog,
  mockModerationThresholds,
  mockReportedUsers,
  mockAdminUsers,
  mockPlugins,
  mockUserPreferences,
  mockCommunityPreferences,
  mockOnboardingFields,
  mockMyReports,
} from './data'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

export const handlers = [
  // --- Auth endpoints ---

  // GET /api/auth/login
  http.get(`${API_URL}/api/auth/login`, ({ request }) => {
    const url = new URL(request.url)
    const handle = url.searchParams.get('handle')
    if (!handle) {
      return HttpResponse.json({ error: 'handle is required' }, { status: 400 })
    }
    return HttpResponse.json({
      redirectUrl: `https://bsky.social/oauth/authorize?handle=${encodeURIComponent(handle)}&state=mock-state-123`,
    })
  }),

  // GET /api/auth/callback
  http.get(`${API_URL}/api/auth/callback`, ({ request }) => {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    if (!code || !state) {
      return HttpResponse.json({ error: 'code and state are required' }, { status: 400 })
    }
    return HttpResponse.json(mockAuthSession)
  }),

  // POST /api/auth/refresh
  http.post(`${API_URL}/api/auth/refresh`, () => {
    // In tests, always succeed by default; override per-test for failure cases
    return HttpResponse.json(mockAuthSession)
  }),

  // DELETE /api/auth/session
  http.delete(`${API_URL}/api/auth/session`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /api/auth/me
  http.get(`${API_URL}/api/auth/me`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json(mockAuthUser)
  }),

  // GET /api/notifications
  http.get(`${API_URL}/api/notifications`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 20

    const limited = mockNotifications.slice(0, limit)
    const hasMore = mockNotifications.length > limit
    const unreadCount = mockNotifications.filter((n) => !n.read).length

    return HttpResponse.json({
      notifications: limited,
      cursor: hasMore ? 'mock-cursor-next' : null,
      unreadCount,
    })
  }),

  // PUT /api/notifications/read
  http.put(`${API_URL}/api/notifications/read`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return new HttpResponse(null, { status: 204 })
  }),

  // GET /api/categories
  http.get(`${API_URL}/api/categories`, () => {
    return HttpResponse.json({ categories: mockCategories })
  }),

  // GET /api/categories/:slug
  http.get(`${API_URL}/api/categories/:slug`, ({ params }) => {
    const slug = params['slug'] as string
    const findCategory = (
      nodes: typeof mockCategories
    ): (typeof mockCategories)[number] | undefined => {
      for (const node of nodes) {
        if (node.slug === slug) return node
        const found = findCategory(node.children)
        if (found) return found
      }
      return undefined
    }
    const category = findCategory(mockCategories)
    if (!category) {
      return HttpResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    return HttpResponse.json({ ...category, topicCount: mockCategoryWithTopicCount.topicCount })
  }),

  // GET /api/search
  http.get(`${API_URL}/api/search`, ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') ?? ''
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 20

    const filtered = q
      ? mockSearchResults.filter(
          (r) =>
            r.title?.toLowerCase().includes(q.toLowerCase()) ||
            r.content.toLowerCase().includes(q.toLowerCase())
        )
      : []

    const limited = filtered.slice(0, limit)
    const hasMore = filtered.length > limit

    return HttpResponse.json({
      results: limited,
      cursor: hasMore ? 'mock-cursor-next' : null,
      total: filtered.length,
      searchMode: 'fulltext' as const,
    })
  }),

  // GET /api/topics/by-rkey/:rkey (must be before :uri handler)
  http.get(`${API_URL}/api/topics/by-rkey/:rkey`, ({ params }) => {
    const rkey = params['rkey'] as string
    const topic = mockTopics.find((t) => t.rkey === rkey)
    if (!topic) {
      return HttpResponse.json({ error: 'Topic not found' }, { status: 404 })
    }
    return HttpResponse.json(topic)
  }),

  // GET /api/topics/:topicUri/replies
  http.get(`${API_URL}/api/topics/:topicUri/replies`, ({ request, params }) => {
    const topicUri = decodeURIComponent(params['topicUri'] as string)
    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 20

    const replies = mockReplies.filter((r) => r.rootUri === topicUri)
    const limited = replies.slice(0, limit)
    const hasMore = replies.length > limit

    return HttpResponse.json({
      replies: limited,
      cursor: hasMore ? 'mock-cursor-next' : null,
    })
  }),

  // GET /api/topics (list)
  http.get(`${API_URL}/api/topics`, ({ request }) => {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 20

    let topics = mockTopics
    if (category) {
      topics = topics.filter((t) => t.category === category)
    }

    const limited = topics.slice(0, limit)
    const hasMore = topics.length > limit

    return HttpResponse.json({
      topics: limited,
      cursor: hasMore ? 'mock-cursor-next' : null,
    })
  }),

  // POST /api/topics (create)
  http.post(`${API_URL}/api/topics`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as {
      title?: string
      content?: string
      category?: string
    }
    if (!body.title || !body.content || !body.category) {
      return HttpResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const rkey = `3kf${Date.now().toString(36)}`
    const now = new Date().toISOString()
    const newTopic = {
      uri: `at://did:plc:mock-user/forum.barazo.topic.post/${rkey}`,
      rkey,
      authorDid: 'did:plc:mock-user',
      title: body.title,
      content: body.content,
      contentFormat: null,
      category: body.category,
      tags: [],
      communityDid: 'did:plc:test-community-123',
      cid: `bafyreib-${rkey}`,
      replyCount: 0,
      reactionCount: 0,
      lastActivityAt: now,
      createdAt: now,
      indexedAt: now,
    }
    return HttpResponse.json(newTopic, { status: 201 })
  }),

  // PUT /api/topics/:rkey (update)
  http.put(`${API_URL}/api/topics/:rkey`, async ({ request, params }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rkey = params['rkey'] as string
    const topic = mockTopics.find((t) => t.rkey === rkey)
    if (!topic) {
      return HttpResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ ...topic, ...body })
  }),

  // GET /api/topics/:uri (single topic by AT URI)
  http.get(`${API_URL}/api/topics/:uri`, ({ params }) => {
    const uri = decodeURIComponent(params['uri'] as string)
    const topic = mockTopics.find((t) => t.uri === uri)
    if (!topic) {
      return HttpResponse.json({ error: 'Topic not found' }, { status: 404 })
    }
    return HttpResponse.json(topic)
  }),

  // --- Admin endpoints ---

  // GET /api/admin/settings
  http.get(`${API_URL}/api/admin/settings`, () => {
    return HttpResponse.json(mockCommunitySettings)
  }),

  // PUT /api/admin/settings
  http.put(`${API_URL}/api/admin/settings`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ ...mockCommunitySettings, ...body })
  }),

  // GET /api/admin/stats
  http.get(`${API_URL}/api/admin/stats`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json(mockCommunityStats)
  }),

  // POST /api/admin/categories
  http.post(`${API_URL}/api/admin/categories`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = (await request.json()) as Record<string, unknown>
    const newCategory = {
      id: `cat-${Date.now()}`,
      ...body,
      communityDid: 'did:plc:test-community-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      children: [],
    }
    return HttpResponse.json(newCategory, { status: 201 })
  }),

  // PUT /api/admin/categories/:id
  http.put(`${API_URL}/api/admin/categories/:id`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ ...mockCategories[0], ...body, children: [] })
  }),

  // DELETE /api/admin/categories/:id
  http.delete(`${API_URL}/api/admin/categories/:id`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /api/moderation/reports
  http.get(`${API_URL}/api/moderation/reports`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({
      reports: mockReports,
      cursor: null,
      total: mockReports.length,
    })
  }),

  // PUT /api/moderation/reports/:id
  http.put(`${API_URL}/api/moderation/reports/:id`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /api/moderation/queue
  http.get(`${API_URL}/api/moderation/queue`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({
      items: mockFirstPostQueue,
      cursor: null,
      total: mockFirstPostQueue.length,
    })
  }),

  // PUT /api/moderation/queue/:id
  http.put(`${API_URL}/api/moderation/queue/:id`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /api/moderation/log
  http.get(`${API_URL}/api/moderation/log`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({
      entries: mockModerationLog,
      cursor: null,
      total: mockModerationLog.length,
    })
  }),

  // GET /api/admin/moderation/thresholds
  http.get(`${API_URL}/api/admin/moderation/thresholds`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json(mockModerationThresholds)
  }),

  // PUT /api/admin/moderation/thresholds
  http.put(`${API_URL}/api/admin/moderation/thresholds`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ ...mockModerationThresholds, ...body })
  }),

  // GET /api/admin/reports/users
  http.get(`${API_URL}/api/admin/reports/users`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ users: mockReportedUsers })
  }),

  // GET /api/admin/users
  http.get(`${API_URL}/api/admin/users`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 20
    const limited = mockAdminUsers.slice(0, limit)
    return HttpResponse.json({
      users: limited,
      cursor: null,
      total: mockAdminUsers.length,
    })
  }),

  // POST /api/moderation/ban
  http.post(`${API_URL}/api/moderation/ban`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /api/plugins
  http.get(`${API_URL}/api/plugins`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ plugins: mockPlugins })
  }),

  // PUT /api/plugins/:id/enable or /disable
  http.put(`${API_URL}/api/plugins/:id/enable`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.put(`${API_URL}/api/plugins/:id/disable`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // PUT /api/plugins/:id/settings
  http.put(`${API_URL}/api/plugins/:id/settings`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // DELETE /api/plugins/:id
  http.delete(`${API_URL}/api/plugins/:id`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /api/users/me/preferences
  http.get(`${API_URL}/api/users/me/preferences`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json(mockUserPreferences)
  }),

  // PUT /api/users/me/preferences
  http.put(`${API_URL}/api/users/me/preferences`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ ...mockUserPreferences, ...body })
  }),

  // GET /api/users/me/preferences/communities
  http.get(`${API_URL}/api/users/me/preferences/communities`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ communities: mockCommunityPreferences })
  }),

  // PUT /api/users/me/preferences/communities/:communityDid
  http.put(
    `${API_URL}/api/users/me/preferences/communities/:communityDid`,
    async ({ request, params }) => {
      const auth = request.headers.get('Authorization')
      if (!auth?.startsWith('Bearer ')) {
        return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const communityDid = decodeURIComponent(params['communityDid'] as string)
      const existing = mockCommunityPreferences.find((c) => c.communityDid === communityDid)
      if (!existing) {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 })
      }
      const body = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({ ...existing, ...body })
    }
  ),

  // POST /api/users/me/age-declaration
  http.post(`${API_URL}/api/users/me/age-declaration`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = (await request.json()) as { declaredAge?: number }
    const declaredAge = body.declaredAge ?? 0
    return HttpResponse.json({
      success: true,
      declaredAge,
    })
  }),

  // POST /api/users/me/block/:did
  http.post(`${API_URL}/api/users/me/block/:did`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ success: true })
  }),

  // DELETE /api/users/me/block/:did
  http.delete(`${API_URL}/api/users/me/block/:did`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ success: true })
  }),

  // POST /api/users/me/mute/:did
  http.post(`${API_URL}/api/users/me/mute/:did`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ success: true })
  }),

  // DELETE /api/users/me/mute/:did
  http.delete(`${API_URL}/api/users/me/mute/:did`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ success: true })
  }),

  // --- Onboarding field endpoints ---

  // GET /api/admin/onboarding-fields
  http.get(`${API_URL}/api/admin/onboarding-fields`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ fields: mockOnboardingFields })
  }),

  // POST /api/admin/onboarding-fields
  http.post(`${API_URL}/api/admin/onboarding-fields`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = (await request.json()) as Record<string, unknown>
    const now = new Date().toISOString()
    const newField = {
      id: `field-${Date.now()}`,
      communityDid: 'did:plc:test-community-123',
      fieldType: body.fieldType,
      label: body.label,
      description: body.description ?? null,
      isMandatory: body.isMandatory ?? true,
      sortOrder: body.sortOrder ?? 0,
      config: body.config ?? null,
      createdAt: now,
      updatedAt: now,
    }
    return HttpResponse.json(newField, { status: 201 })
  }),

  // PUT /api/admin/onboarding-fields/:id
  http.put(`${API_URL}/api/admin/onboarding-fields/:id`, async ({ request, params }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const id = params['id'] as string
    const existing = mockOnboardingFields.find((f) => f.id === id)
    if (!existing) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ ...existing, ...body, updatedAt: new Date().toISOString() })
  }),

  // DELETE /api/admin/onboarding-fields/:id
  http.delete(`${API_URL}/api/admin/onboarding-fields/:id`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // PUT /api/admin/onboarding-fields/reorder
  http.put(`${API_URL}/api/admin/onboarding-fields/reorder`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ success: true })
  }),

  // GET /api/onboarding/status
  http.get(`${API_URL}/api/onboarding/status`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({
      complete: true,
      fields: mockOnboardingFields,
      responses: {},
      missingFields: [],
    })
  }),

  // POST /api/onboarding/submit
  http.post(`${API_URL}/api/onboarding/submit`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ success: true })
  }),

  // --- My Reports + Appeals endpoints ---

  // GET /api/moderation/my-reports
  http.get(`${API_URL}/api/moderation/my-reports`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({
      reports: mockMyReports,
      cursor: null,
    })
  }),

  // POST /api/moderation/reports/:id/appeal
  http.post(`${API_URL}/api/moderation/reports/:id/appeal`, async ({ request, params }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const id = Number(params['id'])
    const report = mockMyReports.find((r) => r.id === id)
    if (!report) {
      return HttpResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    const body = (await request.json()) as { reason?: string }
    return HttpResponse.json({
      ...report,
      appealReason: body.reason ?? null,
      appealedAt: new Date().toISOString(),
      appealStatus: 'pending',
      status: 'pending',
    })
  }),
]
