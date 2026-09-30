import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminDevicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const { q } = await searchParams
  const query = q?.trim()

  const devices = await prisma.device.findMany({
    where: query
      ? {
          OR: [
            { manufacturer: { contains: query, mode: 'insensitive' } },
            { model: { contains: query, mode: 'insensitive' } },
            { serialNumber: { contains: query, mode: 'insensitive' } },
            { partNumber: { contains: query, mode: 'insensitive' } },
            { repair: { customer: { name: { contains: query, mode: 'insensitive' } } } },
            { repair: { customer: { email: { contains: query, mode: 'insensitive' } } } },
          ],
        }
      : undefined,
    include: { repair: { include: { customer: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-lab-text">Devices</h1>
          <p className="mt-1 text-sm text-lab-muted">
            Every piece of equipment on file, searchable by serial number, manufacturer, model, or
            owner. Each device is created as part of a repair request — there&apos;s no standalone
            device entry yet since every device on file has exactly one repair tied to it today.
          </p>
        </div>
      </div>

      <form className="mt-6 max-w-sm">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search serial, manufacturer, model, owner…"
          className="w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-lab-line text-xs uppercase tracking-wide text-lab-muted">
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4">Manufacturer / Model</th>
              <th className="py-3 pr-4">Serial / Part #</th>
              <th className="py-3 pr-4">Owner</th>
              <th className="py-3 pr-4">Repair</th>
              <th className="py-3 pr-4">Received</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id} className="border-b border-lab-line/60 hover:bg-lab-panel2">
                <td className="py-3 pr-4 text-lab-muted">{device.category.replace(/_/g, ' ')}</td>
                <td className="py-3 pr-4 text-lab-text">
                  {device.manufacturer} {device.model}
                </td>
                <td className="py-3 pr-4 text-lab-muted">
                  {device.serialNumber || device.partNumber || '—'}
                </td>
                <td className="py-3 pr-4 text-lab-muted">
                  {device.repair ? (
                    <Link
                      href={`/admin/customers/${device.repair.customer.id}`}
                      className="text-lab-accent"
                    >
                      {device.repair.customer.name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 pr-4">
                  {device.repair ? (
                    <Link
                      href={`/admin/repairs/${device.repair.id}`}
                      className="font-mono text-lab-accent"
                    >
                      {device.repair.referenceCode}
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 pr-4 text-lab-muted">{device.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
            {devices.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-lab-muted">
                  {query ? 'No devices match that search.' : 'No devices yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
