'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Login failed.')
      }

      const redirectTo = searchParams.get('from') || '/admin'
      router.push(redirectTo)
      router.refresh()
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Login failed.')
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="panel w-full max-w-sm p-8">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-2 text-xl font-bold text-lab-text">Laboratory Dashboard</h1>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
              Email
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
          <div>
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
            />
          </div>
        </div>

        {status === 'error' && <p className="mt-4 text-sm text-lab-danger">{errorMessage}</p>}

        <button type="submit" disabled={status === 'submitting'} className="btn-primary mt-6 w-full disabled:opacity-60">
          {status === 'submitting' ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
