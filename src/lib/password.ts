// Password hashing — Argon2id (OWASP-recommended, memory-hard, resists
// GPU/ASIC cracking better than bcrypt). Existing accounts seeded before this
// migration have bcrypt hashes ($2a$/$2b$/$2y$ prefix); verifyPassword()
// still checks those correctly, and the login route transparently rehashes
// to Argon2id on the next successful login — no forced reset needed.

import { hash as argon2Hash, verify as argon2Verify } from '@node-rs/argon2'
import bcrypt from 'bcryptjs'

// @node-rs/argon2's `Algorithm` is an ambient const enum, which `isolatedModules`
// (required for Next.js's per-file transpilation) can't reference — 2 is
// Argon2id per the library's own enum ordering (Argon2d=0, Argon2i=1, Argon2id=2).
const ARGON2ID = 2

// OWASP Password Storage Cheat Sheet's second recommended Argon2id profile:
// m=19 MiB, t=2, p=1. Tuned for a low-traffic admin login, not end-user auth
// at scale — revisit if this ever gates high-volume customer-portal login.
const ARGON2_OPTIONS = {
  algorithm: ARGON2ID,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
}

// A real Argon2id hash of a random, never-used password — for the
// constant-time "user not found" comparison in the login route, so an
// unknown email takes the same code path (and roughly the same time) as a
// known one.
export const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$aAP+hcU+Hght7mMykX9Rbw$q+XaerGCslzs8M6G98TYXrg7YpZgeGV/K5nhDELT73s'

export function isArgon2Hash(hash: string): boolean {
  return hash.startsWith('$argon2')
}

export async function hashPassword(plain: string): Promise<string> {
  return argon2Hash(plain, ARGON2_OPTIONS)
}

export async function verifyPassword(storedHash: string, plain: string): Promise<boolean> {
  if (isArgon2Hash(storedHash)) {
    try {
      return await argon2Verify(storedHash, plain)
    } catch {
      return false
    }
  }
  // Legacy bcrypt hash from before the Argon2id migration.
  return bcrypt.compare(plain, storedHash)
}
