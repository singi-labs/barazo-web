/**
 * Admin layout with sidebar navigation.
 * Used by all /admin/* pages.
 * @see specs/prd-web.md Section 4 (AdminLayout)
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChartBar,
  FolderSimple,
  ShieldCheck,
  Gear,
  Tag,
  Users,
  PuzzlePiece,
  ClipboardText,
  ArrowLeft,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
  children: React.ReactNode
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: ChartBar },
  { href: '/admin/categories', label: 'Categories', icon: FolderSimple },
  { href: '/admin/moderation', label: 'Moderation', icon: ShieldCheck },
  { href: '/admin/settings', label: 'Settings', icon: Gear },
  { href: '/admin/content-ratings', label: 'Content Ratings', icon: Tag },
  { href: '/admin/onboarding', label: 'Onboarding', icon: ClipboardText },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/plugins', label: 'Plugins', icon: PuzzlePiece },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Back to forum"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to forum
          </Link>
        </div>

        <nav aria-label="Admin navigation" className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  )
}
