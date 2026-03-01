/**
 * Terms of service page.
 * URL: /legal/terms
 * Static placeholder content -- admin-editable in P3+.
 * @see decisions/legal.md
 */

import type { Metadata } from 'next'
import { getPublicSettings } from '@/lib/api/client'
import { ForumLayout } from '@/components/layout/forum-layout'
import { Breadcrumbs } from '@/components/breadcrumbs'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms and conditions for using Barazo forum communities. Covers usage rules, content policies, and user responsibilities.',
  alternates: {
    canonical: '/legal/terms',
  },
}

export default async function TermsOfServicePage() {
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
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Terms of Service' }]} />

        <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Acceptance of Terms</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            By accessing or using Barazo, you agree to be bound by these Terms of Service. If you do
            not agree to these terms, you may not use the service. Barazo reserves the right to
            update these terms at any time, with notice provided through the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Eligibility</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You must be at least 16 years old to use Barazo (in accordance with the Dutch
            implementation of GDPR, UAVG). By using the service, you confirm that you meet this age
            requirement. Access to mature content may require additional age verification as
            required by applicable law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Account and Authentication</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Barazo uses the AT Protocol for authentication. You log in using your existing AT
            Protocol identity (e.g., a Bluesky account). You are responsible for maintaining the
            security of your AT Protocol account. Barazo does not store your password.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Content and Conduct</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You retain ownership of content you post on Barazo. By posting, you grant Barazo a
            license to display, index, and distribute your content as part of the forum service and
            via the AT Protocol.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You agree not to post content that:
          </p>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>Violates applicable laws or regulations.</li>
            <li>Infringes on the intellectual property rights of others.</li>
            <li>Contains spam, malware, or deceptive content.</li>
            <li>Harasses, threatens, or promotes violence against individuals or groups.</li>
            <li>Contains child sexual abuse material (CSAM).</li>
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Community administrators may enforce additional content policies specific to their
            community. Repeated violations may result in content removal, account restrictions, or
            bans.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Content Maturity Ratings</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Communities and categories may be rated for content maturity (Safe for Work, Mature, or
            Adult). You are responsible for accurately labeling your content. Communities may
            require age verification to access mature content. New accounts default to safe-mode
            with mature content hidden.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Cross-Posting</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Barazo may cross-post your content to connected platforms (such as Bluesky or Frontpage)
            when you enable this feature. Cross-posting is optional and can be controlled in your
            settings. Cross-posted content is subject to the terms of the destination platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Moderation and Labels</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your account may be labeled by independent moderation services (such as Bluesky&apos;s
            Ozone). Labels affect posting limits and content visibility. You cannot delete labels
            applied by labeler services, but you can dispute inaccuracies by contacting us or the
            labeler service. Community administrators may also apply local moderation overrides.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">AI-Generated Summaries</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Barazo may generate AI-powered summaries of discussion threads. These summaries are
            anonymized derivative works that do not contain personal data (no usernames or verbatim
            quotes). AI summaries may persist after individual content is deleted, as they are
            regenerated from remaining content. Community administrators can disable summary
            preservation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">AT Protocol and Federation</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Barazo is built on the AT Protocol, which is a federated, open network. Content you post
            may be indexed by other services on the AT Protocol network. Barazo cannot control how
            third-party services handle your data once it is published via the protocol.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Termination</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Barazo may suspend or terminate your access if you violate these terms. You may stop
            using the service at any time. Deleting your AT Protocol account or content will trigger
            removal of indexed data from Barazo (see our Privacy Policy for details).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Limitation of Liability</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Barazo is provided &quot;as is&quot; without warranties of any kind. We are not liable
            for any damages arising from your use of the service, including but not limited to loss
            of data, service interruptions, or actions taken by community moderators or
            administrators.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Governing Law</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            These terms are governed by the laws of the Netherlands. Any disputes arising from these
            terms will be subject to the exclusive jurisdiction of the courts of the Netherlands.
          </p>
        </section>

        <section className="space-y-3">
          <p className="text-xs text-muted-foreground">
            These terms were last updated on February 2026.
          </p>
        </section>
      </div>
    </ForumLayout>
  )
}
