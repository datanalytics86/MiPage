'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function OrphanFilesPage() {
  const [paths, setPaths] = useState<string[]>([])
  const [scanned, setScanned] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/storage/orphans')
      const json = await response.json()
      if (!response.ok) {
        setPaths([])
        setScanned(null)
        setMessage(json.error || 'No se pudo listar')
        return
      }
      setPaths(json.paths || [])
      setScanned(json.scanned ?? null)
    } catch {
      setMessage('No se pudo listar')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!paths.length) return
    if (!window.confirm(`Eliminar ${paths.length} archivos que no usa ningún aviso?`)) return
    setBusy(true)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/storage/orphans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths }),
      })
      const json = await response.json()
      if (!response.ok) {
        setMessage(json.error || 'No se pudo eliminar')
        return
      }
      setMessage(`Se eliminaron ${json.deleted ?? 0} archivos.`)
      setPaths([])
    } catch {
      setMessage('No se pudo eliminar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Archivos huérfanos</h1>
        <p className="text-sm text-foreground-secondary mt-1">
          Fotos del bucket gallery que no están en un aviso, una portada ni la galería.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={load} disabled={busy}>
              {busy ? 'Trabajando…' : 'Buscar huérfanos'}
            </Button>
            <Button type="button" variant="outline" onClick={remove} disabled={busy || paths.length === 0}>
              Eliminar listados
            </Button>
          </div>
          {scanned !== null && (
            <p className="text-sm text-foreground-secondary">
              {scanned} archivos revisados. {paths.length} sin uso.
            </p>
          )}
          {message && <p className="text-sm text-foreground">{message}</p>}
          {paths.length > 0 && (
            <ul className="max-h-80 overflow-auto rounded-xl border border-border text-sm">
              {paths.map((path) => (
                <li key={path} className="px-3 py-2 border-b border-border last:border-0 font-mono text-xs">
                  {path}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
