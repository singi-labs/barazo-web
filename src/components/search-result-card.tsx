/**
 * SearchResultCard - Renders a single search result with type indicator.
 * @see specs/prd-web.md Section M9
 */

'use client'

import Link from 'next/link'
import { ChatCircle, Article, Heart } from '@phosphor-icons/react'
import type { SearchResult } from '@/lib/api/types'

interface SearchResultCardProps {
  result: SearchResult
  formatDate: (dateStr: string) => string
}

export function SearchResultCard({ result, formatDate }: SearchResultCardProps) {
  const isTopic = result.type === 'topic'
  const authorHandle = result.authorHandle ?? result.authorDid
  const href = `/${authorHandle}/${result.rkey}`

  return (
    <article className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card-hover">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          {isTopic ? (
            <Article size={16} className="text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChatCircle size={16} className="text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground capitalize">
              {result.type}
            </span>
            {result.category && (
              <span className="text-xs text-muted-foreground">{result.category}</span>
            )}
          </div>

          <Link
            href={href}
            className="mt-1 block font-medium text-foreground hover:text-primary hover:underline"
          >
            {isTopic && result.title ? result.title : result.content.slice(0, 100)}
          </Link>

          {!isTopic && result.rootTitle && (
            <p className="mt-1 text-xs text-muted-foreground">
              In topic: <span className="font-medium">{result.rootTitle}</span>
            </p>
          )}

          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatDate(result.publishedAt)}</span>
            <span className="flex items-center gap-1">
              <Heart size={12} aria-hidden="true" />
              {result.reactionCount}
            </span>
            {isTopic && result.replyCount !== null && (
              <span className="flex items-center gap-1">
                <ChatCircle size={12} aria-hidden="true" />
                {result.replyCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
