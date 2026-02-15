/**
 * Cookie policy page.
 * URL: /legal/cookies
 * Static placeholder content -- admin-editable in P3+.
 * @see decisions/legal.md
 */

import type { Metadata } from 'next'
import { ForumLayout } from '@/components/layout/forum-layout'
import { Breadcrumbs } from '@/components/breadcrumbs'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'How Barazo uses cookies. We use a single essential cookie for authentication -- no tracking or analytics cookies.',
  alternates: {
    canonical: '/legal/cookies',
  },
}

export default function CookiePolicyPage() {
  return (
    <ForumLayout>
      <div className="mx-auto max-w-2xl space-y-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cookie Policy' }]} />

        <h1 className="text-2xl font-bold text-foreground">Cookie Policy</h1>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Overview</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Barazo uses a minimal number of cookies. We do not use tracking cookies, advertising
            cookies, or third-party analytics cookies. This page explains the cookies we do use and
            why.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Cookies We Use</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Barazo uses a single essential cookie:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-muted-foreground">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4 font-semibold text-foreground">Cookie</th>
                  <th className="pb-2 pr-4 font-semibold text-foreground">Purpose</th>
                  <th className="pb-2 pr-4 font-semibold text-foreground">Duration</th>
                  <th className="pb-2 font-semibold text-foreground">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4">Refresh token</td>
                  <td className="py-2 pr-4">
                    Keeps you logged in across page reloads by enabling silent access token renewal.
                  </td>
                  <td className="py-2 pr-4">Session</td>
                  <td className="py-2">Essential</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Technical Details</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The refresh token cookie has the following security properties:
          </p>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>HTTP-only</strong> -- the cookie is not accessible to JavaScript, preventing
              cross-site scripting (XSS) attacks.
            </li>
            <li>
              <strong>Secure</strong> -- the cookie is only sent over HTTPS connections.
            </li>
            <li>
              <strong>SameSite=Strict</strong> -- the cookie is not sent with cross-site requests,
              preventing cross-site request forgery (CSRF) attacks.
            </li>
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Access tokens (used to authenticate API requests) are held in memory only and are never
            stored in cookies, localStorage, or sessionStorage.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">What We Do Not Use</h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>No tracking or advertising cookies.</li>
            <li>No third-party analytics (Google Analytics, etc.).</li>
            <li>No social media tracking pixels.</li>
            <li>No fingerprinting or behavioral profiling.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Cookie Consent</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Because we only use a single essential cookie required for the service to function, a
            cookie consent banner is not required under the ePrivacy Directive (EU Directive
            2002/58/EC, Art. 5(3)). Essential cookies that are strictly necessary for the service
            requested by the user are exempt from the consent requirement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Theme Preference</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your light/dark mode preference is stored in localStorage (not a cookie). This is a
            client-side preference that is never sent to our servers.
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
