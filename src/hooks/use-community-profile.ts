/**
 * useCommunityProfile - Manages community profile data loading and mutations.
 * Handles loading community DID, profile data, save, reset, and image upload/remove.
 * @see specs/prd-web.md Section M8 (Settings / Community Profile)
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  getPublicSettings,
  getCommunityProfile,
  updateCommunityProfile,
  resetCommunityProfile,
  uploadCommunityAvatar,
  uploadCommunityBanner,
} from '@/lib/api/client'
import type { CommunityProfile } from '@/lib/api/types'

interface UseCommunityProfileReturn {
  communityDid: string | null
  profile: CommunityProfile | null
  loading: boolean
  saving: boolean
  error: string | null
  success: boolean
  displayName: string
  bio: string
  setDisplayName: (v: string) => void
  setBio: (v: string) => void
  handleSave: (e: React.FormEvent) => void
  handleReset: () => void
  handleAvatarUpload: (file: File) => Promise<{ url: string }>
  handleBannerUpload: (file: File) => Promise<{ url: string }>
  handleAvatarRemove: () => void
  handleBannerRemove: () => void
  setShowResetConfirm: (show: boolean) => void
  showResetConfirm: boolean
}

export function useCommunityProfile(): UseCommunityProfileReturn {
  const { getAccessToken, isAuthenticated } = useAuth()

  const [communityDid, setCommunityDid] = useState<string | null>(null)
  const [profile, setProfile] = useState<CommunityProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadProfile() {
      try {
        const publicSettings = await getPublicSettings()
        const did = publicSettings.communityDid
        if (!did) {
          if (!cancelled) setLoading(false)
          return
        }

        if (!cancelled) setCommunityDid(did)

        const currentToken = token
        if (!currentToken) return

        const communityProfile = await getCommunityProfile(did, currentToken)
        if (!cancelled) {
          setProfile(communityProfile)
          setDisplayName(communityProfile.hasOverride ? (communityProfile.displayName ?? '') : '')
          setBio(communityProfile.hasOverride ? (communityProfile.bio ?? '') : '')
        }
      } catch {
        if (!cancelled) setError('Failed to load community profile.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadProfile()
    return () => {
      cancelled = true
    }
  }, [getAccessToken, isAuthenticated])

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!communityDid) return

      const token = getAccessToken()
      if (!token) {
        setError('Not authenticated')
        return
      }

      setSaving(true)
      setError(null)
      setSuccess(false)

      try {
        await updateCommunityProfile(
          communityDid,
          { displayName: displayName.trim() || null, bio: bio.trim() || null },
          token
        )
        const updatedProfile = await getCommunityProfile(communityDid, token)
        setProfile(updatedProfile)
        setSuccess(true)
      } catch {
        setError('Failed to save community profile.')
      } finally {
        setSaving(false)
      }
    },
    [communityDid, displayName, bio, getAccessToken]
  )

  const handleReset = useCallback(async () => {
    if (!communityDid) return

    const token = getAccessToken()
    if (!token) {
      setError('Not authenticated')
      return
    }

    setShowResetConfirm(false)
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await resetCommunityProfile(communityDid, token)
      const updatedProfile = await getCommunityProfile(communityDid, token)
      setProfile(updatedProfile)
      setDisplayName('')
      setBio('')
      setSuccess(true)
    } catch {
      setError('Failed to reset community profile.')
    } finally {
      setSaving(false)
    }
  }, [communityDid, getAccessToken])

  const handleAvatarUpload = useCallback(
    async (file: File): Promise<{ url: string }> => {
      if (!communityDid) throw new Error('No community DID')
      const token = getAccessToken()
      if (!token) throw new Error('Not authenticated')

      const result = await uploadCommunityAvatar(communityDid, file, token)
      const updatedProfile = await getCommunityProfile(communityDid, token)
      setProfile(updatedProfile)
      return result
    },
    [communityDid, getAccessToken]
  )

  const handleBannerUpload = useCallback(
    async (file: File): Promise<{ url: string }> => {
      if (!communityDid) throw new Error('No community DID')
      const token = getAccessToken()
      if (!token) throw new Error('Not authenticated')

      const result = await uploadCommunityBanner(communityDid, file, token)
      const updatedProfile = await getCommunityProfile(communityDid, token)
      setProfile(updatedProfile)
      return result
    },
    [communityDid, getAccessToken]
  )

  const handleAvatarRemove = useCallback(async () => {
    if (!communityDid) return
    const token = getAccessToken()
    if (!token) return

    try {
      await updateCommunityProfile(
        communityDid,
        { displayName: displayName.trim() || null, bio: bio.trim() || null },
        token
      )
      const updatedProfile = await getCommunityProfile(communityDid, token)
      setProfile(updatedProfile)
    } catch {
      setError('Failed to remove avatar.')
    }
  }, [communityDid, displayName, bio, getAccessToken])

  const handleBannerRemove = useCallback(async () => {
    if (!communityDid) return
    const token = getAccessToken()
    if (!token) return

    try {
      await updateCommunityProfile(
        communityDid,
        { displayName: displayName.trim() || null, bio: bio.trim() || null },
        token
      )
      const updatedProfile = await getCommunityProfile(communityDid, token)
      setProfile(updatedProfile)
    } catch {
      setError('Failed to remove banner.')
    }
  }, [communityDid, displayName, bio, getAccessToken])

  return {
    communityDid,
    profile,
    loading,
    saving,
    error,
    success,
    displayName,
    bio,
    setDisplayName,
    setBio,
    handleSave,
    handleReset,
    handleAvatarUpload,
    handleBannerUpload,
    handleAvatarRemove,
    handleBannerRemove,
    showResetConfirm,
    setShowResetConfirm,
  }
}
