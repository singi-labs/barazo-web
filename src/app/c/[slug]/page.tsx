/**
 * Category page - Shows topics for a specific category.
 * URL: /c/{slug}
 * Server-side rendered with SEO metadata and JSON-LD.
 * Maturity-aware: Adult categories are noindex'd, Mature get rating meta.
 * @see specs/prd-web.md Section 3.1
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getCategoryBySlug,
  getCategories,
  getTopics,
  getPublicSettings,
  ApiError,
} from '@/lib/api/client'
import { getEffectiveMaturity, getMaturityMeta, shouldIncludeOgTags } from '@/lib/seo'

export const dynamic = 'force-dynamic'
import { ForumLayout } from '@/components/layout/forum-layout'
import { TopicList } from '@/components/topic-list'
import { CategoryNav } from '@/components/category-nav'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Pagination } from '@/components/pagination'
import { NewTopicButton } from '@/components/new-topic-button'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const [category, publicSettings] = await Promise.all([
      getCategoryBySlug(slug),
      getPublicSettings().catch(() => null),
    ])

    const communityRating = publicSettings?.maturityRating ?? 'safe'
    const effectiveMaturity = getEffectiveMaturity(communityRating, category.maturityRating)
    const maturityMeta = getMaturityMeta(effectiveMaturity)
    const includeOg = shouldIncludeOgTags(effectiveMaturity)

    return {
      title: category.name,
      description: category.description ?? `Topics in ${category.name}`,
      alternates: {
        canonical: `/c/${slug}`,
      },
      ...(includeOg
        ? {
            openGraph: {
              title: category.name,
              description: category.description ?? `Topics in ${category.name}`,
              type: 'website',
            },
          }
        : {}),
      ...maturityMeta,
    }
  } catch {
    return { title: 'Category Not Found' }
  }
}

const TOPICS_PER_PAGE = 20

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const page = Math.max(1, parseInt(resolvedSearchParams.page ?? '1', 10) || 1)

  let category
  try {
    category = await getCategoryBySlug(slug)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound()
    }
    throw error
  }

  const [categoriesResult, topicsResult, publicSettings] = await Promise.all([
    getCategories(),
    getTopics({
      category: slug,
      limit: TOPICS_PER_PAGE,
    }),
    getPublicSettings().catch(() => null),
  ])

  const totalPages = Math.max(1, Math.ceil(category.topicCount / TOPICS_PER_PAGE))

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: category.name, href: `/c/${slug}` },
  ]

  return (
    <ForumLayout
      publicSettings={publicSettings}
      sidebar={<CategoryNav categories={categoriesResult.categories} currentSlug={slug} />}
    >
      {/* Breadcrumbs (includes JSON-LD BreadcrumbList) */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Category header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
        {category.description && (
          <p className="mt-1 text-muted-foreground">{category.description}</p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {category.topicCount} {category.topicCount === 1 ? 'topic' : 'topics'}
        </p>
      </div>

      {/* New topic button */}
      <div className="mb-4 flex justify-end">
        <NewTopicButton variant="category" categorySlug={slug} categoryName={category.name} />
      </div>

      {/* Topic list */}
      <TopicList topics={topicsResult.topics} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={page} totalPages={totalPages} baseUrl={`/c/${slug}`} />
        </div>
      )}
    </ForumLayout>
  )
}
