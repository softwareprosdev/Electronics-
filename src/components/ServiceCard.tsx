import Link from 'next/link'
import { iconMap } from './icons'
import { getServiceBySlug } from '@/lib/data/services'

export function ServiceCard({ slug, label, icon }: { slug: string; label: string; icon: string }) {
  const service = getServiceBySlug(slug)
  const Icon = iconMap[icon] ?? iconMap.circuit

  return (
    <div className="group flex flex-col justify-between rounded-sm border border-lab-line bg-lab-panel p-6 transition hover:border-lab-accent/60 hover:shadow-glow">
      <div>
        <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-lab-line bg-lab-panel2 text-lab-accent">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="mt-4 text-base font-semibold text-lab-text">{label}</h3>
        <p className="mt-2 text-sm leading-relaxed text-lab-muted">{service?.shortSummary}</p>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <Link href={`/${slug}`} className="text-xs font-semibold uppercase tracking-wide text-lab-accent2 hover:underline">
          Learn More
        </Link>
        <Link href="/request-repair" className="text-xs font-semibold uppercase tracking-wide text-lab-accent hover:underline">
          Request Repair
        </Link>
      </div>
    </div>
  )
}
