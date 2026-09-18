import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CtaSection } from '@/components/CtaSection'
import { FaqAccordion } from '@/components/FaqAccordion'
import { JsonLd } from '@/components/JsonLd'
import { faqCategories, faqs } from '@/lib/data/faqs'
import { buildMetadata, faqJsonLd } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Frequently Asked Questions',
  description:
    'Answers about board-level repair, component-level repair, mail-in service, business accounts, pricing, and what happens if a board cannot be repaired.',
  path: '/faq',
})

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <Breadcrumbs items={[{ name: 'FAQ', path: '/faq' }]} />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="eyebrow">Frequently Asked Questions</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-lab-text sm:text-4xl">
          TraceWorks Lab Repair FAQ
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-lab-muted sm:text-base">
          Answers to common questions about board-level repair, component-level repair,
          diagnostics, pricing, and service options.
        </p>

        <div className="mt-10 space-y-10">
          {faqCategories.map((category) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-lab-text">{category}</h2>
              <div className="mt-4">
                <FaqAccordion items={faqs.filter((faq) => faq.category === category)} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <CtaSection headline="Still have a question about your device, board, or module?" />
    </>
  )
}
