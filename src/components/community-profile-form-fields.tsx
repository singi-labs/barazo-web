/**
 * CommunityProfileFormFields - Display name and bio inputs for community profile.
 * @see specs/prd-web.md Section M8 (Settings / Community Profile)
 */

import { cn } from '@/lib/utils'
import { FormLabel } from '@/components/ui/form-label'

const DISPLAY_NAME_MAX = 256
const BIO_MAX = 2048

interface CommunityProfileFormFieldsProps {
  displayName: string
  bio: string
  placeholderDisplayName?: string
  placeholderBio?: string
  onDisplayNameChange: (value: string) => void
  onBioChange: (value: string) => void
}

export function CommunityProfileFormFields({
  displayName,
  bio,
  placeholderDisplayName,
  placeholderBio,
  onDisplayNameChange,
  onBioChange,
}: CommunityProfileFormFieldsProps) {
  return (
    <>
      <div className="space-y-1">
        <FormLabel htmlFor="community-display-name" optional>
          Display name
        </FormLabel>
        <input
          id="community-display-name"
          type="text"
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          placeholder={placeholderDisplayName ?? 'Display name'}
          maxLength={DISPLAY_NAME_MAX}
          className={cn(
            'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        />
        <p className="text-xs text-muted-foreground">
          {displayName.length}/{DISPLAY_NAME_MAX} characters. Leave empty to use your AT Protocol
          display name.
        </p>
      </div>

      <div className="space-y-1">
        <FormLabel htmlFor="community-bio" optional>
          Bio
        </FormLabel>
        <textarea
          id="community-bio"
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder={placeholderBio ?? 'Tell the community about yourself'}
          maxLength={BIO_MAX}
          rows={4}
          className={cn(
            'block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        />
        <p className="text-xs text-muted-foreground">
          {bio.length}/{BIO_MAX} characters. Leave empty to use your AT Protocol bio.
        </p>
      </div>
    </>
  )
}
