/**
 * Utilities for converting between API notificationPrefs objects and a
 * simplified three-level notification level enum used in the settings UI.
 *
 * Levels:
 *  - "all"           — replies, reactions, and mentions enabled
 *  - "mentions_only" — only mentions enabled (API default when no prefs set)
 *  - "none"          — all user-facing notifications disabled
 *
 * modActions is always delivered by the API regardless of user preference and
 * is always set to true in outbound prefs objects.
 */

import type { NotificationPrefs } from '@/lib/api/types'

export type NotificationLevel = 'all' | 'mentions_only' | 'none'

/**
 * Derive the notification level from stored API prefs.
 * Returns "mentions_only" when prefs are null (API default).
 */
export function notificationLevelFromPrefs(prefs: NotificationPrefs | null): NotificationLevel {
  if (prefs === null) return 'mentions_only'
  if (prefs.replies || prefs.reactions) return 'all'
  if (prefs.mentions) return 'mentions_only'
  return 'none'
}

/**
 * Build the notificationPrefs object to send to the API for a given level.
 * modActions is always true (the API ignores it but we send a clean object).
 */
export function notificationPrefsFromLevel(level: NotificationLevel): NotificationPrefs {
  switch (level) {
    case 'all':
      return { replies: true, reactions: true, mentions: true, modActions: true }
    case 'mentions_only':
      return { replies: false, reactions: false, mentions: true, modActions: true }
    case 'none':
      return { replies: false, reactions: false, mentions: false, modActions: true }
  }
}
