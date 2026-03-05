/**
 * Formatting utilities for display values.
 */

/**
 * Formats an ISO date string as a relative time (e.g., "2h ago", "3d ago").
 */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)

  if (diffSeconds < 60) return 'just now'

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths}mo ago`

  const diffYears = Math.floor(diffMonths / 12)
  return `${diffYears}y ago`
}

/**
 * Formats an ISO date string as a short date/time (e.g., "Jan 15, 3:42 PM").
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Formats an ISO date string as a short date without time (e.g., "Jan 15, 2026").
 */
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Formats an ISO date string as a long date (e.g., "January 15, 2026").
 */
export function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Formats a number with locale-aware separators (e.g., 1,234).
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

/**
 * Formats a number with compact notation (e.g., 1.2k, 3.4M).
 */
export function formatCompactNumber(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
}

/**
 * Converts a string to a URL-safe slug.
 */
export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')

  return slug || 'untitled'
}

/**
 * Generates a topic URL from a topic's author handle and rkey.
 */
export function getTopicUrl(topic: { authorHandle: string; rkey: string }): string {
  return `/${topic.authorHandle}/${topic.rkey}`
}

/**
 * Generates a reply permalink URL.
 */
export function getReplyUrl(params: {
  topicAuthorHandle: string
  topicRkey: string
  replyAuthorHandle: string
  replyRkey: string
}): string {
  return `/${params.topicAuthorHandle}/${params.topicRkey}/${params.replyAuthorHandle}/${params.replyRkey}`
}

/**
 * Returns true if a post was edited (indexedAt differs from createdAt by more than 30 seconds).
 */
export function isEdited(createdAt: string, indexedAt: string): boolean {
  const created = new Date(createdAt).getTime()
  const indexed = new Date(indexedAt).getTime()
  if (Number.isNaN(created) || Number.isNaN(indexed)) return false
  return indexed - created > 30_000
}
