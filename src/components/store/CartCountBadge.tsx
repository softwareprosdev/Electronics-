'use client'

import { useCart } from '@/components/store/CartContext'

export function CartCountBadge() {
  const { totalItems } = useCart()
  if (totalItems === 0) return null
  return (
    <span className="ml-1 rounded-full bg-lab-accent px-1.5 py-0.5 text-[10px] font-semibold text-lab-bg">
      {totalItems}
    </span>
  )
}
