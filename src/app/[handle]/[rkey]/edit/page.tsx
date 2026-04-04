/**
 * Edit topic page - Edit an existing forum topic.
 * URL: /{handle}/{rkey}/edit
 * Client component (requires auth context + form state).
 * @see specs/prd-web.md Section 3.2
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { CreateTopicInput, CategoryTreeNode, PublicSettings, Topic } from '@/lib/api/types'
import {
  getCategories,
  getTopicByAuthorAndRkey,
  updateTopic,
  getPublicSettings,
} from '@/lib/api/client'
import { getTopicUrl } from '@/lib/format'
import { useAuth } from '@/hooks/use-auth'
import { ForumLayout } from '@/components/layout/forum-layout'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { TopicForm } from '@/components/topic-form'

interface EditTopicPageProps {
  params: Promise<{ handle: string; rkey: string }> | { handle: string; rkey: string }
}

export default function EditTopicPage({ params }: EditTopicPageProps) {
  const router = useRouter()
  const { user, isLoading: authLoading, getAccessToken } = useAuth()
  const [handle, setHandle] = useState<string | null>(null)
  const [rkey, setRkey] = useState<string | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  // Resolve params (handles both Promise and plain object)
  useEffect(() => {
    async function resolveParams() {
      const resolved = params instanceof Promise ? await params : params
      setHandle(resolved.handle)
      setRkey(resolved.rkey)
    }
    void resolveParams()
  }, [params])

  // Load topic once handle and rkey are available
  useEffect(() => {
    if (!handle || !rkey) return

    let cancelled = false
    async function loadTopic() {
      try {
        const loaded = await getTopicByAuthorAndRkey(handle!, rkey!)
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
  }, [handle, rkey])

  const buildTopicUrl = (t: Topic) =>
    getTopicUrl({ authorHandle: t.author?.handle ?? t.authorDid, rkey: t.rkey })

  const handleSubmit = async (values: CreateTopicInput) => {
    if (!rkey) return
    setSubmitting(true)
    setError(null)

    try {
      const accessToken = getAccessToken()
      if (!accessToken) {
        setError('You must be logged in to edit a topic.')
        setSubmitting(false)
        return
      }
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
      router.push(buildTopicUrl(updated))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update topic')
      setSubmitting(false)
    }
  }

  if (loading || authLoading) {
    return (
      <ForumLayout publicSettings={publicSettings}>
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
      <ForumLayout publicSettings={publicSettings}>
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Error' }]} />
          <p className="text-destructive" role="alert">
            {error ?? 'Topic not found'}
          </p>
        </div>
      </ForumLayout>
    )
  }

  if (!authLoading && (!user || user.did !== topic.authorDid)) {
    return (
      <ForumLayout publicSettings={publicSettings}>
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Edit' }]} />
          <div className="py-8 text-center">
            <p className="text-muted-foreground">You can only edit your own posts.</p>
            <Link href={buildTopicUrl(topic)} className="text-sm text-primary hover:underline">
              Back to topic
            </Link>
          </div>
        </div>
      </ForumLayout>
    )
  }

  return (
    <ForumLayout publicSettings={publicSettings}>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: topic.category, href: `/c/${topic.category}` },
            { label: topic.title, href: buildTopicUrl(topic) },
            { label: 'Edit' },
          ]}
        />

        <h1 className="text-2xl font-bold text-foreground">Edit topic</h1>

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
          categories={categories.length > 0 ? categories : undefined}
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
