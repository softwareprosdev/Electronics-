import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Customer Portal',
  description: 'Track repair status, quotes, and messages from our laboratory.',
  path: '/portal',
  noIndex: true,
})

const upcomingFeatures = [
  'View repair requests and current diagnostic status',
  'Review and approve quotes online',
  'See device and repair history',
  'Message a technician directly',
  'Access documents and diagnostic reports',
  'Track shipping information for mail-in repairs',
]

export default function PortalPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Customer Portal', path: '/portal' }]} />

      <section className="circuit-bg border-b border-lab-line">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="eyebrow">Customer Portal</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-lab-text sm:text-4xl">
            Repair tracking is coming to your account.
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-lab-muted sm:text-base">
            Our backend is already architected to support a full customer portal: every repair
            request, device, quote, and message is tied to a customer record in our database. The
            self-service portal experience below is on our roadmap.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="panel p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
            Planned Portal Features
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-lab-muted">
            {upcomingFeatures.map((feature) => (
              <li key={feature}>&bull; {feature}</li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-sm text-lab-muted">
          In the meantime, our technicians communicate repair status by phone and email using the
          contact information provided with your repair request.
        </p>
        <Link href="/request-repair" className="btn-primary mt-6 inline-flex">
          Start a Repair Request
        </Link>
      </section>
    </>
  )
}
