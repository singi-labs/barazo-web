/**
 * Hook to check and manage community onboarding status.
 * Returns onboarding state and a function to trigger the onboarding modal.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { getOnboardingStatus, submitOnboarding } from '@/lib/api/client'
import type { OnboardingStatus, OnboardingFieldType } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

export interface UseOnboardingResult {
  /** Whether onboarding status has been loaded */
  loading: boolean
  /** Whether onboarding is complete */
  complete: boolean
  /** Whether the onboarding modal should be shown */
  showModal: boolean
  /** The full onboarding status from the API */
  status: OnboardingStatus | null
  /** Open the onboarding modal */
  openModal: () => void
  /** Close the onboarding modal */
  closeModal: () => void
  /** Submit onboarding responses and refresh status */
  submit: (responses: Array<{ fieldId: string; response: unknown }>) => Promise<boolean>
  /** Refresh onboarding status from the API */
  refresh: () => Promise<void>
}

export function useOnboarding(): UseOnboardingResult {
  const { getAccessToken } = useAuth()
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
      // Set status to null so callers can detect the error state.
      // The UI will still function -- onboarding won't block posting
      // if we can't determine onboarding status.
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    void fetchStatus()
  }, [fetchStatus])

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

  return {
    loading,
    complete: status?.complete ?? false,
    showModal,
    status,
    openModal: () => setShowModal(true),
    closeModal: () => setShowModal(false),
    submit,
    refresh: fetchStatus,
  }
}

/** Type label map for rendering in the modal */
export const ONBOARDING_FIELD_TYPE_LABELS: Record<OnboardingFieldType, string> = {
  age_confirmation: 'Age Confirmation',
  tos_acceptance: 'Terms of Service',
  newsletter_email: 'Newsletter Email',
  custom_text: 'Text',
  custom_select: 'Select',
  custom_checkbox: 'Checkbox',
}
