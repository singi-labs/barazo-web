/**
 * Accessibility statement page.
 * URL: /accessibility
 * Describes WCAG 2.2 AA conformance, testing methods, and contact info.
 * @see specs/prd-web.md Section M14
 */

import type { Metadata } from 'next'
import { getPublicSettings } from '@/lib/api/client'
import { ForumLayout } from '@/components/layout/forum-layout'
import { Breadcrumbs } from '@/components/breadcrumbs'

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description:
    'Barazo is committed to WCAG 2.2 Level AA accessibility. Learn about our testing, standards, and how to report issues.',
  alternates: {
    canonical: '/accessibility',
  },
}

export default async function AccessibilityPage() {
  let communityName = ''
  try {
    const settings = await getPublicSettings()
    communityName = settings.communityName
  } catch {
    // silently degrade
  }

  return (
    <ForumLayout communityName={communityName}>
      <div className="mx-auto max-w-2xl space-y-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Accessibility' }]} />

        <h1 className="text-2xl font-bold text-foreground">Accessibility Statement</h1>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Our Commitment</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Barazo is committed to ensuring digital accessibility for people with disabilities. We
            continually improve the user experience for everyone and apply the relevant
            accessibility standards.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Conformance Status</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We aim to conform to the{' '}
            <strong>Web Content Accessibility Guidelines (WCAG) 2.2 Level AA</strong>. These
            guidelines explain how to make web content more accessible to people with a wide range
            of disabilities.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Testing Methods</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We test accessibility through a combination of methods:
          </p>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>Automated testing</strong> using axe-core and ESLint accessibility rules in
              our continuous integration pipeline.
            </li>
            <li>
              <strong>Keyboard navigation</strong> testing to ensure all interactive elements are
              reachable and operable without a mouse.
            </li>
            <li>
              <strong>Screen reader</strong> testing with VoiceOver to verify content is properly
              announced and navigable.
            </li>
            <li>
              <strong>Lighthouse audits</strong> targeting an accessibility score of 95 or higher on
              all page types.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Accessibility Features</h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>Semantic HTML with proper heading hierarchy and landmark regions.</li>
            <li>Skip links for jumping to main content and the reply editor.</li>
            <li>Keyboard-accessible controls with visible focus indicators.</li>
            <li>ARIA attributes for dynamic content, dialogs, and tab patterns.</li>
            <li>Color contrast meeting WCAG AA requirements in both light and dark themes.</li>
            <li>Pagination as the default for content lists (no infinite scroll).</li>
            <li>Respects reduced motion preferences via prefers-reduced-motion.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Known Limitations</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            While we strive for full accessibility, some areas may have limitations:
          </p>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>
              User-generated content may not always meet accessibility standards (e.g., images
              without alt text in posts).
            </li>
            <li>Third-party embeds and plugins may have their own accessibility limitations.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Contact Us</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            If you encounter accessibility barriers on Barazo, please contact us. We take
            accessibility feedback seriously and will work to address issues promptly.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You can report accessibility issues through our{' '}
            <a
              href="https://github.com/barazo-forum/barazo-web/issues"
              className="text-primary underline hover:text-primary/80"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub issue tracker
            </a>
            . Please include the page URL, a description of the issue, and the assistive technology
            you are using.
          </p>
        </section>

        <section className="space-y-3">
          <p className="text-xs text-muted-foreground">
            This statement was last updated on February 2026.
          </p>
        </section>
      </div>
    </ForumLayout>
  )
}
