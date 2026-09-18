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
  {
    name: 'Repair shops',
    description: 'Outsource board-level and component-level cases you would otherwise turn away.',
  },
  {
    name: 'Computer stores',
    description: 'Route motherboard and GPU diagnostics to a lab built for component-level work.',
  },
  {
    name: 'Automotive shops',
    description: 'Send ECU, ECM, BCM, and other control modules for evaluation before replacement.',
  },
  {
    name: 'Dealerships',
    description: 'A component-level alternative to costly dealer-parts module replacement.',
  },
  {
    name: 'Fleet operators',
    description: 'Recurring diagnostic and repair support for vehicle electronics across a fleet.',
  },
  {
    name: 'Electronics companies',
    description: 'Board-level support for product lines that need repair beyond swap-and-replace.',
  },
  {
    name: 'Mining operations',
    description: 'Control board and hashboard repair to keep units running instead of idle.',
  },
  {
    name: 'Aviation organizations',
    description: 'Technical evaluation of avionics and electronic assemblies within our capability.',
  },
  {
    name: 'Industrial companies',
    description: 'Component-level diagnostics for electronic assemblies used in operations.',
  },
  {
    name: 'IT companies',
    description: 'A backup lab for laptop, desktop, and peripheral board-level failures.',
  },
  {
    name: 'Refurbishers',
    description: 'Recover otherwise-scrapped units with component-level repair before resale.',
  },
  {
    name: 'Insurance companies',
    description: 'Diagnostic findings to support claim evaluation on damaged electronics.',
  },
]

const offerings = [
  {
    name: 'Trade accounts',
    description: 'A standing account so repeat submissions don’t start from scratch each time.',
  },
  {
    name: 'Volume pricing',
    description: 'Pricing that scales with your repair volume as your account grows.',
  },
  {
    name: 'Business intake',
    description: 'An intake process built around recurring submissions, not one-off requests.',
  },
  {
    name: 'Priority service options',
    description: 'Faster turnaround options available for trade account customers.',
  },
  {
    name: 'Diagnostic reports',
    description: 'Written findings you can use for your own records or customer communication.',
  },
  {
    name: 'Repair documentation',
    description: 'Documentation of the work performed on each submitted item.',
  },
  {
    name: 'White-label possibilities where appropriate',
    description: 'Present findings under your own shop’s name in appropriate cases.',
  },
  {
    name: 'Structured shipping workflow',
    description: 'A consistent process for shipping multiple items in and out of the lab.',
  },
  {
    name: 'Account dashboard (future feature)',
    description: 'Online account visibility is planned as our customer-facing tools expand.',
  },
]

const tradeAccountSteps = [
  {
    title: 'Tell Us About Your Business',
    description:
      'Submit the trade account form below with your business type, typical repair volume, and the categories of equipment you need support with.',
  },
  {
    title: 'Account Setup',
    description:
      'A representative follows up to confirm details, discuss pricing, and set up your account for ongoing submissions.',
  },
  {
    title: 'Submit Devices, Boards, or Modules',
    description:
      'Once your account is active, submit items through the same repair-request process, referencing your business account.',
  },
  {
    title: 'Diagnostics & Findings',
    description:
      'Each item receives board-level or component-level diagnostics, with findings reported back before any repair proceeds.',
  },
  {
    title: 'Repair & Return',
    description:
      'Approved repairs are completed and the item is returned or made available for pickup, along with any documentation your account includes.',
  },
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
          <p className="mt-4 text-sm leading-relaxed text-lab-muted sm:text-base">
            Most repair businesses eventually run into a device, board, or module that falls
            outside modular replacement: a motherboard with a shorted rail, a control module with
            corrosion damage, a GPU that won&rsquo;t display. Rather than turning that job away or
            investing in equipment and training you may only need occasionally, a trade account
            lets you route it to a lab that specializes in exactly that work, while you keep the
            customer relationship.
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
            <ul className="mt-4 space-y-3 text-sm text-lab-muted">
              {audiences.map((item) => (
                <li key={item.name}>
                  <span className="font-medium text-lab-text">{item.name}</span> &mdash;{' '}
                  {item.description}
                </li>
              ))}
            </ul>
          </div>
          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
              What Trade Accounts Include
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-lab-muted">
              {offerings.map((item) => (
                <li key={item.name}>
                  <span className="font-medium text-lab-text">{item.name}</span> &mdash;{' '}
                  {item.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-lab-line bg-lab-panel2">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-lab-text">How a Trade Account Works</h2>
          <ol className="mt-8 space-y-6">
            {tradeAccountSteps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-sm border border-lab-accent/40 font-mono text-xs text-lab-accent">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-lab-text">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-lab-muted">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
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
