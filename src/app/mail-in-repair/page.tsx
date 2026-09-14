import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CtaSection } from '@/components/CtaSection'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Mail-In Repair | Ship Your Device, Board, or Module to Our Lab',
  description:
    'Not local to the Rio Grande Valley? Ship devices, boards, and modules to our laboratory for board-level diagnostics and component-level repair.',
  path: '/mail-in-repair',
})

const steps = [
  { title: 'Submit Repair Request', description: 'Tell us about the device, board, or module and the symptoms you’re seeing.' },
  { title: 'Receive Intake Instructions', description: 'A technician reviews the request and sends packaging and shipping instructions.' },
  { title: 'Package Device / Board Securely', description: 'Follow the provided packaging guidance to protect the item in transit.' },
  { title: 'Ship to Laboratory', description: 'Send the package to the address provided in your intake instructions.' },
  { title: 'Diagnostic Evaluation', description: 'Our technicians perform board-level and component-level diagnostics.' },
  { title: 'Repair Authorization', description: 'You receive findings and approve the recommended repair path.' },
  { title: 'Repair', description: 'Qualified repair is performed using laboratory-grade equipment.' },
  { title: 'Testing', description: 'The repaired board or device is tested against applicable functional criteria.' },
  { title: 'Return Shipment', description: 'Your device, board, or module is packaged and shipped back to you.' },
]

export default function MailInRepairPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Mail-In Repair', path: '/mail-in-repair' }]} />

      <section className="circuit-bg border-b border-lab-line">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="eyebrow">Not Local?</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-lab-text sm:text-4xl">
            Ship it to our lab.
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-lab-muted sm:text-base">
            Customers outside the Harlingen-to-Mission service corridor can access the same
            board-level diagnostics and component-level repair used on local intake through
            mail-in service.
          </p>
          <p className="mt-4 rounded-sm border border-lab-warn/40 bg-lab-warn/10 p-4 text-sm font-medium text-lab-warn">
            Do not ship equipment before receiving shipping instructions unless otherwise
            directed.
          </p>
          <Link href="/request-repair" className="btn-primary mt-8 inline-flex">
            Start a Repair Request
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-lab-text">How Mail-In Repair Works</h2>
        <ol className="mt-8 space-y-6">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-sm border border-lab-accent/40 font-mono text-xs text-lab-accent">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-lab-text">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-lab-muted">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-lab-line bg-lab-panel2">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-muted">
            Customer Tracking
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-lab-muted">
            Our backend is architected to support customer-facing repair tracking through a
            future customer portal, so mail-in customers will be able to follow their repair
            status online as that feature becomes available.
          </p>
        </div>
      </section>

      <CtaSection headline="Ready to ship a device, board, or module to our lab?" />
    </>
  )
}
