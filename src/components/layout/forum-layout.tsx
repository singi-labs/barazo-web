/**
 * Forum Layout (CommunityLayout)
 * Wraps all forum pages with header, sidebar, main content area, and footer.
 * Header: logo, search, theme toggle, user menu placeholder.
 * @see specs/prd-web.md Section 4 (Layout Components)
 */

import Link from 'next/link'
import Image from 'next/image'
import { SkipLinks } from '@/components/skip-links'
import { ThemeToggle } from '@/components/theme-toggle'
import { SearchInput } from '@/components/search-input'
import { NotificationBell } from '@/components/notification-bell'
import { UserMenu } from '@/components/auth/user-menu'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import { NewTopicButton } from '@/components/new-topic-button'
import type { PublicSettings } from '@/lib/api/types'

interface ForumLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  publicSettings?: PublicSettings | null
}

export function ForumLayout({ children, sidebar, publicSettings }: ForumLayoutProps) {
  const communityName = publicSettings?.communityName ?? ''
  const headerLogoUrl = publicSettings?.headerLogoUrl ?? null
  const communityLogoUrl = publicSettings?.communityLogoUrl ?? null
  const showCommunityName = publicSettings?.showCommunityName ?? true

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SkipLinks />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {headerLogoUrl ? (
              <Image
                src={headerLogoUrl}
                alt={communityName || 'Community'}
                width={200}
                height={32}
                className="h-8 w-auto"
                priority
              />
            ) : communityLogoUrl ? (
              <Image
                src={communityLogoUrl}
                alt={communityName || 'Community'}
                width={32}
                height={32}
                className="h-8 w-8 rounded"
                priority
              />
            ) : (
              <>
                <Image
                  src="/barazo-logo-light.svg"
                  alt="Barazo"
                  width={120}
                  height={32}
                  className="h-8 w-auto dark:hidden"
                  priority
                />
                <Image
                  src="/barazo-logo-dark.svg"
                  alt="Barazo"
                  width={120}
                  height={32}
                  className="hidden h-8 w-auto dark:block"
                  priority
                />
              </>
            )}
            {showCommunityName && communityName && (
              <span className="hidden text-lg font-semibold text-foreground sm:inline">
                {communityName}
              </span>
            )}
          </Link>

          {/* Search */}
          <div className="hidden flex-1 sm:flex sm:max-w-md">
            <SearchInput className="w-full" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <NewTopicButton variant="header" className="hidden sm:inline-flex" />
            {/* Mobile search */}
            <Link
              href="/search"
              aria-label="Search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:hidden"
            >
              <MagnifyingGlass className="h-5 w-5" weight="regular" aria-hidden="true" />
            </Link>
            <NotificationBell unreadCount={0} />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="container flex gap-8 py-6">
        {/* Main content */}
        <main id="main-content" className="min-w-0 flex-1" tabIndex={-1}>
          {children}
        </main>

        {/* Sidebar */}
        {sidebar && (
          <aside className="hidden w-64 shrink-0 lg:block" aria-label="Sidebar">
            {sidebar}
          </aside>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container flex items-center justify-between py-6 text-sm text-muted-foreground">
          <p>
            Powered by{' '}
            <Link
              href="https://barazo.forum"
              className="text-primary underline decoration-primary/50 hover:text-primary-hover hover:decoration-primary"
            >
              Barazo
            </Link>
          </p>
          <nav aria-label="Footer">
            <ul className="flex gap-4">
              <li>
                <Link href="/p/accessibility" className="transition-colors hover:text-foreground">
                  Accessibility
                </Link>
              </li>
              <li>
                <Link href="/p/privacy-policy" className="transition-colors hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/p/terms-of-service"
                  className="transition-colors hover:text-foreground"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/p/cookie-policy" className="transition-colors hover:text-foreground">
                  Cookies
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  )
}
