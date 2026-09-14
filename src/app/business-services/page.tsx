import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CtaSection } from '@/components/CtaSection'
import { BusinessAccountForm } from '@/components/forms/BusinessAccountForm'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Business Services & Trade Accounts',
  description:
    'Trade accounts for repair shops, computer stores, automotive shops, dealerships, fleet operators, mining operations, aviation organizations, and industrial companies.',
  path: '/business-services',
})

const audiences = [
  'Repair shops',
  'Computer stores',
  'Automotive shops',
  'Dealerships',
  'Fleet operators',
  'Electronics companies',
  'Mining operations',
  'Aviation organizations',
  'Industrial companies',
  'IT companies',
  'Refurbishers',
  'Insurance companies',
]

const offerings = [
  'Trade accounts',
  'Volume pricing',
  'Business intake',
  'Priority service options',
  'Diagnostic reports',
  'Repair documentation',
  'White-label possibilities where appropriate',
  'Structured shipping workflow',
  'Account dashboard (future feature)',
]

export default function BusinessServicesPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Business Services', path: '/business-services' }]} />

      <section className="circuit-bg border-b border-lab-line">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="eyebrow">For Businesses &amp; Repair Shops</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-lab-text sm:text-4xl">
            Your shop doesn&rsquo;t have to turn away board-level repairs.
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-lab-muted sm:text-base">
            Become a trade customer and outsource advanced board-level work to our laboratory.
          </p>
          <Link href="#trade-account" className="btn-primary mt-8 inline-flex">
            Open a Trade Account
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
              Who We Work With
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-lab-muted sm:grid-cols-2">
              {audiences.map((item) => (
                <li key={item}>&bull; {item}</li>
              ))}
            </ul>
          </div>
          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
              What Trade Accounts Include
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-lab-muted">
              {offerings.map((item) => (
                <li key={item}>&bull; {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="trade-account" className="border-t border-lab-line bg-lab-panel2">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-lab-text">Open a Trade Account</h2>
          <p className="mt-2 text-sm text-lab-muted">
            Tell us about your business and repair volume. A representative will follow up to set
            up your account.
          </p>
          <div className="mt-8">
            <BusinessAccountForm />
          </div>
        </div>
      </section>

      <CtaSection
        eyebrow="Repair Shop Partner Program"
        headline="You handle the customer relationship. We handle the advanced electronics."
        primaryLabel="View Partner Program"
        primaryHref="/repair-shop-partner-program"
      />
    </>
  )
}
