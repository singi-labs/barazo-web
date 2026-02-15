/**
 * MutedContentWrapper - Collapses content matching user's muted words.
 * Shows "Content hidden (muted word: {word})" label, expandable on click.
 * Accessible: aria-expanded, screen reader announcements via aria-live.
 * @see specs/prd-web.md Section M8
 */

'use client'

import { useState, type ReactNode } from 'react'
import { EyeSlash, Eye } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface MutedContentWrapperProps {
  content: string
  mutedWords: string[]
  children: ReactNode
  className?: string
}

/**
 * Finds the first muted word that matches as a whole word in the content.
 * Case-insensitive, whole-word matching only (won't match "ass" in "classic").
 */
function findMatchingMutedWord(content: string, mutedWords: string[]): string | null {
  for (const word of mutedWords) {
    if (!word.trim()) continue
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'i')
    if (regex.test(content)) {
      return word
    }
  }
  return null
}

export function MutedContentWrapper({
  content,
  mutedWords,
  children,
  className,
}: MutedContentWrapperProps) {
  const [expanded, setExpanded] = useState(false)

  const matchedWord = findMatchingMutedWord(content, mutedWords)

  if (!matchedWord) {
    return <>{children}</>
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors',
          'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          !expanded && 'bg-muted/30 border border-border'
        )}
      >
        {expanded ? (
          <Eye size={16} weight="regular" aria-hidden="true" />
        ) : (
          <EyeSlash size={16} weight="regular" aria-hidden="true" />
        )}
        {expanded
          ? `Content hidden (muted word: ${matchedWord}) — click to hide`
          : `Content hidden (muted word: ${matchedWord})`}
      </button>

      <span role="status" aria-live="polite" className="sr-only">
        {expanded ? 'Content revealed' : 'Content hidden'}
      </span>

      {expanded && <div className="mt-2">{children}</div>}
    </div>
  )
}
