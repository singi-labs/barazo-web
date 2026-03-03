/**
 * Type-safe API client for barazo-api.
 * Server-side: uses fetch directly with the internal API URL.
 * Client-side: uses fetch with the public API URL.
 */

import type {
  AgeDeclarationResponse,
  AuthorProfile,
  AuthSession,
  AuthUser,
  CategoriesResponse,
  CategoryTreeNode,
  CategoryWithTopicCount,
  CommunityPreferencesResponse,
  CommunitySettings,
  CommunityStats,
  CommunityPreferenceOverride,
  CreateTopicInput,
  InitializeCommunityInput,
  InitializeResponse,
  PublicSettings,
  SetupStatus,
  Topic,
  TopicsResponse,
  UpdateCommunityPreferenceInput,
  UpdatePreferencesInput,
  UpdateTopicInput,
  UserPreferences,
  Reply,
  RepliesResponse,
  CreateReplyInput,
  SearchResponse,
  NotificationsResponse,
  PaginationParams,
  ModerationReportsResponse,
  FirstPostQueueResponse,
  ModerationLogResponse,
  ModerationThresholds,
  ReportedUsersResponse,
  AdminUsersResponse,
  MaturityRating,
  PluginsResponse,
  OnboardingField,
  CreateOnboardingFieldInput,
  UpdateOnboardingFieldInput,
  OnboardingStatus,
  SubmitOnboardingInput,
  MyReport,
  MyReportsResponse,
  UserProfile,
  CommunityProfile,
  UpdateCommunityProfileInput,
  UploadResponse,
  SybilClustersResponse,
  SybilClusterDetail,
  SybilCluster,
  TrustSeedsResponse,
  TrustSeed,
  CreateTrustSeedInput,
  PdsTrustFactorsResponse,
  PdsTrustFactor,
  TrustGraphStatus,
  BehavioralFlagsResponse,
  BehavioralFlag,
} from './types'

/** Client: relative URLs (empty string). Server: internal Docker network URL. */
const API_URL =
  typeof window === 'undefined' ? (process.env.API_INTERNAL_URL ?? 'http://localhost:3000') : ''

interface FetchOptions {
  headers?: Record<string, string>
  signal?: AbortSignal
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_URL}${path}`
  const hasBody = options.body !== undefined
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    signal: options.signal,
    ...(hasBody ? { body: JSON.stringify(options.body) } : {}),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => 'Unknown error')
    throw new ApiError(response.status, `API ${response.status}: ${body}`)
  }

  return response.json() as Promise<T>
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number] => entry[1] !== undefined
  )
  if (entries.length === 0) return ''
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
}

// --- Auth endpoints ---

export async function initiateLogin(handle: string): Promise<{ url: string }> {
  const query = buildQuery({ handle })
  const result = await apiFetch<{ url: string }>(`/api/auth/login${query}`)
  if (!result?.url) {
    throw new ApiError(502, 'Login endpoint did not return a redirect URL')
  }
  return result
}

export async function initiateCrossPostAuth(token: string): Promise<{ url: string }> {
  const result = await apiFetch<{ url: string }>('/api/auth/crosspost-authorize', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!result?.url) {
    throw new ApiError(502, 'Cross-post auth endpoint did not return a redirect URL')
  }
  return result
}

export function handleCallback(code: string, state: string): Promise<AuthSession> {
  const query = buildQuery({ code, state })
  return apiFetch<AuthSession>(`/api/auth/callback${query}`)
}

export async function refreshSession(): Promise<AuthSession> {
  const url = `${API_URL}/api/auth/refresh`
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    const body = await response.text().catch(() => 'Unknown error')
    throw new ApiError(response.status, `API ${response.status}: ${body}`)
  }

  return response.json() as Promise<AuthSession>
}

export async function logout(accessToken: string): Promise<void> {
  const url = `${API_URL}/api/auth/session`
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  })

  if (!response.ok && response.status !== 204) {
    const body = await response.text().catch(() => 'Unknown error')
    throw new ApiError(response.status, `API ${response.status}: ${body}`)
  }
}

export function getCurrentUser(accessToken: string): Promise<AuthUser> {
  return apiFetch<AuthUser>('/api/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

// --- Category endpoints ---

export function getCategories(options?: FetchOptions): Promise<CategoriesResponse> {
  return apiFetch<CategoriesResponse>('/api/categories', options)
}

export function getCategoryBySlug(
  slug: string,
  options?: FetchOptions
): Promise<CategoryWithTopicCount> {
  return apiFetch<CategoryWithTopicCount>(`/api/categories/${encodeURIComponent(slug)}`, options)
}

// --- Topic endpoints ---

export interface GetTopicsParams extends PaginationParams {
  category?: string
  sort?: 'latest' | 'popular'
}

export function getTopics(
  params: GetTopicsParams = {},
  options?: FetchOptions
): Promise<TopicsResponse> {
  const query = buildQuery({
    limit: params.limit,
    cursor: params.cursor,
    category: params.category,
    sort: params.sort,
  })
  return apiFetch<TopicsResponse>(`/api/topics${query}`, options)
}

export function getTopicByRkey(rkey: string, options?: FetchOptions): Promise<Topic> {
  return apiFetch<Topic>(`/api/topics/by-rkey/${encodeURIComponent(rkey)}`, options)
}

export function createTopic(
  input: CreateTopicInput,
  accessToken: string,
  options?: FetchOptions
): Promise<Topic> {
  return apiFetch<Topic>('/api/topics', {
    ...options,
    method: 'POST',
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
    body: input,
  })
}

export function updateTopic(
  rkey: string,
  input: UpdateTopicInput,
  accessToken: string,
  options?: FetchOptions
): Promise<Topic> {
  return apiFetch<Topic>(`/api/topics/${encodeURIComponent(rkey)}`, {
    ...options,
    method: 'PUT',
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
    body: input,
  })
}

// --- Reply endpoints ---

export function getReplies(
  topicUri: string,
  params: PaginationParams = {},
  options?: FetchOptions
): Promise<RepliesResponse> {
  const query = buildQuery({
    limit: params.limit,
    cursor: params.cursor,
  })
  return apiFetch<RepliesResponse>(
    `/api/topics/${encodeURIComponent(topicUri)}/replies${query}`,
    options
  )
}

export function createReply(
  topicUri: string,
  input: CreateReplyInput,
  accessToken: string,
  options?: FetchOptions
): Promise<Reply> {
  return apiFetch<Reply>(
    `/api/topics/${encodeURIComponent(topicUri)}/replies`,
    {
      ...options,
      method: 'POST',
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${accessToken}`,
      },
      body: input,
    }
  )
}

// --- Search endpoints ---

export interface SearchParams extends PaginationParams {
  q: string
}

export function searchContent(
  params: SearchParams,
  options?: FetchOptions
): Promise<SearchResponse> {
  const query = buildQuery({
    q: params.q,
    limit: params.limit,
    cursor: params.cursor,
  })
  return apiFetch<SearchResponse>(`/api/search${query}`, options)
}

// --- Notification endpoints ---

export function getNotifications(
  accessToken: string,
  params: PaginationParams = {},
  options?: FetchOptions
): Promise<NotificationsResponse> {
  const query = buildQuery({
    limit: params.limit,
    cursor: params.cursor,
  })
  return apiFetch<NotificationsResponse>(`/api/notifications${query}`, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export function markNotificationsRead(
  accessToken: string,
  ids: string[],
  options?: FetchOptions
): Promise<void> {
  return apiFetch<void>('/api/notifications/read', {
    ...options,
    method: 'PUT',
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
    body: { ids },
  })
}

// --- Community endpoints ---

export function getCommunitySettings(
  accessToken: string,
  options?: FetchOptions
): Promise<CommunitySettings> {
  return apiFetch<CommunitySettings>('/api/admin/settings', {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function getPublicSettings(options?: FetchOptions): Promise<PublicSettings> {
  return apiFetch<PublicSettings>('/api/settings/public', options)
}

export function getCommunityStats(
  accessToken: string,
  options?: FetchOptions
): Promise<CommunityStats> {
  return apiFetch<CommunityStats>('/api/admin/stats', {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

// --- Admin category endpoints ---

export function createCategory(
  input: {
    name: string
    slug: string
    description: string | null
    parentId: string | null
    sortOrder: number
    maturityRating: MaturityRating
  },
  accessToken: string,
  options?: FetchOptions
): Promise<CategoryTreeNode> {
  return apiFetch<CategoryTreeNode>('/api/admin/categories', {
    ...options,
    method: 'POST',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: input,
  })
}

export function updateCategory(
  id: string,
  input: Partial<{
    name: string
    slug: string
    description: string | null
    parentId: string | null
    sortOrder: number
    maturityRating: MaturityRating
  }>,
  accessToken: string,
  options?: FetchOptions
): Promise<CategoryTreeNode> {
  return apiFetch<CategoryTreeNode>(`/api/admin/categories/${encodeURIComponent(id)}`, {
    ...options,
    method: 'PUT',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: input,
  })
}

export function deleteCategory(
  id: string,
  accessToken: string,
  options?: FetchOptions
): Promise<void> {
  return apiFetch<void>(`/api/admin/categories/${encodeURIComponent(id)}`, {
    ...options,
    method: 'DELETE',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

// --- Moderation endpoints ---

export function getModerationReports(
  accessToken: string,
  params: PaginationParams = {},
  options?: FetchOptions
): Promise<ModerationReportsResponse> {
  const query = buildQuery({ limit: params.limit, cursor: params.cursor })
  return apiFetch<ModerationReportsResponse>(`/api/moderation/reports${query}`, {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function resolveReport(
  id: string,
  resolution: string,
  accessToken: string,
  options?: FetchOptions
): Promise<void> {
  return apiFetch<void>(`/api/moderation/reports/${encodeURIComponent(id)}`, {
    ...options,
    method: 'PUT',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: { resolution },
  })
}

export function getFirstPostQueue(
  accessToken: string,
  params: PaginationParams = {},
  options?: FetchOptions
): Promise<FirstPostQueueResponse> {
  const query = buildQuery({ limit: params.limit, cursor: params.cursor })
  return apiFetch<FirstPostQueueResponse>(`/api/moderation/queue${query}`, {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function resolveFirstPost(
  id: string,
  action: 'approved' | 'rejected',
  accessToken: string,
  options?: FetchOptions
): Promise<void> {
  return apiFetch<void>(`/api/moderation/queue/${encodeURIComponent(id)}`, {
    ...options,
    method: 'PUT',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: { action },
  })
}

export function getModerationLog(
  accessToken: string,
  params: PaginationParams = {},
  options?: FetchOptions
): Promise<ModerationLogResponse> {
  const query = buildQuery({ limit: params.limit, cursor: params.cursor })
  return apiFetch<ModerationLogResponse>(`/api/moderation/log${query}`, {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function getModerationThresholds(
  accessToken: string,
  options?: FetchOptions
): Promise<ModerationThresholds> {
  return apiFetch<ModerationThresholds>('/api/admin/moderation/thresholds', {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function updateModerationThresholds(
  thresholds: Partial<ModerationThresholds>,
  accessToken: string,
  options?: FetchOptions
): Promise<ModerationThresholds> {
  return apiFetch<ModerationThresholds>('/api/admin/moderation/thresholds', {
    ...options,
    method: 'PUT',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: thresholds,
  })
}

export function getReportedUsers(
  accessToken: string,
  options?: FetchOptions
): Promise<ReportedUsersResponse> {
  return apiFetch<ReportedUsersResponse>('/api/admin/reports/users', {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

// --- Admin settings endpoints ---

export function updateCommunitySettings(
  settings: Partial<CommunitySettings>,
  accessToken: string,
  options?: FetchOptions
): Promise<CommunitySettings> {
  return apiFetch<CommunitySettings>('/api/admin/settings', {
    ...options,
    method: 'PUT',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: settings,
  })
}

// --- Admin user endpoints ---

export function getAdminUsers(
  accessToken: string,
  params: PaginationParams = {},
  options?: FetchOptions
): Promise<AdminUsersResponse> {
  const query = buildQuery({ limit: params.limit, cursor: params.cursor })
  return apiFetch<AdminUsersResponse>(`/api/admin/users${query}`, {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function banUser(
  did: string,
  reason: string,
  accessToken: string,
  options?: FetchOptions
): Promise<void> {
  return apiFetch<void>('/api/moderation/ban', {
    ...options,
    method: 'POST',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: { did, action: 'ban', reason },
  })
}

export function unbanUser(did: string, accessToken: string, options?: FetchOptions): Promise<void> {
  return apiFetch<void>('/api/moderation/ban', {
    ...options,
    method: 'POST',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: { did, action: 'unban' },
  })
}

// --- Plugin endpoints ---

export function getPlugins(accessToken: string, options?: FetchOptions): Promise<PluginsResponse> {
  return apiFetch<PluginsResponse>('/api/plugins', {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function togglePlugin(
  id: string,
  enabled: boolean,
  accessToken: string,
  options?: FetchOptions
): Promise<void> {
  return apiFetch<void>(
    `/api/plugins/${encodeURIComponent(id)}/${enabled ? 'enable' : 'disable'}`,
    {
      ...options,
      method: 'PUT',
      headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    }
  )
}

export function updatePluginSettings(
  id: string,
  settings: Record<string, boolean | string | number>,
  accessToken: string,
  options?: FetchOptions
): Promise<void> {
  return apiFetch<void>(`/api/plugins/${encodeURIComponent(id)}/settings`, {
    ...options,
    method: 'PUT',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: settings,
  })
}

export function uninstallPlugin(
  id: string,
  accessToken: string,
  options?: FetchOptions
): Promise<void> {
  return apiFetch<void>(`/api/plugins/${encodeURIComponent(id)}`, {
    ...options,
    method: 'DELETE',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

// --- User Preference endpoints ---

export function getPreferences(
  accessToken: string,
  options?: FetchOptions
): Promise<UserPreferences> {
  return apiFetch<UserPreferences>('/api/users/me/preferences', {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function updatePreferences(
  input: UpdatePreferencesInput,
  accessToken: string,
  options?: FetchOptions
): Promise<UserPreferences> {
  return apiFetch<UserPreferences>('/api/users/me/preferences', {
    ...options,
    method: 'PUT',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: input,
  })
}

export function declareAge(
  declaredAge: number,
  accessToken: string,
  options?: FetchOptions
): Promise<AgeDeclarationResponse> {
  return apiFetch<AgeDeclarationResponse>('/api/users/me/age-declaration', {
    ...options,
    method: 'POST',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: { declaredAge },
  })
}

export function resolveHandles(
  handles: string[],
  accessToken: string,
  options?: FetchOptions
): Promise<{ users: AuthorProfile[] }> {
  const qs = encodeURIComponent(handles.join(','))
  return apiFetch<{ users: AuthorProfile[] }>(`/api/users/resolve-handles?handles=${qs}`, {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

// --- Per-Community Preference endpoints ---

export function getCommunityPreferences(
  accessToken: string,
  options?: FetchOptions
): Promise<CommunityPreferencesResponse> {
  return apiFetch<CommunityPreferencesResponse>('/api/users/me/preferences/communities', {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function updateCommunityPreference(
  communityDid: string,
  input: UpdateCommunityPreferenceInput,
  accessToken: string,
  options?: FetchOptions
): Promise<CommunityPreferenceOverride> {
  return apiFetch<CommunityPreferenceOverride>(
    `/api/users/me/preferences/communities/${encodeURIComponent(communityDid)}`,
    {
      ...options,
      method: 'PUT',
      headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
      body: input,
    }
  )
}

// --- Block/Mute endpoints ---

export function blockUser(
  did: string,
  accessToken: string,
  options?: FetchOptions
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/users/me/block/${encodeURIComponent(did)}`, {
    ...options,
    method: 'POST',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function unblockUser(
  did: string,
  accessToken: string,
  options?: FetchOptions
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/users/me/block/${encodeURIComponent(did)}`, {
    ...options,
    method: 'DELETE',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function muteUser(
  did: string,
  accessToken: string,
  options?: FetchOptions
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/users/me/mute/${encodeURIComponent(did)}`, {
    ...options,
    method: 'POST',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function unmuteUser(
  did: string,
  accessToken: string,
  options?: FetchOptions
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/users/me/mute/${encodeURIComponent(did)}`, {
    ...options,
    method: 'DELETE',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

// --- Admin onboarding field endpoints ---

export function getOnboardingFields(
  accessToken: string,
  options?: FetchOptions
): Promise<OnboardingField[]> {
  return apiFetch<OnboardingField[]>('/api/admin/onboarding-fields', {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function createOnboardingField(
  input: CreateOnboardingFieldInput,
  accessToken: string,
  options?: FetchOptions
): Promise<OnboardingField> {
  return apiFetch<OnboardingField>('/api/admin/onboarding-fields', {
    ...options,
    method: 'POST',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: input,
  })
}

export function updateOnboardingField(
  id: string,
  input: UpdateOnboardingFieldInput,
  accessToken: string,
  options?: FetchOptions
): Promise<OnboardingField> {
  return apiFetch<OnboardingField>(`/api/admin/onboarding-fields/${encodeURIComponent(id)}`, {
    ...options,
    method: 'PUT',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: input,
  })
}

export function deleteOnboardingField(
  id: string,
  accessToken: string,
  options?: FetchOptions
): Promise<void> {
  return apiFetch<void>(`/api/admin/onboarding-fields/${encodeURIComponent(id)}`, {
    ...options,
    method: 'DELETE',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function reorderOnboardingFields(
  fields: Array<{ id: string; sortOrder: number }>,
  accessToken: string,
  options?: FetchOptions
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>('/api/admin/onboarding-fields/reorder', {
    ...options,
    method: 'PUT',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: fields,
  })
}

// --- User onboarding endpoints ---

export function getOnboardingStatus(
  accessToken: string,
  options?: FetchOptions
): Promise<OnboardingStatus> {
  return apiFetch<OnboardingStatus>('/api/onboarding/status', {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function submitOnboarding(
  input: SubmitOnboardingInput,
  accessToken: string,
  options?: FetchOptions
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>('/api/onboarding/submit', {
    ...options,
    method: 'POST',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: input,
  })
}

// --- My Reports + Appeals endpoints ---

export function getMyReports(
  accessToken: string,
  params: PaginationParams = {},
  options?: FetchOptions
): Promise<MyReportsResponse> {
  const query = buildQuery({ limit: params.limit, cursor: params.cursor })
  return apiFetch<MyReportsResponse>(`/api/moderation/my-reports${query}`, {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function submitAppeal(
  reportId: number,
  reason: string,
  accessToken: string,
  options?: FetchOptions
): Promise<MyReport> {
  return apiFetch<MyReport>(
    `/api/moderation/reports/${encodeURIComponent(String(reportId))}/appeal`,
    {
      ...options,
      method: 'POST',
      headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
      body: { reason },
    }
  )
}

// --- User Profile endpoints ---

export function getUserProfile(
  handle: string,
  communityDid?: string,
  options?: FetchOptions
): Promise<UserProfile> {
  const query = buildQuery({ communityDid })
  return apiFetch<UserProfile>(`/api/users/${encodeURIComponent(handle)}${query}`, options)
}

// --- Community Profile endpoints ---

export function getCommunityProfile(
  communityDid: string,
  accessToken: string,
  options?: FetchOptions
): Promise<CommunityProfile> {
  return apiFetch<CommunityProfile>(
    `/api/communities/${encodeURIComponent(communityDid)}/profile`,
    { ...options, headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` } }
  )
}

export function updateCommunityProfile(
  communityDid: string,
  input: UpdateCommunityProfileInput,
  accessToken: string,
  options?: FetchOptions
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(
    `/api/communities/${encodeURIComponent(communityDid)}/profile`,
    {
      ...options,
      method: 'PUT',
      headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
      body: input,
    }
  )
}

export function resetCommunityProfile(
  communityDid: string,
  accessToken: string,
  options?: FetchOptions
): Promise<void> {
  return apiFetch<void>(`/api/communities/${encodeURIComponent(communityDid)}/profile`, {
    ...options,
    method: 'DELETE',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

// --- Upload endpoints (use FormData, not JSON) ---

export async function uploadCommunityAvatar(
  communityDid: string,
  file: File,
  accessToken: string
): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  const url = `${API_URL}/api/communities/${encodeURIComponent(communityDid)}/profile/avatar`
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  })
  if (!response.ok) {
    const body = await response.text().catch(() => 'Unknown error')
    throw new ApiError(response.status, `API ${response.status}: ${body}`)
  }
  return response.json() as Promise<UploadResponse>
}

export async function uploadCommunityBanner(
  communityDid: string,
  file: File,
  accessToken: string
): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  const url = `${API_URL}/api/communities/${encodeURIComponent(communityDid)}/profile/banner`
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  })
  if (!response.ok) {
    const body = await response.text().catch(() => 'Unknown error')
    throw new ApiError(response.status, `API ${response.status}: ${body}`)
  }
  return response.json() as Promise<UploadResponse>
}

// --- Sybil Detection endpoints ---

export function getSybilClusters(
  accessToken: string,
  params: { status?: string } = {},
  options?: FetchOptions
): Promise<SybilClustersResponse> {
  const query = buildQuery({ status: params.status })
  return apiFetch<SybilClustersResponse>(`/api/admin/sybil-clusters${query}`, {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function getSybilClusterDetail(
  id: number,
  accessToken: string,
  options?: FetchOptions
): Promise<SybilClusterDetail> {
  return apiFetch<SybilClusterDetail>(`/api/admin/sybil-clusters/${id}`, {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function updateSybilClusterStatus(
  id: number,
  status: string,
  accessToken: string,
  options?: FetchOptions
): Promise<SybilCluster> {
  return apiFetch<SybilCluster>(`/api/admin/sybil-clusters/${id}`, {
    ...options,
    method: 'PUT',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: { status },
  })
}

export function getTrustSeeds(
  accessToken: string,
  options?: FetchOptions
): Promise<TrustSeedsResponse> {
  return apiFetch<TrustSeedsResponse>('/api/admin/trust-seeds', {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function createTrustSeed(
  input: CreateTrustSeedInput,
  accessToken: string,
  options?: FetchOptions
): Promise<TrustSeed> {
  return apiFetch<TrustSeed>('/api/admin/trust-seeds', {
    ...options,
    method: 'POST',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: input,
  })
}

export function deleteTrustSeed(
  id: number,
  accessToken: string,
  options?: FetchOptions
): Promise<void> {
  return apiFetch<void>(`/api/admin/trust-seeds/${id}`, {
    ...options,
    method: 'DELETE',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function getPdsTrustFactors(
  accessToken: string,
  options?: FetchOptions
): Promise<PdsTrustFactorsResponse> {
  return apiFetch<PdsTrustFactorsResponse>('/api/admin/pds-trust', {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function updatePdsTrustFactor(
  pdsHost: string,
  trustFactor: number,
  accessToken: string,
  options?: FetchOptions
): Promise<PdsTrustFactor> {
  return apiFetch<PdsTrustFactor>('/api/admin/pds-trust', {
    ...options,
    method: 'PUT',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: { pdsHost, trustFactor },
  })
}

export function getTrustGraphStatus(
  accessToken: string,
  options?: FetchOptions
): Promise<TrustGraphStatus> {
  return apiFetch<TrustGraphStatus>('/api/admin/trust-graph/status', {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function recomputeTrustGraph(
  accessToken: string,
  options?: FetchOptions
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/api/admin/trust-graph/recompute', {
    ...options,
    method: 'POST',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function getBehavioralFlags(
  accessToken: string,
  options?: FetchOptions
): Promise<BehavioralFlagsResponse> {
  return apiFetch<BehavioralFlagsResponse>('/api/admin/behavioral-flags', {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
  })
}

export function updateBehavioralFlag(
  id: number,
  status: string,
  accessToken: string,
  options?: FetchOptions
): Promise<BehavioralFlag> {
  return apiFetch<BehavioralFlag>(`/api/admin/behavioral-flags/${id}`, {
    ...options,
    method: 'PUT',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: { status },
  })
}

// --- Setup endpoints ---

export function getSetupStatus(options?: FetchOptions): Promise<SetupStatus> {
  return apiFetch<SetupStatus>('/api/setup/status', options)
}

export function initializeCommunity(
  input: InitializeCommunityInput,
  accessToken: string,
  options?: FetchOptions
): Promise<InitializeResponse> {
  return apiFetch<InitializeResponse>('/api/setup/initialize', {
    ...options,
    method: 'POST',
    headers: { ...options?.headers, Authorization: `Bearer ${accessToken}` },
    body: input,
  })
}

export { ApiError }
