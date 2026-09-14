'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="circuit-bg flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">System Fault</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-lab-text sm:text-4xl">
        Something went wrong on our end.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-lab-muted">
        Our technicians have been notified. Please try again, or contact us directly if the issue
        continues.
      </p>
      <button type="button" onClick={() => reset()} className="btn-primary mt-8">
        Try Again
      </button>
    </div>
  )
}
