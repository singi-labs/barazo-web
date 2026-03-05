/**
 * New topic page - Create a new forum topic.
 * URL: /new
 * Client component (requires auth context + form state).
 * @see specs/prd-web.md Section 3.2
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { CreateTopicInput, CategoryTreeNode, PublicSettings } from '@/lib/api/types'
import { ApiError, createTopic, getCategories, getPublicSettings } from '@/lib/api/client'
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
  const [heldMessage, setHeldMessage] = useState<string | null>(null)
  const [publicSettings, setPublicSettings] = useState<PublicSettings | null>(null)
  const [categories, setCategories] = useState<CategoryTreeNode[]>([])

  useEffect(() => {
    getPublicSettings()
      .then((settings) => setPublicSettings(settings))
      .catch(() => {})
    getCategories()
      .then((res) => setCategories(res.categories))
      .catch(() => {})
  }, [])

  const handleSubmit = async (values: CreateTopicInput) => {
    if (!ensureOnboarded()) return

    setSubmitting(true)
    setError(null)

    try {
      const accessToken = getAccessToken() ?? ''
      const topic = await createTopic(values, accessToken)

      if (topic.moderationStatus === 'held') {
        setHeldMessage(
          'Your topic has been submitted and is pending moderator review. It will appear once approved.'
        )
        setSubmitting(false)
        return
      }

      router.push(getTopicUrl({ authorHandle: topic.authorHandle, rkey: topic.rkey }))
    } catch (err) {
      if (err instanceof ApiError && err.errorCode === 'Onboarding required') {
        ensureOnboarded()
        setSubmitting(false)
        return
      }
      setError(err instanceof Error ? err.message : 'Failed to create topic')
      setSubmitting(false)
    }
  }

  return (
    <ForumLayout publicSettings={publicSettings}>
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

        {heldMessage && (
          <div
            className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950"
            role="status"
          >
            <p className="text-sm text-blue-800 dark:text-blue-200">{heldMessage}</p>
          </div>
        )}

        <TopicForm
          onSubmit={handleSubmit}
          submitting={submitting}
          categories={categories.length > 0 ? categories : undefined}
          initialValues={{ category: initialCategory }}
        />
      </div>
    </ForumLayout>
  )
}
