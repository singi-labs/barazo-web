/**
 * Homepage - Forum landing page.
 * Shows recent topics, category sidebar, and community overview.
 * Server-side rendered for SEO.
 * @see specs/prd-web.md Section 3.1
 */

import type { Metadata } from 'next'
import { getCategories, getTopics, getPublicSettings } from '@/lib/api/client'
import { ForumLayout } from '@/components/layout/forum-layout'
import { TopicList } from '@/components/topic-list'
import { CategoryNav } from '@/components/category-nav'
import type { CategoriesResponse, TopicsResponse, PublicSettings } from '@/lib/api/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Barazo - Community Forums on the AT Protocol',
  description:
    'Federated community forums with portable identity, user data ownership, and cross-community reputation.',
  alternates: {
    canonical: '/',
  },
}

export default async function HomePage() {
  let categoriesResult: CategoriesResponse = { categories: [] }
  let recentTopics: TopicsResponse = { topics: [], cursor: null }
  let popularTopics: TopicsResponse = { topics: [], cursor: null }
  let publicSettings: PublicSettings | null = null
  let apiError = false

  try {
    ;[categoriesResult, recentTopics, popularTopics, publicSettings] = await Promise.all([
      getCategories(),
      getTopics({ limit: 10, sort: 'latest' }),
      getTopics({ limit: 10, sort: 'popular' }),
      getPublicSettings(),
    ])
  } catch {
    apiError = true
  }

  const communityName = publicSettings?.communityName ?? ''
  const welcomeHeading = communityName ? `Welcome to ${communityName}` : 'Welcome to the Community'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: communityName || 'Barazo',
    url: 'https://barazo.forum',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://barazo.forum/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <ForumLayout
      publicSettings={publicSettings}
      sidebar={
        categoriesResult.categories.length > 0 ? (
          <CategoryNav categories={categoriesResult.categories} />
        ) : undefined
      }
    >
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Welcome / Stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{welcomeHeading}</h1>
        <p className="mt-1 text-muted-foreground">
          Discussions powered by the AT Protocol. Your identity, your data.
        </p>
      </div>

      {apiError ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Unable to connect to the forum API. Please try again later.
          </p>
        </div>
      ) : (
        <>
          {/* Category cards (mobile) */}
          {categoriesResult.categories.length > 0 && (
            <div className="mb-6 lg:hidden">
              <CategoryNav categories={categoriesResult.categories} />
            </div>
          )}

          {/* Pinned Topics — deduplicated from both feeds, shown once at top */}
          {(() => {
            const pinnedMap = new Map<string, (typeof recentTopics.topics)[number]>()
            for (const t of [...recentTopics.topics, ...popularTopics.topics]) {
              if (t.isPinned && !pinnedMap.has(t.uri)) {
                pinnedMap.set(t.uri, t)
              }
            }
            const pinnedTopics = [...pinnedMap.values()]
            const recentFiltered = recentTopics.topics.filter((t) => !t.isPinned)
            const popularFiltered = popularTopics.topics.filter((t) => !t.isPinned)

            return (
              <>
                {pinnedTopics.length > 0 && (
                  <TopicList topics={pinnedTopics} heading="Pinned Topics" />
                )}

                {/* Recent Topics */}
                {recentFiltered.length > 0 && (
                  <div className={pinnedTopics.length > 0 ? 'mt-8' : undefined}>
                    <TopicList topics={recentFiltered} heading="Recent Topics" />
                  </div>
                )}

                {/* Popular Topics */}
                {popularFiltered.length > 0 && (
                  <div className="mt-8">
                    <TopicList topics={popularFiltered} heading="Popular Topics" />
                  </div>
                )}
              </>
            )
          })()}
        </>
      )}
    </ForumLayout>
  )
}
