'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export interface QuoteData {
  id: string
  amountCents: number | null
  currency: string
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'DECLINED' | 'EXPIRED'
  notes: string | null
  sentAt: string | null
  respondedAt: string | null
  createdAt: string
}

const STATUS_STYLE: Record<QuoteData['status'], string> = {
  DRAFT: 'border-lab-line text-lab-muted',
  SENT: 'border-lab-warn/40 text-lab-warn',
  APPROVED: 'border-lab-accent/40 text-lab-accent',
  DECLINED: 'border-lab-danger/40 text-lab-danger',
  EXPIRED: 'border-lab-line text-lab-muted',
}

function formatCents(cents: number | null) {
  if (cents === null) return '—'
  return `$${(cents / 100).toFixed(2)}`
}

export function QuoteManager({ repairId, initialQuotes }: { repairId: string; initialQuotes: QuoteData[] }) {
  const router = useRouter()
  const [quotes, setQuotes] = useState(initialQuotes)
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [creating, setCreating] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    const amountCents = Math.round(parseFloat(amount) * 100)
    if (!Number.isFinite(amountCents) || amountCents < 0) {
      setError('Enter a valid dollar amount.')
      return
    }

    setCreating(true)
    try {
      const response = await fetch(`/api/admin/repairs/${repairId}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents, notes }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to create quote.')
      setQuotes((prev) => [data.quote, ...prev])
      setAmount('')
      setNotes('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quote.')
    } finally {
      setCreating(false)
    }
  }

  async function handleStatusChange(quoteId: string, status: QuoteData['status']) {
    setUpdatingId(quoteId)
    setError('')
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to update quote.')
      setQuotes((prev) => prev.map((q) => (q.id === quoteId ? data.quote : q)))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quote.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      {quotes.length === 0 ? (
        <p className="mt-3 text-sm text-lab-muted">No quotes yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {quotes.map((quote) => (
            <li key={quote.id} className="border-b border-lab-line/60 pb-3 text-sm last:border-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-lab-text">{formatCents(quote.amountCents)}</span>
                <span className={`rounded-sm border px-2 py-0.5 text-xs ${STATUS_STYLE[quote.status]}`}>
                  {quote.status}
                </span>
              </div>
              {quote.notes && <p className="mt-1 text-xs text-lab-muted">{quote.notes}</p>}
              <p className="mt-1 text-xs text-lab-muted">
                Created {new Date(quote.createdAt).toLocaleString()}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {quote.status === 'DRAFT' && (
                  <button
                    onClick={() => handleStatusChange(quote.id, 'SENT')}
                    disabled={updatingId === quote.id}
                    className="rounded-sm border border-lab-line px-3 py-1 text-xs text-lab-text hover:bg-lab-panel2 disabled:opacity-60"
                  >
                    Mark Sent
                  </button>
                )}
                {quote.status === 'SENT' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(quote.id, 'APPROVED')}
                      disabled={updatingId === quote.id}
                      className="rounded-sm border border-lab-accent/40 px-3 py-1 text-xs text-lab-accent hover:bg-lab-accent/10 disabled:opacity-60"
                    >
                      Mark Approved
                    </button>
                    <button
                      onClick={() => handleStatusChange(quote.id, 'DECLINED')}
                      disabled={updatingId === quote.id}
                      className="rounded-sm border border-lab-danger/40 px-3 py-1 text-xs text-lab-danger hover:bg-lab-danger/10 disabled:opacity-60"
                    >
                      Mark Declined
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleCreate} className="mt-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
              Amount (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
              className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Notes</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          />
        </div>
        {error && <p className="text-sm text-lab-danger">{error}</p>}
        <button type="submit" disabled={creating} className="btn-primary disabled:opacity-60">
          {creating ? 'Creating…' : 'Create Quote'}
        </button>
      </form>
    </div>
  )
}
