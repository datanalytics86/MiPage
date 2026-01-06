'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, User, MapPin, Phone, Instagram, Ruler, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Mock provider data
const initialData = {
  displayName: 'Valentina Reyes',
  category: 'masajes',
  age: 28,
  bio: 'Terapeuta certificada con más de 5 años de experiencia en masajes relajantes y descontracturantes. Mi objetivo es brindarte un espacio de paz y bienestar.',
  city: 'Santiago',
  commune: 'Las Condes',
  addressHint: 'Sector El Golf',
  whatsapp: '56912345678',
  instagram: 'valentina.wellness',
  heightCm: 165,
  weightKg: 58,
}

export default function DashboardPerfilPage() {
  const [formData, setFormData] = useState(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
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
                <label className="text-sm font-medium text-foreground">
                  Nombre profesional *
                </label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Tu nombre artístico"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Edad *</label>
                <Input
                  type="number"
                  min={18}
                  max={99}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Categoría *</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, category: 'masajes' })}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    formData.category === 'masajes'
                      ? 'border-gold bg-gold/5'
                      : 'border-border hover:border-gold/50'
                  }`}
                >
                  <span className="text-2xl mb-2 block">💆</span>
                  <span className="font-medium">Masajes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, category: 'modelaje' })}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    formData.category === 'modelaje'
                      ? 'border-gold bg-gold/5'
                      : 'border-border hover:border-gold/50'
                  }`}
                >
                  <span className="text-2xl mb-2 block">📸</span>
                  <span className="font-medium">Modelaje</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Biografía
                <span className="text-foreground-muted font-normal ml-1">(máx. 500 caracteres)</span>
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                maxLength={500}
                rows={4}
                className="input-luxury resize-none"
                placeholder="Cuéntale a tus clientes sobre ti..."
              />
              <p className="text-xs text-foreground-muted text-right">
                {formData.bio.length}/500
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gold" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Ciudad *</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Santiago"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Comuna</label>
                <Input
                  value={formData.commune}
                  onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                  placeholder="Las Condes"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Referencia de ubicación
                <span className="text-foreground-muted font-normal ml-1">(sin dirección exacta)</span>
              </label>
              <Input
                value={formData.addressHint}
                onChange={(e) => setFormData({ ...formData, addressHint: e.target.value })}
                placeholder="Ej: Sector El Golf, cerca de metro..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Phone className="h-5 w-5 text-gold" />
              Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  WhatsApp *
                  <span className="text-foreground-muted font-normal ml-1">(con código país)</span>
                </label>
                <Input
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="56912345678"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Instagram
                  <span className="text-foreground-muted font-normal ml-1">(sin @)</span>
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                  <Input
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="tu.usuario"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Physical Details (optional) */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Ruler className="h-5 w-5 text-gold" />
              Detalles físicos
              <Badge variant="secondary">Opcional</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Altura (cm)</label>
                <Input
                  type="number"
                  min={140}
                  max={220}
                  value={formData.heightCm || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, heightCm: parseInt(e.target.value) || 0 })
                  }
                  placeholder="165"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Peso (kg)</label>
                <Input
                  type="number"
                  min={40}
                  max={150}
                  value={formData.weightKg || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, weightKg: parseInt(e.target.value) || 0 })
                  }
                  placeholder="58"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <Button type="submit" size="lg" disabled={isSaving}>
            <Save className="h-5 w-5 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-success font-medium"
            >
              ✓ Cambios guardados
            </motion.span>
          )}
        </div>
      </form>
    </div>
  )
}
