'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const CHECKLIST_ITEMS = [
  'Power test',
  'Display test',
  'Functional test',
  'Cosmetic inspection',
  'Accessories verified',
]

export function QcPanel({
  repairId,
  qcPassedAt,
  qcPassedByName,
  qcNotes,
}: {
  repairId: string
  qcPassedAt: string | null
  qcPassedByName: string | null
  qcNotes: string | null
}) {
  const router = useRouter()
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const allChecked = CHECKLIST_ITEMS.every((item) => checked[item])

  async function handlePass() {
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/repairs/${repairId}/qc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to record QC pass.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record QC pass.')
    } finally {
      setSaving(false)
    }
  }

  if (qcPassedAt) {
    return (
      <div>
        <p className="text-sm text-lab-accent">
          QC passed {new Date(qcPassedAt).toLocaleString()}
          {qcPassedByName && ` by ${qcPassedByName}`}
        </p>
        {qcNotes && <p className="mt-1 text-xs text-lab-muted">{qcNotes}</p>}
      </div>
    )
  }

  return (
    <div>
      <ul className="space-y-2 text-sm">
        {CHECKLIST_ITEMS.map((item) => (
          <li key={item}>
            <label className="flex items-center gap-2 text-lab-text">
              <input
                type="checkbox"
                checked={!!checked[item]}
                onChange={(event) => setChecked((prev) => ({ ...prev, [item]: event.target.checked }))}
                className="h-4 w-4 accent-lab-accent"
              />
              {item}
            </label>
          </li>
        ))}
      </ul>
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="QC notes (optional)"
        rows={2}
        className="mt-3 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
      />
      {error && <p className="mt-2 text-sm text-lab-danger">{error}</p>}
      <button
        onClick={handlePass}
        disabled={!allChecked || saving}
        className="btn-primary mt-3 disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Record QC Pass'}
      </button>
      {!allChecked && (
        <p className="mt-2 text-xs text-lab-muted">Check every item above to record a QC pass.</p>
      )}
    </div>
  )
}
