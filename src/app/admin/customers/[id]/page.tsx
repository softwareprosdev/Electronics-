import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CustomerForm } from '@/components/admin/CustomerForm'

export const dynamic = 'force-dynamic'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const { id } = await params

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      repairRequests: {
        include: { device: true },
        orderBy: { createdAt: 'desc' },
      },
      businessAccount: true,
    },
  })

  if (!customer) notFound()

  return (
    <div>
      <Link href="/admin/customers" className="text-xs text-lab-muted hover:text-lab-accent">
        &larr; Customers
      </Link>
      <h1 className="mt-4 text-xl font-bold text-lab-text">{customer.name}</h1>
      <p className="mt-1 text-sm text-lab-muted">
        Customer since {customer.createdAt.toLocaleDateString()}
        {customer.businessAccount && (
          <>
            {' '}
            &middot; Trade account:{' '}
            <Link href="/admin/leads" className="text-lab-accent">
              {customer.businessAccount.shopName}
            </Link>
          </>
        )}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
            Repairs ({customer.repairRequests.length})
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-lab-line text-xs uppercase tracking-wide text-lab-muted">
                  <th className="py-2 pr-4">Reference</th>
                  <th className="py-2 pr-4">Equipment</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {customer.repairRequests.map((repair) => (
                  <tr key={repair.id} className="border-b border-lab-line/60 hover:bg-lab-panel2">
                    <td className="py-2 pr-4">
                      <Link href={`/admin/repairs/${repair.id}`} className="font-mono text-lab-accent">
                        {repair.referenceCode}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-lab-muted">
                      {repair.device.manufacturer} {repair.device.model}
                    </td>
                    <td className="py-2 pr-4 text-lab-muted">{repair.status.replace(/_/g, ' ')}</td>
                    <td className="py-2 pr-4 text-lab-muted">
                      {repair.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {customer.repairRequests.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-lab-muted">
                      No repairs on file for this customer yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
            Contact Info
          </h2>
          <div className="mt-3">
            <CustomerForm
              customerId={customer.id}
              initialValues={{
                name: customer.name,
                email: customer.email,
                phone: customer.phone || '',
                company: customer.company || '',
                addressLine1: customer.addressLine1 || '',
                addressLine2: customer.addressLine2 || '',
                city: customer.city || '',
                state: customer.state || '',
                zip: customer.zip || '',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
