/**
 * Reply permalink page stub.
 * URL: /{handle}/{rkey}/{replyAuthor}/{replyRkey}
 * Full implementation deferred -- redirects to the topic page for now.
 */

import { redirect } from 'next/navigation'

interface ReplyPermalinkPageProps {
  params: Promise<{
    handle: string
    rkey: string
    replyAuthor: string
    replyRkey: string
  }>
}

export default async function ReplyPermalinkPage({ params }: ReplyPermalinkPageProps) {
  const { handle, rkey } = await params
  redirect(`/${handle}/${rkey}`)
}
