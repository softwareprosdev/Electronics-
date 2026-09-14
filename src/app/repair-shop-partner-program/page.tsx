import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ContactForm } from '@/components/forms/ContactForm'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Repair Shop Partner Program',
  description:
    'Repair shops can submit customer boards for advanced diagnostics and component-level repair while maintaining their own customer relationship.',
  path: '/repair-shop-partner-program',
})

export default function RepairShopPartnerProgramPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Repair Shop Partner Program', path: '/repair-shop-partner-program' }]} />

      <section className="circuit-bg border-b border-lab-line">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="eyebrow">Repair Shop Partner Program</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-lab-text sm:text-4xl">
            You handle the customer relationship. We handle the advanced electronics.
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-lab-muted sm:text-base">
            Many repair shops are equipped for screen, battery, and part-level replacement, but
            not for board-level diagnostics or component-level microsoldering. Our partner
            program lets you keep the customer relationship while outsourcing the advanced
            electronics work to our laboratory.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
              How It Works
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-lab-muted">
              <li>&bull; Submit boards through our website or your trade account</li>
              <li>&bull; We diagnose and quote the repair</li>
              <li>&bull; You approve the work on behalf of your customer</li>
              <li>&bull; We repair, test, and return the board to you</li>
            </ul>
          </div>
          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
              What We Need From You
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-lab-muted">
              <li>&bull; Shop name and contact information</li>
              <li>&bull; Business website (if available)</li>
              <li>&bull; Approximate monthly repair volume</li>
              <li>&bull; Equipment types you typically handle</li>
              <li>&bull; Current outsourcing needs</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-lab-line bg-lab-panel2">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-lab-text">Join the Partner Program</h2>
          <p className="mt-2 text-sm text-lab-muted">
            Tell us about your shop and we will follow up with partner program details.
          </p>
          <div className="mt-8">
            <ContactForm submissionType="REPAIR_SHOP_PARTNER" />
          </div>
        </div>
      </section>
    </>
  )
}
