import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LeadsKanbanBoard, type LeadCardData } from '@/components/admin/LeadsKanbanBoard'
import { BusinessAccountRow } from '@/components/admin/BusinessAccountRow'

export const dynamic = 'force-dynamic'

export default async function AdminLeadsPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const [leads, users, businessAccounts] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
    }),
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.businessAccount.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ])

  const leadCards: LeadCardData[] = leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    deviceDescription: lead.deviceDescription,
    problemDescription: lead.problemDescription,
    source: lead.source,
    status: lead.status,
    priority: lead.priority,
    estimatedValueCents: lead.estimatedValueCents,
    notes: lead.notes,
    followUpDate: lead.followUpDate ? lead.followUpDate.toISOString() : null,
    assignedToId: lead.assignedToId,
    convertedCustomerId: lead.convertedCustomerId,
    createdAt: lead.createdAt.toISOString(),
  }))

  const pendingAccounts = businessAccounts.filter((a) => !a.isApproved).length

  return (
    <div className="space-y-12">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-lab-text">Leads Pipeline</h1>
          <Link href="/admin" className="text-xs text-lab-muted hover:text-lab-accent">
            &larr; Dashboard
          </Link>
        </div>
        <p className="mt-1 text-sm text-lab-muted">
          Drag a card between stages, click one to assign, prioritize, set a follow-up, or convert
          it into a customer. Repair requests already have a customer and go straight to the Repair
          Queue; trade/business account applications are below.
        </p>

        <div className="mt-6">
          <LeadsKanbanBoard initialLeads={leadCards} users={users} />
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
