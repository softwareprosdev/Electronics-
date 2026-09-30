'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const statusOptions = ['NEW', 'CONTACTED', 'CLOSED']

export function LeadRow({
  id,
  type,
  name,
  email,
  phone,
  message,
  createdAt,
  currentStatus,
  currentNotes,
}: {
  id: string
  type: string
  name: string
  email: string
  phone: string | null
  message: string
  createdAt: string
  currentStatus: string
  currentNotes: string
}) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [internalNotes, setInternalNotes] = useState(currentNotes)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, internalNotes }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update.')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <tr className="border-b border-lab-line/60 hover:bg-lab-panel2">
        <td className="py-3 pr-4 text-lab-text">{name}</td>
        <td className="py-3 pr-4 text-lab-muted">
          <a href={`mailto:${email}`} className="hover:text-lab-accent">
            {email}
          </a>
          {phone && <div className="text-xs">{phone}</div>}
        </td>
        <td className="py-3 pr-4 text-lab-muted">{type.replace(/_/g, ' ')}</td>
        <td className="py-3 pr-4">
          <span
            className={`rounded-sm border px-2 py-1 text-xs ${
              status === 'CLOSED'
                ? 'border-lab-line text-lab-muted'
                : status === 'CONTACTED'
                  ? 'border-lab-accent/40 text-lab-accent'
                  : 'border-lab-warn/40 text-lab-warn'
            }`}
          >
            {status}
          </span>
        </td>
        <td className="py-3 pr-4 text-lab-muted">{createdAt}</td>
        <td className="py-3 pr-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-lab-accent hover:underline"
          >
            {expanded ? 'Close' : 'View'}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-lab-line/60 bg-lab-panel2/40">
          <td colSpan={6} className="p-4">
            <p className="text-sm text-lab-text">{message}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
                  Internal Notes
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(event) => setInternalNotes(event.target.value)}
                  rows={2}
                  className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
                />
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-lab-danger">{error}</p>}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary mt-4 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </td>
        </tr>
      )}
    </>
  )
}
