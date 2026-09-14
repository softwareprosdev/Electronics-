import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { siteConfig } from '@/lib/site-config'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'How we collect, use, and protect customer information.',
  path: '/privacy',
  noIndex: true,
})

export default function PrivacyPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Privacy Policy', path: '/privacy' }]} />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-sm leading-relaxed text-lab-muted">
        <h1 className="text-3xl font-bold tracking-tight text-lab-text">Privacy Policy</h1>
        <p className="mt-6">
          This Privacy Policy describes how {siteConfig.name} collects, uses, and protects
          information submitted through this website and during the repair process.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-lab-text">Information We Collect</h2>
        <p className="mt-2">
          We collect information you provide directly, such as your name, contact information,
          device or equipment details, symptom descriptions, and any photos, videos, or documents
          you upload in connection with a repair request or business account application.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-lab-text">How We Use Information</h2>
        <p className="mt-2">
          Information is used to evaluate and perform diagnostics and repairs, communicate about
          the status of a repair, process business account and trade partner applications, and
          improve our services. We do not sell customer information.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-lab-text">Customer Data on Devices</h2>
        <p className="mt-2">
          Customers are responsible for maintaining backups of their own data unless a specific
          data-recovery agreement is in place. We take reasonable precautions to protect data
          present on devices during the repair process but do not guarantee data preservation.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-lab-text">File Storage &amp; Security</h2>
        <p className="mt-2">
          Uploaded photos, videos, and documents are stored using private, access-controlled
          storage and are not publicly accessible. Access is limited to authorized personnel
          involved in evaluating or repairing your device.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-lab-text">Contact</h2>
        <p className="mt-2">
          Questions about this Privacy Policy can be directed to{' '}
          <a href={`mailto:${siteConfig.email}`} className="text-lab-accent">
            {siteConfig.email}
          </a>
          .
        </p>
      </article>
    </>
  )
}
