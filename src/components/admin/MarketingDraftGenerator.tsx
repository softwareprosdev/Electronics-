'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const CHANNELS = ['GOOGLE_SEARCH', 'GOOGLE_LSA', 'META', 'TIKTOK', 'YOUTUBE', 'EMAIL', 'ORGANIC_SITE'] as const

export function MarketingDraftGenerator() {
  const router = useRouter()
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>('META')
  const [brief, setBrief] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    if (!brief.trim()) {
      setError('Enter a brief for the creative agent to work from.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/admin/marketing-drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, brief }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate ad copy.')
      }
      setBrief('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate ad copy.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel space-y-3 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-lab-muted">
        Creative Agent — Draft New Ad Copy
      </h3>
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value as (typeof CHANNELS)[number])}
          className="rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text"
        >
          {CHANNELS.map((c) => (
            <option key={c} value={c}>
              {c.replace('_', ' ')}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="e.g. GPU reballing service, emphasize the no-fix-no-charge diagnostic"
          className="flex-1 rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text"
        />
        <button type="button" onClick={generate} disabled={busy} className="btn-primary text-xs">
          {busy ? 'Drafting…' : 'Generate Draft'}
        </button>
      </div>
      {error && <p className="text-xs text-lab-danger">{error}</p>}
    </div>
  )
}
