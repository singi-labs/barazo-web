/**
 * Global onboarding context provider.
 * Fetches onboarding status on mount (when authenticated) and provides
 * ensureOnboarded() for any write action to gate behind onboarding completion.
 * Renders the OnboardingModal globally so individual pages don't need to.
 * @see specs/prd-web.md Section M5 (Onboarding)
 */

'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { OnboardingStatus } from '@/lib/api/types'
import { getOnboardingStatus, submitOnboarding } from '@/lib/api/client'
import { useAuth } from '@/hooks/use-auth'
import { OnboardingModal } from '@/components/onboarding-modal'

export interface OnboardingContextValue {
  /** Whether onboarding status is still loading */
  loading: boolean
  /** Whether onboarding is complete (false when status is null/loading) */
  complete: boolean
  /** Whether the onboarding modal is currently shown */
  showModal: boolean
  /** Full onboarding status from the API */
  status: OnboardingStatus | null
  /**
   * Gate function for write actions. Returns true if the user may proceed.
   * Fail-open: returns true when loading, unauthenticated, or status is null.
   * Returns false and opens the modal when onboarding is incomplete.
   */
  ensureOnboarded: () => boolean
  /** Submit onboarding responses, refresh status, close modal on success */
  submit: (responses: Array<{ fieldId: string; response: unknown }>) => Promise<boolean>
  /** Close the onboarding modal */
  closeModal: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

interface OnboardingProviderProps {
  children: ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { isAuthenticated, isLoading: authLoading, getAccessToken } = useAuth()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<OnboardingStatus | null>(null)
  const [showModal, setShowModal] = useState(false)

  const fetchStatus = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const result = await getOnboardingStatus(token)
      setStatus(result)
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      setLoading(false)
      return
    }
    void fetchStatus()
  }, [isAuthenticated, authLoading, fetchStatus])

  const ensureOnboarded = useCallback((): boolean => {
    // Fail-open: allow action when loading, unauthenticated, or status unknown
    if (loading || !isAuthenticated || status === null) {
      return true
    }

    if (status.complete) {
      return true
    }

    // Onboarding incomplete -- open modal
    setShowModal(true)
    return false
  }, [loading, isAuthenticated, status])

  const submit = useCallback(
    async (responses: Array<{ fieldId: string; response: unknown }>): Promise<boolean> => {
      const token = getAccessToken()
      if (!token) return false

      try {
        await submitOnboarding({ responses }, token)
        await fetchStatus()
        setShowModal(false)
        return true
      } catch {
        return false
      }
    },
    [fetchStatus, getAccessToken]
  )

  const closeModal = useCallback(() => {
    setShowModal(false)
  }, [])

  const value = useMemo<OnboardingContextValue>(
    () => ({
      loading,
      complete: status?.complete ?? false,
      showModal,
      status,
      ensureOnboarded,
      submit,
      closeModal,
    }),
    [loading, showModal, status, ensureOnboarded, submit, closeModal]
  )

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      <OnboardingModal
        open={showModal}
        fields={status?.fields ?? []}
        onSubmit={submit}
        onCancel={closeModal}
      />
    </OnboardingContext.Provider>
  )
}

export function useOnboardingContext(): OnboardingContextValue {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider')
  }
  return context
}
