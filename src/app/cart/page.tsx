'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/components/store/CartContext'

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalCents } = useCart()
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState('')

  async function handleCheckout() {
    setError('')
    setCheckingOut(true)
    try {
      const response = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ inventoryItemId: i.inventoryItemId, quantity: i.quantity })),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to start checkout.')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout.')
      setCheckingOut(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-lab-text">Cart</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-lab-muted">
          Your cart is empty.{' '}
          <Link href="/store" className="text-lab-accent underline">
            Browse the shop
          </Link>
          .
        </p>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-lab-line">
            {items.map((item) => (
              <li key={item.inventoryItemId} className="flex items-center gap-4 py-4">
                <div className="h-16 w-16 flex-none overflow-hidden rounded-sm border border-lab-line bg-lab-panel2">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-lab-text">{item.name}</p>
                  <p className="text-xs text-lab-muted">${(item.unitPriceCents / 100).toFixed(2)} each</p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={item.maxQuantity}
                  value={item.quantity}
                  onChange={(event) =>
                    updateQuantity(item.inventoryItemId, parseInt(event.target.value, 10) || 1)
                  }
                  className="w-16 rounded-sm border border-lab-line bg-lab-panel2 px-2 py-1 text-sm text-lab-text focus:border-lab-accent"
                />
                <p className="w-20 text-right font-mono text-sm text-lab-text">
                  ${((item.unitPriceCents * item.quantity) / 100).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.inventoryItemId)}
                  className="text-xs text-lab-muted hover:text-lab-danger"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between border-t border-lab-line pt-4">
            <p className="text-sm text-lab-muted">Total</p>
            <p className="font-mono text-xl text-lab-accent">${(totalCents / 100).toFixed(2)}</p>
          </div>

          {error && <p className="mt-4 text-sm text-lab-danger">{error}</p>}

          <button onClick={handleCheckout} disabled={checkingOut} className="btn-primary mt-6 w-full disabled:opacity-60">
            {checkingOut ? 'Redirecting to checkout…' : 'Checkout'}
          </button>
        </>
      )}
    </div>
  )
}
