/**
 * Admin content ratings page.
 * URL: /admin/content-ratings
 * Overview of community and category maturity ratings.
 * @see specs/prd-web.md Section M11
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ErrorAlert } from '@/components/error-alert'
import { getCategories, getCommunitySettings } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import type { CategoryTreeNode, CommunitySettings, MaturityRating } from '@/lib/api/types'
import { useAuth } from '@/hooks/use-auth'

const MATURITY_DESCRIPTIONS: Record<MaturityRating, string> = {
  safe: 'Suitable for all audiences. No explicit or mature content.',
  mature: 'May contain mature themes. Not suitable for minors.',
  adult: 'Contains explicit content. Restricted to adults only.',
}

const MATURITY_COLORS: Record<MaturityRating, string> = {
  safe: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  mature: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  adult: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

function CategoryRatingRow({ category, depth }: { category: CategoryTreeNode; depth: number }) {
  return (
    <>
      <tr>
        <td className={cn('py-2 pr-4 text-sm text-foreground', depth > 0 && 'pl-6')}>
          {category.name}
        </td>
        <td className="py-2">
          <span
            className={cn(
              'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
              MATURITY_COLORS[category.maturityRating]
            )}
          >
            {category.maturityRating}
          </span>
        </td>
      </tr>
      {category.children.map((child) => (
        <CategoryRatingRow key={child.id} category={child} depth={depth + 1} />
      ))}
    </>
  )
}

export default function AdminContentRatingsPage() {
  const { getAccessToken } = useAuth()
  const [categories, setCategories] = useState<CategoryTreeNode[]>([])
  const [communitySettings, setCommunitySettings] = useState<CommunitySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setError(null)
    try {
      const [catRes, settingsRes] = await Promise.all([
        getCategories(),
        getCommunitySettings(getAccessToken() ?? ''),
      ])
      setCategories(catRes.categories)
      setCommunitySettings(settingsRes)
    } catch {
      setError('Failed to load content ratings. The API may be unreachable.')
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Content ratings</h1>

        {/* Rating level explanation */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Maturity levels</h2>
          <dl className="space-y-2">
            {(Object.entries(MATURITY_DESCRIPTIONS) as [MaturityRating, string][]).map(
              ([rating, description]) => (
                <div key={rating} className="flex items-start gap-3">
                  <dt>
                    <span
                      className={cn(
                        'inline-block w-16 rounded-full px-2 py-0.5 text-center text-xs font-medium capitalize',
                        MATURITY_COLORS[rating]
                      )}
                    >
                      {rating}
                    </span>
                  </dt>
                  <dd className="text-sm text-muted-foreground">{description}</dd>
                </div>
              )
            )}
          </dl>
        </div>

        {error && <ErrorAlert message={error} variant="page" onRetry={() => void fetchData()} />}

        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

        {/* Community rating */}
        {communitySettings && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-2 text-lg font-semibold text-foreground">Community rating</h2>
            <p className="text-sm text-muted-foreground">
              Current community maturity rating:{' '}
              <span
                className={cn(
                  'inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                  MATURITY_COLORS[communitySettings.maturityRating]
                )}
              >
                {communitySettings.maturityRating}
              </span>
            </p>
          </div>
        )}

        {/* Category ratings table */}
        {!loading && categories.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-lg font-semibold text-foreground">Category ratings</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="pb-2 text-sm font-medium text-muted-foreground">Rating</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <CategoryRatingRow key={category.id} category={category} depth={0} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
