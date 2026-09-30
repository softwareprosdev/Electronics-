import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; low?: string }>
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const { q, low } = await searchParams
  const query = q?.trim()
  const lowStockOnly = low === '1'

  const items = await prisma.inventoryItem.findMany({
    where: query
      ? {
          OR: [
            { sku: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { manufacturer: { contains: query, mode: 'insensitive' } },
            { partNumber: { contains: query, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: { supplier: true },
    orderBy: { description: 'asc' },
    take: 300,
  })

  const visibleItems = lowStockOnly
    ? items.filter((item) => item.quantityOnHand <= item.minimumQuantity)
    : items
  const lowStockCount = items.filter((item) => item.quantityOnHand <= item.minimumQuantity).length

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-lab-text">Inventory</h1>
          <p className="mt-1 text-sm text-lab-muted">
            Parts and consumables on hand. Quantity changes only happen through a logged
            transaction — there is no direct edit of the count itself.
          </p>
        </div>
        <Link href="/admin/inventory/new" className="btn-primary">
          + New Item
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <form className="max-w-sm flex-1">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search SKU, description, manufacturer, part #…"
            className="w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          />
        </form>
        <Link
          href={lowStockOnly ? '/admin/inventory' : '/admin/inventory?low=1'}
          className={`rounded-sm border px-3 py-1 text-xs ${
            lowStockOnly ? 'border-lab-warn text-lab-warn' : 'border-lab-line text-lab-muted'
          }`}
        >
          Low Stock ({lowStockCount})
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-lab-line text-xs uppercase tracking-wide text-lab-muted">
              <th className="py-3 pr-4">SKU</th>
              <th className="py-3 pr-4">Description</th>
              <th className="py-3 pr-4">On Hand</th>
              <th className="py-3 pr-4">Cost</th>
              <th className="py-3 pr-4">Supplier</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => (
              <tr key={item.id} className="border-b border-lab-line/60 hover:bg-lab-panel2">
                <td className="py-3 pr-4">
                  <Link href={`/admin/inventory/${item.id}`} className="font-mono text-lab-accent">
                    {item.sku}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-lab-text">{item.description}</td>
                <td className="py-3 pr-4">
                  <span className={item.quantityOnHand <= item.minimumQuantity ? 'text-lab-warn' : 'text-lab-text'}>
                    {item.quantityOnHand}
                  </span>
                  <span className="text-lab-muted"> / min {item.minimumQuantity}</span>
                </td>
                <td className="py-3 pr-4 text-lab-muted">${(item.costCents / 100).toFixed(2)}</td>
                <td className="py-3 pr-4 text-lab-muted">{item.supplier?.name || '—'}</td>
              </tr>
            ))}
            {visibleItems.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-lab-muted">
                  {query ? 'No items match that search.' : 'No inventory items yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
