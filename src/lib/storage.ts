// Abstracted private file storage for repair attachments (photos, videos,
// screenshots, board images, diagnostic reports).
//
// In production, configure STORAGE_* env vars to point at an S3-compatible
// bucket. Uploaded files are never made public — the admin dashboard reads
// them via short-lived signed URLs generated server-side.
//
// Without STORAGE_* configured, this falls back to writing to a local,
// non-public directory for local development only. Do not rely on the
// local fallback in production.

import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'video/mp4',
  'video/quicktime',
  'application/pdf',
]

// One file's declared extension is never trusted from the client — it is
// derived from this fixed map instead, so a crafted filename can never
// influence the storage path.
const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'application/pdf': 'pdf',
}

export const MAX_ATTACHMENT_SIZE_BYTES = 8 * 1024 * 1024 // 8MB per file

export interface StoredAttachment {
  storageKey: string
  fileName: string
  mimeType: string
  sizeBytes: number
}

export class AttachmentValidationError extends Error {}

function isS3Configured(): boolean {
  return Boolean(
    process.env.STORAGE_ENDPOINT &&
      process.env.STORAGE_BUCKET &&
      process.env.STORAGE_ACCESS_KEY_ID &&
      process.env.STORAGE_SECRET_ACCESS_KEY,
  )
}

function assertValidDeclaredType(file: File) {
  if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(file.type)) {
    throw new AttachmentValidationError(`Unsupported file type: ${file.type || 'unknown'}`)
  }
  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new AttachmentValidationError('File exceeds the 8MB upload limit.')
  }
}

// A browser's reported `file.type` is client-supplied metadata and can be
// spoofed (e.g. an HTML/script file renamed with an image extension and a
// forged Content-Type). Verify the actual file signature ("magic bytes")
// matches the declared MIME type before it is ever written to disk.
function assertMagicBytesMatch(buffer: Buffer, mimeType: string) {
  const matches = (() => {
    switch (mimeType) {
      case 'image/jpeg':
        return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
      case 'image/png':
        return (
          buffer.length >= 8 &&
          buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
        )
      case 'image/webp':
        return (
          buffer.length >= 12 &&
          buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
          buffer.subarray(8, 12).toString('ascii') === 'WEBP'
        )
      case 'application/pdf':
        return buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-'
      case 'image/heic':
      case 'video/mp4':
      case 'video/quicktime':
        // All three are ISO base media file format containers; a standard
        // "ftyp" box at offset 4 is the shared, reliable signature.
        return buffer.length >= 8 && buffer.subarray(4, 8).toString('ascii') === 'ftyp'
      default:
        return false
    }
  })()

  if (!matches) {
    throw new AttachmentValidationError('File contents do not match the declared file type.')
  }
}

function sanitizedScopeKey(scopeKey: string): string {
  // Repair IDs are server-generated cuids, but sanitize defensively anyway
  // so this can never be used to influence the storage path.
  const safe = scopeKey.replace(/[^a-zA-Z0-9_-]/g, '')
  if (!safe) throw new AttachmentValidationError('Invalid storage scope.')
  return safe
}

export async function storeAttachment(
  file: File,
  scopeKey: string,
): Promise<StoredAttachment> {
  assertValidDeclaredType(file)

  const buffer = Buffer.from(await file.arrayBuffer())
  assertMagicBytesMatch(buffer, file.type)

  const extension = EXTENSION_BY_MIME[file.type]
  const safeScopeKey = sanitizedScopeKey(scopeKey)
  const storageKey = `repairs/${safeScopeKey}/${randomUUID()}.${extension}`

  if (isS3Configured()) {
    // Production path: stream directly to the configured S3-compatible
    // bucket using the AWS SDK v3 client, then persist `storageKey` on the
    // Attachment record. Intentionally left as an integration point so the
    // storage provider can be swapped without touching call sites.
    throw new AttachmentValidationError(
      'S3 storage is configured but the upload client is not wired up in this environment.',
    )
  }

  const uploadsRoot = path.join(process.cwd(), '.data', 'uploads')
  const destination = path.join(uploadsRoot, storageKey)

  // Defense-in-depth: confirm the resolved path never escapes uploadsRoot,
  // even though storageKey is already built entirely from trusted inputs.
  const resolvedRoot = path.resolve(uploadsRoot) + path.sep
  if (!path.resolve(destination).startsWith(resolvedRoot)) {
    throw new AttachmentValidationError('Invalid storage path.')
  }

  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, buffer)

  return {
    storageKey,
    fileName: file.name.slice(0, 200),
    mimeType: file.type,
    sizeBytes: file.size,
  }
}
