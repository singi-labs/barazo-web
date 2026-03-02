/**
 * Sticky sidebar navigation for the settings page.
 * Anchor links to community-scoped and global settings sections.
 * Hidden below max-w-2xl breakpoint (768px).
 */

'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SettingsSidebarProps {
  communityName: string
}

export function SettingsSidebar({ communityName }: SettingsSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>('community-settings')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const sections = ['community-settings', 'global-settings']
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    for (const id of sections) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  const links = [
    { id: 'community-settings', label: `${communityName} settings` },
    { id: 'global-settings', label: 'Global settings' },
  ]

  return (
    <nav
      aria-label="Settings sections"
      className="sticky top-20 hidden h-fit w-48 shrink-0 self-start min-[768px]:block"
    >
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              className={cn(
                'block rounded-md px-3 py-2 text-sm transition-colors',
                'hover:bg-card-hover hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                activeSection === link.id
                  ? 'bg-card-hover font-medium text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
