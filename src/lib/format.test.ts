/**
 * Tests for formatting utilities.
 */

import { describe, it, expect } from 'vitest'
import { formatRelativeTime, formatCompactNumber, slugify, getTopicUrl, isEdited } from './format'

describe('formatRelativeTime', () => {
  it('returns "just now" for recent timestamps', () => {
    const now = new Date()
    expect(formatRelativeTime(now.toISOString())).toBe('just now')
  })

  it('returns minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(date.toISOString())).toBe('5m ago')
  })

  it('returns hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000)
    expect(formatRelativeTime(date.toISOString())).toBe('3h ago')
  })
})

describe('formatCompactNumber', () => {
  it('returns number as-is below 1000', () => {
    expect(formatCompactNumber(42)).toBe('42')
  })

  it('formats thousands with k suffix', () => {
    expect(formatCompactNumber(1200)).toBe('1.2k')
  })

  it('formats millions with M suffix', () => {
    expect(formatCompactNumber(3400000)).toBe('3.4M')
  })
})

describe('slugify', () => {
  it('converts title to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Building with the AT Protocol!')).toBe('building-with-the-at-protocol')
  })

  it('collapses multiple hyphens', () => {
    expect(slugify('Hello   ---   World')).toBe('hello-world')
  })

  it('trims leading/trailing hyphens', () => {
    expect(slugify('---Hello World---')).toBe('hello-world')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('untitled')
  })

  it('truncates long slugs', () => {
    const longTitle = 'A'.repeat(200)
    const slug = slugify(longTitle)
    expect(slug.length).toBeLessThanOrEqual(80)
  })
})

describe('getTopicUrl', () => {
  it('generates correct URL from topic', () => {
    const topic = {
      title: 'Welcome to Barazo Forums',
      rkey: '3kf1abc',
    }
    expect(getTopicUrl(topic)).toBe('/t/welcome-to-barazo-forums/3kf1abc')
  })

  it('handles special characters in title', () => {
    const topic = {
      title: 'Feature Request: Dark Mode!',
      rkey: '3kf3ghi',
    }
    expect(getTopicUrl(topic)).toBe('/t/feature-request-dark-mode/3kf3ghi')
  })
})

describe('isEdited', () => {
  it('returns false when timestamps are equal', () => {
    const ts = '2026-01-01T12:00:00.000Z'
    expect(isEdited(ts, ts)).toBe(false)
  })

  it('returns false when difference is under 30 seconds', () => {
    const createdAt = '2026-01-01T12:00:00.000Z'
    const indexedAt = new Date(new Date(createdAt).getTime() + 15_000).toISOString()
    expect(isEdited(createdAt, indexedAt)).toBe(false)
  })

  it('returns true when difference exceeds 30 seconds', () => {
    const createdAt = '2026-01-01T12:00:00.000Z'
    const indexedAt = new Date(new Date(createdAt).getTime() + 60_000).toISOString()
    expect(isEdited(createdAt, indexedAt)).toBe(true)
  })

  it('returns false for invalid date strings', () => {
    expect(isEdited('not-a-date', '2026-01-01T12:00:00.000Z')).toBe(false)
    expect(isEdited('2026-01-01T12:00:00.000Z', 'not-a-date')).toBe(false)
    expect(isEdited('invalid', 'also-invalid')).toBe(false)
  })
})
