import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { InventoryItemForm } from '@/components/admin/InventoryItemForm'

export default async function NewInventoryItemPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="max-w-2xl">
      <Link href="/admin/inventory" className="text-xs text-lab-muted hover:text-lab-accent">
        &larr; Inventory
      </Link>
      <h1 className="mt-4 text-xl font-bold text-lab-text">New Inventory Item</h1>
      <div className="mt-6">
        <InventoryItemForm />
      </div>
    </div>
  )
}
