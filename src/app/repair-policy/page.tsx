import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Repair Policy',
  description: 'Our diagnostic, repair authorization, data, and return policy.',
  path: '/repair-policy',
  noIndex: true,
})

const sections = [
  {
    title: 'Diagnostic Evaluation',
    body: 'Every repair begins with a diagnostic evaluation. Diagnosis does not guarantee repairability. Findings are communicated before any repair work beyond diagnostics is performed.',
  },
  {
    title: 'Repair Authorization',
    body: 'Repair work is performed only after you approve the recommended repair path and any associated cost. You will not be charged for a repair that was not performed.',
  },
  {
    title: 'Data',
    body: 'Customers are responsible for maintaining backups of their own data unless a specific data-recovery agreement exists. Data preservation is a consideration during board-level repair whenever technically possible, but it is not guaranteed.',
  },
  {
    title: 'Unrepairable Findings',
    body: 'If diagnostics determine that a device, board, or module cannot be repaired, we will communicate that finding along with any relevant details. Devices, boards, or modules can be returned to you as-is.',
  },
  {
    title: 'Aviation, Automotive &amp; Identifier Services',
    body: 'Aviation equipment may be subject to regulatory, manufacturer, maintenance, documentation, and return-to-service requirements that remain the customer’s responsibility. Programming and module services, including automotive and device identifier work, are performed only where technically supported and legally authorized.',
  },
  {
    title: 'Mail-In Repair',
    body: 'Do not ship equipment before receiving shipping instructions unless otherwise directed. Follow the packaging guidance provided in your intake instructions to protect the item in transit.',
  },
]

export default function RepairPolicyPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Repair Policy', path: '/repair-policy' }]} />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-lab-text">Repair Policy</h1>
        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-semibold text-lab-text">{section.title}</h2>
              <p
                className="mt-2 text-sm leading-relaxed text-lab-muted"
                dangerouslySetInnerHTML={{ __html: section.body }}
              />
            </div>
          ))}
        </div>
      </article>
    </>
  )
}
