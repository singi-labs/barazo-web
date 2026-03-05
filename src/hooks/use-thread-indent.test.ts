import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useThreadIndent } from './use-thread-indent'

vi.mock('./use-media-query', () => ({
  useMediaQuery: vi.fn(),
}))

import { useMediaQuery } from './use-media-query'
const mockUseMediaQuery = vi.mocked(useMediaQuery)

describe('useThreadIndent', () => {
  beforeEach(() => {
    mockUseMediaQuery.mockReset()
  })

  it('returns desktop indent step for wide viewports', () => {
    mockUseMediaQuery.mockImplementation((q: string) => {
      if (q === '(min-width: 768px)') return true
      if (q === '(min-width: 481px)') return true
      return false
    })
    const { result } = renderHook(() => useThreadIndent())
    expect(result.current.indentStep).toBe(22)
    expect(result.current.showChevron).toBe(true)
  })

  it('returns tablet indent step for medium viewports', () => {
    mockUseMediaQuery.mockImplementation((q: string) => {
      if (q === '(min-width: 768px)') return false
      if (q === '(min-width: 481px)') return true
      return false
    })
    const { result } = renderHook(() => useThreadIndent())
    expect(result.current.indentStep).toBe(16)
    expect(result.current.showChevron).toBe(true)
  })

  it('returns mobile indent step and hides chevron for narrow viewports', () => {
    mockUseMediaQuery.mockImplementation(() => false)
    const { result } = renderHook(() => useThreadIndent())
    expect(result.current.indentStep).toBe(8)
    expect(result.current.showChevron).toBe(false)
  })
})
