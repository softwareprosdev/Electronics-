import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LeadRow } from '@/components/admin/LeadRow'
import { BusinessAccountRow } from '@/components/admin/BusinessAccountRow'

export const dynamic = 'force-dynamic'

const leadStatusOrder = ['NEW', 'CONTACTED', 'CLOSED'] as const

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const { status: rawStatus } = await searchParams
  const statusFilter = leadStatusOrder.find((status) => status === rawStatus)

  const [submissions, submissionCounts, businessAccounts] = await Promise.all([
    prisma.contactSubmission.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.contactSubmission.groupBy({ by: ['status'], _count: true }),
    prisma.businessAccount.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ])

  const countMap = Object.fromEntries(submissionCounts.map((c) => [c.status, c._count]))
  const pendingAccounts = businessAccounts.filter((a) => !a.isApproved).length

  return (
    <div className="space-y-12">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-lab-text">Leads &amp; Inquiries</h1>
          <Link href="/admin" className="text-xs text-lab-muted hover:text-lab-accent">
            &larr; Dashboard
          </Link>
        </div>
        <p className="mt-1 text-sm text-lab-muted">
          Contact-form and general inquiries. Repair requests live in the Repair Queue; trade/business
          account applications are below.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/admin/leads"
            className={`rounded-sm border px-3 py-1 text-xs ${
              !statusFilter ? 'border-lab-accent text-lab-accent' : 'border-lab-line text-lab-muted'
            }`}
          >
            All ({submissions.length})
          </Link>
          {leadStatusOrder.map((status) => (
            <Link
              key={status}
              href={`/admin/leads?status=${status}`}
              className={`rounded-sm border px-3 py-1 text-xs ${
                statusFilter === status
                  ? 'border-lab-accent text-lab-accent'
                  : 'border-lab-line text-lab-muted'
              }`}
            >
              {status} ({countMap[status] || 0})
            </Link>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-lab-line text-xs uppercase tracking-wide text-lab-muted">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Contact</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Submitted</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <LeadRow
                  key={submission.id}
                  id={submission.id}
                  type={submission.type}
                  name={submission.name}
                  email={submission.email}
                  phone={submission.phone}
                  message={submission.message}
                  createdAt={submission.createdAt.toLocaleString()}
                  currentStatus={submission.status}
                  currentNotes={submission.internalNotes || ''}
                />
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-lab-muted">
                    No inquiries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-lab-text">
          Business Account Requests
          {pendingAccounts > 0 && (
            <span className="ml-3 rounded-sm border border-lab-warn/40 px-2 py-1 text-xs text-lab-warn">
              {pendingAccounts} pending
            </span>
          )}
        </h2>
        <p className="mt-1 text-sm text-lab-muted">
          Trade / fleet / insurance / refurbisher account applications. Approve to unlock trade
          pricing and intake for that shop.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-lab-line text-xs uppercase tracking-wide text-lab-muted">
                <th className="py-3 pr-4">Shop</th>
                <th className="py-3 pr-4">Contact</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Submitted</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {businessAccounts.map((account) => (
                <BusinessAccountRow
                  key={account.id}
                  id={account.id}
                  shopName={account.shopName}
                  contactName={account.contactName}
                  email={account.email}
                  phone={account.phone}
                  accountType={account.accountType}
                  monthlyVolume={account.monthlyVolume}
                  equipmentTypes={account.equipmentTypes}
                  outsourcingNeeds={account.outsourcingNeeds}
                  createdAt={account.createdAt.toLocaleString()}
                  currentIsApproved={account.isApproved}
                  currentNotes={account.notes || ''}
                />
              ))}
              {businessAccounts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-lab-muted">
                    No business account requests yet.
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
