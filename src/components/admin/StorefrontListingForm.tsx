'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function StorefrontListingForm({
  itemId,
  initialIsForSale,
  initialSlug,
  initialPublicName,
  initialPublicDescription,
  initialImageUrl,
  initialSellingPriceCents,
}: {
  itemId: string
  initialIsForSale: boolean
  initialSlug: string
  initialPublicName: string
  initialPublicDescription: string
  initialImageUrl: string
  initialSellingPriceCents: string
}) {
  const router = useRouter()
  const [isForSale, setIsForSale] = useState(initialIsForSale)
  const [slug, setSlug] = useState(initialSlug)
  const [publicName, setPublicName] = useState(initialPublicName)
  const [publicDescription, setPublicDescription] = useState(initialPublicDescription)
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [sellingPrice, setSellingPrice] = useState(initialSellingPriceCents)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/inventory/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isForSale,
          slug: slug || null,
          publicName: publicName || null,
          publicDescription: publicDescription || null,
          imageUrl: imageUrl || null,
          sellingPriceCents: sellingPrice ? Math.round(parseFloat(sellingPrice) * 100) : null,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to save listing.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save listing.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-lab-text">
        <input
          type="checkbox"
          checked={isForSale}
          onChange={(event) => setIsForSale(event.target.checked)}
          className="h-4 w-4 accent-lab-accent"
        />
        List for sale in the Shop
      </label>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
          URL Slug (e.g. &quot;capacitor-kit-100pc&quot;)
        </label>
        <input
          type="text"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
          Public Product Name
        </label>
        <input
          type="text"
          value={publicName}
          onChange={(event) => setPublicName(event.target.value)}
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
          Public Description
        </label>
        <textarea
          value={publicDescription}
          onChange={(event) => setPublicDescription(event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
          Image URL
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
          Selling Price (USD)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={sellingPrice}
          onChange={(event) => setSellingPrice(event.target.value)}
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
      </div>

      {error && <p className="text-sm text-lab-danger">{error}</p>}

      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
        {saving ? 'Saving…' : 'Save Listing'}
      </button>
    </form>
  )
}
