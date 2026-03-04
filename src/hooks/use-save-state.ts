/**
 * State machine hook for save button feedback.
 * Cycles: idle -> saving -> saved -> idle (2s auto-reset).
 */

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved'

export function useSaveState() {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  const startSaving = useCallback(() => {
    clearTimer()
    setStatus('saving')
  }, [clearTimer])

  const onSaved = useCallback(() => {
    clearTimer()
    setStatus('saved')
    timerRef.current = setTimeout(() => {
      setStatus('idle')
      timerRef.current = null
    }, 2000)
  }, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    setStatus('idle')
  }, [clearTimer])

  return { status, startSaving, onSaved, reset }
}
