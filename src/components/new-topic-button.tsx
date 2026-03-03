/**
 * NewTopicButton - Link to create a new topic.
 * Header variant: shown in site header when authenticated.
 * Category variant: shown in category pages, pre-fills category.
 */

'use client'

import Link from 'next/link'
import { PencilSimpleLine } from '@phosphor-icons/react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

interface NewTopicButtonProps {
  variant: 'header' | 'category'
  categorySlug?: string
  categoryName?: string
  className?: string
}

export function NewTopicButton({
  variant,
  categorySlug,
  categoryName,
  className,
}: NewTopicButtonProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading || !isAuthenticated) {
    return null
  }

  if (variant === 'category' && categorySlug && categoryName) {
    return (
      <Link
        href={`/new?category=${encodeURIComponent(categorySlug)}`}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors',
          'hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
      >
        <PencilSimpleLine className="h-4 w-4" weight="bold" aria-hidden="true" />
        New in {categoryName}
      </Link>
    )
  }

  return (
    <Link
      href="/new"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors',
        'hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      <PencilSimpleLine className="h-4 w-4" weight="bold" aria-hidden="true" />
      New Discussion
    </Link>
  )
}
