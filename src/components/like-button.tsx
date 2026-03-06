/**
 * LikeButton - Interactive heart button for liking/unliking topics and replies.
 * Fetches current user's like status on mount and handles optimistic updates.
 * @see specs/prd-web.md Section M7 (Reactions + Moderation UI)
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Heart } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/use-auth'
import { useOnboardingContext } from '@/context/onboarding-context'
import { useToast } from '@/hooks/use-toast'
import { getReactions, createReaction, deleteReaction } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import { formatCompactNumber } from '@/lib/format'

interface LikeButtonProps {
  subjectUri: string
  subjectCid: string
  initialCount: number
  size?: 'sm' | 'md'
  disabled?: boolean
  className?: string
}

export function LikeButton({
  subjectUri,
  subjectCid,
  initialCount,
  size = 'md',
  disabled = false,
  className,
}: LikeButtonProps) {
  const { user, isAuthenticated, getAccessToken } = useAuth()
  const { ensureOnboarded } = useOnboardingContext()
  const { toast } = useToast()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [pending, setPending] = useState(false)
  const reactionUriRef = useRef<string | null>(null)

  // Fetch the current user's like status on mount
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const token = getAccessToken()
    if (!token) return

    let cancelled = false

    async function fetchLikeStatus() {
      try {
        const result = await getReactions(
          subjectUri,
          { type: 'like' },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        if (cancelled) return

        const userReaction = result.reactions.find((r) => r.authorDid === user!.did)
        if (userReaction) {
          setLiked(true)
          reactionUriRef.current = userReaction.uri
        }
      } catch {
        // Non-critical: button still works, just won't show pre-existing like state
      }
    }

    void fetchLikeStatus()
    return () => {
      cancelled = true
    }
  }, [subjectUri, isAuthenticated, user, getAccessToken])

  const handleToggle = useCallback(async () => {
    if (!ensureOnboarded()) return
    const token = getAccessToken()
    if (!token || pending) return

    const wasLiked = liked
    const previousCount = count
    const previousUri = reactionUriRef.current

    // Optimistic update
    if (wasLiked) {
      setLiked(false)
      setCount(Math.max(0, previousCount - 1))
    } else {
      setLiked(true)
      setCount(previousCount + 1)
    }

    setPending(true)

    try {
      if (wasLiked && previousUri) {
        await deleteReaction(previousUri, token)
        reactionUriRef.current = null
      } else {
        const result = await createReaction({ subjectUri, subjectCid, type: 'like' }, token)
        reactionUriRef.current = result.uri
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update reaction'
      const isNotFound = message === 'Not Found' || message.includes('not found')

      if (wasLiked && isNotFound) {
        // Reaction was already deleted server-side -- accept the unliked state
        reactionUriRef.current = null
      } else {
        // Revert optimistic update
        setLiked(wasLiked)
        setCount(previousCount)
        reactionUriRef.current = previousUri
        toast({ title: 'Error', description: message, variant: 'destructive' })
      }
    } finally {
      setPending(false)
    }
  }, [liked, count, pending, subjectUri, subjectCid, getAccessToken, ensureOnboarded, toast])

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={`${formatCompactNumber(count)} reactions`}
      disabled={disabled || !isAuthenticated}
      onClick={handleToggle}
      className={cn(
        'inline-flex items-center gap-1.5 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded',
        'disabled:cursor-not-allowed disabled:opacity-50',
        liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      <Heart className={iconSize} weight={liked ? 'fill' : 'regular'} aria-hidden="true" />
      <span>{formatCompactNumber(count)}</span>
    </button>
  )
}
