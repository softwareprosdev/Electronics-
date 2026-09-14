import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ContactForm } from '@/components/forms/ContactForm'
import { siteConfig } from '@/lib/site-config'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Contact Us',
  description:
    'Contact our advanced electronics repair laboratory serving Harlingen to Mission and the Rio Grande Valley. Phone, email, and repair request options.',
  path: '/contact',
})

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Contact', path: '/contact' }]} />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="eyebrow">Contact</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-lab-text sm:text-4xl">
          Talk to a Technician
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="panel p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
                Phone &amp; Email
              </h2>
              <p className="mt-3 text-sm text-lab-muted">
                <a href={`tel:${siteConfig.phone}`} className="text-lab-text hover:text-lab-accent">
                  {siteConfig.phoneDisplay}
                </a>
              </p>
              <p className="mt-1 text-sm text-lab-muted">
                <a href={`mailto:${siteConfig.email}`} className="text-lab-text hover:text-lab-accent">
                  {siteConfig.email}
                </a>
              </p>
            </div>

            <div className="panel p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
                Service Area
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-lab-muted">
                Serving Harlingen to Mission and the Rio Grande Valley, including{' '}
                {siteConfig.serviceArea.join(', ')}. Mail-in repair available nationwide.
              </p>
              <Link href="/mail-in-repair" className="btn-tertiary mt-3 inline-flex">
                Mail-In Instructions
              </Link>
            </div>

            <div className="panel p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
                Business Hours
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-lab-muted">
                Monday &ndash; Friday, 9:00 AM &ndash; 6:00 PM Central Time. Configure exact hours
                in the admin dashboard.
              </p>
            </div>

            <div className="panel p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
                Business Accounts
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-lab-muted">
                Repair shops and businesses can request a trade account.
              </p>
              <Link href="/business-services" className="btn-tertiary mt-3 inline-flex">
                Open a Trade Account
              </Link>
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
