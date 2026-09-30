import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const OPEN_REPAIR_STATUSES = [
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

type ActivityItem = {
  id: string
  kind: 'repair' | 'lead' | 'business'
  title: string
  subtitle: string
  href: string
  badge: string
  createdAt: Date
}

export default async function AdminDashboardPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const [
    openRepairCount,
    newLeadCount,
    pendingAccountCount,
    recentRepairs,
    recentLeads,
    recentAccounts,
  ] = await Promise.all([
    prisma.repair.count({ where: { status: { in: [...OPEN_REPAIR_STATUSES] } } }),
    prisma.contactSubmission.count({ where: { status: 'NEW' } }),
    prisma.businessAccount.count({ where: { isApproved: false } }),
    prisma.repair.findMany({
      include: { customer: true, device: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.businessAccount.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
  ])

  const activity: ActivityItem[] = [
    ...recentRepairs.map((r) => ({
      id: r.id,
      kind: 'repair' as const,
      title: `${r.customer.name} — ${r.device.manufacturer} ${r.device.model}`,
      subtitle: r.referenceCode,
      href: `/admin/repairs/${r.id}`,
      badge: r.status.replace(/_/g, ' '),
      createdAt: r.createdAt,
    })),
    ...recentLeads.map((l) => ({
      id: l.id,
      kind: 'lead' as const,
      title: `${l.name} — ${l.type.replace(/_/g, ' ')}`,
      subtitle: l.email,
      href: '/admin/leads',
      badge: l.status,
      createdAt: l.createdAt,
    })),
    ...recentAccounts.map((a) => ({
      id: a.id,
      kind: 'business' as const,
      title: `${a.shopName} (${a.accountType})`,
      subtitle: a.contactName,
      href: '/admin/leads',
      badge: a.isApproved ? 'APPROVED' : 'PENDING',
      createdAt: a.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 15)

  return (
    <div>
      <h1 className="text-xl font-bold text-lab-text">Dashboard</h1>
      <p className="mt-1 text-sm text-lab-muted">
        Everything coming in through the site, in one place. Signed in as {session.email}.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Open Repairs"
          value={openRepairCount}
          href="/admin/repairs"
          tone={openRepairCount > 0 ? 'accent' : 'muted'}
        />
        <StatCard
          label="New Inquiries"
          value={newLeadCount}
          href="/admin/leads"
          tone={newLeadCount > 0 ? 'warn' : 'muted'}
        />
        <StatCard
          label="Pending Trade Accounts"
          value={pendingAccountCount}
          href="/admin/leads"
          tone={pendingAccountCount > 0 ? 'warn' : 'muted'}
        />
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
          Recent Activity
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-lab-line text-xs uppercase tracking-wide text-lab-muted">
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4">Details</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">When</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((item) => (
                <tr
                  key={`${item.kind}-${item.id}`}
                  className="border-b border-lab-line/60 hover:bg-lab-panel2"
                >
                  <td className="py-3 pr-4 text-lab-muted">{kindLabel(item.kind)}</td>
                  <td className="py-3 pr-4">
                    <Link href={item.href} className="text-lab-text hover:text-lab-accent">
                      {item.title}
                    </Link>
                    <div className="text-xs text-lab-muted">{item.subtitle}</div>
                  </td>
                  <td className="py-3 pr-4 text-lab-muted">{item.badge}</td>
                  <td className="py-3 pr-4 text-lab-muted">{item.createdAt.toLocaleString()}</td>
                </tr>
              ))}
              {activity.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-lab-muted">
                    No activity yet — new repair requests, contact inquiries, and business account
                    requests will show up here as soon as someone submits a form on the site.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function kindLabel(kind: ActivityItem['kind']) {
  if (kind === 'repair') return 'Repair'
  if (kind === 'lead') return 'Inquiry'
  return 'Trade Account'
}

function StatCard({
  label,
  value,
  href,
  tone,
}: {
  label: string
  value: number
  href: string
  tone: 'accent' | 'warn' | 'muted'
}) {
  const toneClass =
    tone === 'accent' ? 'text-lab-accent' : tone === 'warn' ? 'text-lab-warn' : 'text-lab-muted'

  return (
    <Link href={href} className="panel block p-6 hover:border-lab-accent/50">
      <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${toneClass}`}>{value}</p>
    </Link>
  )
}
