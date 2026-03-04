/**
 * Tests for useSaveState hook.
 * State machine: idle -> saving -> saved -> idle (with 2s auto-reset).
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSaveState } from './use-save-state'

describe('useSaveState', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts in idle status', () => {
    const { result } = renderHook(() => useSaveState())
    expect(result.current.status).toBe('idle')
  })

  it('transitions to saving when startSaving is called', () => {
    const { result } = renderHook(() => useSaveState())
    act(() => {
      result.current.startSaving()
    })
    expect(result.current.status).toBe('saving')
  })

  it('transitions to saved when onSaved is called', () => {
    const { result } = renderHook(() => useSaveState())
    act(() => {
      result.current.startSaving()
    })
    act(() => {
      result.current.onSaved()
    })
    expect(result.current.status).toBe('saved')
  })

  it('auto-resets to idle after 2 seconds', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useSaveState())
    act(() => {
      result.current.startSaving()
    })
    act(() => {
      result.current.onSaved()
    })
    expect(result.current.status).toBe('saved')

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.status).toBe('idle')
    vi.useRealTimers()
  })

  it('does not reset before 2 seconds', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useSaveState())
    act(() => {
      result.current.startSaving()
    })
    act(() => {
      result.current.onSaved()
    })

    act(() => {
      vi.advanceTimersByTime(1999)
    })
    expect(result.current.status).toBe('saved')
    vi.useRealTimers()
  })

  it('resets to idle immediately when reset is called', () => {
    const { result } = renderHook(() => useSaveState())
    act(() => {
      result.current.startSaving()
    })
    act(() => {
      result.current.reset()
    })
    expect(result.current.status).toBe('idle')
  })

  it('clears timer on unmount', () => {
    vi.useFakeTimers()
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    const { result, unmount } = renderHook(() => useSaveState())
    act(() => {
      result.current.startSaving()
    })
    act(() => {
      result.current.onSaved()
    })
    unmount()
    expect(clearTimeoutSpy).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('clears previous timer when onSaved is called again', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useSaveState())

    // First save cycle
    act(() => {
      result.current.startSaving()
    })
    act(() => {
      result.current.onSaved()
    })

    // Advance 1s, then start another cycle
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    act(() => {
      result.current.startSaving()
    })
    act(() => {
      result.current.onSaved()
    })

    // After 1.5s from second onSaved, should still be saved
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(result.current.status).toBe('saved')

    // After full 2s from second onSaved, should reset
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current.status).toBe('idle')
    vi.useRealTimers()
  })
})
