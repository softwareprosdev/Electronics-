'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export interface MarketingDraftRow {
  id: string
  type: string
  channel: string
  title: string
  payload: unknown
  rationale: string | null
  status: string
  createdByAgent: string
  createdAt: string
  reviewedByName: string | null
}

function PayloadPreview({ payload }: { payload: unknown }) {
  if (payload && typeof payload === 'object') {
    const p = payload as Record<string, unknown>
    if (Array.isArray(p.headlines)) {
      return (
        <div className="mt-2 space-y-1 text-xs text-lab-muted">
          <p className="font-semibold text-lab-text">Headlines:</p>
          <ul className="list-inside list-disc">
            {(p.headlines as string[]).map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          {typeof p.primaryText === 'string' && <p className="mt-1">{p.primaryText}</p>}
        </div>
      )
    }
  }
  return <pre className="mt-2 overflow-x-auto text-xs text-lab-muted">{JSON.stringify(payload, null, 2)}</pre>
}

function DraftActions({ draft }: { draft: MarketingDraftRow }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function review(status: 'APPROVED' | 'REJECTED') {
    setBusy(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/marketing-drafts/${draft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update draft.')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update draft.')
    } finally {
      setBusy(false)
    }
  }

  if (draft.status !== 'PENDING_REVIEW') {
    return (
      <p className="text-xs text-lab-muted">
        {draft.status === 'APPROVED' ? 'Approved' : 'Rejected'}
        {draft.reviewedByName ? ` by ${draft.reviewedByName}` : ''}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => review('APPROVED')}
          disabled={busy}
          className="btn-tertiary text-xs"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => review('REJECTED')}
          disabled={busy}
          className="btn-tertiary text-xs"
        >
          Reject
        </button>
      </div>
      {error && <p className="text-xs text-lab-danger">{error}</p>}
    </div>
  )
}

export function MarketingDraftList({ drafts }: { drafts: MarketingDraftRow[] }) {
  if (drafts.length === 0) {
    return <p className="text-sm text-lab-muted">No drafts yet — generate one above.</p>
  }

  return (
    <div className="space-y-4">
      {drafts.map((draft) => (
        <div key={draft.id} className="panel p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-lab-accent">
                {draft.channel.replace('_', ' ')} &bull; {draft.type.replace('_', ' ')}
              </span>
              <h4 className="mt-1 text-sm font-semibold text-lab-text">{draft.title}</h4>
              {draft.rationale && <p className="mt-1 text-xs text-lab-muted">{draft.rationale}</p>}
              <PayloadPreview payload={draft.payload} />
            </div>
            <DraftActions draft={draft} />
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-wide text-lab-muted">
            {draft.createdByAgent.replace('_', ' ')} &bull; {draft.createdAt}
          </p>
        </div>
      ))}
    </div>
  )
}
