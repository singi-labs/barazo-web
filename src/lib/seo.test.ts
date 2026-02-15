/**
 * Tests for maturity-aware SEO helpers.
 * @see src/lib/seo.ts
 */

import { describe, it, expect } from 'vitest'
import {
  getEffectiveMaturity,
  getMaturityMeta,
  shouldIncludeJsonLd,
  shouldIncludeOgTags,
} from './seo'

describe('getEffectiveMaturity', () => {
  it('returns safe when both ratings are safe', () => {
    expect(getEffectiveMaturity('safe', 'safe')).toBe('safe')
  })

  it('returns mature when community is safe and category is mature', () => {
    expect(getEffectiveMaturity('safe', 'mature')).toBe('mature')
  })

  it('returns mature when community is mature and category is safe', () => {
    expect(getEffectiveMaturity('mature', 'safe')).toBe('mature')
  })

  it('returns adult when community is adult and category is safe', () => {
    expect(getEffectiveMaturity('adult', 'safe')).toBe('adult')
  })

  it('returns adult when community is safe and category is adult', () => {
    expect(getEffectiveMaturity('safe', 'adult')).toBe('adult')
  })

  it('returns adult when both are adult', () => {
    expect(getEffectiveMaturity('adult', 'adult')).toBe('adult')
  })

  it('returns adult when community is mature and category is adult', () => {
    expect(getEffectiveMaturity('mature', 'adult')).toBe('adult')
  })
})

describe('getMaturityMeta', () => {
  it('returns empty object for safe rating', () => {
    expect(getMaturityMeta('safe')).toEqual({})
  })

  it('returns rating meta for mature', () => {
    const meta = getMaturityMeta('mature')
    expect(meta).toEqual({ other: { rating: 'mature' } })
  })

  it('returns noindex/nofollow for adult', () => {
    const meta = getMaturityMeta('adult')
    expect(meta).toEqual({ robots: { index: false, follow: false } })
  })
})

describe('shouldIncludeJsonLd', () => {
  it('returns true for safe', () => {
    expect(shouldIncludeJsonLd('safe')).toBe(true)
  })

  it('returns true for mature', () => {
    expect(shouldIncludeJsonLd('mature')).toBe(true)
  })

  it('returns false for adult', () => {
    expect(shouldIncludeJsonLd('adult')).toBe(false)
  })
})

describe('shouldIncludeOgTags', () => {
  it('returns true for safe', () => {
    expect(shouldIncludeOgTags('safe')).toBe(true)
  })

  it('returns true for mature', () => {
    expect(shouldIncludeOgTags('mature')).toBe(true)
  })

  it('returns false for adult', () => {
    expect(shouldIncludeOgTags('adult')).toBe(false)
  })
})
