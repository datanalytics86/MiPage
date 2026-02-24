'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useProvider } from '@/hooks/useProviders'

export default function DashboardGaleriaPage() {
  const { provider } = useAuth()
  const { data, isLoading } = useProvider(provider?.slug || '')

  if (!provider) {
    return (
      <div className="p-8">
        <Card><CardContent className="p-8 text-center text-muted-foreground">No tienes perfil de proveedor.</CardContent></Card>
      </div>
    )
  }

  if (isLoading || !data) return <div className="p-8 text-muted-foreground">Cargando galería...</div>

  const items = data.gallery.length > 0
    ? data.gallery.map((item) => ({ id: item.id, url: item.url, isCover: item.is_cover }))
    : (data.photos || []).map((url, idx) => ({ id: `photo-${idx}`, url, isCover: idx === 0 }))

  return (
    <div className="p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Mi galería</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground">Aún no tienes imágenes en tu galería.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden border bg-muted">
                  <Image src={item.url} alt="Galería" fill className="object-cover" />
                  {item.isCover && (
                    <Badge className="absolute top-2 left-2 bg-black/70 text-white border-0">Portada</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
