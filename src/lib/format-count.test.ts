import { describe, it, expect } from 'vitest'
import { formatCount } from './format-count'

describe('formatCount', () => {
  it('returns "0" for zero', () => {
    expect(formatCount(0)).toBe('0')
  })

  it('returns number as-is below 1000', () => {
    expect(formatCount(999)).toBe('999')
  })

  it('formats exact thousands as whole K', () => {
    expect(formatCount(1000)).toBe('1K')
  })

  it('formats non-exact thousands with one decimal', () => {
    expect(formatCount(1500)).toBe('1.5K')
  })

  it('formats 1700 as 1.7K', () => {
    expect(formatCount(1700)).toBe('1.7K')
  })

  it('formats 14100 as 14.1K', () => {
    expect(formatCount(14100)).toBe('14.1K')
  })

  it('formats exact millions as whole M', () => {
    expect(formatCount(1000000)).toBe('1M')
  })

  it('formats non-exact millions with one decimal', () => {
    expect(formatCount(2300000)).toBe('2.3M')
  })
})
