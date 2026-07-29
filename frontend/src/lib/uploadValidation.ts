/**
 * Client-side upload validation for Supabase Storage gallery uploads.
 * Server-side mime/size limits also enforced by Storage bucket policies.
 */

export const ALLOWED_IMAGE_MIME = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export const ALLOWED_VIDEO_MIME = ['video/mp4', 'video/quicktime'] as const

export const ALLOWED_UPLOAD_MIME = [...ALLOWED_IMAGE_MIME, ...ALLOWED_VIDEO_MIME] as const

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB
export const MAX_VIDEO_BYTES = 10 * 1024 * 1024 // 10 MB (aligned with storage policy)
export const MAX_FILES_PER_BATCH = 6

const DANGEROUS_EXTENSIONS = [
  'exe',
  'php',
  'phtml',
  'js',
  'mjs',
  'cjs',
  'sh',
  'bat',
  'cmd',
  'ps1',
  'dll',
  'so',
  'jar',
  'html',
  'htm',
  'svg', // SVG can carry scripts; block by default for gallery
  'xml',
]

export type UploadValidationErrorCode =
  | 'EMPTY'
  | 'TOO_MANY'
  | 'DANGEROUS_EXT'
  | 'MIME_NOT_ALLOWED'
  | 'SIZE_EXCEEDED'
  | 'NAME_INVALID'

export interface UploadValidationResult {
  ok: boolean
  code?: UploadValidationErrorCode
  message?: string
}

export function getExtension(filename: string): string {
  const parts = filename.toLowerCase().split('.')
  if (parts.length < 2) return ''
  return parts[parts.length - 1] || ''
}

export function isDangerousFilename(filename: string): boolean {
  const ext = getExtension(filename)
  if (!ext) return true
  if (DANGEROUS_EXTENSIONS.includes(ext)) return true
  // double extension tricks: file.php.jpg still ends with jpg — Storage mime is source of truth
  // but block obvious embedded dangerous tokens
  const lower = filename.toLowerCase()
  return DANGEROUS_EXTENSIONS.some((d) => lower.includes(`.${d}.`))
}

export function validateUploadFile(file: File): UploadValidationResult {
  if (!file || file.size <= 0) {
    return { ok: false, code: 'EMPTY', message: 'Archivo vacío' }
  }

  if (!file.name || file.name.length > 200) {
    return { ok: false, code: 'NAME_INVALID', message: 'Nombre de archivo inválido' }
  }

  if (isDangerousFilename(file.name)) {
    return {
      ok: false,
      code: 'DANGEROUS_EXT',
      message: 'Tipo de archivo no permitido por seguridad',
    }
  }

  const mime = (file.type || '').toLowerCase()
  if (!ALLOWED_UPLOAD_MIME.includes(mime as (typeof ALLOWED_UPLOAD_MIME)[number])) {
    return {
      ok: false,
      code: 'MIME_NOT_ALLOWED',
      message: `Tipo no permitido: ${mime || 'desconocido'}. Usa JPG, PNG, WebP o MP4.`,
    }
  }

  const max = ALLOWED_VIDEO_MIME.includes(mime as (typeof ALLOWED_VIDEO_MIME)[number])
    ? MAX_VIDEO_BYTES
    : MAX_IMAGE_BYTES

  if (file.size > max) {
    return {
      ok: false,
      code: 'SIZE_EXCEEDED',
      message: `Archivo supera el máximo de ${Math.round(max / (1024 * 1024))} MB`,
    }
  }

  return { ok: true }
}

export function validateUploadBatch(files: FileList | File[]): UploadValidationResult {
  const list = Array.from(files)
  if (list.length === 0) {
    return { ok: false, code: 'EMPTY', message: 'No hay archivos' }
  }
  if (list.length > MAX_FILES_PER_BATCH) {
    return {
      ok: false,
      code: 'TOO_MANY',
      message: `Máximo ${MAX_FILES_PER_BATCH} archivos por carga`,
    }
  }
  for (const f of list) {
    const r = validateUploadFile(f)
    if (!r.ok) return r
  }
  return { ok: true }
}

/** Sanitize free text against trivial XSS payloads before display storage */
export function sanitizePlainText(input: string, maxLen = 5000): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, maxLen)
}

/** Detect obvious SQL injection probes in search boxes (defense in depth; Supabase uses params) */
export function looksLikeSqlInjection(query: string): boolean {
  const q = query.toLowerCase()
  return (
    /('|--|;|\/\*|\*\/)/.test(q) ||
    /\b(union\s+select|drop\s+table|insert\s+into|or\s+1\s*=\s*1)\b/.test(q)
  )
}
