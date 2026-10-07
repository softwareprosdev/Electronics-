'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/components/store/CartContext'

export function AddToCartForm({
  inventoryItemId,
  name,
  unitPriceCents,
  imageUrl,
  quantityOnHand,
}: {
  inventoryItemId: string
  name: string
  unitPriceCents: number
  imageUrl: string | null
  quantityOnHand: number
}) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  if (quantityOnHand <= 0) {
    return <p className="text-sm text-lab-danger">Out of stock.</p>
  }

  function handleAdd() {
    addItem({ inventoryItemId, name, unitPriceCents, imageUrl, maxQuantity: quantityOnHand }, quantity)
    setAdded(true)
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          max={quantityOnHand}
          value={quantity}
          onChange={(event) => setQuantity(Math.max(1, Math.min(quantityOnHand, parseInt(event.target.value, 10) || 1)))}
          className="w-20 rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
        <button onClick={handleAdd} className="btn-primary">
          Add to Cart
        </button>
      </div>
      {added && (
        <p className="mt-3 text-sm text-lab-accent">
          Added to cart. <Link href="/cart" className="underline">View cart &rarr;</Link>
        </p>
      )}
    </div>
  )
}
