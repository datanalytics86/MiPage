'use client'

import React, { useState } from 'react'
import { Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export function ReportButton({
  reportedType,
  reportedId,
  label = 'Reportar',
}: {
  reportedType: 'profile' | 'review'
  reportedId: string
  label?: string
}) {
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  if (!isAuthenticated) return null

  const submit = async () => {
    setBusy(true)
    setMessage('')
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedType,
          reportedId,
          reason,
          description,
        }),
      })
      if (!res.ok) {
        setMessage('No se pudo enviar el reporte.')
        return
      }
      setMessage('Reporte enviado. Gracias.')
      setReason('')
      setDescription('')
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen((value) => !value)}>
        <Flag className="h-4 w-4 mr-1" aria-hidden />
        {label}
      </Button>
      {open && (
        <div className="w-full max-w-sm space-y-2 rounded-xl border border-border bg-card p-3">
          <label className="block text-sm">
            Motivo
            <input
              className="mt-1 w-full rounded-control border border-border bg-background px-3 py-2 text-sm"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              minLength={3}
              required
            />
          </label>
          <label className="block text-sm">
            Descripción
            <textarea
              className="mt-1 w-full rounded-control border border-border bg-background px-3 py-2 text-sm"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </label>
          <Button type="button" size="sm" disabled={busy || reason.trim().length < 3} onClick={submit}>
            Enviar reporte
          </Button>
        </div>
      )}
      {message && <p className="text-xs text-foreground-secondary">{message}</p>}
    </div>
  )
}
