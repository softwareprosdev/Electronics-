'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DiagnosticForm({ repairId }: { repairId: string }) {
  const router = useRouter()
  const [findings, setFindings] = useState('')
  const [rootCause, setRootCause] = useState('')
  const [isRepairable, setIsRepairable] = useState<'true' | 'false' | 'unknown'>('unknown')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/repairs/${repairId}/diagnostics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findings, rootCause, isRepairable }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save diagnostic.')
      }

      setFindings('')
      setRootCause('')
      setIsRepairable('unknown')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save diagnostic.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
          Findings
        </label>
        <textarea
          value={findings}
          onChange={(event) => setFindings(event.target.value)}
          required
          rows={3}
          placeholder="What was observed, measured, or tested…"
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
          Root Cause
        </label>
        <textarea
          value={rootCause}
          onChange={(event) => setRootCause(event.target.value)}
          rows={2}
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
          Repairable?
        </label>
        <select
          value={isRepairable}
          onChange={(event) => setIsRepairable(event.target.value as typeof isRepairable)}
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        >
          <option value="unknown">Not yet determined</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      {error && <p className="text-sm text-lab-danger">{error}</p>}

      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
        {saving ? 'Saving…' : 'Add Diagnostic'}
      </button>
    </form>
  )
}
