/**
 * Privacy policy page.
 * URL: /legal/privacy
 * Static placeholder content -- admin-editable in P3+.
 * @see decisions/legal.md
 */

import type { Metadata } from 'next'
import { ForumLayout } from '@/components/layout/forum-layout'
import { Breadcrumbs } from '@/components/breadcrumbs'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Barazo collects, uses, and protects your personal data. GDPR-compliant privacy policy.',
  alternates: {
    canonical: '/legal/privacy',
  },
}

export default function PrivacyPolicyPage() {
  return (
    <ForumLayout>
      <div className="mx-auto max-w-2xl space-y-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />

        <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Overview</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Barazo is committed to protecting your privacy. This policy explains what personal data
            we collect, why we collect it, how long we keep it, and what rights you have. Barazo is
            operated from the Netherlands and complies with the General Data Protection Regulation
            (GDPR).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">What We Collect</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            When you use Barazo, we process the following data:
          </p>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>AT Protocol identifiers</strong> -- your DID (decentralized identifier) and
              handle, used to identify your account.
            </li>
            <li>
              <strong>Profile information</strong> -- display name and profile data retrieved from
              your AT Protocol PDS.
            </li>
            <li>
              <strong>Content</strong> -- posts, replies, and reactions you create on the forum,
              indexed from the AT Protocol firehose.
            </li>
            <li>
              <strong>IP addresses</strong> -- collected for API rate limiting and security
              purposes.
            </li>
            <li>
              <strong>Session data</strong> -- OAuth tokens for authentication.
            </li>
            <li>
              <strong>Moderation records</strong> -- actions taken by moderators on your content or
              account.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">What We Do Not Collect</h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>
              We do not collect or store your password (authentication is handled via AT Protocol
              OAuth).
            </li>
            <li>
              We do not collect email addresses unless provided by a community admin for billing.
            </li>
            <li>We do not collect payment card details (processed by our payment provider).</li>
            <li>We do not use tracking cookies or analytics that profile your behavior.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Legal Basis</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We process your data under the following legal bases (GDPR Art. 6):
          </p>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>Contract performance</strong> -- processing necessary to provide the forum
              service you signed up for.
            </li>
            <li>
              <strong>Legitimate interest</strong> -- indexing public AT Protocol content, spam
              prevention, platform security, and moderation.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Data Storage and Transfers</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Our servers are hosted in the European Union (Hetzner, Germany). We use the following
            sub-processors:
          </p>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>Hetzner (EU) -- hosting infrastructure.</li>
            <li>Bunny.net (EU, Slovenia) -- content delivery network.</li>
            <li>Stripe (EU-US Data Privacy Framework certified) -- payment processing.</li>
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A full sub-processor list is maintained at{' '}
            <strong>barazo.forum/legal/sub-processors</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Data Retention and Deletion</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your indexed data is retained while the source exists on your AT Protocol PDS. When you
            delete content or your account via the AT Protocol, we process the deletion event and
            remove the indexed data from our systems.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You may also request deletion directly by contacting us, independent of AT Protocol
            signals. We respond to deletion requests within one month (GDPR Art. 12(3)).
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Please note that Barazo cannot guarantee deletion from external systems such as AT
            Protocol relays, other AppViews, search engine caches, or web archives. We take
            reasonable steps including propagating AT Protocol delete events and requesting removal
            from search engines.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Content Labels</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We subscribe to content labeling services (such as Bluesky&apos;s Ozone) for spam
            detection and content moderation. Labels applied to your account may affect posting
            limits and content visibility. Labels are stored by the labeler service, not on your
            PDS. You can dispute labels by contacting us.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Your Rights</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Under the GDPR, you have the right to:
          </p>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>Access the personal data we hold about you.</li>
            <li>Rectify inaccurate data.</li>
            <li>Request erasure of your data (right to be forgotten).</li>
            <li>Object to processing based on legitimate interest.</li>
            <li>Data portability (built into the AT Protocol).</li>
            <li>
              Lodge a complaint with the Dutch Data Protection Authority (Autoriteit
              Persoonsgegevens).
            </li>
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            To exercise these rights, contact us through our{' '}
            <a
              href="https://github.com/barazo-forum/barazo-web/issues"
              className="text-primary underline hover:text-primary/80"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub issue tracker
            </a>{' '}
            or via the contact details provided by your community administrator.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Data Breach Notification</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            In the event of a data breach, we will notify the Dutch Data Protection Authority within
            72 hours (GDPR Art. 33). For high-risk breaches, we will notify affected users without
            undue delay via AT Protocol notifications and public announcements.
          </p>
        </section>

        <section className="space-y-3">
          <p className="text-xs text-muted-foreground">
            This policy was last updated on February 2026.
          </p>
        </section>
      </div>
    </ForumLayout>
  )
}
