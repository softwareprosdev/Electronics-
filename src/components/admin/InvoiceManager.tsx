'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export interface PaymentData {
  id: string
  amountCents: number
  method: 'CASH' | 'CHECK' | 'CARD' | 'OTHER'
  transactionReference: string | null
  paidAt: string
}

export interface InvoiceData {
  id: string
  invoiceNumber: string
  amountCents: number
  status: 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'VOID'
  dueDate: string | null
  notes: string | null
  createdAt: string
  payments: PaymentData[]
}

const STATUS_STYLE: Record<InvoiceData['status'], string> = {
  DRAFT: 'border-lab-line text-lab-muted',
  SENT: 'border-lab-warn/40 text-lab-warn',
  PARTIALLY_PAID: 'border-lab-warn/40 text-lab-warn',
  PAID: 'border-lab-accent/40 text-lab-accent',
  OVERDUE: 'border-lab-danger/40 text-lab-danger',
  VOID: 'border-lab-line text-lab-muted',
}

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export function InvoiceManager({
  repairId,
  initialInvoices,
}: {
  repairId: string
  initialInvoices: InvoiceData[]
}) {
  const router = useRouter()
  const [invoices, setInvoices] = useState(initialInvoices)
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    const amountCents = Math.round(parseFloat(amount) * 100)
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setError('Enter a valid dollar amount.')
      return
    }

    setCreating(true)
    try {
      const response = await fetch(`/api/admin/repairs/${repairId}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountCents,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to create invoice.')
      setInvoices((prev) => [{ ...data.invoice, payments: [] }, ...prev])
      setAmount('')
      setDueDate('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice.')
    } finally {
      setCreating(false)
    }
  }

  function handleInvoiceUpdated(updated: InvoiceData) {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)))
    router.refresh()
  }

  return (
    <div>
      {invoices.length === 0 ? (
        <p className="mt-3 text-sm text-lab-muted">No invoices yet.</p>
      ) : (
        <ul className="mt-3 space-y-4">
          {invoices.map((invoice) => (
            <InvoiceRow key={invoice.id} invoice={invoice} onUpdated={handleInvoiceUpdated} />
          ))}
        </ul>
      )}

      <form onSubmit={handleCreate} className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-3">
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
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
              Due Date (optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
            />
          </div>
        </div>
        {error && <p className="text-sm text-lab-danger">{error}</p>}
        <button type="submit" disabled={creating} className="btn-primary disabled:opacity-60">
          {creating ? 'Creating…' : 'Create Invoice'}
        </button>
      </form>
    </div>
  )
}

function InvoiceRow({
  invoice,
  onUpdated,
}: {
  invoice: InvoiceData
  onUpdated: (invoice: InvoiceData) => void
}) {
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [method, setMethod] = useState<PaymentData['method']>('CARD')
  const [reference, setReference] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amountCents, 0)
  const balanceDue = invoice.amountCents - totalPaid

  async function handleMarkSent() {
    const response = await fetch(`/api/admin/invoices/${invoice.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SENT' }),
    })
    const data = await response.json().catch(() => ({}))
    if (response.ok) onUpdated({ ...invoice, ...data.invoice })
  }

  async function handleRecordPayment(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    const amountCents = Math.round(parseFloat(paymentAmount) * 100)
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setError('Enter a valid payment amount.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/invoices/${invoice.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents, method, transactionReference: reference }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to record payment.')
      onUpdated(data.invoice)
      setPaymentAmount('')
      setReference('')
      setShowPaymentForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <li className="border-b border-lab-line/60 pb-4 text-sm last:border-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={`/admin/invoices/${invoice.id}/print`} className="font-mono text-lab-accent">
          {invoice.invoiceNumber}
        </Link>
        <span className={`rounded-sm border px-2 py-0.5 text-xs ${STATUS_STYLE[invoice.status]}`}>
          {invoice.status.replace(/_/g, ' ')}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-lab-muted">
        <span>Total: {formatCents(invoice.amountCents)}</span>
        <span>Paid: {formatCents(totalPaid)}</span>
        <span className={balanceDue > 0 ? 'text-lab-warn' : 'text-lab-accent'}>
          Balance: {formatCents(Math.max(balanceDue, 0))}
        </span>
        {invoice.dueDate && <span>Due {new Date(invoice.dueDate).toLocaleDateString()}</span>}
      </div>

      {invoice.payments.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-lab-muted">
          {invoice.payments.map((p) => (
            <li key={p.id}>
              {formatCents(p.amountCents)} via {p.method} &middot;{' '}
              {new Date(p.paidAt).toLocaleDateString()}
              {p.transactionReference && ` (${p.transactionReference})`}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {invoice.status === 'DRAFT' && (
          <button
            onClick={handleMarkSent}
            className="rounded-sm border border-lab-line px-3 py-1 text-xs text-lab-text hover:bg-lab-panel2"
          >
            Mark Sent
          </button>
        )}
        {balanceDue > 0 && invoice.status !== 'VOID' && (
          <button
            onClick={() => setShowPaymentForm((v) => !v)}
            className="rounded-sm border border-lab-accent/40 px-3 py-1 text-xs text-lab-accent hover:bg-lab-accent/10"
          >
            {showPaymentForm ? 'Cancel' : 'Record Payment'}
          </button>
        )}
      </div>

      {showPaymentForm && (
        <form onSubmit={handleRecordPayment} className="mt-3 space-y-2 rounded-sm border border-lab-line p-3">
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount"
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
              required
              className="w-28 rounded-sm border border-lab-line bg-lab-panel2 px-2 py-1 text-xs text-lab-text focus:border-lab-accent"
            />
            <select
              value={method}
              onChange={(event) => setMethod(event.target.value as PaymentData['method'])}
              className="rounded-sm border border-lab-line bg-lab-panel2 px-2 py-1 text-xs text-lab-text focus:border-lab-accent"
            >
              <option value="CARD">Card</option>
              <option value="CASH">Cash</option>
              <option value="CHECK">Check</option>
              <option value="OTHER">Other</option>
            </select>
            <input
              type="text"
              placeholder="Reference (optional)"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              className="flex-1 rounded-sm border border-lab-line bg-lab-panel2 px-2 py-1 text-xs text-lab-text focus:border-lab-accent"
            />
          </div>
          {error && <p className="text-xs text-lab-danger">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary px-3 py-1 text-xs disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Payment'}
          </button>
        </form>
      )}
    </li>
  )
}
