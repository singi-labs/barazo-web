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

      <ImageUpload
        currentUrl={settings.communityLogoUrl}
        onUpload={onLogoUpload}
        onRemove={onLogoRemove}
        label="Community Logo"
        aspectRatio="1/1"
        className="w-40"
      />

      <ImageUpload
        currentUrl={settings.faviconUrl}
        onUpload={onFaviconUpload}
        onRemove={onFaviconRemove}
        label="Favicon"
        aspectRatio="1/1"
        className="w-16"
      />
    </fieldset>
  )
}
