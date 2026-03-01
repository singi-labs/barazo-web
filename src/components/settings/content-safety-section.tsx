/**
 * ContentSafetySection - Age bracket, maturity level, muted words, blocked users.
 * @see specs/prd-web.md Section M8
 */

'use client'

import { cn } from '@/lib/utils'
import { AGE_OPTIONS } from '@/lib/constants'
import { UserBlockList } from './user-block-list'
import type { AuthorProfile } from '@/lib/api/types'

type MaturityLevel = 'sfw' | 'sfw-mature'

interface ContentSafetySectionProps {
  maturityLevel: MaturityLevel
  declaredAge: number | null
  mutedWords: string
  blockedUsers: AuthorProfile[]
  onMaturityChange: (level: MaturityLevel) => void
  onAgeChange: (age: number) => void
  onMutedWordsChange: (words: string) => void
  onBlockUser: (handle: string) => Promise<void>
  onUnblockUser: (did: string) => void
}

export function ContentSafetySection({
  maturityLevel,
  declaredAge,
  mutedWords,
  blockedUsers,
  onMaturityChange,
  onAgeChange,
  onMutedWordsChange,
  onBlockUser,
  onUnblockUser,
}: ContentSafetySectionProps) {
  return (
    <fieldset className="space-y-4 rounded-lg border border-border p-4">
      <legend className="px-2 text-sm font-semibold text-foreground">Content Safety</legend>

      <div className="space-y-1">
        <label htmlFor="age-bracket" className="block text-sm font-medium text-foreground">
          Age bracket
        </label>
        <select
          id="age-bracket"
          value={declaredAge ?? ''}
          onChange={(e) => onAgeChange(Number(e.target.value))}
          className={cn(
            'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <option value="" disabled>
            Select your age bracket
          </option>
          {AGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Your age bracket determines which content is available. Selecting &quot;Rather not
          say&quot; restricts you to safe content only.
        </p>
      </div>

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

      <UserBlockList
        users={blockedUsers}
        onAdd={onBlockUser}
        onRemove={onUnblockUser}
        label="Blocked users"
        description="Users blocked here are hidden across all communities."
      />
    </fieldset>
  )
}
