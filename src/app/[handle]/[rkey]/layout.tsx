import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Topic',
}

export default function TopicLayout({ children }: { children: React.ReactNode }) {
  return children
}
