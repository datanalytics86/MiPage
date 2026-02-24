'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useProvider } from '@/hooks/useProviders'

export default function DashboardPerfilPage() {
  const { provider } = useAuth()
  const { data, isLoading } = useProvider(provider?.slug || '')

  if (!provider) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No encontramos tu perfil de proveedor.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading || !data) return <div className="p-8 text-muted-foreground">Cargando perfil...</div>

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumen del perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><b>Nombre:</b> {data.display_name}</div>
          <div><b>Categoría:</b> <Badge variant="outline">{data.category}</Badge></div>
          <div><b>Ciudad:</b> {data.city}</div>
          <div><b>Estado:</b> <Badge variant={data.status === 'approved' ? 'success' : 'warning'}>{data.status}</Badge></div>
          <div><b>WhatsApp:</b> {data.whatsapp || 'No definido'}</div>
          <div><b>Instagram:</b> {data.instagram || 'No definido'}</div>
          <div><b>Bio:</b> {data.bio || 'Sin biografía'}</div>
        </CardContent>
      </Card>
    </div>
  )
}
