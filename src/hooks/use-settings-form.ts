/**
 * Hook for managing user settings form state and API interactions.
 * Split into community-scoped and global-scoped save handlers.
 * @see specs/prd-web.md Section M8 (Settings page)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { getPreferences, updatePreferences } from '@/lib/api/client'
import { useAuth } from '@/hooks/use-auth'

export type MaturityLevel = 'sfw' | 'sfw-mature'

export interface SettingsValues {
  maturityLevel: MaturityLevel
  mutedWords: string
  blockedDids: string
  crossPostBluesky: boolean
  crossPostFrontpage: boolean
  notifyReplies: boolean
  notifyMentions: boolean
  notifyReactions: boolean
}

const INITIAL_VALUES: SettingsValues = {
  maturityLevel: 'sfw',
  mutedWords: '',
  blockedDids: '',
  crossPostBluesky: true,
  crossPostFrontpage: false,
  notifyReplies: true,
  notifyMentions: true,
  notifyReactions: false,
}

export function useSettingsForm() {
  const { getAccessToken, crossPostScopesGranted, requestCrossPostAuth } = useAuth()
  const [values, setValues] = useState<SettingsValues>(INITIAL_VALUES)
  const [loading, setLoading] = useState(true)
  const [declaredAge, setDeclaredAge] = useState<number | null>(null)
  const [showAgeGate, setShowAgeGate] = useState(false)
  const [showCrossPostAuthDialog, setShowCrossPostAuthDialog] = useState(false)

  // Per-section save state
  const [savingCommunity, setSavingCommunity] = useState(false)
  const [communityError, setCommunityError] = useState<string | null>(null)
  const [communitySuccess, setCommunitySuccess] = useState(false)
  const [savingGlobal, setSavingGlobal] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [globalSuccess, setGlobalSuccess] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }

    getPreferences(token)
      .then((prefs) => {
        setValues({
          maturityLevel: prefs.maturityLevel === 'mature' ? 'sfw-mature' : 'sfw',
          mutedWords: prefs.mutedWords.join(', '),
          blockedDids: prefs.blockedDids.join(', '),
          crossPostBluesky: prefs.crossPostBluesky,
          crossPostFrontpage: prefs.crossPostFrontpage,
          notifyReplies: true,
          notifyMentions: true,
          notifyReactions: false,
        })
        setDeclaredAge(prefs.declaredAge)
      })
      .catch(() => {
        setCommunityError('Failed to load preferences')
        setGlobalError('Failed to load preferences')
      })
      .finally(() => setLoading(false))
  }, [getAccessToken])

  const handleSaveCommunitySettings = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSavingCommunity(true)
      setCommunityError(null)
      setCommunitySuccess(false)

      const token = getAccessToken()
      if (!token) {
        setCommunityError('Not authenticated')
        setSavingCommunity(false)
        return
      }

      try {
        await updatePreferences(
          {
            crossPostBluesky: values.crossPostBluesky,
            crossPostFrontpage: values.crossPostFrontpage,
          },
          token
        )
        setCommunitySuccess(true)
      } catch {
        setCommunityError('Failed to save community settings')
      } finally {
        setSavingCommunity(false)
      }
    },
    [values.crossPostBluesky, values.crossPostFrontpage, getAccessToken]
  )

  const handleSaveGlobalSettings = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSavingGlobal(true)
      setGlobalError(null)
      setGlobalSuccess(false)

      const token = getAccessToken()
      if (!token) {
        setGlobalError('Not authenticated')
        setSavingGlobal(false)
        return
      }

      if (values.maturityLevel === 'sfw-mature' && !declaredAge) {
        setShowAgeGate(true)
        setSavingGlobal(false)
        return
      }

      try {
        const mutedWords = values.mutedWords
          .split(',')
          .map((w) => w.trim())
          .filter(Boolean)

        const blockedDids = values.blockedDids
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean)

        await updatePreferences(
          {
            maturityLevel: values.maturityLevel === 'sfw-mature' ? 'mature' : 'sfw',
            mutedWords,
            blockedDids,
          },
          token
        )
        setGlobalSuccess(true)
      } catch {
        setGlobalError('Failed to save global settings')
      } finally {
        setSavingGlobal(false)
      }
    },
    [values, declaredAge, getAccessToken]
  )

  const handleAgeConfirm = useCallback(
    (age: number) => {
      setDeclaredAge(age)
      setShowAgeGate(false)
      void handleSaveGlobalSettings({ preventDefault: () => {} } as React.FormEvent)
    },
    [handleSaveGlobalSettings]
  )

  const handleAgeCancel = useCallback(() => {
    setShowAgeGate(false)
    setValues((prev) => ({ ...prev, maturityLevel: 'sfw' }))
  }, [])

  const handleCrossPostAuthorize = useCallback(() => {
    setShowCrossPostAuthDialog(false)
    void requestCrossPostAuth()
  }, [requestCrossPostAuth])

  return {
    values,
    setValues,
    loading,
    savingCommunity,
    communityError,
    communitySuccess,
    savingGlobal,
    globalError,
    globalSuccess,
    showAgeGate,
    showCrossPostAuthDialog,
    setShowCrossPostAuthDialog,
    crossPostScopesGranted,
    handleSaveCommunitySettings,
    handleSaveGlobalSettings,
    handleAgeConfirm,
    handleAgeCancel,
    handleCrossPostAuthorize,
  }
}
