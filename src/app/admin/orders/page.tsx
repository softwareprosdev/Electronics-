import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'border-lab-line text-lab-muted',
  PAID: 'border-lab-warn/40 text-lab-warn',
  FULFILLED: 'border-lab-accent/40 text-lab-accent',
  CANCELLED: 'border-lab-line text-lab-muted',
  REFUNDED: 'border-lab-danger/40 text-lab-danger',
}

export default async function AdminOrdersPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { items: true },
  })

  return (
    <div>
      <h1 className="text-xl font-bold text-lab-text">Orders</h1>
      <p className="mt-1 text-sm text-lab-muted">Storefront orders — not repair invoices.</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-lab-line text-xs uppercase tracking-wide text-lab-muted">
              <th className="py-3 pr-4">Order</th>
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Items</th>
              <th className="py-3 pr-4">Total</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-lab-line/60 hover:bg-lab-panel2">
                <td className="py-3 pr-4">
                  <Link href={`/admin/orders/${order.id}`} className="font-mono text-lab-accent">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-lab-text">{order.customerName}</td>
                <td className="py-3 pr-4 text-lab-muted">
                  {order.items.reduce((sum, i) => sum + i.quantity, 0)}
                </td>
                <td className="py-3 pr-4 text-lab-text">${(order.amountCents / 100).toFixed(2)}</td>
                <td className="py-3 pr-4">
                  <span className={`rounded-sm border px-2 py-0.5 text-xs ${STATUS_STYLE[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-lab-muted">{order.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-lab-muted">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
