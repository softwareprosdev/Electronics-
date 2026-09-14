import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RepairRequestForm } from '@/components/forms/RepairRequestForm'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Request a Repair',
  description:
    'Submit a repair request for board-level diagnostics and component-level repair. Upload photos, describe symptoms, and choose local drop-off, mail-in, or ship-in service.',
  path: '/request-repair',
})

export default function RequestRepairPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Request Repair', path: '/request-repair' }]} />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="eyebrow">Start a Repair Request</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-lab-text sm:text-4xl">
          Tell us about the failure
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-lab-muted sm:text-base">
          Provide customer, equipment, and failure information. A technician will review your
          request and determine the appropriate diagnostic path.
        </p>

        <div className="mt-10">
          <Suspense fallback={<div className="panel p-8 text-sm text-lab-muted">Loading form…</div>}>
            <RepairRequestForm />
          </Suspense>
        </div>
      </section>
    </>
  )
}
