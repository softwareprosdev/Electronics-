'use client'

import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="mt-4 w-full rounded-sm border border-lab-line px-3 py-2 text-xs font-semibold uppercase tracking-wide text-lab-muted hover:border-lab-danger hover:text-lab-danger"
    >
      Sign Out
    </button>
  )
}
