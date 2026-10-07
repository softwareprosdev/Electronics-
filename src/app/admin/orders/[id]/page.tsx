import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OrderFulfillmentForm } from '@/components/admin/OrderFulfillmentForm'

export const dynamic = 'force-dynamic'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { inventoryItem: true } } },
  })

  if (!order) notFound()

  return (
    <div>
      <Link href="/admin/orders" className="text-xs text-lab-muted hover:text-lab-accent">
        &larr; Orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-mono text-xl font-bold text-lab-text">{order.orderNumber}</h1>
        <span className="rounded-sm border border-lab-accent/40 px-3 py-1 text-xs text-lab-accent">
          {order.status}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">Customer</h2>
            <p className="mt-3 text-sm text-lab-text">{order.customerName}</p>
            <p className="text-sm text-lab-muted">{order.customerEmail}</p>
          </div>

          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
              Shipping Address
            </h2>
            <p className="mt-3 text-sm text-lab-text">{order.shippingLine1}</p>
            {order.shippingLine2 && <p className="text-sm text-lab-text">{order.shippingLine2}</p>}
            <p className="text-sm text-lab-text">
              {order.shippingCity}, {order.shippingState} {order.shippingZip}
            </p>
            <p className="text-sm text-lab-muted">{order.shippingCountry}</p>
            {order.trackingNumber && (
              <p className="mt-3 text-sm text-lab-accent">Tracking: {order.trackingNumber}</p>
            )}
          </div>

          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">Items</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {order.items.map((orderItem) => (
                <li key={orderItem.id} className="flex items-center justify-between border-b border-lab-line/60 pb-2">
                  <span className="text-lab-text">
                    {orderItem.inventoryItem.publicName || orderItem.inventoryItem.description}
                  </span>
                  <span className="text-lab-muted">
                    {orderItem.quantity} &times; ${(orderItem.unitPriceCents / 100).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-lab-line pt-3">
              <span className="text-sm text-lab-muted">Total</span>
              <span className="font-mono text-lg text-lab-accent">${(order.amountCents / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <OrderFulfillmentForm
            orderId={order.id}
            currentStatus={order.status}
            currentTrackingNumber={order.trackingNumber || ''}
          />
        </div>
      </div>
    </div>
  )
}
