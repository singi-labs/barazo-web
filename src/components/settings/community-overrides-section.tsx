/**
 * CommunityOverridesSection - Per-community maturity, muted words, blocked users.
 * @see specs/prd-web.md Section M8
 */

'use client'

import { cn } from '@/lib/utils'

interface CommunityOverrideValues {
  communityDid: string
  communityName: string
  maturityLevel: 'inherit' | 'sfw' | 'mature'
  mutedWords: string
  blockedDids: string
}

interface CommunityOverridesSectionProps {
  overrides: CommunityOverrideValues[]
  onChange: (communityDid: string, field: keyof CommunityOverrideValues, value: string) => void
}

export function CommunityOverridesSection({ overrides, onChange }: CommunityOverridesSectionProps) {
  return (
    <fieldset className="space-y-4 rounded-lg border border-border p-4">
      <legend className="px-2 text-sm font-semibold text-foreground">
        Per-Community Overrides
      </legend>

      {overrides.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No community memberships found. Join a community to configure per-community settings.
        </p>
      ) : (
        <div className="space-y-3">
          {overrides.map((community) => (
            <details key={community.communityDid} className="rounded-md border border-border">
              <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50">
                {community.communityName}
              </summary>

              <div className="space-y-3 border-t border-border px-3 py-3">
                <div className="space-y-1">
                  <label
                    htmlFor={`maturity-${community.communityDid}`}
                    className="block text-xs font-medium text-foreground"
                  >
                    Maturity override
                  </label>
                  <select
                    id={`maturity-${community.communityDid}`}
                    value={community.maturityLevel}
                    onChange={(e) =>
                      onChange(community.communityDid, 'maturityLevel', e.target.value)
                    }
                    className={cn(
                      'block w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                  >
                    <option value="inherit">Inherit global setting</option>
                    <option value="sfw">SFW only</option>
                    <option value="mature">SFW + Mature</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor={`muted-words-${community.communityDid}`}
                    className="block text-xs font-medium text-foreground"
                  >
                    Community muted words
                  </label>
                  <textarea
                    id={`muted-words-${community.communityDid}`}
                    value={community.mutedWords}
                    onChange={(e) => onChange(community.communityDid, 'mutedWords', e.target.value)}
                    placeholder="Additional muted words for this community"
                    rows={2}
                    className={cn(
                      'block w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    These are in addition to your global muted words. Comma-separated.
                  </p>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor={`blocked-${community.communityDid}`}
                    className="block text-xs font-medium text-foreground"
                  >
                    Community blocked users
                  </label>
                  <textarea
                    id={`blocked-${community.communityDid}`}
                    value={community.blockedDids}
                    onChange={(e) =>
                      onChange(community.communityDid, 'blockedDids', e.target.value)
                    }
                    placeholder="DIDs of users to block in this community"
                    rows={2}
                    className={cn(
                      'block w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Block specific users only in this community. Comma-separated DIDs.
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </fieldset>
  )
}
