/**
 * API response types matching barazo-api schemas.
 * These mirror the Zod-validated responses from the API.
 * @see ~/Documents/Git/barazo-forum/barazo-api/src/routes/
 */

// Re-export lexicon types for AT Protocol record validation and constants.
// API response types below are enriched by the AppView (computed fields like
// replyCount, indexedAt, etc.) and differ from the raw PDS record shapes.
export type {
  TopicPostInput,
  TopicReplyInput,
  ReactionInput,
  ActorPreferencesInput,
} from '@barazo-forum/lexicons'

export {
  LEXICON_IDS,
  topicPostSchema,
  topicReplySchema,
  reactionSchema,
  actorPreferencesSchema,
} from '@barazo-forum/lexicons'

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

// --- Author Profile (enriched by AppView) ---

export interface AuthorProfile {
  did: string
  handle: string
  displayName: string | null
  avatarUrl: string | null
}

// --- Topics ---

export interface Topic {
  uri: string
  rkey: string
  authorDid: string
  author?: AuthorProfile
  title: string
  content: string
  contentFormat: string | null
  category: string
  tags: string[] | null
  communityDid: string
  cid: string
  replyCount: number
  reactionCount: number
  categoryMaturityRating: MaturityRating
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
  author?: AuthorProfile
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
  jurisdictionCountry: string | null
  ageThreshold: number
  requireLoginForMature: boolean
  createdAt: string
  updatedAt: string
}

export interface PublicSettings {
  communityDid: string | null
  communityName: string
  maturityRating: MaturityRating
  communityDescription: string | null
  communityLogoUrl: string | null
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

export type UserRole = 'user' | 'moderator' | 'admin'

export interface AuthSession {
  accessToken: string
  expiresAt: string
  did: string
  handle: string
  displayName: string | null
  avatarUrl: string | null
  role: UserRole
  crossPostScopesGranted?: boolean
}

export interface AuthUser {
  did: string
  handle: string
  displayName: string | null
  avatarUrl: string | null
  role: UserRole
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

// --- User's own reports (my-reports) ---

export type AppealStatus = 'none' | 'pending' | 'rejected'

export interface MyReport {
  id: number
  reporterDid: string
  targetUri: string
  targetDid: string
  reasonType: ReportReasonType
  description: string | null
  status: 'pending' | 'resolved'
  resolutionType: ReportResolution | null
  resolvedBy: string | null
  resolvedAt: string | null
  appealReason: string | null
  appealedAt: string | null
  appealStatus: AppealStatus
  createdAt: string
}

export interface MyReportsResponse {
  reports: MyReport[]
  cursor: string | null
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
  declaredAge: number | null
  mutedWords: string[]
  blockedDids: string[]
  blockedProfiles: AuthorProfile[]
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

// --- Per-Community Preference Overrides ---

export interface CommunityPreferenceOverride {
  communityDid: string
  communityName: string
  maturityLevel: 'inherit' | 'sfw' | 'mature'
  mutedWords: string[]
  blockedDids: string[]
  blockedProfiles: AuthorProfile[]
}

export interface CommunityPreferencesResponse {
  communities: CommunityPreferenceOverride[]
}

export interface UpdateCommunityPreferenceInput {
  maturityLevel?: 'inherit' | 'sfw' | 'mature'
  mutedWords?: string[]
  blockedDids?: string[]
}

export interface AgeDeclarationResponse {
  success: boolean
  declaredAge: number
}

// --- Setup ---

export type SetupStatus = { initialized: false } | { initialized: true; communityName: string }

export interface InitializeCommunityInput {
  communityName?: string
}

export interface InitializeResponse {
  initialized: true
  adminDid: string
  communityName: string
  communityDid?: string
}

// --- Onboarding Fields ---

export type OnboardingFieldType =
  | 'age_confirmation'
  | 'tos_acceptance'
  | 'newsletter_email'
  | 'custom_text'
  | 'custom_select'
  | 'custom_checkbox'

export interface OnboardingField {
  id: string
  communityDid: string
  fieldType: OnboardingFieldType
  label: string
  description: string | null
  isMandatory: boolean
  sortOrder: number
  config: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface OnboardingFieldsResponse {
  fields: OnboardingField[]
}

export interface CreateOnboardingFieldInput {
  fieldType: OnboardingFieldType
  label: string
  description?: string
  isMandatory?: boolean
  sortOrder?: number
  config?: Record<string, unknown>
}

export interface UpdateOnboardingFieldInput {
  label?: string
  description?: string | null
  isMandatory?: boolean
  sortOrder?: number
  config?: Record<string, unknown> | null
}

export interface OnboardingStatus {
  complete: boolean
  fields: OnboardingField[]
  responses: Record<string, unknown>
  missingFields: Array<{ id: string; label: string; fieldType: OnboardingFieldType }>
}

export interface SubmitOnboardingInput {
  responses: Array<{ fieldId: string; response: unknown }>
}

// --- User Profile (public, with community resolution) ---

export interface UserProfile {
  did: string
  handle: string
  displayName: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  bio: string | null
  role: string
  firstSeenAt: string
  lastActiveAt: string
  accountCreatedAt: string | null
  followersCount: number
  followsCount: number
  atprotoPostsCount: number
  hasBlueskyProfile: boolean
  communityCount: number
  labels: Array<{
    val: string
    src: string
    isSelfLabel: boolean
  }>
  activity: {
    topicCount: number
    replyCount: number
    reactionsReceived: number
    votesReceived: number
  }
  globalActivity?: {
    topicCount: number
    replyCount: number
    reactionsReceived: number
    votesReceived: number
  }
}

// --- Community Profile (own profile in a community) ---

export interface CommunityProfile {
  did: string
  handle: string
  displayName: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  bio: string | null
  communityDid: string
  hasOverride: boolean
  source: {
    displayName: string | null
    avatarUrl: string | null
    bannerUrl: string | null
    bio: string | null
  }
}

export interface UpdateCommunityProfileInput {
  displayName?: string | null
  bio?: string | null
}

export interface UploadResponse {
  url: string
}

// --- Sybil Detection ---

export type SybilClusterStatus = 'flagged' | 'dismissed' | 'monitoring' | 'banned'

export interface SybilCluster {
  id: number
  clusterHash: string
  memberCount: number
  internalEdgeCount: number
  externalEdgeCount: number
  suspicionRatio: number
  status: SybilClusterStatus
  detectedAt: string
  reviewedBy: string | null
  reviewedAt: string | null
}

export interface ClusterMember {
  did: string
  handle: string
  displayName: string
  roleInCluster: 'core' | 'peripheral'
  trustScore: number
  reputationScore: number
  accountAge: string
  communitiesActiveIn: number
}

export interface SybilClusterDetail extends SybilCluster {
  members: ClusterMember[]
}

export interface SybilClustersResponse {
  clusters: SybilCluster[]
}

export interface TrustSeed {
  id: number
  did: string
  handle: string
  displayName: string
  communityId: string | null
  reason: string | null
  implicit: boolean
  createdAt: string
}

export interface TrustSeedsResponse {
  seeds: TrustSeed[]
}

/** The API accepts a handle and resolves it to a DID server-side. */
export interface CreateTrustSeedInput {
  handle: string
  communityId?: string
  reason?: string
}

export interface PdsTrustFactor {
  pdsHost: string
  trustFactor: number
  isDefault: boolean
  updatedAt: string
}

export interface PdsTrustFactorsResponse {
  providers: PdsTrustFactor[]
}

export interface TrustGraphStatus {
  lastComputedAt: string | null
  totalNodes: number
  totalEdges: number
  computationDurationMs: number
  clustersFlagged: number
  nextScheduledAt: string
}

export type BehavioralFlagType = 'burst_voting' | 'content_similarity' | 'low_diversity'
export type BehavioralFlagStatus = 'pending' | 'dismissed' | 'action_taken'

export interface BehavioralFlag {
  id: number
  flagType: BehavioralFlagType
  affectedDids: string[]
  details: string
  detectedAt: string
  status: BehavioralFlagStatus
}

export interface BehavioralFlagsResponse {
  flags: BehavioralFlag[]
}

// --- Shared ---

export type MaturityRating = 'safe' | 'mature' | 'adult'

// --- Pagination ---

export interface PaginationParams {
  limit?: number
  cursor?: string
}
