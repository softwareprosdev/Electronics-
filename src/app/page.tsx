import Link from 'next/link'
import type { Metadata } from 'next'
import { ErrorCodeIntake } from '@/components/ErrorCodeIntake'
import { ServiceCard } from '@/components/ServiceCard'
import { CtaSection } from '@/components/CtaSection'
import { DiagnosticProcess } from '@/components/DiagnosticProcess'
import { LabEquipment } from '@/components/LabEquipment'
import { FaqAccordion } from '@/components/FaqAccordion'
import { faqs } from '@/lib/data/faqs'
import { homepageServiceCards } from '@/lib/data/services'
import { locations } from '@/lib/data/locations'
import { siteConfig } from '@/lib/site-config'
import { buildMetadata, localBusinessJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} | Harlingen, TX`,
  description:
    'Advanced electronics repair down to the board. Component-level diagnostics for phones, computers, GPUs, game consoles, automotive modules, aviation electronics, and ASIC mining hardware.',
  path: '/',
})

const homepageFaqs = faqs.slice(0, 6)

export default function HomePage() {
  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />

      {/* Hero */}
      <section className="circuit-bg relative overflow-hidden border-b border-lab-line">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="eyebrow">Board-Level Diagnostics &bull; Component-Level Repair</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-lab-text sm:text-5xl lg:text-6xl">
              Firmware-Level Electronics Repair.
              <br />
              Down to the Board.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-lab-muted sm:text-lg">
              Component-level diagnostics, PCB repair, memory and storage troubleshooting,
              embedded electronics, automotive modules, aviation electronics, GPUs, ASIC boards,
              and advanced device repair.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/request-repair" className="btn-primary">
                Request a Diagnostic
              </Link>
              <a href={`tel:${siteConfig.phone}`} className="btn-secondary">
                Talk to a Technician
              </a>
            </div>
            <p className="mt-6 text-xs uppercase tracking-wide text-lab-muted">
              Serving Harlingen &bull; Rio Grande Valley &bull; South Texas &bull; Mail-In Repairs
              Available
            </p>
          </div>
        </div>
      </section>

      {/* We Repair the Electronics Inside */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">We Repair the Electronics Inside</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-lab-text sm:text-3xl">
              Advanced diagnostics for electronics that require more than part replacement.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-lab-muted sm:text-base">
              {siteConfig.coreMessage} If the failure is electronic, structural,
              firmware-related, memory-related, or component-level, our technicians can evaluate
              it.
            </p>
          </div>
          <div className="panel grid grid-cols-2 gap-px overflow-hidden bg-lab-line sm:grid-cols-3">
            {[
              'Normal Repair: Replace the module.',
              'Us: Diagnose the module.',
              'Normal Repair: Replace the motherboard.',
              'Us: Investigate the motherboard.',
              'Normal Repair: "Not repairable."',
              'Us: "Let’s diagnose it first."',
            ].map((line) => (
              <div key={line} className="bg-lab-panel p-4 text-xs leading-relaxed text-lab-muted">
                {line}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service categories */}
      <section className="border-y border-lab-line bg-lab-panel2">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="eyebrow">Service Directory</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-lab-text sm:text-3xl">
              Advanced repair, organized by system
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {homepageServiceCards.map((card) => (
              <ServiceCard key={card.slug} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* Advanced repair explanation / other shops can't fix it */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Sent to Multiple Repair Shops?</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-lab-text sm:text-3xl">
              Don&rsquo;t give up on the board yet.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-lab-muted sm:text-base">
              Many repair facilities focus on modular replacement: screen, battery, port,
              motherboard, or complete device replacement.
            </p>
            <p className="mt-3 text-sm font-semibold text-lab-text sm:text-base">We go deeper.</p>
            <p className="mt-3 text-sm leading-relaxed text-lab-muted sm:text-base">
              Our work focuses on diagnosing the electronics themselves when the failure exists at
              the PCB, component, memory, power, or embedded-system level.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/request-repair" className="btn-primary">
                Send Us the Failure
              </Link>
              <Link href="/board-level-repair" className="btn-secondary">
                Request a Diagnostic
              </Link>
            </div>
          </div>
          <div className="panel p-6">
            <p className="eyebrow">Advanced Board-Level Repair Is Not Standard Device Repair</p>
            <p className="mt-3 text-sm leading-relaxed text-lab-muted">
              Many local repair facilities specialize in modular replacement. We specialize in
              going deeper when the failure is on the board itself &mdash; tracing shorts,
              replacing individual components, and recovering boards that would otherwise be
              scrapped.
            </p>
          </div>
        </div>
      </section>

      {/* Dead Board section */}
      <section className="border-y border-lab-line bg-lab-panel2">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="eyebrow">Dead Board?</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-lab-text sm:text-3xl">
              It may not be dead.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-lab-muted sm:text-base">
              No power. No boot. No display. Constant rebooting. Error codes. Failed firmware.
              Corrupted storage. Shorted power rail. Liquid damage.
            </p>
            <p className="mt-3 text-sm font-semibold text-lab-text sm:text-base">
              Before you replace the entire device, let us diagnose the board.
            </p>
            <Link href="/request-repair" className="btn-primary mt-6 inline-flex">
              Request Advanced Diagnostic
            </Link>
          </div>
        </div>
      </section>

      {/* Error code intake */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">Have an Error Code?</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-lab-text sm:text-3xl">
            Tell us what you&rsquo;re seeing
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-lab-muted sm:text-base">
            Provide your device, error code, and symptoms and a technician will determine the
            appropriate diagnostic path.
          </p>
        </div>
        <div className="mt-8">
          <ErrorCodeIntake />
        </div>
      </section>

      {/* Diagnostics process */}
      <div className="border-y border-lab-line bg-lab-panel2">
        <DiagnosticProcess />
      </div>

      {/* Industries served intro */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">Industries Served</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-lab-text sm:text-3xl">
            Consumer, business, automotive, aviation, and specialty electronics
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-lab-muted sm:text-base">
            Our laboratory serves individual consumers, repair shops, automotive businesses,
            technology companies, mining operations, aviation organizations, and industrial
            customers throughout the Rio Grande Valley and beyond.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="panel p-6">
            <h3 className="text-lg font-semibold text-lab-text">Gaming</h3>
            <p className="mt-2 text-sm leading-relaxed text-lab-muted">
              PS5, Xbox, and Nintendo Switch board-level repair for no-power conditions, HDMI
              faults, charging circuits, and storage-related failures.
            </p>
            <Link href="/ps5-repair" className="btn-tertiary mt-4 inline-flex">
              Console Won&rsquo;t Turn On? Don&rsquo;t Replace It Yet.
            </Link>
          </div>
          <div className="panel p-6">
            <h3 className="text-lg font-semibold text-lab-text">Automotive Electronics</h3>
            <p className="mt-2 text-sm leading-relaxed text-lab-muted">
              ECM, ECU, BCM, and TCM diagnostics and board-level repair. Programming and module
              services are performed only where technically supported and legally authorized.
            </p>
            <Link href="/automotive-ecm-repair" className="btn-tertiary mt-4 inline-flex">
              ECM / BCM Failure? Request Module Evaluation
            </Link>
          </div>
          <div className="panel p-6">
            <h3 className="text-lg font-semibold text-lab-text">Aviation Electronics</h3>
            <p className="mt-2 text-sm leading-relaxed text-lab-muted">
              Avionics circuit boards, navigation units, and electronic assemblies accepted for
              technical evaluation and repair when within our capabilities and applicable
              authorization requirements.
            </p>
            <Link href="/aviation-electronics-repair" className="btn-tertiary mt-4 inline-flex">
              Aviation Electronics &mdash; Request Technical Evaluation
            </Link>
          </div>
          <div className="panel p-6">
            <h3 className="text-lg font-semibold text-lab-text">ASIC &amp; Mining Hardware</h3>
            <p className="mt-2 text-sm leading-relaxed text-lab-muted">
              Hashboard electronics, controller boards, and power circuitry diagnostics for
              cryptocurrency mining hardware.
            </p>
            <Link href="/asic-board-repair" className="btn-tertiary mt-4 inline-flex">
              Miner Down? Submit Your Board
            </Link>
          </div>
        </div>
      </section>

      <LabEquipment />

      {/* Emergency / high value CTA */}
      <CtaSection
        eyebrow="Before You Replace It"
        headline="A failed board does not always mean a failed device."
        body="Whether it's a $1,000 GPU, a specialized automotive module, an ASIC board, a gaming console, an iPad, or a complex electronic assembly, the right diagnosis can sometimes save the entire unit."
        primaryLabel="Start a Repair Request"
      />

      {/* Local service area */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">Local Service Area</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-lab-text sm:text-3xl">
            Board-Level Electronics Repair Serving Harlingen to Mission and the Rio Grande Valley
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {locations.map((location) => (
            <Link
              key={location.slug}
              href={`/service-area/${location.slug}`}
              className="panel px-4 py-5 text-center text-sm font-medium text-lab-text hover:border-lab-accent/60"
            >
              {location.city}
            </Link>
          ))}
        </div>
      </section>

      {/* Mail-in repair */}
      <section className="border-y border-lab-line bg-lab-panel2">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow">Not Local?</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-lab-text sm:text-3xl">
                Ship it to our lab.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-lab-muted sm:text-base">
                Customers outside the Rio Grande Valley can mail devices, boards, and modules to
                our laboratory for the same board-level diagnostics performed on local intake.
              </p>
              <Link href="/mail-in-repair" className="btn-primary mt-6 inline-flex">
                Mail-In Repair Instructions
              </Link>
            </div>
            <div className="panel p-6 text-sm text-lab-muted">
              <p className="font-semibold text-lab-text">
                Do not ship equipment before receiving shipping instructions unless otherwise
                directed.
              </p>
              <p className="mt-3">
                Submit a repair request first. A technician will confirm the diagnostic path and
                provide intake instructions before you ship anything.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business partner program */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">Repair Shop Partner Program</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-lab-text sm:text-3xl">
              Your shop doesn&rsquo;t have to turn away board-level repairs.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-lab-muted sm:text-base">
              You handle the customer relationship. We handle the advanced electronics. Become a
              trade customer and outsource board-level work to our laboratory.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/business-services" className="btn-primary">
                Open a Trade Account
              </Link>
              <Link href="/repair-shop-partner-program" className="btn-secondary">
                Partner Program Details
              </Link>
            </div>
          </div>
          <div className="panel p-6">
            <ul className="space-y-3 text-sm text-lab-muted">
              <li>&bull; Trade accounts and volume pricing</li>
              <li>&bull; Priority service options</li>
              <li>&bull; Diagnostic reports and repair documentation</li>
              <li>&bull; Structured shipping workflow for boards and devices</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-lab-line bg-lab-panel2">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="eyebrow">Frequently Asked Questions</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-lab-text sm:text-3xl">
              Common questions about advanced electronics repair
            </h2>
          </div>
          <div className="mt-10">
            <FaqAccordion items={homepageFaqs} />
          </div>
          <div className="mt-8 text-center">
            <Link href="/faq" className="btn-tertiary">
              View All FAQs
            </Link>
          </div>
        </div>
      </section>

      <CtaSection
        headline="Have a device, board, or module another shop couldn't fix?"
        body="Start a repair request and a technician will determine the appropriate diagnostic path."
      />
    </>
  )
}
