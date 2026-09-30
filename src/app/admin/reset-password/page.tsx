'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setErrorMessage('')

    if (newPassword !== confirmPassword) {
      setStatus('error')
      setErrorMessage('New password and confirmation do not match.')
      return
    }

    setStatus('submitting')

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to reset password.')
      }

      setStatus('done')
      setTimeout(() => router.push('/admin/login'), 2000)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to reset password.')
    }
  }

  if (!token) {
    return (
      <div className="panel w-full max-w-sm p-8">
        <p className="text-sm text-lab-danger">This link is missing its reset token.</p>
        <Link href="/admin/forgot-password" className="mt-4 block text-sm text-lab-accent">
          Request a new reset link
        </Link>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="panel w-full max-w-sm p-8">
        <p className="text-sm text-lab-text">Password changed. Redirecting to sign in…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="panel w-full max-w-sm p-8">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-2 text-xl font-bold text-lab-text">Set a New Password</h1>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            New Password (min 12 characters)
          </label>
          <input
            id="newPassword"
            type="password"
            required
            minLength={12}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={12}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          />
        </div>
      </div>

      {status === 'error' && <p className="mt-4 text-sm text-lab-danger">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-primary mt-6 w-full disabled:opacity-60"
      >
        {status === 'submitting' ? 'Saving…' : 'Set New Password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
