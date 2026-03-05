/**
 * Category page - Shows topics for a specific category.
 * URL: /c/{slug} or /c/{parentSlug}/{slug} for subcategories.
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
import type { CategoryTreeNode } from '@/lib/api/types'

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>
  searchParams?: Promise<{ page?: string }>
}

/** Find a category in the tree by slug. */
function findCategoryInTree(
  categories: CategoryTreeNode[],
  slug: string
): CategoryTreeNode | undefined {
  for (const cat of categories) {
    if (cat.slug === slug) return cat
    const found = findCategoryInTree(cat.children, slug)
    if (found) return found
  }
  return undefined
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug: slugSegments } = await params
  const categorySlug = slugSegments.at(-1)!
  const canonicalPath = `/c/${slugSegments.join('/')}`

  try {
    const [category, publicSettings] = await Promise.all([
      getCategoryBySlug(categorySlug),
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
        canonical: canonicalPath,
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
  const { slug: slugSegments } = await params
  const categorySlug = slugSegments.at(-1)!
  const canonicalPath = `/c/${slugSegments.join('/')}`
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const page = Math.max(1, parseInt(resolvedSearchParams.page ?? '1', 10) || 1)

  let category
  try {
    category = await getCategoryBySlug(categorySlug)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound()
    }
    throw error
  }

  const [categoriesResult, topicsResult, publicSettings] = await Promise.all([
    getCategories(),
    getTopics({
      category: categorySlug,
      limit: TOPICS_PER_PAGE,
    }),
    getPublicSettings().catch(() => null),
  ])

  const totalPages = Math.max(1, Math.ceil(category.topicCount / TOPICS_PER_PAGE))

  // Build breadcrumbs: Home > [Parent] > Category
  const breadcrumbItems = [{ label: 'Home', href: '/' }]

  if (slugSegments.length > 1) {
    const parentSlug = slugSegments[0]!
    const parentCategory = findCategoryInTree(categoriesResult.categories, parentSlug)
    breadcrumbItems.push({
      label: parentCategory?.name ?? parentSlug,
      href: `/c/${parentSlug}`,
    })
  }

  breadcrumbItems.push({ label: category.name, href: canonicalPath })

  return (
    <ForumLayout
      publicSettings={publicSettings}
      sidebar={<CategoryNav categories={categoriesResult.categories} currentSlug={categorySlug} />}
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
        <NewTopicButton variant="category" categorySlug={categorySlug} categoryName={category.name} />
      </div>

      {/* Topic list */}
      <TopicList topics={topicsResult.topics} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={page} totalPages={totalPages} baseUrl={canonicalPath} />
        </div>
      )}
    </ForumLayout>
  )
}
