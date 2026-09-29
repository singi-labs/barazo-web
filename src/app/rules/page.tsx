/**
 * Public community rules page.
 * URL: /rules
 * Displays active community rules visible to all members.
 */

import { getCommunityRules, getPublicSettings } from '@/lib/api/client'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Community Rules',
  description: 'Community rules and guidelines for participation.',
}

export default async function RulesPage() {
  const settings = await getPublicSettings()
  const communityDid = settings.communityDid

  if (!communityDid) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground">Community Rules</h1>
        <p className="mt-4 text-muted-foreground">Community not yet configured.</p>
      </main>
    )
  }

  const response = await getCommunityRules(communityDid)
  const rules = response.data

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold text-foreground">Community Rules</h1>
      {rules.length === 0 ? (
        <p className="mt-4 text-muted-foreground">No community rules have been defined yet.</p>
      ) : (
        <ol className="mt-6 space-y-6">
          {rules.map((rule, index) => (
            <li key={rule.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <h2 className="text-lg font-semibold text-foreground">{rule.title}</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                {rule.description}
              </p>
            </li>
          ))}
        </ol>
      )}
    </main>
  )
}
