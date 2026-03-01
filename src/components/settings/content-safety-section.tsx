/**
 * ContentSafetySection - Maturity level selector and muted words.
 * @see specs/prd-web.md Section M8
 */

'use client'

import { cn } from '@/lib/utils'

type MaturityLevel = 'sfw' | 'sfw-mature'

interface ContentSafetySectionProps {
  communityName: string
  maturityLevel: MaturityLevel
  mutedWords: string
  blockedDids: string
  onMaturityChange: (level: MaturityLevel) => void
  onMutedWordsChange: (words: string) => void
  onBlockedDidsChange: (dids: string) => void
}

export function ContentSafetySection({
  communityName,
  maturityLevel,
  mutedWords,
  blockedDids,
  onMaturityChange,
  onMutedWordsChange,
  onBlockedDidsChange,
}: ContentSafetySectionProps) {
  const displayName = communityName || 'This community'

  return (
    <fieldset className="space-y-4 rounded-lg border border-border p-4">
      <legend className="px-2 text-sm font-semibold text-foreground">
        Default Content Preferences
      </legend>
      <p className="text-xs text-muted-foreground">
        {displayName} is built with{' '}
        <a
          href="https://barazo.forum"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary-hover"
        >
          Barazo
        </a>
        , forum software built on the{' '}
        <a
          href="https://atproto.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary-hover"
        >
          AT Protocol
        </a>
        , allowing you to use the same identity and login across all Barazo forums. The settings
        below apply to all Barazo communities you join, unless you override them for a specific
        community below.
      </p>

      <div className="space-y-1">
        <label htmlFor="maturity-level" className="block text-sm font-medium text-foreground">
          Maturity level
        </label>
        <select
          id="maturity-level"
          value={maturityLevel}
          onChange={(e) => onMaturityChange(e.target.value as MaturityLevel)}
          className={cn(
            'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <option value="sfw">SFW only</option>
          <option value="sfw-mature">SFW + Mature</option>
        </select>
        <p className="text-xs text-muted-foreground">
          Controls which content you can see. Mature content requires age confirmation.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="muted-words" className="block text-sm font-medium text-foreground">
          Muted words
        </label>
        <textarea
          id="muted-words"
          value={mutedWords}
          onChange={(e) => onMutedWordsChange(e.target.value)}
          placeholder="Enter words separated by commas"
          rows={3}
          className={cn(
            'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        />
        <p className="text-xs text-muted-foreground">
          Posts containing these words will be collapsed. Comma-separated.
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="blocked-users" className="block text-sm font-medium text-foreground">
          Blocked users
        </label>
        <textarea
          id="blocked-users"
          value={blockedDids}
          onChange={(e) => onBlockedDidsChange(e.target.value)}
          placeholder="Enter user handles separated by commas"
          rows={2}
          className={cn(
            'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        />
        <p className="text-xs text-muted-foreground">
          Users blocked here are hidden across all communities. Comma-separated DIDs.
        </p>
      </div>
    </fieldset>
  )
}
