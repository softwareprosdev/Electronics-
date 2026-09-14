import { diagnosticProcess } from '@/lib/site-config'

export function DiagnosticProcess() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="eyebrow">Our Diagnostic Process</p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-lab-text sm:text-3xl">
          Every repair starts with a documented diagnostic
        </h2>
      </div>

      <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {diagnosticProcess.map((item) => (
          <li key={item.step} className="panel p-5">
            <span className="font-mono text-xs text-lab-accent">{item.step}</span>
            <h3 className="mt-2 text-sm font-semibold text-lab-text">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-lab-muted">{item.description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
