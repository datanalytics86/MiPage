import { describe, it, expect } from 'vitest'
import {
  validateUploadFile,
  validateUploadBatch,
  isDangerousFilename,
  sanitizePlainText,
  looksLikeSqlInjection,
  MAX_FILES_PER_BATCH,
} from '../uploadValidation'

function fakeFile(
  name: string,
  type: string,
  size = 1024
): File {
  const blob = new Blob([new Uint8Array(size)], { type })
  return new File([blob], name, { type })
}

describe('uploadValidation', () => {
  it('accepts jpeg under size limit', () => {
    const r = validateUploadFile(fakeFile('photo.jpg', 'image/jpeg', 1000))
    expect(r.ok).toBe(true)
  })

  it('rejects exe', () => {
    const r = validateUploadFile(fakeFile('malware.exe', 'application/octet-stream', 1000))
    expect(r.ok).toBe(false)
    expect(r.code).toBe('DANGEROUS_EXT')
  })

  it('rejects php', () => {
    expect(isDangerousFilename('shell.php')).toBe(true)
    const r = validateUploadFile(fakeFile('x.php', 'text/php', 100))
    expect(r.ok).toBe(false)
  })

  it('rejects wrong mime', () => {
    const r = validateUploadFile(fakeFile('doc.pdf', 'application/pdf', 1000))
    expect(r.ok).toBe(false)
    expect(r.code).toBe('MIME_NOT_ALLOWED')
  })

  it('rejects oversized files', () => {
    const r = validateUploadFile(fakeFile('big.jpg', 'image/jpeg', 11 * 1024 * 1024))
    expect(r.ok).toBe(false)
    expect(r.code).toBe('SIZE_EXCEEDED')
  })

  it('rejects batch over max', () => {
    const files = Array.from({ length: MAX_FILES_PER_BATCH + 1 }, (_, i) =>
      fakeFile(`p${i}.jpg`, 'image/jpeg')
    )
    const r = validateUploadBatch(files)
    expect(r.ok).toBe(false)
    expect(r.code).toBe('TOO_MANY')
  })

  it('sanitizes XSS-ish text', () => {
    const clean = sanitizePlainText('<script>alert(1)</script>Hola')
    expect(clean).not.toContain('<script>')
    expect(clean).toContain('Hola')
  })

  it('detects sql injection probes', () => {
    expect(looksLikeSqlInjection("1' OR 1=1 --")).toBe(true)
    expect(looksLikeSqlInjection('union select password from users')).toBe(true)
    expect(looksLikeSqlInjection('masajes santiago')).toBe(false)
  })
})
