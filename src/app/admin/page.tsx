import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const statusOrder = [
  'NEW',
  'UNDER_REVIEW',
  'DIAGNOSTIC_PENDING',
  'DIAGNOSING',
  'QUOTE_SENT',
  'APPROVED',
  'IN_REPAIR',
  'TESTING',
  'COMPLETED',
  'RETURN_SHIPPING',
  'CLOSED',
  'UNREPAIRABLE',
] as const

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const statusFilter = searchParams.status

  const repairs = await prisma.repair.findMany({
    where: statusFilter ? { status: statusFilter as (typeof statusOrder)[number] } : undefined,
    include: { customer: true, device: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const counts = await prisma.repair.groupBy({
    by: ['status'],
    _count: true,
  })

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]))

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-lab-text">Repair Queue</h1>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin"
          className={`rounded-sm border px-3 py-1 text-xs ${
            !statusFilter ? 'border-lab-accent text-lab-accent' : 'border-lab-line text-lab-muted'
          }`}
        >
          All ({repairs.length})
        </Link>
        {statusOrder.map((status) => (
          <Link
            key={status}
            href={`/admin?status=${status}`}
            className={`rounded-sm border px-3 py-1 text-xs ${
              statusFilter === status
                ? 'border-lab-accent text-lab-accent'
                : 'border-lab-line text-lab-muted'
            }`}
          >
            {status.replace(/_/g, ' ')} ({countMap[status] || 0})
          </Link>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-lab-line text-xs uppercase tracking-wide text-lab-muted">
              <th className="py-3 pr-4">Reference</th>
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Equipment</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {repairs.map((repair) => (
              <tr key={repair.id} className="border-b border-lab-line/60 hover:bg-lab-panel2">
                <td className="py-3 pr-4">
                  <Link href={`/admin/repairs/${repair.id}`} className="font-mono text-lab-accent">
                    {repair.referenceCode}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-lab-text">{repair.customer.name}</td>
                <td className="py-3 pr-4 text-lab-muted">
                  {repair.device.manufacturer} {repair.device.model}
                </td>
                <td className="py-3 pr-4 text-lab-muted">{repair.status.replace(/_/g, ' ')}</td>
                <td className="py-3 pr-4 text-lab-muted">
                  {repair.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
            {repairs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-lab-muted">
                  No repair requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
