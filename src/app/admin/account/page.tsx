import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { ChangePasswordForm } from '@/components/admin/ChangePasswordForm'

export default async function AdminAccountPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-lab-text">Account</h1>
      <p className="mt-1 text-sm text-lab-muted">Signed in as {session.email}</p>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-accent">
          Change Password
        </h2>
        <p className="mt-2 text-sm text-lab-muted">
          If this account was ever created with the setup script&apos;s default password, change it
          now — that default lives in the project&apos;s source code.
        </p>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}
