import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const { q } = await searchParams
  const query = q?.trim()

  const customers = await prisma.customer.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: { _count: { select: { repairRequests: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-lab-text">Customers</h1>
          <p className="mt-1 text-sm text-lab-muted">
            Every customer on file, from web submissions or added directly.
          </p>
        </div>
        <Link href="/admin/customers/new" className="btn-primary">
          + New Customer
        </Link>
      </div>

      <form className="mt-6 max-w-sm">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search name, email, phone, company…"
          className="w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-lab-line text-xs uppercase tracking-wide text-lab-muted">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Contact</th>
              <th className="py-3 pr-4">Company</th>
              <th className="py-3 pr-4">Repairs</th>
              <th className="py-3 pr-4">Added</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-lab-line/60 hover:bg-lab-panel2">
                <td className="py-3 pr-4">
                  <Link href={`/admin/customers/${customer.id}`} className="text-lab-accent">
                    {customer.name}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-lab-muted">
                  {customer.email}
                  {customer.phone && <div className="text-xs">{customer.phone}</div>}
                </td>
                <td className="py-3 pr-4 text-lab-muted">{customer.company || '—'}</td>
                <td className="py-3 pr-4 text-lab-muted">{customer._count.repairRequests}</td>
                <td className="py-3 pr-4 text-lab-muted">{customer.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-lab-muted">
                  {query ? 'No customers match that search.' : 'No customers yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
