import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { CustomerForm } from '@/components/admin/CustomerForm'

export default async function NewCustomerPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="max-w-2xl">
      <Link href="/admin/customers" className="text-xs text-lab-muted hover:text-lab-accent">
        &larr; Customers
      </Link>
      <h1 className="mt-4 text-xl font-bold text-lab-text">New Customer</h1>
      <p className="mt-1 text-sm text-lab-muted">
        For a walk-in or phone lead — anyone who hasn&apos;t gone through the website form.
      </p>
      <div className="mt-6">
        <CustomerForm />
      </div>
    </div>
  )
}
