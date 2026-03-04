/**
 * Public page rendering - Displays admin-created static pages.
 * URL: /p/{slug}
 * Server-side rendered with JSON-LD WebPage and OpenGraph metadata.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPageBySlug, getPublicSettings, ApiError } from '@/lib/api/client'
import { ForumLayout } from '@/components/layout/forum-layout'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { MarkdownContent } from '@/components/markdown-content'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://barazo.forum'

/** Truncate content to a max length suitable for meta descriptions. */
function truncateDescription(text: string, maxLength = 157): string {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

interface PublicPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PublicPageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const page = await getPageBySlug(slug)
    const description = page.metaDescription ?? truncateDescription(page.content)

    return {
      title: page.title,
      description,
      alternates: {
        canonical: `/p/${slug}`,
      },
      openGraph: {
        title: page.title,
        description,
        type: 'website',
      },
    }
  } catch {
    return { title: 'Page Not Found' }
  }
}

export default async function PublicPage({ params }: PublicPageProps) {
  const { slug } = await params

  let page
  try {
    page = await getPageBySlug(slug)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound()
    }
    throw error
  }

  let publicSettings = null
  try {
    publicSettings = await getPublicSettings()
  } catch {
    // silently degrade
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.metaDescription ?? truncateDescription(page.content),
    dateModified: page.updatedAt,
    url: `${SITE_URL}/p/${slug}`,
  }

  return (
    <ForumLayout publicSettings={publicSettings}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: page.title }]} />

      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-foreground">{page.title}</h1>
        <MarkdownContent content={page.content} />
      </div>
    </ForumLayout>
  )
}
