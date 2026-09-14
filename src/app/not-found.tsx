import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="circuit-bg flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-lab-text sm:text-4xl">
        This board isn&rsquo;t on our bench.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-lab-muted">
        The page you&rsquo;re looking for doesn&rsquo;t exist. It may have moved, or the link may
        be incorrect.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-primary">
          Return Home
        </Link>
        <Link href="/request-repair" className="btn-secondary">
          Request a Diagnostic
        </Link>
      </div>
    </div>
  )
}
