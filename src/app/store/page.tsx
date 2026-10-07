import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Parts & Components Shop',
  description:
    'Board-level repair components — capacitors, connectors, MOSFETs, and other high-demand parts — in stock and ready to ship.',
}

export const dynamic = 'force-dynamic'

export default async function StorePage() {
  const items = await prisma.inventoryItem.findMany({
    where: { isForSale: true },
    orderBy: { publicName: 'asc' },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="eyebrow">Parts &amp; Components</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-lab-text">Shop</h1>
      <p className="mt-2 max-w-2xl text-sm text-lab-muted">
        Component-level repair parts we stock in the lab — the same parts and consumables we use
        on customer boards, sold individually.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/store/${item.slug}`}
            className="panel group overflow-hidden transition hover:border-lab-accent/50"
          >
            <div className="aspect-square bg-lab-panel2">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin-entered
                // external URLs from arbitrary supplier domains; next/image requires a
                // configured remotePatterns allowlist we deliberately don't maintain here.
                <img
                  src={item.imageUrl}
                  alt={item.publicName || item.description}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-lab-muted">
                  No image
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-sm font-semibold text-lab-text group-hover:text-lab-accent">
                {item.publicName || item.description}
              </h2>
              <p className="mt-2 font-mono text-lab-accent">
                ${((item.sellingPriceCents || 0) / 100).toFixed(2)}
              </p>
              {item.quantityOnHand <= 0 && (
                <p className="mt-1 text-xs text-lab-danger">Out of stock</p>
              )}
            </div>
          </Link>
        ))}
        {items.length === 0 && (
          <p className="col-span-full text-sm text-lab-muted">
            Nothing in the shop yet — check back soon.
          </p>
        )}
      </div>
    </div>
  )
}
