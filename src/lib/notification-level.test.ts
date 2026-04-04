/**
 * Tests for notification level utility functions.
 */

import { describe, it, expect } from 'vitest'
import {
  notificationLevelFromPrefs,
  notificationPrefsFromLevel,
  type NotificationLevel,
} from './notification-level'
import type { NotificationPrefs } from '@/lib/api/types'

describe('notificationLevelFromPrefs', () => {
  it('returns "mentions_only" when prefs are null (default)', () => {
    expect(notificationLevelFromPrefs(null)).toBe('mentions_only')
  })

  it('returns "all" when replies, reactions, and mentions are all true', () => {
    const prefs: NotificationPrefs = {
      replies: true,
      reactions: true,
      mentions: true,
      modActions: true,
    }
    expect(notificationLevelFromPrefs(prefs)).toBe('all')
  })

  it('returns "mentions_only" when only mentions is true', () => {
    const prefs: NotificationPrefs = {
      replies: false,
      reactions: false,
      mentions: true,
      modActions: true,
    }
    expect(notificationLevelFromPrefs(prefs)).toBe('mentions_only')
  })

  it('returns "none" when all notification types are false', () => {
    const prefs: NotificationPrefs = {
      replies: false,
      reactions: false,
      mentions: false,
      modActions: true,
    }
    expect(notificationLevelFromPrefs(prefs)).toBe('none')
  })

  it('returns "all" when replies is true even if reactions is false', () => {
    const prefs: NotificationPrefs = {
      replies: true,
      reactions: false,
      mentions: true,
      modActions: false,
    }
    expect(notificationLevelFromPrefs(prefs)).toBe('all')
  })

  it('returns "all" when reactions is true even if replies is false', () => {
    const prefs: NotificationPrefs = {
      replies: false,
      reactions: true,
      mentions: true,
      modActions: false,
    }
    expect(notificationLevelFromPrefs(prefs)).toBe('all')
  })

  it('returns "none" when modActions is false and all others are false', () => {
    const prefs: NotificationPrefs = {
      replies: false,
      reactions: false,
      mentions: false,
      modActions: false,
    }
    expect(notificationLevelFromPrefs(prefs)).toBe('none')
  })
})

describe('notificationPrefsFromLevel', () => {
  it('returns correct prefs for "all" level', () => {
    const prefs = notificationPrefsFromLevel('all')
    expect(prefs).toEqual({
      replies: true,
      reactions: true,
      mentions: true,
      modActions: true,
    })
  })

  it('returns correct prefs for "mentions_only" level', () => {
    const prefs = notificationPrefsFromLevel('mentions_only')
    expect(prefs).toEqual({
      replies: false,
      reactions: false,
      mentions: true,
      modActions: true,
    })
  })

  it('returns correct prefs for "none" level', () => {
    const prefs = notificationPrefsFromLevel('none')
    expect(prefs).toEqual({
      replies: false,
      reactions: false,
      mentions: false,
      modActions: true,
    })
  })

  it('round-trips: level -> prefs -> level', () => {
    const levels: NotificationLevel[] = ['all', 'mentions_only', 'none']
    for (const level of levels) {
      expect(notificationLevelFromPrefs(notificationPrefsFromLevel(level))).toBe(level)
    }
  })
})
