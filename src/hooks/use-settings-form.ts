/**
 * Hook for managing user settings form state and API interactions.
 * @see specs/prd-web.md Section M8 (Settings page)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getPreferences,
  updatePreferences,
  getCommunityPreferences,
  updateCommunityPreference,
} from '@/lib/api/client'
import type { CommunityPreferenceOverride } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

export type MaturityLevel = 'sfw' | 'sfw-mature'

export interface SettingsValues {
  maturityLevel: MaturityLevel
  mutedWords: string
  crossPostBluesky: boolean
  crossPostFrontpage: boolean
  notifyReplies: boolean
  notifyMentions: boolean
  notifyReactions: boolean
}

export interface CommunityOverrideValues {
  communityDid: string
  communityName: string
  maturityLevel: 'inherit' | 'sfw' | 'mature'
  mutedWords: string
  blockedDids: string
}

const INITIAL_VALUES: SettingsValues = {
  maturityLevel: 'sfw',
  mutedWords: '',
  crossPostBluesky: true,
  crossPostFrontpage: false,
  notifyReplies: true,
  notifyMentions: true,
  notifyReactions: false,
}

export function useSettingsForm() {
  const { getAccessToken, crossPostScopesGranted, requestCrossPostAuth } = useAuth()
  const [values, setValues] = useState<SettingsValues>(INITIAL_VALUES)
  const [communityOverrides, setCommunityOverrides] = useState<CommunityOverrideValues[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [declaredAge, setDeclaredAge] = useState<number | null>(null)
  const [showAgeGate, setShowAgeGate] = useState(false)
  const [showCrossPostAuthDialog, setShowCrossPostAuthDialog] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }

    Promise.all([getPreferences(token), getCommunityPreferences(token)])
      .then(([prefs, communityPrefs]) => {
        setValues({
          maturityLevel: prefs.maturityLevel === 'mature' ? 'sfw-mature' : 'sfw',
          mutedWords: prefs.mutedWords.join(', '),
          crossPostBluesky: prefs.crossPostBluesky,
          crossPostFrontpage: prefs.crossPostFrontpage,
          notifyReplies: true,
          notifyMentions: true,
          notifyReactions: false,
        })
        setDeclaredAge(prefs.declaredAge)
        setCommunityOverrides(
          communityPrefs.communities.map(
            (c: CommunityPreferenceOverride): CommunityOverrideValues => ({
              communityDid: c.communityDid,
              communityName: c.communityName,
              maturityLevel: c.maturityLevel,
              mutedWords: c.mutedWords.join(', '),
              blockedDids: c.blockedDids.join(', '),
            })
          )
        )
      })
      .catch(() => setError('Failed to load preferences'))
      .finally(() => setLoading(false))
  }, [getAccessToken])

  const handleCommunityChange = useCallback(
    (communityDid: string, field: keyof CommunityOverrideValues, value: string) => {
      setCommunityOverrides((prev) =>
        prev.map((c) => (c.communityDid === communityDid ? { ...c, [field]: value } : c))
      )
    },
    []
  )

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSaving(true)
      setError(null)
      setSuccess(false)

      const token = getAccessToken()
      if (!token) {
        setError('Not authenticated')
        setSaving(false)
        return
      }

      if (values.maturityLevel === 'sfw-mature' && !declaredAge) {
        setShowAgeGate(true)
        setSaving(false)
        return
      }

      try {
        const mutedWords = values.mutedWords
          .split(',')
          .map((w) => w.trim())
          .filter(Boolean)

        await updatePreferences(
          {
            maturityLevel: values.maturityLevel === 'sfw-mature' ? 'mature' : 'sfw',
            mutedWords,
            crossPostBluesky: values.crossPostBluesky,
            crossPostFrontpage: values.crossPostFrontpage,
          },
          token
        )

        await Promise.all(
          communityOverrides.map((c) =>
            updateCommunityPreference(
              c.communityDid,
              {
                maturityLevel: c.maturityLevel,
                mutedWords: c.mutedWords
                  .split(',')
                  .map((w) => w.trim())
                  .filter(Boolean),
                blockedDids: c.blockedDids
                  .split(',')
                  .map((d) => d.trim())
                  .filter(Boolean),
              },
              token
            )
          )
        )

        setSuccess(true)
      } catch {
        setError('Failed to save preferences')
      } finally {
        setSaving(false)
      }
    },
    [values, communityOverrides, declaredAge, getAccessToken]
  )

  const handleAgeConfirm = useCallback(
    (age: number) => {
      setDeclaredAge(age)
      setShowAgeGate(false)
      void handleSave({ preventDefault: () => {} } as React.FormEvent)
    },
    [handleSave]
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
    communityOverrides,
    saving,
    loading,
    error,
    success,
    showAgeGate,
    showCrossPostAuthDialog,
    setShowCrossPostAuthDialog,
    crossPostScopesGranted,
    handleCommunityChange,
    handleSave,
    handleAgeConfirm,
    handleAgeCancel,
    handleCrossPostAuthorize,
  }
}
