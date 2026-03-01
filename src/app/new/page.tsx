/**
 * New topic page - Create a new forum topic.
 * URL: /new
 * Client component (requires auth context + form state).
 * @see specs/prd-web.md Section 3.2
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { CreateTopicInput } from '@/lib/api/types'
import { createTopic, getPublicSettings } from '@/lib/api/client'
import { getTopicUrl } from '@/lib/format'
import { ForumLayout } from '@/components/layout/forum-layout'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { TopicForm } from '@/components/topic-form'
import { OnboardingModal } from '@/components/onboarding-modal'
import { useOnboarding } from '@/hooks/use-onboarding'
import { useAuth } from '@/hooks/use-auth'

export default function NewTopicPage() {
  const router = useRouter()
  const { getAccessToken } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [communityName, setCommunityName] = useState('')
  const onboarding = useOnboarding()
  const pendingValues = useRef<CreateTopicInput | null>(null)

  useEffect(() => {
    getPublicSettings()
      .then((settings) => setCommunityName(settings.communityName))
      .catch(() => {})
  }, [])

  const doSubmit = async (values: CreateTopicInput) => {
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

  const handleSubmit = async (values: CreateTopicInput) => {
    if (!onboarding.loading && !onboarding.complete) {
      pendingValues.current = values
      onboarding.openModal()
      return
    }
    await doSubmit(values)
  }

  const handleOnboardingComplete = async (
    responses: Array<{ fieldId: string; response: unknown }>
  ) => {
    const success = await onboarding.submit(responses)
    if (success && pendingValues.current) {
      await doSubmit(pendingValues.current)
      pendingValues.current = null
    }
    return success
  }

  return (
    <ForumLayout communityName={communityName}>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'New Topic' }]} />

        <h1 className="text-2xl font-bold text-foreground">Create New Topic</h1>

        {error && (
          <div
            className="rounded-md border border-destructive/50 bg-destructive/10 p-4"
            role="alert"
          >
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <TopicForm onSubmit={handleSubmit} submitting={submitting} />

        <OnboardingModal
          open={onboarding.showModal}
          fields={onboarding.status?.fields ?? []}
          onSubmit={handleOnboardingComplete}
          onCancel={() => {
            onboarding.closeModal()
            pendingValues.current = null
          }}
        />
      </div>
    </ForumLayout>
  )
}
