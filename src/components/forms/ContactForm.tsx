'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function ContactForm({
  submissionType = 'GENERAL',
}: {
  submissionType?: 'GENERAL' | 'BUSINESS_ACCOUNT' | 'REPAIR_SHOP_PARTNER' | 'MEDIA'
}) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      type: submissionType,
      website: formData.get('website'),
    }

    try {
      const response = await fetch('/api/contact', {
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
        <h3 className="text-lg font-semibold text-lab-text">Message Received.</h3>
        <p className="mt-2 text-sm text-lab-muted">
          A technician will follow up as soon as possible.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="panel grid gap-4 p-6">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

      <div>
        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
          Name *
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
      </div>

      {status === 'error' && <p className="text-sm text-lab-danger">{errorMessage}</p>}

      <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full sm:w-auto disabled:opacity-60">
        {status === 'submitting' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
