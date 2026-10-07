import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AddToCartForm } from '@/components/store/AddToCartForm'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await prisma.inventoryItem.findUnique({ where: { slug } })
  if (!item || !item.isForSale) return {}
  return {
    title: item.publicName || item.description,
    description: item.publicDescription || item.description,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await prisma.inventoryItem.findUnique({ where: { slug } })

  if (!item || !item.isForSale) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-sm border border-lab-line bg-lab-panel2">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- see /store/page.tsx
            <img
              src={item.imageUrl}
              alt={item.publicName || item.description}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-lab-muted">
              No image
            </div>
          )}
        </div>

        <div>
          {item.category && <p className="eyebrow">{item.category}</p>}
          <h1 className="mt-2 text-2xl font-bold text-lab-text">
            {item.publicName || item.description}
          </h1>
          <p className="mt-4 font-mono text-2xl text-lab-accent">
            ${((item.sellingPriceCents || 0) / 100).toFixed(2)}
          </p>
          {item.publicDescription && (
            <p className="mt-4 text-sm leading-relaxed text-lab-muted">{item.publicDescription}</p>
          )}

          <div className="mt-8">
            <AddToCartForm
              inventoryItemId={item.id}
              name={item.publicName || item.description}
              unitPriceCents={item.sellingPriceCents || 0}
              imageUrl={item.imageUrl}
              quantityOnHand={item.quantityOnHand}
            />
          </div>

          {item.manufacturer && (
            <p className="mt-6 text-xs text-lab-muted">Manufacturer: {item.manufacturer}</p>
          )}
          {item.partNumber && <p className="text-xs text-lab-muted">Part #: {item.partNumber}</p>}
        </div>
      </div>
    </div>
  )
}
