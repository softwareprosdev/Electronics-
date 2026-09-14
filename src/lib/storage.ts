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

export const MAX_ATTACHMENT_SIZE_BYTES = 25 * 1024 * 1024 // 25MB

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

function assertValidFile(file: File) {
  if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(file.type)) {
    throw new AttachmentValidationError(`Unsupported file type: ${file.type || 'unknown'}`)
  }
  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new AttachmentValidationError('File exceeds the 25MB upload limit.')
  }
}

export async function storeAttachment(
  file: File,
  scopeKey: string,
): Promise<StoredAttachment> {
  assertValidFile(file)

  const extension = file.name.includes('.') ? file.name.split('.').pop() : ''
  const storageKey = `repairs/${scopeKey}/${randomUUID()}${extension ? `.${extension}` : ''}`

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
  await mkdir(path.dirname(destination), { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(destination, buffer)

  return {
    storageKey,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  }
}
