import { labEquipment } from '@/lib/site-config'

export function LabEquipment() {
  return (
    <section className="border-y border-lab-line bg-lab-panel2">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">Engineered for Repairs Other Shops Turn Away</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-lab-text sm:text-3xl">
            Laboratory-grade diagnostic &amp; rework equipment
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-lab-muted sm:text-base">
            Our laboratory uses professional diagnostic, measurement, rework, programming, and
            microscopic inspection equipment to troubleshoot failures at the board and component
            level.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {labEquipment.map((item) => (
            <div key={item.name} className="panel p-4">
              <h3 className="text-sm font-semibold text-lab-text">{item.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-lab-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
