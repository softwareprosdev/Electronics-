import Image from 'next/image'
import Link from 'next/link'
import { footerLinks, siteConfig } from '@/lib/site-config'

export function Footer() {
  return (
    <footer className="border-t border-lab-line bg-lab-panel2">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <Image
                src="/brand/traceworks-logo.png"
                alt="TraceWorks Lab"
                width={48}
                height={48}
                className="h-10 w-10 sm:h-12 sm:w-12"
              />
              <p className="font-mono text-sm font-semibold tracking-[0.08em] text-lab-text">
                TRACE<span className="text-lab-accent">WORKS</span> LAB
              </p>
            </div>
            <p className="mt-2 text-sm text-lab-muted">
              Board-level diagnostics and component-level repair serving Harlingen to Mission and
              the Rio Grande Valley, with mail-in repair available nationwide.
            </p>
            <p className="mt-4 text-sm text-lab-muted">
              <a href={`tel:${siteConfig.phone}`} className="hover:text-lab-accent">
                {siteConfig.phoneDisplay}
              </a>
            </p>
            <p className="text-sm text-lab-muted">
              <a href={`mailto:${siteConfig.email}`} className="hover:text-lab-accent">
                {siteConfig.email}
              </a>
            </p>
          </div>

          <div>
            <h3 className="eyebrow">Services</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-lab-muted hover:text-lab-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow">Company</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-lab-muted hover:text-lab-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow">Legal</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-lab-muted hover:text-lab-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-lab-line pt-6 text-xs text-lab-muted">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. Diagnosis does not guarantee
            repairability. Programming and module services are performed only where technically
            supported and legally authorized.
          </p>
        </div>
      </div>
    </footer>
  )
}
