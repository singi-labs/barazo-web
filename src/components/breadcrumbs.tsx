/**
 * Breadcrumbs component with JSON-LD structured data.
 * WCAG 2.2 AA: nav landmark, semantic list, 44px mobile touch target.
 * Mobile: collapses to single parent back-link.
 * Desktop: full breadcrumb trail.
 * @see https://schema.org/BreadcrumbList
 */

import Link from 'next/link'
import { CaretLeft } from '@phosphor-icons/react/dist/ssr'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  /** When provided, JSON-LD uses these instead of `items`. Lets pages keep full path in structured data while showing fewer visual breadcrumbs. */
  jsonLdItems?: BreadcrumbItem[]
}

export function Breadcrumbs({ items, jsonLdItems }: BreadcrumbsProps) {
  if (items.length === 0) return null

  const jsonLdSource = jsonLdItems ?? items
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: jsonLdSource
      .filter((item) => item.href)
      .map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: `https://barazo.forum${item.href}`,
      })),
  }

  // Last item with an href = parent link for mobile back-link
  const parentItem = [...items].reverse().find((item) => item.href)

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Mobile: single parent back-link */}
      {parentItem && (
        <Link
          href={parentItem.href!}
          className="flex min-h-[44px] items-center gap-1 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm md:hidden"
        >
          <CaretLeft size={14} aria-hidden="true" />
          {parentItem.label}
        </Link>
      )}

      {/* Desktop: full breadcrumb trail */}
      <ol className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.href ?? item.label} className="flex items-center gap-1">
              {index > 0 && (
                <span aria-hidden="true" className="text-muted-foreground">
                  /
                </span>
              )}
              {isLast || !item.href ? (
                <span className={isLast ? 'font-medium text-foreground' : ''}>{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-1"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
