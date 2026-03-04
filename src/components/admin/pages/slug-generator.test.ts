/**
 * Tests for slug generator utility.
 */

import { describe, it, expect } from 'vitest'
import { generateSlug } from './slug-generator'

describe('generateSlug', () => {
  it('converts title to lowercase slug', () => {
    expect(generateSlug('Hello World')).toBe('hello-world')
  })

  it('replaces non-alphanumeric characters with hyphens', () => {
    expect(generateSlug('Privacy & Terms!')).toBe('privacy-terms')
  })

  it('collapses multiple hyphens into one', () => {
    expect(generateSlug('Hello   World --- Test')).toBe('hello-world-test')
  })

  it('trims leading and trailing hyphens', () => {
    expect(generateSlug('---Hello World---')).toBe('hello-world')
  })

  it('truncates to 100 characters', () => {
    const longTitle = 'a'.repeat(150)
    expect(generateSlug(longTitle).length).toBe(100)
  })

  it('handles empty string', () => {
    expect(generateSlug('')).toBe('')
  })

  it('handles special characters', () => {
    expect(generateSlug("What's New? (2026)")).toBe('what-s-new-2026')
  })

  it('handles numbers', () => {
    expect(generateSlug('Version 2.0 Release')).toBe('version-2-0-release')
  })
})
