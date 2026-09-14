import Link from 'next/link'
import { primaryNav, siteConfig } from '@/lib/site-config'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-lab-line bg-lab-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-lab-accent/40 bg-lab-panel text-lab-accent">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <rect x="4" y="4" width="16" height="16" rx="1" />
              <path d="M8 4v3M16 4v3M8 17v3M16 17v3M4 8h3M4 16h3M17 8h3M17 16h3" />
              <circle cx="9" cy="9" r="1" />
              <circle cx="15" cy="15" r="1" />
            </svg>
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-mono text-sm font-semibold tracking-wide text-lab-text">
              ADVANCED ELECTRONICS
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-lab-muted">
              Repair &amp; Reprogramming Lab
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 xl:flex" aria-label="Primary">
          {primaryNav.slice(0, 8).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-medium uppercase tracking-wide text-lab-muted transition hover:text-lab-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${siteConfig.phone}`}
            className="hidden text-sm font-semibold text-lab-text hover:text-lab-accent md:block"
          >
            {siteConfig.phoneDisplay}
          </a>
          <Link href="/request-repair" className="btn-primary hidden sm:inline-flex">
            Request a Diagnostic
          </Link>
          <Link href="/request-repair" className="btn-primary sm:hidden">
            Request Repair
          </Link>
        </div>
      </div>
    </header>
  )
}
