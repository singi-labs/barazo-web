/**
 * Hook for managing user settings form state and API interactions.
 * Split into community-scoped and global-scoped save handlers.
 * @see specs/prd-web.md Section M8 (Settings page)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getPreferences,
  updatePreferences,
  resolveHandles,
  declareAge,
  getCommunityPreferences,
  updateCommunityPreference,
} from '@/lib/api/client'
import type { AuthorProfile } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'
import {
  notificationLevelFromPrefs,
  notificationPrefsFromLevel,
  type NotificationLevel,
} from '@/lib/notification-level'

export type MaturityLevel = 'sfw' | 'sfw-mature'

export interface SettingsValues {
  maturityLevel: MaturityLevel
  mutedWords: string
  blockedUsers: AuthorProfile[]
  crossPostBluesky: boolean
  crossPostFrontpage: boolean
  notificationLevel: NotificationLevel
}

const INITIAL_VALUES: SettingsValues = {
  maturityLevel: 'sfw',
  mutedWords: '',
  blockedUsers: [],
  crossPostBluesky: true,
  crossPostFrontpage: false,
  notificationLevel: 'mentions_only',
}

export function useSettingsForm(communityDid?: string) {
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

    const globalPrefsPromise = getPreferences(token)
    const communityPrefsPromise = communityDid
      ? getCommunityPreferences(token)
      : Promise.resolve(null)

    Promise.all([globalPrefsPromise, communityPrefsPromise])
      .then(([prefs, communityPrefsResponse]) => {
        const communityPrefs = communityDid
          ? (communityPrefsResponse?.communities.find((c) => c.communityDid === communityDid) ??
            null)
          : null

        setValues({
          maturityLevel: prefs.maturityLevel === 'mature' ? 'sfw-mature' : 'sfw',
          mutedWords: prefs.mutedWords.join(', '),
          blockedUsers: prefs.blockedProfiles ?? [],
          crossPostBluesky: prefs.crossPostBluesky,
          crossPostFrontpage: prefs.crossPostFrontpage,
          notificationLevel: notificationLevelFromPrefs(communityPrefs?.notificationPrefs ?? null),
        })
        setDeclaredAge(prefs.declaredAge)
      })
      .catch(() => {
        setCommunityError('Failed to load preferences')
        setGlobalError('Failed to load preferences')
      })
      .finally(() => setLoading(false))
  }, [getAccessToken, communityDid])

  const handleBlockUser = useCallback(
    async (handle: string) => {
      const token = getAccessToken()
      if (!token) throw new Error('Not authenticated')
      const { users } = await resolveHandles([handle], token)
      if (users.length === 0) throw new Error(`Could not find user "${handle}"`)
      const profile = users[0]!
      setValues((prev) => {
        if (prev.blockedUsers.some((u) => u.did === profile.did)) return prev
        return { ...prev, blockedUsers: [...prev.blockedUsers, profile] }
      })
    },
    [getAccessToken]
  )

  const handleUnblockUser = useCallback((did: string) => {
    setValues((prev) => ({
      ...prev,
      blockedUsers: prev.blockedUsers.filter((u) => u.did !== did),
    }))
  }, [])

  const handleAgeChange = useCallback(
    async (age: number) => {
      const token = getAccessToken()
      if (!token) return
      try {
        await declareAge(age, token)
        setDeclaredAge(age)
      } catch {
        setGlobalError('Failed to update age bracket')
      }
    },
    [getAccessToken]
  )

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
        const saves: Promise<unknown>[] = [
          updatePreferences(
            {
              crossPostBluesky: values.crossPostBluesky,
              crossPostFrontpage: values.crossPostFrontpage,
            },
            token
          ),
        ]

        if (communityDid) {
          saves.push(
            updateCommunityPreference(
              communityDid,
              { notificationPrefs: notificationPrefsFromLevel(values.notificationLevel) },
              token
            )
          )
        }

        await Promise.all(saves)
        setCommunitySuccess(true)
      } catch {
        setCommunityError('Failed to save community settings')
      } finally {
        setSavingCommunity(false)
      }
    },
    [
      values.crossPostBluesky,
      values.crossPostFrontpage,
      values.notificationLevel,
      communityDid,
      getAccessToken,
    ]
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

        const blockedDids = values.blockedUsers.map((u) => u.did)

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
    declaredAge,
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
    handleBlockUser,
    handleUnblockUser,
    handleAgeChange,
    handleSaveCommunitySettings,
    handleSaveGlobalSettings,
    handleAgeConfirm,
    handleAgeCancel,
    handleCrossPostAuthorize,
  }
}
