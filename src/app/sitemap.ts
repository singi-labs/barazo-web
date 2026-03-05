/**
 * Dynamic sitemap generation.
 * Includes homepage, categories (flattened tree), and topics.
 * Excludes Adult-rated categories and their topics.
 * @see specs/prd-web.md Section 5 (Sitemaps)
 */

import type { MetadataRoute } from 'next'
import { getCategories, getTopics } from '@/lib/api/client'
import { getTopicUrl } from '@/lib/format'
import type { CategoryTreeNode } from '@/lib/api/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://barazo.forum'

interface FlatCategory extends CategoryTreeNode {
  path: string
}

function flattenCategories(nodes: CategoryTreeNode[], parentPath = ''): FlatCategory[] {
  const result: FlatCategory[] = []
  for (const node of nodes) {
    const path = parentPath ? `${parentPath}/${node.slug}` : node.slug
    result.push({ ...node, path })
    if (node.children.length > 0) {
      result.push(...flattenCategories(node.children, path))
    }
  }
  return result
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
  ]

  // Fetch categories and topics in parallel, gracefully handling errors
  const [categoriesResult, topicsResult] = await Promise.all([
    getCategories().catch(() => null),
    getTopics({ limit: 1000, sort: 'latest' }).catch(() => null),
  ])

  // Add category pages (exclude Adult-rated)
  if (categoriesResult) {
    const allCategories = flattenCategories(categoriesResult.categories)
    for (const category of allCategories) {
      if (category.maturityRating === 'adult') continue
      entries.push({
        url: `${SITE_URL}/c/${category.path}`,
        lastModified: new Date(category.updatedAt),
        changeFrequency: 'daily',
        priority: 0.8,
      })
    }
  }

  // Add topic pages (exclude Adult-rated)
  if (topicsResult) {
    for (const topic of topicsResult.topics) {
      if (topic.categoryMaturityRating === 'adult') continue
      entries.push({
        url: `${SITE_URL}${getTopicUrl({ authorHandle: topic.author?.handle ?? topic.authorDid, rkey: topic.rkey })}`,
        lastModified: new Date(topic.lastActivityAt),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  }

  return entries
}
