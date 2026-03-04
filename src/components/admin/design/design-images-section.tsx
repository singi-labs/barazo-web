/**
 * DesignImagesSection - Branding section: header logo, community logo, and favicon upload.
 */

'use client'

import { ImageUpload } from '@/components/image-upload'
import type { CommunitySettings } from '@/lib/api/types'

interface DesignImagesSectionProps {
  settings: CommunitySettings
  onHeaderLogoUpload: (file: File) => Promise<{ url: string }>
  onHeaderLogoRemove: () => void
  onShowCommunityNameChange: (value: boolean) => void
  onLogoUpload: (file: File) => Promise<{ url: string }>
  onLogoRemove: () => void
  onFaviconUpload: (file: File) => Promise<{ url: string }>
  onFaviconRemove: () => void
}

export function DesignImagesSection({
  settings,
  onHeaderLogoUpload,
  onHeaderLogoRemove,
  onShowCommunityNameChange,
  onLogoUpload,
  onLogoRemove,
  onFaviconUpload,
  onFaviconRemove,
}: DesignImagesSectionProps) {
  return (
    <fieldset className="space-y-6">
      <legend className="text-sm font-medium text-foreground">Branding</legend>

      <div className="space-y-4">
        <ImageUpload
          currentUrl={settings.headerLogoUrl}
          onUpload={onHeaderLogoUpload}
          onRemove={onHeaderLogoRemove}
          label="Header Logo"
          aspectRatio="5/1"
          className="w-full max-w-sm"
        />
        <p className="text-xs text-muted-foreground">
          Wide logo or wordmark for the forum header. Max 600 x 120 px. Accepted formats: JPEG, PNG,
          WebP, GIF.
        </p>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="show-community-name"
            checked={settings.showCommunityName}
            onChange={(e) => onShowCommunityNameChange(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
          />
          <label htmlFor="show-community-name" className="text-sm font-medium text-foreground">
            Show community name in header
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Disable when your header logo already includes the community name.
        </p>
      </div>

      <div>
        <ImageUpload
          currentUrl={settings.communityLogoUrl}
          onUpload={onLogoUpload}
          onRemove={onLogoRemove}
          label="Community Logo"
          aspectRatio="1/1"
          className="w-40"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Recommended: 512&times;512px. Accepted formats: JPEG, PNG, WebP, GIF.
        </p>
      </div>

      <div>
        <ImageUpload
          currentUrl={settings.faviconUrl}
          onUpload={onFaviconUpload}
          onRemove={onFaviconRemove}
          label="Favicon"
          aspectRatio="1/1"
          className="w-16"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Recommended: 256&times;256px. Accepted formats: JPEG, PNG, WebP, GIF.
        </p>
      </div>
    </fieldset>
  )
}
