import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const QUEUE_ORDER = [
  'NEW',
  'UNDER_REVIEW',
  'DIAGNOSTIC_PENDING',
  'DIAGNOSING',
  'QUOTE_SENT',
  'APPROVED',
  'IN_REPAIR',
  'TESTING',
  'RETURN_SHIPPING',
] as const

export default async function MyRepairsPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const technician = await prisma.technician.findUnique({
    where: { userId: session.sub },
  })

  if (!technician) {
    return (
      <div>
        <h1 className="text-xl font-bold text-lab-text">My Repairs</h1>
        <p className="mt-3 text-sm text-lab-muted">
          This account doesn&apos;t have a technician profile, so there&apos;s nothing assigned to
          it specifically. Assign a technician to a repair from the Repair Queue to see it show up
          here.
        </p>
      </div>
    )
  }

  const repairs = await prisma.repair.findMany({
    where: { technicianId: technician.id, status: { in: [...QUEUE_ORDER] } },
    include: { customer: true, device: true },
    orderBy: { createdAt: 'asc' },
  })

  const byStatus = QUEUE_ORDER.map((status) => ({
    status,
    repairs: repairs.filter((r) => r.status === status),
  })).filter((group) => group.repairs.length > 0)

  return (
    <div>
      <h1 className="text-xl font-bold text-lab-text">My Repairs</h1>
      <p className="mt-1 text-sm text-lab-muted">
        Everything assigned to you, {repairs.length} open.
      </p>

      <div className="mt-8 space-y-8">
        {byStatus.map((group) => (
          <div key={group.status}>
            <p className="eyebrow">{group.status.replace(/_/g, ' ')}</p>
            <ul className="mt-3 space-y-2">
              {group.repairs.map((repair) => (
                <li key={repair.id}>
                  <Link
                    href={`/admin/repairs/${repair.id}`}
                    className="readout block px-4 py-3 text-sm transition hover:bg-lab-panel2"
                  >
                    <span className="font-mono text-lab-accent">{repair.referenceCode}</span>
                    <span className="ml-3 text-lab-text">
                      {repair.customer.name} — {repair.device.manufacturer} {repair.device.model}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {byStatus.length === 0 && (
          <p className="text-sm text-lab-muted">Nothing currently assigned to you. Nice work.</p>
        )}
      </div>
    </div>
  )
}
