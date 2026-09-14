'use client'

import { useState } from 'react'

const accountTypes = [
  { value: 'trade', label: 'Repair Shop / Trade' },
  { value: 'fleet', label: 'Fleet / Service Account' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'refurbisher', label: 'Refurbisher' },
]

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function BusinessAccountForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())

    try {
      const response = await fetch('/api/business-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong. Please try again.')
      }

      setStatus('success')
      form.reset()
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong.')
    }
  }

  if (status === 'success') {
    return (
      <div className="panel p-6">
        <h3 className="text-lg font-semibold text-lab-text">Request Received.</h3>
        <p className="mt-2 text-sm text-lab-muted">
          A representative will review your business account request and follow up to set up
          trade pricing and intake.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="panel grid gap-4 p-6 sm:grid-cols-2">
      {/* honeypot */}
      <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" className="hidden" />

      <Field label="Shop / Business Name" name="shopName" required />
      <Field label="Contact Name" name="contactName" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone" name="phone" type="tel" />
      <Field label="Business Website" name="website" />
      <div>
        <label htmlFor="accountType" className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
          Account Type
        </label>
        <select
          id="accountType"
          name="accountType"
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          defaultValue="trade"
        >
          {accountTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <Field label="Approximate Monthly Repair Volume" name="monthlyVolume" className="sm:col-span-2" />
      <TextArea label="Equipment Types You Handle" name="equipmentTypes" className="sm:col-span-2" />
      <TextArea label="Current Outsourcing Needs" name="outsourcingNeeds" className="sm:col-span-2" />

      {status === 'error' && (
        <p className="sm:col-span-2 text-sm text-lab-danger">{errorMessage}</p>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full sm:w-auto disabled:opacity-60">
          {status === 'submitting' ? 'Submitting…' : 'Submit Trade Account Request'}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
  className = '',
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
        {label}
        {required && <span className="text-lab-accent"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
      />
    </div>
  )
}

function TextArea({
  label,
  name,
  className = '',
}: {
  label: string
  name: string
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={3}
        className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
      />
    </div>
  )
}
