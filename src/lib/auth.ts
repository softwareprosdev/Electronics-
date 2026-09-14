import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export const ADMIN_SESSION_COOKIE = 'admin_session'
const SESSION_DURATION_SECONDS = 60 * 60 * 8 // 8 hours

function getSecretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET
  // NIST SP 800-63B / RFC 2104 recommend an HMAC key at least as long as
  // the underlying hash output (32 bytes for HMAC-SHA256 / "HS256").
  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_SESSION_SECRET must be set to a random string of at least 32 characters (see .env.example).',
    )
  }
  return new TextEncoder().encode(secret)
}

export interface AdminSessionPayload {
  sub: string
  email: string
  role: string
}

export async function createAdminSessionToken(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey())
}

export async function verifyAdminSessionToken(
  token: string,
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    if (!payload.sub || typeof payload.email !== 'string' || typeof payload.role !== 'string') {
      return null
    }
    return { sub: payload.sub, email: payload.email, role: payload.role }
  } catch {
    return null
  }
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return null
  return verifyAdminSessionToken(token)
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_DURATION_SECONDS,
}
