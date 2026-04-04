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
  mockDeepReplies,
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
  mockOnboardingFields,
  mockMyReports,
  mockUserProfiles,
  mockPublicSettings,
  mockCommunityProfile,
  mockPages,
  mockSybilClusters,
  mockSybilClusterDetail,
  mockTrustSeeds,
  mockPdsTrustFactors,
  mockTrustGraphStatus,
  mockBehavioralFlags,
} from './data'

const API_URL = ''

export const handlers = [
  // --- Setup endpoints ---

  // GET /api/setup/status
  http.get(`${API_URL}/api/setup/status`, () => {
    return HttpResponse.json({ initialized: true, communityName: 'Barazo Test Community' })
  }),

  // POST /api/setup/initialize
  http.post(`${API_URL}/api/setup/initialize`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({
      initialized: true,
      adminDid: 'did:plc:testuser123',
      communityName: 'Barazo Test Community',
    })
  }),

  // --- Auth endpoints ---

  // GET /api/auth/login
  http.get(`${API_URL}/api/auth/login`, ({ request }) => {
    const url = new URL(request.url)
    const handle = url.searchParams.get('handle')
    if (!handle) {
      return HttpResponse.json({ error: 'handle is required' }, { status: 400 })
    }
    return HttpResponse.json({
      url: `https://bsky.social/oauth/authorize?handle=${encodeURIComponent(handle)}&state=mock-state-123`,
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

  // GET /api/topics/by-author-rkey/:handle/:rkey
  http.get(`${API_URL}/api/topics/by-author-rkey/:handle/:rkey`, ({ params }) => {
    const handle = decodeURIComponent(params['handle'] as string)
    const rkey = params['rkey'] as string
    const topic = mockTopics.find(
      (t) => t.rkey === rkey && (t.author?.handle === handle || t.authorDid === handle)
    )
    if (!topic) {
      return HttpResponse.json({ error: 'Topic not found' }, { status: 404 })
    }
    return HttpResponse.json(topic)
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

    const replies = [...mockReplies, ...mockDeepReplies].filter((r) => r.rootUri === topicUri)
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
      author: {
        did: 'did:plc:mock-user',
        handle: 'mock-user.bsky.social',
        displayName: 'Mock User',
        avatarUrl: null,
      },
      title: body.title,
      content: body.content,
      category: body.category,
      site: null,
      tags: [],
      communityDid: 'did:plc:test-community-123',
      cid: `bafyreib-${rkey}`,
      replyCount: 0,
      reactionCount: 0,
      lastActivityAt: now,
      publishedAt: now,
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

  // POST /api/admin/design/logo
  http.post(`${API_URL}/api/admin/design/logo`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ url: 'http://localhost:3000/uploads/logos/mock-logo.webp' })
  }),

  // POST /api/admin/design/header-logo
  http.post(`${API_URL}/api/admin/design/header-logo`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({
      url: 'http://localhost:3000/uploads/header-logos/mock-header-logo.webp',
    })
  }),

  // POST /api/admin/design/favicon
  http.post(`${API_URL}/api/admin/design/favicon`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ url: 'http://localhost:3000/uploads/favicons/mock-favicon.webp' })
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
      actions: mockModerationLog,
      cursor: null,
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

  // GET /api/plugins/registry/search
  http.get(`${API_URL}/api/plugins/registry/search`, () => {
    return HttpResponse.json({ plugins: [] })
  }),

  // GET /api/plugins/registry/featured
  http.get(`${API_URL}/api/plugins/registry/featured`, () => {
    return HttpResponse.json({ plugins: [] })
  }),

  // POST /api/plugins/install
  http.post(`${API_URL}/api/plugins/install`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({
      plugin: {
        id: 'installed-1',
        name: '@barazo/plugin-new',
        displayName: 'New Plugin',
        version: '1.0.0',
        description: 'A newly installed plugin',
        source: 'community',
        enabled: false,
        category: 'general',
        dependencies: [],
        dependents: [],
        settingsSchema: {},
        settings: {},
        installedAt: new Date().toISOString(),
      },
    })
  }),

  // GET /api/users/resolve-handles
  http.get(`${API_URL}/api/users/resolve-handles`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = new URL(request.url)
    const handles = (url.searchParams.get('handles') ?? '').split(',').filter(Boolean)
    const users = handles.map((handle) => ({
      did: `did:plc:resolved-${handle.replace(/\./g, '-')}`,
      handle,
      displayName: handle.split('.')[0] ?? handle,
      avatarUrl: null,
    }))
    return HttpResponse.json({ users })
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
    return HttpResponse.json({ communities: [] })
  }),

  // PUT /api/users/me/preferences/communities/:communityDid
  http.put(
    `${API_URL}/api/users/me/preferences/communities/:communityDid`,
    async ({ request, params }) => {
      const auth = request.headers.get('Authorization')
      if (!auth?.startsWith('Bearer ')) {
        return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const body = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        communityDid: params['communityDid'],
        maturityOverride: null,
        mutedWords: null,
        blockedDids: null,
        mutedDids: null,
        notificationPrefs: null,
        updatedAt: new Date().toISOString(),
        ...body,
      })
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
    return HttpResponse.json({ fields: mockOnboardingFields, hostingMode: 'selfhosted' })
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
      source: 'admin' as const,
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

  // --- User Profile endpoints ---

  // GET /api/users/:handle (public profile)
  http.get(`${API_URL}/api/users/:handle`, ({ params }) => {
    const handle = decodeURIComponent(params['handle'] as string)
    // Skip /api/users/me/* paths (handled by specific handlers above)
    if (handle === 'me') {
      return
    }
    const profile = mockUserProfiles[handle]
    if (!profile) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return HttpResponse.json(profile)
  }),

  // --- Public Settings endpoint ---

  // GET /api/settings/public
  http.get(`${API_URL}/api/settings/public`, () => {
    return HttpResponse.json(mockPublicSettings)
  }),

  // --- Community Profile endpoints ---

  // GET /api/communities/:communityDid/profile
  http.get(`${API_URL}/api/communities/:communityDid/profile`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json(mockCommunityProfile)
  }),

  // PUT /api/communities/:communityDid/profile
  http.put(`${API_URL}/api/communities/:communityDid/profile`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ success: true })
  }),

  // DELETE /api/communities/:communityDid/profile
  http.delete(`${API_URL}/api/communities/:communityDid/profile`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // POST /api/communities/:communityDid/profile/avatar
  http.post(`${API_URL}/api/communities/:communityDid/profile/avatar`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ url: 'https://cdn.example.com/avatar/uploaded.jpg' })
  }),

  // POST /api/communities/:communityDid/profile/banner
  http.post(`${API_URL}/api/communities/:communityDid/profile/banner`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ url: 'https://cdn.example.com/banner/uploaded.jpg' })
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

  // --- Page endpoints (public) ---

  // GET /api/pages
  http.get(`${API_URL}/api/pages`, () => {
    const published = mockPages.filter((p) => p.status === 'published')
    return HttpResponse.json({ pages: published })
  }),

  // GET /api/pages/:slug
  http.get(`${API_URL}/api/pages/:slug`, ({ params }) => {
    const slug = params['slug'] as string
    const findPage = (nodes: typeof mockPages): (typeof mockPages)[number] | undefined => {
      for (const node of nodes) {
        if (node.slug === slug) return node
        const found = findPage(node.children)
        if (found) return found
      }
      return undefined
    }
    const page = findPage(mockPages)
    if (!page || page.status !== 'published') {
      return HttpResponse.json({ error: 'Page not found' }, { status: 404 })
    }
    return HttpResponse.json(page)
  }),

  // --- Admin page endpoints ---

  // GET /api/admin/pages
  http.get(`${API_URL}/api/admin/pages`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ pages: mockPages })
  }),

  // GET /api/admin/pages/:id
  http.get(`${API_URL}/api/admin/pages/:id`, ({ request, params }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const id = params['id'] as string
    const findPage = (nodes: typeof mockPages): (typeof mockPages)[number] | undefined => {
      for (const node of nodes) {
        if (node.id === id) return node
        const found = findPage(node.children)
        if (found) return found
      }
      return undefined
    }
    const page = findPage(mockPages)
    if (!page) {
      return HttpResponse.json({ error: 'Page not found' }, { status: 404 })
    }
    return HttpResponse.json(page)
  }),

  // POST /api/admin/pages
  http.post(`${API_URL}/api/admin/pages`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = (await request.json()) as Record<string, unknown>
    const now = new Date().toISOString()
    const newPage = {
      id: `page-${Date.now()}`,
      slug: body.slug ?? 'new-page',
      title: body.title ?? 'New Page',
      content: body.content ?? '',
      status: body.status ?? 'draft',
      metaDescription: body.metaDescription ?? null,
      parentId: body.parentId ?? null,
      sortOrder: body.sortOrder ?? 0,
      communityDid: 'did:plc:test-community-123',
      createdAt: now,
      updatedAt: now,
      children: [],
    }
    return HttpResponse.json(newPage, { status: 201 })
  }),

  // PUT /api/admin/pages/:id
  http.put(`${API_URL}/api/admin/pages/:id`, async ({ request, params }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const id = params['id'] as string
    const findPage = (nodes: typeof mockPages): (typeof mockPages)[number] | undefined => {
      for (const node of nodes) {
        if (node.id === id) return node
        const found = findPage(node.children)
        if (found) return found
      }
      return undefined
    }
    const existing = findPage(mockPages)
    if (!existing) {
      return HttpResponse.json({ error: 'Page not found' }, { status: 404 })
    }
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({
      ...existing,
      ...body,
      children: [],
      updatedAt: new Date().toISOString(),
    })
  }),

  // DELETE /api/admin/pages/:id
  http.delete(`${API_URL}/api/admin/pages/:id`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // --- Sybil Detection endpoints ---

  // GET /api/admin/sybil-clusters
  http.get(`${API_URL}/api/admin/sybil-clusters`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const clusters = status
      ? mockSybilClusters.filter((c) => c.status === status)
      : mockSybilClusters
    return HttpResponse.json({ clusters })
  }),

  // GET /api/admin/sybil-clusters/:id
  http.get(`${API_URL}/api/admin/sybil-clusters/:id`, ({ request, params }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const id = Number(params['id'])
    if (id === mockSybilClusterDetail.id) {
      return HttpResponse.json(mockSybilClusterDetail)
    }
    const cluster = mockSybilClusters.find((c) => c.id === id)
    if (!cluster) {
      return HttpResponse.json({ error: 'Cluster not found' }, { status: 404 })
    }
    return HttpResponse.json({ ...cluster, members: [] })
  }),

  // PUT /api/admin/sybil-clusters/:id
  http.put(`${API_URL}/api/admin/sybil-clusters/:id`, async ({ request, params }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const id = Number(params['id'])
    const cluster = mockSybilClusters.find((c) => c.id === id)
    if (!cluster) {
      return HttpResponse.json({ error: 'Cluster not found' }, { status: 404 })
    }
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({
      ...cluster,
      ...body,
      reviewedBy: 'did:plc:user-jay-001',
      reviewedAt: new Date().toISOString(),
    })
  }),

  // GET /api/admin/trust-seeds
  http.get(`${API_URL}/api/admin/trust-seeds`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ seeds: mockTrustSeeds })
  }),

  // POST /api/admin/trust-seeds
  http.post(`${API_URL}/api/admin/trust-seeds`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = (await request.json()) as {
      handle?: string
      communityId?: string
      reason?: string
    }
    const newSeed = {
      id: Date.now(),
      did: `did:plc:new-seed-${Date.now()}`,
      handle: body.handle ?? 'unknown.bsky.social',
      displayName: body.handle ?? 'Unknown',
      communityId: body.communityId ?? null,
      reason: body.reason ?? null,
      implicit: false,
      createdAt: new Date().toISOString(),
    }
    return HttpResponse.json(newSeed, { status: 201 })
  }),

  // DELETE /api/admin/trust-seeds/:id
  http.delete(`${API_URL}/api/admin/trust-seeds/:id`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /api/admin/pds-trust
  http.get(`${API_URL}/api/admin/pds-trust`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ factors: mockPdsTrustFactors, cursor: null })
  }),

  // PUT /api/admin/pds-trust
  http.put(`${API_URL}/api/admin/pds-trust`, async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = (await request.json()) as { pdsHost?: string; trustFactor?: number }
    const pdsHost = body.pdsHost ?? ''
    const existing = mockPdsTrustFactors.find((p) => p.pdsHost === pdsHost)
    return HttpResponse.json({
      pdsHost,
      trustFactor: body.trustFactor ?? existing?.trustFactor ?? 1.0,
      isDefault: false,
      updatedAt: new Date().toISOString(),
    })
  }),

  // GET /api/admin/trust-graph/status
  http.get(`${API_URL}/api/admin/trust-graph/status`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json(mockTrustGraphStatus)
  }),

  // POST /api/admin/trust-graph/recompute
  http.post(`${API_URL}/api/admin/trust-graph/recompute`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ message: 'Trust graph recomputation started' })
  }),

  // GET /api/admin/behavioral-flags
  http.get(`${API_URL}/api/admin/behavioral-flags`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ flags: mockBehavioralFlags })
  }),

  // PUT /api/admin/behavioral-flags/:id
  http.put(`${API_URL}/api/admin/behavioral-flags/:id`, async ({ request, params }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const id = Number(params['id'])
    const flag = mockBehavioralFlags.find((f) => f.id === id)
    if (!flag) {
      return HttpResponse.json({ error: 'Flag not found' }, { status: 404 })
    }
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ ...flag, ...body })
  }),
]
