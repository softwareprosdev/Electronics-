'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export interface CartItem {
  inventoryItemId: string
  name: string
  unitPriceCents: number
  quantity: number
  imageUrl: string | null
  maxQuantity: number
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void
  updateQuantity: (inventoryItemId: string, quantity: number) => void
  removeItem: (inventoryItemId: string) => void
  clear: () => void
  totalCents: number
  totalItems: number
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'traceworks-cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // Private browsing / blocked storage — cart just starts empty.
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore — cart still works for this page view, just won't persist.
    }
  }, [items, loaded])

  function addItem(item: Omit<CartItem, 'quantity'>, quantity: number) {
    setItems((prev) => {
      const existing = prev.find((i) => i.inventoryItemId === item.inventoryItemId)
      if (existing) {
        const nextQuantity = Math.min(existing.quantity + quantity, item.maxQuantity)
        return prev.map((i) => (i.inventoryItemId === item.inventoryItemId ? { ...i, quantity: nextQuantity } : i))
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.maxQuantity) }]
    })
  }

  function updateQuantity(inventoryItemId: string, quantity: number) {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.inventoryItemId !== inventoryItemId)
        : prev.map((i) => (i.inventoryItemId === inventoryItemId ? { ...i, quantity: Math.min(quantity, i.maxQuantity) } : i)),
    )
  }

  function removeItem(inventoryItemId: string) {
    setItems((prev) => prev.filter((i) => i.inventoryItemId !== inventoryItemId))
  }

  function clear() {
    setItems([])
  }

  const totalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clear, totalCents, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
