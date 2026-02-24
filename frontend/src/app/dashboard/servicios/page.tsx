'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useProvider } from '@/hooks/useProviders'
import { formatPrice } from '@/lib/utils'

export default function DashboardServiciosPage() {
  const { provider } = useAuth()
  const { data, isLoading } = useProvider(provider?.slug || '')

  if (!provider) {
    return (
      <div className="p-8">
        <Card><CardContent className="p-8 text-center text-muted-foreground">No tienes perfil de proveedor.</CardContent></Card>
      </div>
    )
  }

  if (isLoading || !data) return <div className="p-8 text-muted-foreground">Cargando servicios...</div>

  return (
    <div className="p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Mis servicios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.services.length === 0 ? (
            <p className="text-muted-foreground">Aún no tienes servicios cargados.</p>
          ) : (
            data.services.map((service) => (
              <div key={service.id} className="p-4 border rounded-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.description || 'Sin descripción'}</p>
                    <p className="text-sm text-muted-foreground">Duración: {service.duration || 'No definida'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gold-dark">{formatPrice(service.price)}</p>
                    <Badge variant={service.is_active ? 'success' : 'secondary'}>
                      {service.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
