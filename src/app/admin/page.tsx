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

const KIND_ACCENT: Record<ActivityItem['kind'], string> = {
  repair: 'border-l-lab-accent',
  lead: 'border-l-lab-warn',
  business: 'border-l-lab-accent2',
}

const KIND_TAG: Record<ActivityItem['kind'], string> = {
  repair: 'REPAIR',
  lead: 'INQUIRY',
  business: 'TRADE',
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
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.businessAccount.count({ where: { isApproved: false } }),
    prisma.repair.findMany({
      include: { customer: true, device: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
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
      title: `${l.name}${l.company ? ` — ${l.company}` : ''}`,
      subtitle: l.email,
      href: '/admin/leads',
      badge: l.status.replace(/_/g, ' '),
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

  const now = new Date()
  const timestamp = now.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-lab-accent [animation:status-pulse_2s_ease-in-out_infinite]" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-lab-accent" />
        </span>
        <p className="eyebrow">Laboratory Status &middot; Operational</p>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-lab-text">Command Center</h1>
        <p className="font-mono text-xs text-lab-muted">{timestamp}</p>
      </div>
      <p className="mt-1 text-sm text-lab-muted">Signed in as {session.email}</p>

      <div className="circuit-bg readout mt-8 grid grid-cols-1 divide-y divide-lab-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <StatCell
          label="Open Repairs"
          value={openRepairCount}
          href="/admin/repairs"
          tone={openRepairCount > 0 ? 'accent' : 'muted'}
        />
        <StatCell
          label="New Inquiries"
          value={newLeadCount}
          href="/admin/leads"
          tone={newLeadCount > 0 ? 'warn' : 'muted'}
        />
        <StatCell
          label="Pending Trade Accounts"
          value={pendingAccountCount}
          href="/admin/leads"
          tone={pendingAccountCount > 0 ? 'warn' : 'muted'}
        />
      </div>

      <div className="mt-10">
        <p className="eyebrow">Activity Log</p>
        <div className="readout mt-4 divide-y divide-lab-line/60">
          {activity.map((item) => (
            <Link
              key={`${item.kind}-${item.id}`}
              href={item.href}
              className={`flex flex-wrap items-center gap-3 border-l-2 px-4 py-3 text-sm transition hover:bg-lab-panel2 sm:flex-nowrap ${KIND_ACCENT[item.kind]}`}
            >
              <span className="font-mono text-[10px] tracking-wide text-lab-muted">
                {item.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="rounded-sm border border-lab-line px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-lab-muted">
                {KIND_TAG[item.kind]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-lab-text">{item.title}</span>
                <span className="block truncate text-xs text-lab-muted">{item.subtitle}</span>
              </span>
              <span className="ml-auto whitespace-nowrap font-mono text-[10px] uppercase tracking-wide text-lab-muted">
                {item.badge}
              </span>
            </Link>
          ))}
          {activity.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-lab-muted">
              No activity yet — new repair requests, contact inquiries, and business account
              requests will show up here as soon as someone submits a form on the site.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCell({
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
  const dotClass = tone === 'accent' ? 'bg-lab-accent' : tone === 'warn' ? 'bg-lab-warn' : 'bg-lab-line'

  return (
    <Link href={href} className="group block bg-lab-panel/60 p-6 transition hover:bg-lab-panel2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">{label}</p>
        <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      </div>
      <p className={`mt-3 font-mono text-4xl font-bold tabular-nums ${toneClass}`}>
        {String(value).padStart(2, '0')}
      </p>
      <p className="mt-2 text-xs text-lab-muted opacity-0 transition group-hover:opacity-100">
        View &rarr;
      </p>
    </Link>
  )
}
