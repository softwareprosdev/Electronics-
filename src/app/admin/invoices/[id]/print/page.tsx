import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { siteConfig } from '@/lib/site-config'
import { PrintButton } from '@/components/admin/PrintButton'

export const dynamic = 'force-dynamic'

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const { id } = await params

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      repair: { include: { customer: true, device: true } },
      payments: { orderBy: { paidAt: 'desc' } },
    },
  })

  if (!invoice) notFound()

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amountCents, 0)
  const balanceDue = invoice.amountCents - totalPaid

  return (
    <div className="mx-auto max-w-2xl p-8 print:p-0">
      <div className="print:hidden">
        <Link href={`/admin/repairs/${invoice.repair.id}`} className="text-xs text-lab-muted hover:text-lab-accent">
          &larr; Back to Repair
        </Link>
        <PrintButton />
      </div>

      <div className="mt-6 flex items-start justify-between">
        <div>
          <p className="text-lg font-bold text-lab-text">{siteConfig.name}</p>
          <p className="text-xs text-lab-muted">{siteConfig.legalName}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm text-lab-text">{invoice.invoiceNumber}</p>
          <p className="text-xs text-lab-muted">
            Issued {invoice.createdAt.toLocaleDateString()}
          </p>
          {invoice.dueDate && (
            <p className="text-xs text-lab-muted">Due {invoice.dueDate.toLocaleDateString()}</p>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Bill To</p>
          <p className="mt-1 text-lab-text">{invoice.repair.customer.name}</p>
          <p className="text-lab-muted">{invoice.repair.customer.email}</p>
          {invoice.repair.customer.phone && (
            <p className="text-lab-muted">{invoice.repair.customer.phone}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Repair</p>
          <p className="mt-1 font-mono text-lab-text">{invoice.repair.referenceCode}</p>
          <p className="text-lab-muted">
            {invoice.repair.device.manufacturer} {invoice.repair.device.model}
          </p>
        </div>
      </div>

      <table className="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-lab-line text-left text-xs uppercase tracking-wide text-lab-muted">
            <th className="py-2">Description</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-lab-line/60">
            <td className="py-3 text-lab-text">
              Board-level repair service
              {invoice.notes && <span className="block text-xs text-lab-muted">{invoice.notes}</span>}
            </td>
            <td className="py-3 text-right text-lab-text">{formatCents(invoice.amountCents)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="border-b border-lab-line/60 text-sm">
            <td className="py-2 text-right text-lab-muted">Total</td>
            <td className="py-2 text-right text-lab-text">{formatCents(invoice.amountCents)}</td>
          </tr>
          <tr className="border-b border-lab-line/60 text-sm">
            <td className="py-2 text-right text-lab-muted">Paid</td>
            <td className="py-2 text-right text-lab-text">{formatCents(totalPaid)}</td>
          </tr>
          <tr className="text-base font-semibold">
            <td className="py-2 text-right text-lab-text">Balance Due</td>
            <td className="py-2 text-right text-lab-accent">
              {formatCents(Math.max(balanceDue, 0))}
            </td>
          </tr>
        </tfoot>
      </table>

      {invoice.payments.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Payment History
          </p>
          <ul className="mt-2 space-y-1 text-xs text-lab-muted">
            {invoice.payments.map((p) => (
              <li key={p.id}>
                {p.paidAt.toLocaleDateString()} &middot; {formatCents(p.amountCents)} via {p.method}
                {p.transactionReference && ` (${p.transactionReference})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-10 text-center text-xs text-lab-muted">
        {siteConfig.name} &middot; {siteConfig.phoneDisplay} &middot; {siteConfig.email}
      </p>
    </div>
  )
}
