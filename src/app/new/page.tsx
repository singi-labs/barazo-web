/**
 * New topic page - Create a new forum topic.
 * URL: /new
 * Client component (requires auth context + form state).
 * @see specs/prd-web.md Section 3.2
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { CreateTopicInput } from '@/lib/api/types'
import { createTopic, getPublicSettings } from '@/lib/api/client'
import { getTopicUrl } from '@/lib/format'
import { ForumLayout } from '@/components/layout/forum-layout'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { TopicForm } from '@/components/topic-form'
import { useOnboardingContext } from '@/context/onboarding-context'
import { useAuth } from '@/hooks/use-auth'

export default function NewTopicPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') ?? ''
  const { getAccessToken } = useAuth()
  const { ensureOnboarded } = useOnboardingContext()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [communityName, setCommunityName] = useState('')

  useEffect(() => {
    getPublicSettings()
      .then((settings) => setCommunityName(settings.communityName))
      .catch(() => {})
  }, [])

  const handleSubmit = async (values: CreateTopicInput) => {
    if (!ensureOnboarded()) return

    setSubmitting(true)
    setError(null)

    try {
      const accessToken = getAccessToken() ?? ''
      const topic = await createTopic(values, accessToken)
      router.push(getTopicUrl(topic))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create topic')
      setSubmitting(false)
    }
  }

  return (
    <ForumLayout communityName={communityName}>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'New topic' }]} />

        <h1 className="text-2xl font-bold text-foreground">Create new topic</h1>

        {error && (
          <div
            className="rounded-md border border-destructive/50 bg-destructive/10 p-4"
            role="alert"
          >
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <TopicForm
          onSubmit={handleSubmit}
          submitting={submitting}
          initialValues={{ category: initialCategory }}
        />
      </div>
    </ForumLayout>
  )
}
