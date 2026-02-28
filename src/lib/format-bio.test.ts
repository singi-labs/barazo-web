import { describe, it, expect } from 'vitest'
import { formatBio } from './format-bio'

describe('formatBio', () => {
  it('converts newlines to <br> tags', () => {
    const result = formatBio('Line 1\nLine 2')
    expect(result).toContain('<br')
    expect(result).toContain('Line 1')
    expect(result).toContain('Line 2')
  })

  it('autolinks URLs with rel="noopener noreferrer"', () => {
    const result = formatBio('Visit https://example.com for more')
    expect(result).toContain('<a href="https://example.com"')
    expect(result).toContain('rel="noopener noreferrer"')
  })

  it('escapes HTML tags', () => {
    const result = formatBio('<script>alert("xss")</script>')
    expect(result).not.toContain('<script>')
  })

  it('handles mixed content (text + URLs + newlines)', () => {
    const result = formatBio('Hello!\nVisit https://example.com\nBye')
    expect(result).toContain('<br')
    expect(result).toContain('<a href="https://example.com"')
    expect(result).toContain('Hello!')
    expect(result).toContain('Bye')
  })

  it('returns empty string for empty input', () => {
    expect(formatBio('')).toBe('')
  })

  it('handles http URLs', () => {
    const result = formatBio('Visit http://example.com')
    expect(result).toContain('<a href="http://example.com"')
  })

  it('does not link partial URLs', () => {
    const result = formatBio('Not a link: example.com')
    expect(result).not.toContain('<a')
  })
})
