import Link from 'next/link'
import { JsonLd } from './JsonLd'
import { breadcrumbJsonLd } from '@/lib/seo'

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const trail = [{ name: 'Home', path: '/' }, ...items]

  return (
    <nav aria-label="Breadcrumb" className="border-b border-lab-line bg-lab-panel2">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 text-xs text-lab-muted sm:px-6 lg:px-8">
        {trail.map((item, index) => (
          <li key={item.path} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === trail.length - 1 ? (
              <span className="text-lab-text">{item.name}</span>
            ) : (
              <Link href={item.path} className="hover:text-lab-accent">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
