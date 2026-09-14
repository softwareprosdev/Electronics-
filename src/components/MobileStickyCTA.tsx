import Link from 'next/link'
import { siteConfig } from '@/lib/site-config'

export function MobileStickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-lab-line bg-lab-bg/95 backdrop-blur md:hidden">
      <a
        href={`tel:${siteConfig.phone}`}
        className="flex flex-1 items-center justify-center gap-2 border-r border-lab-line py-3 text-sm font-semibold text-lab-text"
      >
        Call the Lab
      </a>
      <Link
        href="/request-repair"
        className="flex flex-1 items-center justify-center gap-2 bg-lab-accent py-3 text-sm font-semibold uppercase tracking-wide text-lab-bg"
      >
        Request Repair
      </Link>
    </div>
  )
}
