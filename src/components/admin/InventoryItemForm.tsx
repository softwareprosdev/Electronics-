'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function InventoryItemForm() {
  const router = useRouter()
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [partNumber, setPartNumber] = useState('')
  const [category, setCategory] = useState('')
  const [cost, setCost] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [quantity, setQuantity] = useState('0')
  const [minimum, setMinimum] = useState('0')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')

    const costCents = Math.round(parseFloat(cost) * 100)
    if (!Number.isFinite(costCents) || costCents < 0) {
      setError('Enter a valid cost.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          description,
          manufacturer,
          partNumber,
          category,
          costCents,
          sellingPriceCents: sellingPrice ? Math.round(parseFloat(sellingPrice) * 100) : null,
          quantityOnHand: parseInt(quantity, 10) || 0,
          minimumQuantity: parseInt(minimum, 10) || 0,
          location,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to create item.')
      router.push(`/admin/inventory/${data.item.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel grid gap-4 p-6 sm:grid-cols-2">
      <Field label="SKU" value={sku} onChange={setSku} required />
      <Field label="Manufacturer" value={manufacturer} onChange={setManufacturer} />
      <Field
        label="Description"
        value={description}
        onChange={setDescription}
        required
        className="sm:col-span-2"
      />
      <Field label="Part Number" value={partNumber} onChange={setPartNumber} />
      <Field label="Category" value={category} onChange={setCategory} />
      <Field label="Cost (USD)" type="number" value={cost} onChange={setCost} required />
      <Field label="Selling Price (USD, optional)" type="number" value={sellingPrice} onChange={setSellingPrice} />
      <Field label="Initial Quantity On Hand" type="number" value={quantity} onChange={setQuantity} />
      <Field label="Minimum Quantity (low-stock alert)" type="number" value={minimum} onChange={setMinimum} />
      <Field label="Bin / Location" value={location} onChange={setLocation} />

      {error && <p className="sm:col-span-2 text-sm text-lab-danger">{error}</p>}

      <div className="sm:col-span-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? 'Creating…' : 'Create Item'}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  className = '',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
        {label}
        {required && <span className="text-lab-accent"> *</span>}
      </label>
      <input
        type={type}
        step={type === 'number' ? '0.01' : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
      />
    </div>
  )
}
