'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export interface RecommendationRow {
  id: string
  repairCategoryName: string | null
  createdAt: string
  recommendedPriceCents: number
  priceFloorCents: number
  premiumPriceCents: number
  competitivePriceCents: number | null
  grossMarginPercent: number
  profitPerTechnicianHourCents: number | null
  confidence: number
  priceAction: string
  status: string
  requiresHumanApproval: boolean
  riskFlags: string[]
  reasoning: string[]
  finalPriceCents: number | null
  reviewedByName: string | null
  reviewNote: string | null
}

function formatCents(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return '—'
  return `$${(cents / 100).toFixed(2)}`
}

function RowActions({ row }: { row: RecommendationRow }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [editValue, setEditValue] = useState((row.recommendedPriceCents / 100).toFixed(2))
  const [editing, setEditing] = useState(false)

  async function review(action: 'APPROVE' | 'REJECT' | 'EDIT') {
    setBusy(true)
    setError('')
    try {
      const response = await fetch(`/api/pricing/recommendations/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          finalPriceCents: action === 'EDIT' ? Math.round(Number.parseFloat(editValue) * 100) : undefined,
        }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update recommendation.')
      }
      setEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update recommendation.')
    } finally {
      setBusy(false)
    }
  }

  if (row.status !== 'PENDING_REVIEW') {
    return (
      <div className="text-xs text-lab-muted">
        {row.status.replace(/_/g, ' ')}
        {row.reviewedByName ? ` by ${row.reviewedByName}` : ''}
        {row.finalPriceCents != null ? ` · ${formatCents(row.finalPriceCents)}` : ''}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {editing ? (
        <>
          <input
            type="number"
            step="0.01"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-24 rounded-sm border border-lab-line bg-lab-panel2 px-2 py-1 text-xs text-lab-text"
          />
          <button disabled={busy} onClick={() => review('EDIT')} className="btn-tertiary text-xs">
            Save
          </button>
          <button disabled={busy} onClick={() => setEditing(false)} className="text-xs text-lab-muted">
            Cancel
          </button>
        </>
      ) : (
        <>
          <button disabled={busy} onClick={() => review('APPROVE')} className="btn-tertiary text-xs text-lab-accent2">
            Approve
          </button>
          <button disabled={busy} onClick={() => setEditing(true)} className="btn-tertiary text-xs">
            Edit
          </button>
          <button disabled={busy} onClick={() => review('REJECT')} className="btn-tertiary text-xs text-lab-danger">
            Reject
          </button>
        </>
      )}
      {error && <span className="text-xs text-lab-danger">{error}</span>}
    </div>
  )
}

export function PricingRecommendationList({ recommendations }: { recommendations: RecommendationRow[] }) {
  if (recommendations.length === 0) {
    return <p className="text-sm text-lab-muted">No recommendations generated yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-lab-line text-xs uppercase tracking-wide text-lab-muted">
            <th className="py-3 pr-4">Category</th>
            <th className="py-3 pr-4">Recommended</th>
            <th className="py-3 pr-4">Floor / Premium</th>
            <th className="py-3 pr-4">Margin</th>
            <th className="py-3 pr-4">Profit/hr</th>
            <th className="py-3 pr-4">Action</th>
            <th className="py-3 pr-4">Review</th>
          </tr>
        </thead>
        <tbody>
          {recommendations.map((row) => (
            <tr key={row.id} className="border-b border-lab-line/60 align-top hover:bg-lab-panel2">
              <td className="py-3 pr-4 text-lab-text">
                {row.repairCategoryName ?? '—'}
                <div className="text-xs text-lab-muted">{row.createdAt}</div>
              </td>
              <td className="py-3 pr-4 font-semibold text-lab-accent2">
                {formatCents(row.recommendedPriceCents)}
              </td>
              <td className="py-3 pr-4 text-lab-muted">
                {formatCents(row.priceFloorCents)} / {formatCents(row.premiumPriceCents)}
              </td>
              <td className="py-3 pr-4 text-lab-muted">{(row.grossMarginPercent * 100).toFixed(1)}%</td>
              <td className="py-3 pr-4 text-lab-muted">{formatCents(row.profitPerTechnicianHourCents)}</td>
              <td className="py-3 pr-4 text-lab-muted">{row.priceAction.replace(/_/g, ' ')}</td>
              <td className="py-3 pr-4">
                <RowActions row={row} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
