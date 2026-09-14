import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { siteConfig } from '@/lib/site-config'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Service',
  description: 'Terms governing use of this website and our repair services.',
  path: '/terms',
  noIndex: true,
})

export default function TermsPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Terms of Service', path: '/terms' }]} />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-sm leading-relaxed text-lab-muted">
        <h1 className="text-3xl font-bold tracking-tight text-lab-text">Terms of Service</h1>
        <p className="mt-6">
          These Terms of Service govern your use of this website and any repair, diagnostic, or
          related services provided by {siteConfig.name}.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-lab-text">Diagnostics Do Not Guarantee Repairability</h2>
        <p className="mt-2">
          Submitting a device, board, or module for diagnostics does not guarantee that it can be
          repaired. Findings and available options are communicated after inspection, and you
          will not be charged for a repair that was not performed.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-lab-text">Customer Property</h2>
        <p className="mt-2">
          All repair work is subject to inspection and authorization. We will communicate findings
          and obtain approval before performing repair work beyond the diagnostic stage.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-lab-text">Aviation Equipment</h2>
        <p className="mt-2">
          Aviation equipment may be subject to regulatory, manufacturer, maintenance,
          documentation, and return-to-service requirements. Customers are responsible for
          ensuring all work complies with applicable aviation regulations and maintenance
          procedures.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-lab-text">Automotive &amp; Device Identifiers</h2>
        <p className="mt-2">
          Programming and module services are performed only where technically supported and
          legally authorized. We do not perform unauthorized security bypasses, stolen-device
          unlocking, activation-lock bypasses, or identifier alteration intended to conceal a
          device&rsquo;s or vehicle&rsquo;s identity.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-lab-text">Limitation of Liability</h2>
        <p className="mt-2">
          To the maximum extent permitted by law, {siteConfig.name} is not liable for indirect,
          incidental, or consequential damages arising from the use of this website or our
          services.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-lab-text">Contact</h2>
        <p className="mt-2">
          Questions about these Terms can be directed to{' '}
          <a href={`mailto:${siteConfig.email}`} className="text-lab-accent">
            {siteConfig.email}
          </a>
          .
        </p>
      </article>
    </>
  )
}
