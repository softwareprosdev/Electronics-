'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
  'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
  'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY', 'DC',
]

export interface CustomerFormValues {
  name: string
  email: string
  phone: string
  company: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zip: string
}

const emptyValues: CustomerFormValues = {
  name: '',
  email: '',
  phone: '',
  company: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zip: '',
}

export function CustomerForm({
  customerId,
  initialValues,
}: {
  customerId?: string
  initialValues?: Partial<CustomerFormValues>
}) {
  const router = useRouter()
  const [values, setValues] = useState<CustomerFormValues>({ ...emptyValues, ...initialValues })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function update<K extends keyof CustomerFormValues>(key: K, value: CustomerFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch(
        customerId ? `/api/admin/customers/${customerId}` : '/api/admin/customers',
        {
          method: customerId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        },
      )

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save customer.')
      }

      if (customerId) {
        router.refresh()
      } else {
        router.push(`/admin/customers/${data.customer.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save customer.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel grid gap-4 p-6 sm:grid-cols-2">
      <Field label="Full Name" value={values.name} onChange={(v) => update('name', v)} required />
      <Field
        label="Email"
        type="email"
        value={values.email}
        onChange={(v) => update('email', v)}
        required
      />
      <Field label="Phone" type="tel" value={values.phone} onChange={(v) => update('phone', v)} />
      <Field label="Company" value={values.company} onChange={(v) => update('company', v)} />
      <Field
        label="Street Address"
        value={values.addressLine1}
        onChange={(v) => update('addressLine1', v)}
        className="sm:col-span-2"
      />
      <Field
        label="Apt / Suite"
        value={values.addressLine2}
        onChange={(v) => update('addressLine2', v)}
      />
      <Field label="City" value={values.city} onChange={(v) => update('city', v)} />
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">State</label>
        <select
          value={values.state}
          onChange={(event) => update('state', event.target.value)}
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        >
          <option value="">—</option>
          {usStates.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <Field label="ZIP" value={values.zip} onChange={(v) => update('zip', v)} />

      {error && <p className="sm:col-span-2 text-sm text-lab-danger">{error}</p>}

      <div className="sm:col-span-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? 'Saving…' : customerId ? 'Save Changes' : 'Create Customer'}
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
      />
    </div>
  )
}
