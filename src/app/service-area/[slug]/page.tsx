import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CtaSection } from '@/components/CtaSection'
import { getLocationBySlug, locations } from '@/lib/data/locations'
import { homepageServiceCards } from '@/lib/data/services'
import { buildMetadata, localBusinessJsonLd } from '@/lib/seo'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return locations.map((location) => ({ slug: location.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const location = getLocationBySlug(slug)
  if (!location) return {}

  return buildMetadata({
    title: location.headline,
    description: location.summary,
    path: `/service-area/${location.slug}`,
  })
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params
  const location = getLocationBySlug(slug)
  if (!location) notFound()

  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <Breadcrumbs
        items={[
          { name: 'Service Areas', path: '/service-area/harlingen' },
          { name: location.city, path: `/service-area/${location.slug}` },
        ]}
      />

      <section className="circuit-bg border-b border-lab-line">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="eyebrow">Service Area</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-lab-text sm:text-4xl">
            {location.headline}
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-lab-muted sm:text-base">
            {location.summary}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-lab-muted sm:text-base">
            {location.areaContext}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-lab-muted sm:text-base">
            {location.corridorNote}
          </p>
          <p className="mt-4 rounded-sm border border-lab-accent/40 bg-lab-accent/10 p-4 text-sm font-medium text-lab-text">
            You do not need to be near {location.city} to work with us. Our laboratory accepts
            mail-in repairs from customers nationwide — {location.city} is one of many places we
            serve, not the limit of where we serve.
          </p>
          <p className="mt-6 text-xs uppercase tracking-wide text-lab-muted">
            ZIP codes served locally: {location.zipCodes.join(', ')} — plus mail-in repair from
            anywhere in the U.S.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/request-repair" className="btn-primary">
              Request a Diagnostic
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
              Serving {location.city} &amp; Nearby
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-lab-muted">
              {location.nearby.map((place) => (
                <li key={place}>&bull; {place}</li>
              ))}
            </ul>
          </div>
          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
              What We Offer Locally
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-lab-muted">
              {location.localPoints.map((point) => (
                <li key={point}>&bull; {point}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-lab-line bg-lab-panel2">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-lab-text">
            How Service Works for {location.city} Customers
          </h2>
          <ul className="mt-6 space-y-3">
            {location.serviceOptions.map((option) => (
              <li key={option} className="flex gap-2 text-sm leading-relaxed text-lab-muted">
                <span aria-hidden="true" className="text-lab-accent">
                  &bull;
                </span>
                {option}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaSection
        eyebrow={`TraceWorks Lab — ${location.city}, TX`}
        headline="Have a device, board, or module another shop couldn't fix?"
      />

      <section className="border-t border-lab-line bg-lab-panel2">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-lab-text">Popular Services</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {homepageServiceCards.map((card) => (
              <Link
                key={card.slug}
                href={`/${card.slug}`}
                className="rounded-sm border border-lab-line px-4 py-2 text-xs font-medium text-lab-muted hover:border-lab-accent hover:text-lab-accent"
              >
                {card.label}
              </Link>
            ))}
          </div>

          <h2 className="mt-10 text-xl font-bold text-lab-text">Other Service Areas</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {locations
              .filter((item) => item.slug !== location.slug)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={`/service-area/${item.slug}`}
                  className="rounded-sm border border-lab-line px-4 py-2 text-xs font-medium text-lab-muted hover:border-lab-accent hover:text-lab-accent"
                >
                  {item.city}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  )
}
