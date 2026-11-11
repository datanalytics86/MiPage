import { describe, it, expect } from 'vitest'
import { safeRedirect } from '@/lib/safeRedirect'

describe('safeRedirect', () => {
  it('allows internal paths', () => {
    expect(safeRedirect('/dashboard')).toBe('/dashboard')
    expect(safeRedirect('/perfil/ana?tab=fotos')).toBe('/perfil/ana?tab=fotos')
    expect(safeRedirect('  /admin/proveedores  ')).toBe('/admin/proveedores')
  })

  it('rejects missing values', () => {
    expect(safeRedirect(null)).toBe('/')
    expect(safeRedirect(undefined, '/explorar')).toBe('/explorar')
    expect(safeRedirect('   ')).toBe('/')
  })

  it('rejects absolute and protocol-relative urls', () => {
    expect(safeRedirect('https://sitio-malo.example')).toBe('/')
    expect(safeRedirect('//sitio-malo.example')).toBe('/')
    expect(safeRedirect('//sitio-malo.example/login')).toBe('/')
    expect(safeRedirect('/\\sitio-malo.example')).toBe('/')
    expect(safeRedirect('/foo\\bar')).toBe('/')
    expect(safeRedirect('/foo://bar')).toBe('/')
  })

  it('rejects encoded open redirects', () => {
    expect(safeRedirect('/%2f%2fevil.example')).toBe('/')
    expect(safeRedirect('/%5cevil')).toBe('/')
    expect(safeRedirect('/ok%0aSet-Cookie')).toBe('/')
    expect(safeRedirect('/ok%0d%0aX')).toBe('/')
  })
})
