'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong.')
      }

      setStatus('done')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong.')
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="panel w-full max-w-sm p-8">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-2 text-xl font-bold text-lab-text">Reset Password</h1>

        {status === 'done' ? (
          <p className="mt-6 text-sm text-lab-text">
            If that account exists, a reset link has been sent. It expires in 30 minutes.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
                Account Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
              />
            </div>

            {status === 'error' && <p className="text-sm text-lab-danger">{errorMessage}</p>}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="btn-primary w-full disabled:opacity-60"
            >
              {status === 'submitting' ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <Link href="/admin/login" className="mt-6 block text-xs text-lab-muted hover:text-lab-accent">
          &larr; Back to Sign In
        </Link>
      </div>
    </div>
  )
}
