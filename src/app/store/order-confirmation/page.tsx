'use client'

import Link from 'next/link'
import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/components/store/CartContext'

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clear } = useCart()

  useEffect(() => {
    // The cart's job ends once Stripe redirects back here — the order
    // itself is already created server-side by the webhook, keyed off the
    // Stripe session, not anything still held in this browser.
    if (sessionId) clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6 lg:px-8">
      <p className="eyebrow">Order Confirmed</p>
      <h1 className="mt-2 text-2xl font-bold text-lab-text">Thanks for your order.</h1>
      <p className="mt-4 text-sm text-lab-muted">
        A confirmation and tracking details will be emailed to you once your order ships. If you
        have any questions, reach out and reference your payment confirmation.
      </p>
      <Link href="/store" className="btn-secondary mt-8 inline-flex">
        Continue Shopping
      </Link>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <OrderConfirmationContent />
    </Suspense>
  )
}
