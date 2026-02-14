/**
 * API response types matching barazo-api schemas.
 * These mirror the Zod-validated responses from the API.
 * @see ~/Documents/Git/barazo-forum/barazo-api/src/routes/
 */

// --- Categories ---

export interface Category {
  id: string
  slug: string
  name: string
  description: string | null
  parentId: string | null
  sortOrder: number
  communityDid: string
  maturityRating: MaturityRating
  createdAt: string
  updatedAt: string
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[]
}

export interface CategoryWithTopicCount extends Category {
  topicCount: number
}

export interface CategoriesResponse {
  categories: CategoryTreeNode[]
}

// --- Topics ---

export interface Topic {
  uri: string
  rkey: string
  authorDid: string
  title: string
  content: string
  contentFormat: string | null
  category: string
  tags: string[] | null
  communityDid: string
  cid: string
  replyCount: number
  reactionCount: number
  lastActivityAt: string
  createdAt: string
  indexedAt: string
}

export interface TopicsResponse {
  topics: Topic[]
  cursor: string | null
}

export interface CreateTopicInput {
  title: string
  content: string
  category: string
  tags?: string[]
  crossPostBluesky?: boolean
  crossPostFrontpage?: boolean
}

export interface UpdateTopicInput {
  title?: string
  content?: string
  category?: string
  tags?: string[]
}

// --- Replies ---

export interface Reply {
  uri: string
  rkey: string
  authorDid: string
  content: string
  contentFormat: string | null
  rootUri: string
  rootCid: string
  parentUri: string
  parentCid: string
  communityDid: string
  cid: string
  depth: number
  reactionCount: number
  createdAt: string
  indexedAt: string
}

export interface RepliesResponse {
  replies: Reply[]
  cursor: string | null
}

// --- Reactions ---

export interface Reaction {
  uri: string
  rkey: string
  authorDid: string
  subjectUri: string
  subjectCid: string
  type: string
  communityDid: string
  cid: string
  createdAt: string
}

export interface ReactionsResponse {
  reactions: Reaction[]
  cursor: string | null
}

// --- Search ---

export interface SearchResult {
  type: 'topic' | 'reply'
  uri: string
  rkey: string
  authorDid: string
  title: string | null
  content: string
  category: string | null
  communityDid: string
  replyCount: number | null
  reactionCount: number
  createdAt: string
  rank: number
  rootUri: string | null
  rootTitle: string | null
}

export interface SearchResponse {
  results: SearchResult[]
  cursor: string | null
  total: number
  searchMode: 'fulltext' | 'hybrid'
}

// --- Community ---

export interface CommunitySettings {
  id: string
  initialized: boolean
  communityDid: string | null
  adminDid: string | null
  communityName: string
  maturityRating: MaturityRating
  reactionSet: string[]
  communityDescription: string | null
  communityLogoUrl: string | null
  primaryColor: string | null
  accentColor: string | null
  createdAt: string
  updatedAt: string
}

export interface CommunityStats {
  topicCount: number
  replyCount: number
  userCount: number
  categoryCount: number
  reportCount: number
  recentTopics: number
  recentReplies: number
  recentUsers: number
}

// --- Auth ---

export interface AuthSession {
  accessToken: string
  expiresAt: string
  did: string
  handle: string
}

export interface AuthUser {
  did: string
  handle: string
}

// --- Notifications ---

export type NotificationType = 'reply' | 'reaction' | 'mention' | 'moderation'

export interface Notification {
  id: string
  type: NotificationType
  userDid: string
  actorDid: string
  actorHandle: string
  subjectUri: string
  subjectTitle: string | null
  message: string
  read: boolean
  createdAt: string
}

export interface NotificationsResponse {
  notifications: Notification[]
  cursor: string | null
  unreadCount: number
}

// --- Moderation ---

export type ReportReasonType =
  | 'spam'
  | 'sexual'
  | 'harassment'
  | 'violation'
  | 'misleading'
  | 'other'

export type ReportResolution = 'dismissed' | 'warned' | 'labeled' | 'removed' | 'banned'

export interface ModerationReport {
  id: string
  reporterDid: string
  reporterHandle: string
  targetUri: string
  targetAuthorDid: string
  targetAuthorHandle: string
  targetContent: string
  targetTitle: string | null
  reasonType: ReportReasonType
  reason: string | null
  potentiallyIllegal: boolean
  status: 'pending' | 'resolved'
  resolution: ReportResolution | null
  resolvedAt: string | null
  resolvedByDid: string | null
  communityDid: string
  createdAt: string
}

export interface ModerationReportsResponse {
  reports: ModerationReport[]
  cursor: string | null
  total: number
}

export interface FirstPostQueueItem {
  id: string
  authorDid: string
  authorHandle: string
  contentUri: string
  contentType: 'topic' | 'reply'
  title: string | null
  content: string
  accountAge: string
  crossCommunityCount: number
  bannedFromOtherCommunities: number
  status: 'pending' | 'approved' | 'rejected'
  communityDid: string
  createdAt: string
}

export interface FirstPostQueueResponse {
  items: FirstPostQueueItem[]
  cursor: string | null
  total: number
}

export type ModerationActionType =
  | 'lock'
  | 'unlock'
  | 'pin'
  | 'unpin'
  | 'delete'
  | 'ban'
  | 'unban'
  | 'warn'
  | 'label'
  | 'approve'
  | 'reject'

export interface ModerationLogEntry {
  id: string
  actionType: ModerationActionType
  moderatorDid: string
  moderatorHandle: string
  targetUri: string | null
  targetDid: string | null
  targetHandle: string | null
  reason: string | null
  communityDid: string
  createdAt: string
}

export interface ModerationLogResponse {
  entries: ModerationLogEntry[]
  cursor: string | null
  total: number
}

export interface ModerationThresholds {
  autoBlockReportCount: number
  warnThreshold: number
  firstPostQueueCount: number
  newAccountRateLimit: number
  linkPostingHold: boolean
  topicCreationDelay: boolean
  burstDetectionPostCount: number
  burstDetectionMinutes: number
}

export interface ReportedUser {
  did: string
  handle: string
  reportCount: number
  latestReportAt: string
  bannedFromOtherCommunities: number
}

export interface ReportedUsersResponse {
  users: ReportedUser[]
}

// --- Admin Users ---

export interface AdminUser {
  did: string
  handle: string
  displayName: string | null
  avatarUrl: string | null
  role: 'member' | 'moderator' | 'admin'
  isBanned: boolean
  bannedAt: string | null
  banReason: string | null
  bannedFromOtherCommunities: number
  topicCount: number
  replyCount: number
  reportCount: number
  firstSeenAt: string
  lastActiveAt: string
}

export interface AdminUsersResponse {
  users: AdminUser[]
  cursor: string | null
  total: number
}

// --- Plugins ---

export type PluginSource = 'core' | 'official' | 'community' | 'experimental'

export interface PluginSettingsSchema {
  [key: string]: {
    type: 'boolean' | 'string' | 'number' | 'select'
    label: string
    description?: string
    default: boolean | string | number
    options?: string[]
  }
}

export interface Plugin {
  id: string
  name: string
  displayName: string
  version: string
  description: string
  source: PluginSource
  enabled: boolean
  category: string
  dependencies: string[]
  dependents: string[]
  settingsSchema: PluginSettingsSchema
  settings: Record<string, boolean | string | number>
  installedAt: string
}

export interface PluginsResponse {
  plugins: Plugin[]
}

// --- User Preferences ---

export interface UserPreferences {
  maturityLevel: 'sfw' | 'mature'
  ageDeclarationAt: string | null
  mutedWords: string[]
  blockedDids: string[]
  mutedDids: string[]
  crossPostBluesky: boolean
  crossPostFrontpage: boolean
  updatedAt: string
}

export interface UpdatePreferencesInput {
  maturityLevel?: 'sfw' | 'mature'
  mutedWords?: string[]
  blockedDids?: string[]
  mutedDids?: string[]
  crossPostBluesky?: boolean
  crossPostFrontpage?: boolean
}

export interface AgeDeclarationResponse {
  success: boolean
  ageDeclarationAt: string
}

// --- Shared ---

export type MaturityRating = 'safe' | 'mature' | 'adult'

// --- Pagination ---

export interface PaginationParams {
  limit?: number
  cursor?: string
}
