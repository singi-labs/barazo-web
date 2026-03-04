/**
 * Admin layout with sidebar navigation.
 * Desktop: persistent sidebar. Mobile (<768px): hamburger + slide-in drawer.
 * Used by all /admin/* pages.
 * @see specs/prd-web.md Section 4 (AdminLayout)
 */

'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import {
  ChartBar,
  FolderSimple,
  ShieldCheck,
  Gear,
  PaintBrush,
  Tag,
  Users,
  PuzzlePiece,
  ClipboardText,
  ArrowLeft,
  ShieldWarning,
  SealCheck,
  List,
  X,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
  children: React.ReactNode
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: ChartBar },
  { href: '/admin/categories', label: 'Categories', icon: FolderSimple },
  { href: '/admin/moderation', label: 'Moderation', icon: ShieldCheck },
  { href: '/admin/sybil-detection', label: 'Sybil Detection', icon: ShieldWarning },
  { href: '/admin/trust-seeds', label: 'Trust Seeds', icon: SealCheck },
  { href: '/admin/settings', label: 'Settings', icon: Gear },
  { href: '/admin/design', label: 'Design', icon: PaintBrush },
  { href: '/admin/content-ratings', label: 'Content Ratings', icon: Tag },
  { href: '/admin/onboarding', label: 'Onboarding', icon: ClipboardText },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/plugins', label: 'Plugins', icon: PuzzlePiece },
]

function AdminNav({
  pathname,
  onLinkClick,
}: {
  pathname: string
  onLinkClick?: () => void
}) {
  return (
    <>
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Back to forum"
          onClick={onLinkClick}
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
                  onClick={onLinkClick}
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
    </>
  )
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center border-b border-border bg-card px-4 md:hidden">
        <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              aria-label="Open admin menu"
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <List size={20} aria-hidden="true" />
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
            <Dialog.Content
              aria-label="Admin menu"
              aria-describedby={undefined}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card shadow-lg data-[state=closed]:animate-slide-out-left data-[state=open]:animate-slide-in-left"
            >
              <Dialog.Title className="sr-only">Admin menu</Dialog.Title>
              <div className="flex h-14 items-center justify-between border-b border-border px-4">
                <span aria-hidden="true" className="text-sm font-medium text-foreground">Admin</span>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Close admin menu"
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </div>

              <AdminNav pathname={pathname} onLinkClick={closeDrawer} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <span className="ml-3 text-sm font-medium text-foreground">Admin</span>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <AdminNav pathname={pathname} />
      </aside>

      {/* Main content - add top padding on mobile for the fixed bar */}
      <main className="min-w-0 flex-1 p-6 pt-20 md:pt-6">{children}</main>
    </div>
  )
}
