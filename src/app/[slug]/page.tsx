import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CtaSection } from '@/components/CtaSection'
import { FaqAccordion } from '@/components/FaqAccordion'
import { categoryWhyChooseUs, getServiceBySlug, services } from '@/lib/data/services'
import { faqs } from '@/lib/data/faqs'
import { buildMetadata, faqJsonLd, serviceJsonLd } from '@/lib/seo'
import { diagnosticProcess, labEquipment } from '@/lib/site-config'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) return {}

  return buildMetadata({
    title: service.metaTitle,
    description: service.metaDescription,
    path: `/${service.slug}`,
  })
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) notFound()

  const relatedFaqs = faqs
    .filter((faq) =>
      service.category === 'automotive'
        ? faq.category === 'Automotive'
        : service.category === 'aviation'
          ? faq.category === 'Aviation'
          : service.category === 'mining'
            ? faq.category === 'Mining Hardware'
            : service.category === 'gaming'
              ? faq.category === 'Gaming'
              : service.category === 'phones-tablets'
                ? faq.category === 'Apple Devices'
                : faq.category === 'Board-Level Repair',
    )
    .slice(0, 4)

  const faqItems = relatedFaqs.length > 0 ? relatedFaqs : faqs.slice(0, 4)
  const whyChooseUs = categoryWhyChooseUs[service.category]

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: service.name,
          description: service.metaDescription,
          path: `/${service.slug}`,
        })}
      />
      <JsonLd data={faqJsonLd(faqItems)} />

      <Breadcrumbs items={[{ name: service.name, path: `/${service.slug}` }]} />

      <section className="circuit-bg border-b border-lab-line">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="eyebrow">{service.category.replace('-', ' ')}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-lab-text sm:text-4xl">
            {service.heroHeadline}
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-lab-muted sm:text-base">
            {service.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {service.disclaimer && (
            <p className="mt-6 rounded-sm border border-lab-warn/40 bg-lab-warn/10 p-4 text-xs leading-relaxed text-lab-warn">
              {service.disclaimer}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/request-repair" className="btn-primary">
              {service.ctaLabel}
            </Link>
            <Link href="/mail-in-repair" className="btn-secondary">
              Mail-In Repair
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
              Common Symptoms
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-lab-muted">
              {service.symptoms.map((symptom) => (
                <li key={symptom} className="flex gap-2">
                  <span aria-hidden="true" className="text-lab-accent">
                    &bull;
                  </span>
                  {symptom}
                </li>
              ))}
            </ul>
          </div>
          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
              What We Evaluate
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-lab-muted">
              {service.whatWeEvaluate.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-lab-accent">
                    &bull;
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-lab-line bg-lab-panel2">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-lab-text">{service.causesHeading}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {service.causes.map((cause) => (
              <li
                key={cause}
                className="flex gap-2 text-sm leading-relaxed text-lab-muted"
              >
                <span aria-hidden="true" className="text-lab-accent">
                  &bull;
                </span>
                {cause}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-lab-text">Our Diagnostic Process</h2>
        <p className="mt-2 text-sm text-lab-muted">
          The same structured process is applied to every {service.name.toLowerCase()} case that
          comes through our lab.
        </p>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {diagnosticProcess.map((step) => (
            <li key={step.step} className="panel p-5">
              <span className="text-xs font-semibold uppercase tracking-wide text-lab-accent">
                Step {step.step}
              </span>
              <h3 className="mt-2 text-sm font-semibold text-lab-text">{step.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-lab-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-lab-line bg-lab-panel2">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-lab-text">
            Why Choose TraceWorks Lab for {service.name}
          </h2>
          <ul className="mt-6 space-y-3">
            {whyChooseUs.map((reason) => (
              <li key={reason} className="flex gap-2 text-sm leading-relaxed text-lab-muted">
                <span aria-hidden="true" className="text-lab-accent">
                  &bull;
                </span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-lab-text">Laboratory Equipment We Use</h2>
        <p className="mt-2 text-sm text-lab-muted">
          Board-level and component-level work depends on the right equipment, not just
          experience.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {labEquipment.map((item) => (
            <div key={item.name} className="panel p-5">
              <h3 className="text-sm font-semibold text-lab-text">{item.name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-lab-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaSection headline={service.ctaHeadline} primaryLabel={service.ctaLabel} />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-lab-text">Related Questions</h2>
        <div className="mt-6">
          <FaqAccordion items={faqItems} />
        </div>
      </section>

      <section className="border-t border-lab-line bg-lab-panel2">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-muted">
            Related Services
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {service.relatedSlugs.map((slug) => {
              const related = getServiceBySlug(slug)
              if (!related) return null
              return (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  className="rounded-sm border border-lab-line px-4 py-2 text-xs font-medium text-lab-muted hover:border-lab-accent hover:text-lab-accent"
                >
                  {related.name}
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
