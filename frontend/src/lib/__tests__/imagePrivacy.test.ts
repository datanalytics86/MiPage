import { describe, expect, it } from 'vitest'
import { sniffImageMime } from '../imagePrivacy'

describe('sniffImageMime', () => {
  it('recognizes jpeg, png, gif and webp headers', () => {
    expect(sniffImageMime(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg')
    expect(
      sniffImageMime(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    ).toBe('image/png')
    expect(sniffImageMime(Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]))).toBe('image/gif')
    const webp = new Uint8Array(12)
    webp.set([0x52, 0x49, 0x46, 0x46], 0)
    webp.set([0x57, 0x45, 0x42, 0x50], 8)
    expect(sniffImageMime(webp)).toBe('image/webp')
  })

  it('rejects unknown or short buffers', () => {
    expect(sniffImageMime(Uint8Array.from([0x00, 0x00, 0x00]))).toBeNull()
    expect(sniffImageMime(Uint8Array.from([0xff, 0xd8]))).toBeNull()
  })
})
