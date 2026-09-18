import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MARKETING_VIEW_ROLES } from '@/lib/rbac'
import { MarketingDraftGenerator } from '@/components/admin/MarketingDraftGenerator'
import { MarketingDraftList } from '@/components/admin/MarketingDraftList'

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  OK: 'text-lab-accent',
  DEGRADED: 'text-lab-warn',
  DOWN: 'text-lab-danger',
}

export default async function AdminMarketingPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  if (!MARKETING_VIEW_ROLES.includes(session.role as (typeof MARKETING_VIEW_ROLES)[number])) {
    return (
      <div className="panel p-6">
        <h1 className="text-xl font-bold text-lab-text">Marketing Swarm</h1>
        <p className="mt-3 text-sm text-lab-muted">
          Your account role ({session.role}) does not have access to the marketing swarm.
        </p>
      </div>
    )
  }

  const [drafts, latestChecksRaw] = await Promise.all([
    prisma.marketingDraft.findMany({
      include: { reviewedBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.funnelCheck.findMany({
      orderBy: { checkedAt: 'desc' },
      take: 50,
    }),
  ])

  const draftRows = drafts.map((d) => ({
    id: d.id,
    type: d.type,
    channel: d.channel,
    title: d.title,
    payload: d.payload,
    rationale: d.rationale,
    status: d.status,
    createdByAgent: d.createdByAgent,
    createdAt: d.createdAt.toLocaleString(),
    reviewedByName: d.reviewedBy?.name ?? null,
  }))

  // Most recent check per target, for the at-a-glance status row.
  const latestByTarget = new Map<string, (typeof latestChecksRaw)[number]>()
  for (const check of latestChecksRaw) {
    if (!latestByTarget.has(check.target)) latestByTarget.set(check.target, check)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-lab-text">Marketing AI Agent Swarm</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-lab-muted">
          Every proposed action below is a draft awaiting your approval — nothing here spends
          money or publishes content on its own. See{' '}
          <code className="text-lab-text">/docs/MARKETING_AI_ARCHITECTURE.md</code> for how the
          guardian (self-healing) and creative (self-learning) agents work.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-muted">
          Funnel Health (Guardian Agent)
        </h2>
        <div className="mt-3 overflow-x-auto">
          {latestByTarget.size === 0 ? (
            <p className="text-sm text-lab-muted">
              No checks reported yet — the scheduled health-check hasn&rsquo;t run, or hasn&rsquo;t
              been wired up with FUNNEL_CHECK_SECRET yet.
            </p>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-lab-muted">
                  <th className="pb-2">Target</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Last Checked</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(latestByTarget.values()).map((check) => (
                  <tr key={check.target} className="border-t border-lab-line">
                    <td className="py-2 text-lab-text">{check.target}</td>
                    <td className={`py-2 font-semibold ${STATUS_STYLES[check.status] ?? ''}`}>
                      {check.status}
                    </td>
                    <td className="py-2 text-lab-muted">{check.checkedAt.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-muted">
          Pending &amp; Recent Drafts
        </h2>
        <div className="mt-3 space-y-4">
          <MarketingDraftGenerator />
          <MarketingDraftList drafts={draftRows} />
        </div>
      </div>
    </div>
  )
}
