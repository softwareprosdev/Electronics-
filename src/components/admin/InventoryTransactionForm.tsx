'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const TYPES = [
  { value: 'RECEIVE', label: 'Receive (add stock)' },
  { value: 'RETURN', label: 'Return (add stock)' },
  { value: 'USE', label: 'Use (consume)' },
  { value: 'SCRAP', label: 'Scrap (remove)' },
  { value: 'ADJUSTMENT', label: 'Adjustment (correction)' },
  { value: 'TRANSFER', label: 'Transfer (remove)' },
]

export function InventoryTransactionForm({ itemId }: { itemId: string }) {
  const router = useRouter()
  const [type, setType] = useState('RECEIVE')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    const qty = parseInt(quantity, 10)
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Enter a quantity greater than zero.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/inventory/${itemId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, quantity: qty, notes }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to record transaction.')
      setQuantity('')
      setNotes('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record transaction.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Type</label>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="mt-2 rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            required
            className="mt-2 w-24 rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Notes</label>
        <input
          type="text"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
      </div>
      {error && <p className="text-sm text-lab-danger">{error}</p>}
      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
        {saving ? 'Saving…' : 'Record Transaction'}
      </button>
    </form>
  )
}
