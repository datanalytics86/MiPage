'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/stores/uiStore'

export function FeaturedUpgradeCard({
  providerId,
  isFeatured,
}: {
  providerId: string
  isFeatured: boolean
}) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [mpMessage, setMpMessage] = useState<string | null>(null)

  const requestPayment = async () => {
    setBusy(true)
    setMpMessage(null)
    try {
      const res = await fetch('/api/payments/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId }),
      })
      const json = (await res.json()) as {
        initPoint?: string
        message?: string
        configured?: boolean
        error?: string
      }
      if (res.status === 501 || json.configured === false) {
        setMpMessage(
          json.message ||
            'El pago de Destacado no está activo. Un administrador puede marcar tu perfil desde el panel.'
        )
        return
      }
      if (!res.ok || !json.initPoint) {
        setMpMessage('No se pudo iniciar el pago. Inténtalo más tarde o escribe a soporte.')
        return
      }
      window.location.href = json.initPoint
    } catch {
      toast.error('Error', 'No se pudo contactar el pago')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="border-gold/25">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-gold/15 shrink-0">
            <Star className="h-5 w-5 text-gold" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground flex flex-wrap items-center gap-2">
              Destacado
              {isFeatured && <Badge variant="gold">Activo</Badge>}
            </p>
            <p className="text-sm text-foreground-secondary leading-relaxed">
              Un perfil Destacado aparece primero en Explorar con un badge dorado.
              No compra aprobación: la revisión humana sigue siendo obligatoria.
              El pago por Mercado Pago es opcional; si no está configurado, el admin
              puede activarlo a mano.
            </p>
          </div>
        </div>
        {mpMessage && (
          <p className="text-sm text-foreground-secondary bg-muted/50 rounded-lg p-3">
            {mpMessage}
          </p>
        )}
        {!isFeatured && (
          <Button size="sm" variant="outline" disabled={busy} onClick={requestPayment}>
            {busy ? 'Consultando pago…' : 'Pedir Destacado (Mercado Pago)'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
