import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AnnouncementBar } from '@/components/AnnouncementBar'
import { MobileStickyCTA } from '@/components/MobileStickyCTA'
import { Analytics } from '@/components/Analytics'
import { JsonLd } from '@/components/JsonLd'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import { siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Harlingen, TX`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description:
    'Component-level diagnostics and board-level repair for phones, computers, GPUs, game consoles, automotive modules, aviation electronics, and ASIC mining hardware. Serving Harlingen to Mission, TX, with mail-in repair available nationwide.',
  keywords: [
    'board-level repair',
    'component-level repair',
    'motherboard repair Harlingen',
    'PCB repair Rio Grande Valley',
    'iPhone board repair',
    'GPU repair',
    'PS5 motherboard repair',
    'ASIC repair',
    'automotive ECM repair',
    'aviation electronics repair',
  ],
  authors: [{ name: siteConfig.name }],
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export const viewport: Viewport = {
  themeColor: '#0b0e12',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-lab-bg font-sans text-lab-text antialiased">
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-lab-accent focus:px-4 focus:py-2 focus:text-lab-bg"
        >
          Skip to main content
        </a>
        <AnnouncementBar />
        <Header />
        <main id="main-content" className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
        <MobileStickyCTA />
        <Analytics />
      </body>
    </html>
  )
}
