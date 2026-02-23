/**
 * ImageUpload - Reusable image upload component for avatars and banners.
 * Supports client-side validation (file type, max size), upload progress,
 * and remove functionality.
 * @see specs/prd-web.md Section M8 (Settings / Community Profile)
 */

'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { UploadSimple, TrashSimple, User, Image as ImageIcon } from '@phosphor-icons/react'

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

interface ImageUploadProps {
  /** URL of the currently displayed image, or null for placeholder */
  currentUrl: string | null
  /** Upload handler -- receives the File and returns { url } on success */
  onUpload: (file: File) => Promise<{ url: string }>
  /** Optional remove handler -- called when the user clicks "Remove" */
  onRemove?: () => void
  /** Accessible label for the upload area */
  label: string
  /** CSS aspect-ratio value, e.g. "1/1" for avatar, "3/1" for banner */
  aspectRatio?: string
  /** Additional CSS classes for the outer container */
  className?: string
}

export function ImageUpload({
  currentUrl,
  onUpload,
  onRemove,
  label,
  aspectRatio = '1/1',
  className,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAvatar = aspectRatio === '1/1'

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Reset the input so re-selecting the same file triggers onChange
      e.target.value = ''

      // Client-side validation: file type
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError('Please select a JPEG, PNG, WebP, or GIF image.')
        return
      }

      // Client-side validation: file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError('Image must be smaller than 5 MB.')
        return
      }

      setError(null)
      setUploading(true)

      try {
        await onUpload(file)
      } catch {
        setError('Upload failed. Please try again.')
      } finally {
        setUploading(false)
      }
    },
    [onUpload]
  )

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleRemoveClick = useCallback(() => {
    setError(null)
    onRemove?.()
  }, [onRemove])

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-medium text-foreground">{label}</p>

      {/* Image preview area */}
      <div
        className={cn(
          'relative overflow-hidden border border-border bg-muted',
          isAvatar ? 'h-24 w-24 rounded-full' : 'w-full max-w-md rounded-lg'
        )}
        style={{ aspectRatio }}
      >
        {currentUrl ? (
          <Image src={currentUrl} alt={label} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            {isAvatar ? (
              <User size={32} weight="regular" aria-hidden="true" />
            ) : (
              <ImageIcon size={32} weight="regular" aria-hidden="true" />
            )}
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"
              role="status"
              aria-label="Uploading image"
            />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        onChange={handleFileChange}
        className="sr-only"
        aria-label={`Upload ${label}`}
      />

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={uploading}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors',
            'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <UploadSimple size={16} weight="bold" aria-hidden="true" />
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        {onRemove && currentUrl && (
          <button
            type="button"
            onClick={handleRemoveClick}
            disabled={uploading}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors',
              'hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            <TrashSimple size={16} weight="bold" aria-hidden="true" />
            Remove
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
