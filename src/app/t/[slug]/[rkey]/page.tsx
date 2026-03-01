/**
 * Topic detail page - Shows topic post and threaded replies.
 * URL: /t/{slug}/{rkey}
 * Server-side rendered with JSON-LD DiscussionForumPosting.
 * Maturity-aware: Adult topics are noindex'd, Mature topics get rating meta.
 * @see specs/prd-web.md Section 3.1, Section 5
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getTopicByRkey,
  getCategories,
  getReplies,
  getPublicSettings,
  ApiError,
} from '@/lib/api/client'
import { slugify } from '@/lib/format'
import {
  getEffectiveMaturity,
  getMaturityMeta,
  shouldIncludeJsonLd,
  shouldIncludeOgTags,
} from '@/lib/seo'
import { ForumLayout } from '@/components/layout/forum-layout'
import { CategoryNav } from '@/components/category-nav'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { TopicView } from '@/components/topic-view'
import { ReplyThread } from '@/components/reply-thread'
import type { CategoriesResponse, RepliesResponse } from '@/lib/api/types'

export const dynamic = 'force-dynamic'

interface TopicPageProps {
  params: Promise<{ slug: string; rkey: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { rkey } = await params
  try {
    const [topic, publicSettings] = await Promise.all([
      getTopicByRkey(rkey),
      getPublicSettings().catch(() => null),
    ])
    const description =
      topic.content.length > 160 ? topic.content.slice(0, 157) + '...' : topic.content

    const communityRating = publicSettings?.maturityRating ?? 'safe'
    const effectiveMaturity = getEffectiveMaturity(communityRating, topic.categoryMaturityRating)
    const maturityMeta = getMaturityMeta(effectiveMaturity)
    const includeOg = shouldIncludeOgTags(effectiveMaturity)

    return {
      title: topic.title,
      description,
      alternates: {
        canonical: `/t/${slugify(topic.title)}/${rkey}`,
      },
      ...(includeOg
        ? {
            openGraph: {
              title: topic.title,
              description,
              type: 'article',
              publishedTime: topic.createdAt,
            },
          }
        : {}),
      ...maturityMeta,
    }
  } catch {
    return { title: 'Topic Not Found' }
  }
}

const REPLIES_PER_PAGE = 20

export default async function TopicPage({ params }: TopicPageProps) {
  const { rkey } = await params

  let topic
  try {
    topic = await getTopicByRkey(rkey)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound()
    }
    throw error
  }

  // Fetch community settings for maturity context
  const publicSettings = await getPublicSettings().catch(() => null)
  const communityRating = publicSettings?.maturityRating ?? 'safe'
  const effectiveMaturity = getEffectiveMaturity(communityRating, topic.categoryMaturityRating)

  let categoriesResult: CategoriesResponse = { categories: [] }
  let repliesResult: RepliesResponse = { replies: [], cursor: null }

  try {
    ;[categoriesResult, repliesResult] = await Promise.all([
      getCategories(),
      getReplies(topic.uri, { limit: REPLIES_PER_PAGE }),
    ])
  } catch {
    // Non-critical: page still renders with topic but without sidebar/replies
  }

  // Find category name for breadcrumbs
  const findCategoryName = (
    nodes: CategoriesResponse['categories'],
    slug: string
  ): string | undefined => {
    for (const node of nodes) {
      if (node.slug === slug) return node.name
      const found = findCategoryName(node.children, slug)
      if (found) return found
    }
    return undefined
  }

  const categoryName =
    findCategoryName(categoriesResult.categories, topic.category) ?? topic.category

  const communityName = publicSettings?.communityName ?? ''

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: categoryName, href: `/c/${topic.category}` },
    { label: topic.title },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: topic.title,
    text: topic.content,
    author: {
      '@type': 'Person',
      identifier: topic.authorDid,
    },
    datePublished: topic.createdAt,
    dateModified: topic.lastActivityAt,
    commentCount: topic.replyCount,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/LikeAction',
      userInteractionCount: topic.reactionCount,
    },
    url: `https://barazo.forum/t/${encodeURIComponent(topic.title)}/${topic.rkey}`,
  }

  return (
    <ForumLayout
      communityName={communityName}
      sidebar={
        categoriesResult.categories.length > 0 ? (
          <CategoryNav categories={categoriesResult.categories} />
        ) : undefined
      }
    >
      {/* JSON-LD: omitted for Adult content */}
      {shouldIncludeJsonLd(effectiveMaturity) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Topic */}
      <div className="mt-4">
        <TopicView topic={topic} />
      </div>

      {/* Replies */}
      <div className="mt-8">
        <ReplyThread replies={repliesResult.replies} />
      </div>
    </ForumLayout>
  )
}
