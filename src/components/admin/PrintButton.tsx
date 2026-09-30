'use client'

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-secondary float-right print:hidden">
      Print / Save as PDF
    </button>
  )
}
