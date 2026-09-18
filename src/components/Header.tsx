import Image from 'next/image'
import Link from 'next/link'
import { primaryNav, siteConfig } from '@/lib/site-config'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-lab-line bg-lab-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/brand/traceworks-logo.png"
            alt="TraceWorks Lab"
            width={64}
            height={64}
            className="h-12 w-12 flex-shrink-0 sm:h-14 sm:w-14"
            priority
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-mono text-sm font-semibold tracking-[0.08em] text-lab-text">
              TRACE<span className="text-lab-accent">WORKS</span> LAB
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-lab-muted">
              Firmware-Level Electronics Repairs
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
