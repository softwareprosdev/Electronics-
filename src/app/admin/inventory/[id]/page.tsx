import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { InventoryTransactionForm } from '@/components/admin/InventoryTransactionForm'

export const dynamic = 'force-dynamic'

export default async function InventoryItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const { id } = await params

  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    include: {
      supplier: true,
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { repair: true, createdBy: true },
      },
    },
  })

  if (!item) notFound()

  return (
    <div>
      <Link href="/admin/inventory" className="text-xs text-lab-muted hover:text-lab-accent">
        &larr; Inventory
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-mono text-xl font-bold text-lab-text">{item.sku}</h1>
        <span
          className={`rounded-sm border px-3 py-1 text-xs ${
            item.quantityOnHand <= item.minimumQuantity
              ? 'border-lab-warn/40 text-lab-warn'
              : 'border-lab-accent/40 text-lab-accent'
          }`}
        >
          {item.quantityOnHand} on hand
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">Item</h2>
            <p className="mt-3 text-sm text-lab-text">{item.description}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {item.manufacturer && (
                <div>
                  <dt className="text-xs uppercase text-lab-muted">Manufacturer</dt>
                  <dd className="text-lab-text">{item.manufacturer}</dd>
                </div>
              )}
              {item.partNumber && (
                <div>
                  <dt className="text-xs uppercase text-lab-muted">Part #</dt>
                  <dd className="text-lab-text">{item.partNumber}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs uppercase text-lab-muted">Cost</dt>
                <dd className="text-lab-text">${(item.costCents / 100).toFixed(2)}</dd>
              </div>
              {item.sellingPriceCents !== null && (
                <div>
                  <dt className="text-xs uppercase text-lab-muted">Selling Price</dt>
                  <dd className="text-lab-text">${(item.sellingPriceCents / 100).toFixed(2)}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs uppercase text-lab-muted">Minimum Quantity</dt>
                <dd className="text-lab-text">{item.minimumQuantity}</dd>
              </div>
              {item.location && (
                <div>
                  <dt className="text-xs uppercase text-lab-muted">Location</dt>
                  <dd className="text-lab-text">{item.location}</dd>
                </div>
              )}
              {item.supplier && (
                <div>
                  <dt className="text-xs uppercase text-lab-muted">Supplier</dt>
                  <dd className="text-lab-text">{item.supplier.name}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
              Transaction History
            </h2>
            {item.transactions.length === 0 ? (
              <p className="mt-3 text-sm text-lab-muted">No transactions yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {item.transactions.map((tx) => (
                  <li key={tx.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-lab-line/60 pb-2">
                    <div>
                      <span className={tx.quantity >= 0 ? 'text-lab-accent' : 'text-lab-warn'}>
                        {tx.quantity >= 0 ? '+' : ''}
                        {tx.quantity}
                      </span>
                      <span className="ml-2 text-lab-text">{tx.type}</span>
                      {tx.repair && (
                        <Link href={`/admin/repairs/${tx.repair.id}`} className="ml-2 font-mono text-xs text-lab-accent">
                          {tx.repair.referenceCode}
                        </Link>
                      )}
                      {tx.notes && <p className="text-xs text-lab-muted">{tx.notes}</p>}
                    </div>
                    <span className="text-xs text-lab-muted">
                      {tx.createdAt.toLocaleString()}
                      {tx.createdBy && ` · ${tx.createdBy.name}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
            Record Transaction
          </h2>
          <InventoryTransactionForm itemId={item.id} />
        </div>
      </div>
    </div>
  )
}
