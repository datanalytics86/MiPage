'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Save, User, MapPin, Phone, Instagram, Ruler, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useUpdateOwnProvider } from '@/hooks/useProviders'
import { normalizeCategory } from '@/lib/providers'
import { useToast } from '@/stores/uiStore'

export default function DashboardPerfilPage() {
  const searchParams = useSearchParams()
  const showWelcome = searchParams.get('welcome') === 'pending'
  const toast = useToast()
  const { provider, refreshProfile } = useAuth()
  const updateProvider = useUpdateOwnProvider()
  const [formData, setFormData] = useState({
    displayName: '',
    category: 'masajes' as 'masajes' | 'modelaje',
    age: 18,
    bio: '',
    city: '',
    commune: '',
    whatsapp: '',
    instagram: '',
    heightCm: 0,
    weightKg: 0,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!provider) return
    setFormData({
      displayName: provider.display_name,
      category: normalizeCategory(provider.category),
      age: provider.age ?? 18,
      bio: provider.bio ?? '',
      city: provider.city,
      commune: provider.address ?? '',
      whatsapp: provider.whatsapp ?? '',
      instagram: provider.instagram ?? '',
      heightCm: provider.height ?? 0,
      weightKg: provider.weight ?? 0,
    })
  }, [provider])

  if (!provider) {
    return (
      <div className="max-w-3xl py-8 text-center text-foreground-secondary">
        No tienes un perfil de proveedor asociado.
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await updateProvider.mutateAsync({
        id: provider.id,
        updates: {
          display_name: formData.displayName,
          category: formData.category,
          age: formData.age,
          bio: formData.bio,
          city: formData.city,
          address: formData.commune || null,
          whatsapp: formData.whatsapp,
          instagram: formData.instagram || null,
          height: formData.heightCm || null,
          weight: formData.weightKg || null,
        },
      })
      await refreshProfile()
      setSaved(true)
      toast.success('Perfil actualizado')
      setTimeout(() => setSaved(false), 3000)
    } catch {
      toast.error('Error', 'No se pudo guardar el perfil')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {showWelcome && provider.status === 'pending' && (
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 text-sm">
          <p className="font-medium text-warning flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            ¡Bienvenida a MiPage!
          </p>
          <p className="text-foreground-secondary mt-1">
            Completa tu perfil, servicios y galería. Tu perfil público se publicará cuando un
            administrador apruebe tu solicitud.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Badge variant={provider.status === 'approved' ? 'success' : 'warning'}>
          {provider.status === 'approved' ? 'Perfil publicado' : `Estado: ${provider.status}`}
        </Badge>
        {provider.status !== 'approved' && (
          <p className="text-sm text-foreground-muted">
            Tu perfil será visible cuando un administrador lo apruebe.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <User className="h-5 w-5 text-gold" />
              Información básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre profesional *</label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Edad *</label>
                <Input
                  type="number"
                  min={18}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              {(['masajes', 'modelaje'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`flex-1 p-4 rounded-xl border-2 ${
                    formData.category === cat ? 'border-gold bg-gold/5' : 'border-border'
                  }`}
                >
                  {cat === 'masajes' ? '💆 Masajes' : '📸 Modelaje'}
                </button>
              ))}
            </div>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              maxLength={500}
              rows={4}
              className="input-luxury resize-none w-full"
              placeholder="Biografía..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gold" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Ciudad"
              required
            />
            <Input
              value={formData.commune}
              onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
              placeholder="Comuna / sector"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Phone className="h-5 w-5 text-gold" />
              Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="WhatsApp (569...)"
              required
            />
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
              <Input
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="Instagram"
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Ruler className="h-5 w-5 text-gold" />
              Detalles físicos
              <Badge variant="secondary">Opcional</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              value={formData.heightCm || ''}
              onChange={(e) => setFormData({ ...formData, heightCm: parseInt(e.target.value) || 0 })}
              placeholder="Altura (cm)"
            />
            <Input
              type="number"
              value={formData.weightKg || ''}
              onChange={(e) => setFormData({ ...formData, weightKg: parseInt(e.target.value) || 0 })}
              placeholder="Peso (kg)"
            />
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button type="submit" size="lg" disabled={isSaving}>
            <Save className="h-5 w-5 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
          {saved && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-success font-medium">
              ✓ Cambios guardados en Supabase
            </motion.span>
          )}
        </div>
      </form>
    </div>
  )
}