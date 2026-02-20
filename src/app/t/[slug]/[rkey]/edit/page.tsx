/**
 * Edit topic page - Edit an existing forum topic.
 * URL: /t/{slug}/{rkey}/edit
 * Client component (requires auth context + form state).
 * @see specs/prd-web.md Section 3.2
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { CreateTopicInput, Topic } from '@/lib/api/types'
import { getTopicByRkey, updateTopic } from '@/lib/api/client'
import { getTopicUrl } from '@/lib/format'
import { ForumLayout } from '@/components/layout/forum-layout'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { TopicForm } from '@/components/topic-form'

interface EditTopicPageProps {
  params: Promise<{ slug: string; rkey: string }> | { slug: string; rkey: string }
}

export default function EditTopicPage({ params }: EditTopicPageProps) {
  const router = useRouter()
  const [rkey, setRkey] = useState<string | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Resolve params (handles both Promise and plain object)
  useEffect(() => {
    async function resolveParams() {
      const resolved = params instanceof Promise ? await params : params
      setRkey(resolved.rkey)
    }
    void resolveParams()
  }, [params])

  // Load topic once rkey is available
  useEffect(() => {
    if (!rkey) return

    let cancelled = false
    async function loadTopic() {
      try {
        const loaded = await getTopicByRkey(rkey!)
        if (!cancelled) {
          setTopic(loaded)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load topic')
          setLoading(false)
        }
      }
    }
    void loadTopic()
    return () => {
      cancelled = true
    }
  }, [rkey])

  const handleSubmit = async (values: CreateTopicInput) => {
    if (!rkey) return
    setSubmitting(true)
    setError(null)

    try {
      // TODO: Get access token from auth context when auth is implemented (#39)
      const accessToken = ''
      const updated = await updateTopic(
        rkey,
        {
          title: values.title,
          content: values.content,
          category: values.category,
          tags: values.tags,
        },
        accessToken
      )
      router.push(getTopicUrl(updated))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update topic')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <ForumLayout>
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Loading...' }]} />
          <p className="text-muted-foreground" aria-busy="true">
            Loading topic...
          </p>
        </div>
      </ForumLayout>
    )
  }

  if (!topic) {
    return (
      <ForumLayout>
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Error' }]} />
          <p className="text-destructive" role="alert">
            {error ?? 'Topic not found'}
          </p>
        </div>
      </ForumLayout>
    )
  }

  return (
    <ForumLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: topic.category, href: `/c/${topic.category}` },
            { label: topic.title, href: getTopicUrl(topic) },
            { label: 'Edit' },
          ]}
        />

        <h1 className="text-2xl font-bold text-foreground">Edit Topic</h1>

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
          mode="edit"
          initialValues={{
            title: topic.title,
            content: topic.content,
            category: topic.category,
            tags: topic.tags ?? undefined,
          }}
        />
      </div>
    </ForumLayout>
  )
}
