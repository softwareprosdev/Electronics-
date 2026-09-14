'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const statusOptions = [
  'NEW',
  'UNDER_REVIEW',
  'DIAGNOSTIC_PENDING',
  'DIAGNOSING',
  'QUOTE_SENT',
  'APPROVED',
  'IN_REPAIR',
  'TESTING',
  'COMPLETED',
  'RETURN_SHIPPING',
  'CLOSED',
  'UNREPAIRABLE',
]

export function RepairStatusForm({
  repairId,
  currentStatus,
  currentNotes,
}: {
  repairId: string
  currentStatus: string
  currentNotes: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [statusNote, setStatusNote] = useState('')
  const [internalNotes, setInternalNotes] = useState(currentNotes)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/repairs/${repairId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, statusNote, internalNotes }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update repair.')
      }

      setStatusNote('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update repair.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-4 p-6">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Status</label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
          Status Change Note (customer-facing)
        </label>
        <textarea
          value={statusNote}
          onChange={(event) => setStatusNote(event.target.value)}
          rows={2}
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
          Internal Technician Notes
        </label>
        <textarea
          value={internalNotes}
          onChange={(event) => setInternalNotes(event.target.value)}
          rows={4}
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
      </div>

      {error && <p className="text-sm text-lab-danger">{error}</p>}

      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}
