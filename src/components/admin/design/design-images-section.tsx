/**
 * DesignImagesSection - Logo and favicon upload section for the design page.
 */

'use client'

import { ImageUpload } from '@/components/image-upload'
import type { CommunitySettings } from '@/lib/api/types'

interface DesignImagesSectionProps {
  settings: CommunitySettings
  onLogoUpload: (file: File) => Promise<{ url: string }>
  onLogoRemove: () => void
  onFaviconUpload: (file: File) => Promise<{ url: string }>
  onFaviconRemove: () => void
}

export function DesignImagesSection({
  settings,
  onLogoUpload,
  onLogoRemove,
  onFaviconUpload,
  onFaviconRemove,
}: DesignImagesSectionProps) {
  return (
    <fieldset className="space-y-6">
      <legend className="text-sm font-medium text-foreground">Images</legend>

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
