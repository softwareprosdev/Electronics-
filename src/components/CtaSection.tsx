import Link from 'next/link'
import { siteConfig } from '@/lib/site-config'

export function CtaSection({
  eyebrow,
  headline,
  body,
  primaryLabel = 'Request a Diagnostic',
  primaryHref = '/request-repair',
}: {
  eyebrow?: string
  headline: string
  body?: string
  primaryLabel?: string
  primaryHref?: string
}) {
  return (
    <section className="circuit-bg border-y border-lab-line bg-lab-panel2">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-lab-text sm:text-3xl">
          {headline}
        </h2>
        {body && <p className="mx-auto mt-4 max-w-2xl text-sm text-lab-muted sm:text-base">{body}</p>}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href={primaryHref} className="btn-primary">
            {primaryLabel}
          </Link>
          <a href={`tel:${siteConfig.phone}`} className="btn-secondary">
            Call the Lab
          </a>
          <Link href="/request-repair#upload" className="btn-tertiary">
            Send Photos
          </Link>
        </div>
      </div>
    </section>
  )
}
