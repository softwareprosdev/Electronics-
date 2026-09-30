import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RepairStatusForm } from '@/components/admin/RepairStatusForm'
import { DiagnosticForm } from '@/components/admin/DiagnosticForm'
import { QuoteManager } from '@/components/admin/QuoteManager'

export const dynamic = 'force-dynamic'

export default async function AdminRepairDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const { id } = await params

  const repair = await prisma.repair.findUnique({
    where: { id },
    include: {
      customer: true,
      device: true,
      attachments: true,
      statusHistory: { orderBy: { createdAt: 'desc' } },
      quotes: { orderBy: { createdAt: 'desc' } },
      diagnostics: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!repair) notFound()

  return (
    <div>
      <Link href="/admin/repairs" className="text-xs text-lab-muted hover:text-lab-accent">
        &larr; Back to Repair Queue
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-mono text-xl font-bold text-lab-text">{repair.referenceCode}</h1>
        <span className="rounded-sm border border-lab-accent/40 px-3 py-1 text-xs text-lab-accent">
          {repair.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">Customer</h2>
            <p className="mt-3 text-sm text-lab-text">{repair.customer.name}</p>
            <p className="text-sm text-lab-muted">{repair.customer.email}</p>
            <p className="text-sm text-lab-muted">{repair.customer.phone}</p>
            {repair.customer.company && <p className="text-sm text-lab-muted">{repair.customer.company}</p>}
          </div>

          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">Equipment</h2>
            <p className="mt-3 text-sm text-lab-text">
              {repair.device.category.replace(/_/g, ' ')} &mdash; {repair.device.manufacturer}{' '}
              {repair.device.model}
            </p>
            {repair.device.serialNumber && (
              <p className="text-sm text-lab-muted">Serial: {repair.device.serialNumber}</p>
            )}
            {repair.device.partNumber && (
              <p className="text-sm text-lab-muted">Part #: {repair.device.partNumber}</p>
            )}
          </div>

          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">Failure Details</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {repair.errorCode && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-lab-muted">Error Code</dt>
                  <dd className="text-lab-text">{repair.errorCode}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs uppercase tracking-wide text-lab-muted">Symptoms</dt>
                <dd className="text-lab-text">{repair.symptoms}</dd>
              </div>
              {repair.previousAttempts && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-lab-muted">Previous Attempts</dt>
                  <dd className="text-lab-text">{repair.previousAttempts}</dd>
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                {repair.hasLiquidDamage && <Flag label="Liquid Damage" />}
                {repair.hasPhysicalDamage && <Flag label="Physical Damage" />}
                {repair.hasPowerIssue && <Flag label="Power Issue" />}
                {repair.isIntermittent && <Flag label="Intermittent" />}
                {repair.hasNoDisplay && <Flag label="No Display" />}
                {repair.hasBootFailure && <Flag label="Boot Failure" />}
              </div>
            </dl>
          </div>

          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
              Attachments ({repair.attachments.length})
            </h2>
            {repair.attachments.length === 0 ? (
              <p className="mt-3 text-sm text-lab-muted">No files uploaded.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-lab-muted">
                {repair.attachments.map((attachment) => (
                  <li key={attachment.id}>
                    {attachment.fileName} &middot; {attachment.kind} &middot;{' '}
                    {(attachment.sizeBytes / 1024).toFixed(0)} KB
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
              Diagnostics ({repair.diagnostics.length})
            </h2>
            {repair.diagnostics.length === 0 ? (
              <p className="mt-3 text-sm text-lab-muted">No diagnostic entries yet.</p>
            ) : (
              <ul className="mt-3 space-y-4">
                {repair.diagnostics.map((diagnostic) => (
                  <li key={diagnostic.id} className="border-b border-lab-line/60 pb-3 text-sm last:border-0">
                    <p className="text-lab-text">{diagnostic.findings}</p>
                    {diagnostic.rootCause && (
                      <p className="mt-1 text-xs text-lab-muted">
                        Root cause: {diagnostic.rootCause}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-lab-muted">
                      {diagnostic.isRepairable !== null && (
                        <span
                          className={`rounded-sm border px-2 py-0.5 ${
                            diagnostic.isRepairable
                              ? 'border-lab-accent/40 text-lab-accent'
                              : 'border-lab-danger/40 text-lab-danger'
                          }`}
                        >
                          {diagnostic.isRepairable ? 'Repairable' : 'Not repairable'}
                        </span>
                      )}
                      <span>{diagnostic.performedBy}</span>
                      <span>{diagnostic.createdAt.toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <DiagnosticForm repairId={repair.id} />
          </div>

          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">Quotes</h2>
            <QuoteManager
              repairId={repair.id}
              initialQuotes={repair.quotes.map((quote) => ({
                id: quote.id,
                amountCents: quote.amountCents,
                currency: quote.currency,
                status: quote.status,
                notes: quote.notes,
                sentAt: quote.sentAt ? quote.sentAt.toISOString() : null,
                respondedAt: quote.respondedAt ? quote.respondedAt.toISOString() : null,
                createdAt: quote.createdAt.toISOString(),
              }))}
            />
          </div>

          <div className="panel p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">Status History</h2>
            <ul className="mt-3 space-y-3">
              {repair.statusHistory.map((event) => (
                <li key={event.id} className="text-sm">
                  <span className="text-lab-text">{event.status.replace(/_/g, ' ')}</span>
                  <span className="ml-2 text-xs text-lab-muted">
                    {event.createdAt.toLocaleString()}
                  </span>
                  {event.note && <p className="text-xs text-lab-muted">{event.note}</p>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <RepairStatusForm
            repairId={repair.id}
            currentStatus={repair.status}
            currentNotes={repair.internalNotes || ''}
          />
        </div>
      </div>
    </div>
  )
}

function Flag({ label }: { label: string }) {
  return (
    <span className="rounded-sm border border-lab-warn/40 px-2 py-1 text-xs text-lab-warn">
      {label}
    </span>
  )
}
