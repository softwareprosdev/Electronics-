'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function BusinessAccountRow({
  id,
  shopName,
  contactName,
  email,
  phone,
  accountType,
  monthlyVolume,
  equipmentTypes,
  outsourcingNeeds,
  createdAt,
  currentIsApproved,
  currentNotes,
}: {
  id: string
  shopName: string
  contactName: string
  email: string
  phone: string | null
  accountType: string
  monthlyVolume: string | null
  equipmentTypes: string | null
  outsourcingNeeds: string | null
  createdAt: string
  currentIsApproved: boolean
  currentNotes: string
}) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [isApproved, setIsApproved] = useState(currentIsApproved)
  const [notes, setNotes] = useState(currentNotes)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(nextApproved: boolean) {
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/business-accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: nextApproved, notes }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update.')
      }
      setIsApproved(nextApproved)
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
        <td className="py-3 pr-4 text-lab-text">{shopName}</td>
        <td className="py-3 pr-4 text-lab-muted">
          {contactName}
          <div className="text-xs">
            <a href={`mailto:${email}`} className="hover:text-lab-accent">
              {email}
            </a>
            {phone && ` · ${phone}`}
          </div>
        </td>
        <td className="py-3 pr-4 text-lab-muted">{accountType}</td>
        <td className="py-3 pr-4">
          <span
            className={`rounded-sm border px-2 py-1 text-xs ${
              isApproved ? 'border-lab-accent/40 text-lab-accent' : 'border-lab-warn/40 text-lab-warn'
            }`}
          >
            {isApproved ? 'APPROVED' : 'PENDING'}
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
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {monthlyVolume && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-lab-muted">Monthly Volume</dt>
                  <dd className="text-lab-text">{monthlyVolume}</dd>
                </div>
              )}
              {equipmentTypes && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-lab-muted">Equipment Types</dt>
                  <dd className="text-lab-text">{equipmentTypes}</dd>
                </div>
              )}
              {outsourcingNeeds && (
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-lab-muted">Outsourcing Needs</dt>
                  <dd className="text-lab-text">{outsourcingNeeds}</dd>
                </div>
              )}
            </dl>
            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
                Internal Notes
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
                className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
              />
            </div>
            {error && <p className="mt-2 text-sm text-lab-danger">{error}</p>}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={saving || isApproved}
                className="btn-primary disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Approve'}
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving || !isApproved}
                className="rounded-sm border border-lab-line px-4 py-2 text-sm text-lab-text hover:bg-lab-panel2 disabled:opacity-60"
              >
                Revoke Approval
              </button>
              <button
                type="button"
                onClick={() => handleSave(isApproved)}
                disabled={saving}
                className="rounded-sm border border-lab-line px-4 py-2 text-sm text-lab-text hover:bg-lab-panel2 disabled:opacity-60"
              >
                Save Notes Only
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
