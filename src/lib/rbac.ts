// Role-based access control for the pricing/revenue platform routes.
// Reuses the existing admin session system (src/lib/auth.ts) rather than
// introducing a parallel auth mechanism. See /docs/SECURITY_MODEL.md.

import { getAdminSession, type AdminSessionPayload } from './auth'

export const PRICING_VIEW_ROLES = ['SUPER_ADMIN', 'ADMIN', 'OWNER', 'MANAGER'] as const
export const PRICING_RULE_EDIT_ROLES = ['SUPER_ADMIN', 'ADMIN', 'OWNER'] as const

export const MARKETING_VIEW_ROLES = ['SUPER_ADMIN', 'ADMIN', 'OWNER', 'MANAGER'] as const
export const MARKETING_APPROVE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'OWNER'] as const

export type RoleCheckResult =
  | { ok: true; session: AdminSessionPayload }
  | { ok: false; error: string; status: 401 | 403 }

export async function requireRole(allowedRoles: readonly string[]): Promise<RoleCheckResult> {
  const session = await getAdminSession()
  if (!session) {
    return { ok: false, error: 'Unauthorized.', status: 401 }
  }
  if (!allowedRoles.includes(session.role)) {
    return { ok: false, error: 'Forbidden.', status: 403 }
  }
  return { ok: true, session }
}
