'use client'

import React, { useState } from 'react'
import { Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSiteSettings, useUpdateSiteSettings, type SiteSettings } from '@/hooks/useSiteSettings'
import { useToast } from '@/stores/uiStore'

export default function AdminConfiguracionPage() {
  const toast = useToast()
  const { data: siteSettings, isLoading } = useSiteSettings()
  const updateSettings = useUpdateSiteSettings()
  const [draft, setDraft] = useState<SiteSettings | null>(null)
  const settings = draft ?? siteSettings ?? null

  const save = async () => {
    if (!settings) return
    try {
      await updateSettings.mutateAsync(settings)
      setDraft(null)
      toast.success('Configuración guardada')
    } catch (error) {
      toast.error('Error', error instanceof Error ? error.message : 'No se pudo guardar')
    }
  }

  if (isLoading || !settings) {
    return <div className="h-64 rounded-xl bg-muted" />
  }

  const set = <K extends keyof SiteSettings>(section: K, field: string, value: string | number | boolean) => {
    setDraft({
      ...settings,
      [section]: { ...settings[section], [field]: value },
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Configuración</h2>
          <p className="text-foreground-muted mt-1">
            Textos, correos y avisos que el sitio usa de verdad.
          </p>
        </div>
        <Button onClick={save} disabled={updateSettings.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Guardar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sitio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Nombre" value={settings.general.siteName} onChange={(value) => set('general', 'siteName', value)} />
          <Field label="Descripción" value={settings.general.siteDescription} onChange={(value) => set('general', 'siteDescription', value)} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.general.maintenanceMode}
              onChange={(event) => set('general', 'maintenanceMode', event.target.checked)}
            />
            Modo mantenimiento (el público ve un aviso; el admin sigue entrando)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.security.allowProviderRegistration}
              onChange={(event) => set('security', 'allowProviderRegistration', event.target.checked)}
            />
            Permitir registro de profesionales
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Correos y redes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Contacto" value={settings.content.contactEmail} onChange={(value) => set('content', 'contactEmail', value)} />
          <Field label="Soporte" value={settings.email.supportEmail} onChange={(value) => set('email', 'supportEmail', value)} />
          <Field label="Legal" value={settings.content.legalEmail} onChange={(value) => set('content', 'legalEmail', value)} />
          <Field label="Privacidad" value={settings.content.privacyEmail} onChange={(value) => set('content', 'privacyEmail', value)} />
          <Field label="Aviso al admin" value={settings.email.adminEmail} onChange={(value) => set('email', 'adminEmail', value)} />
          <Field label="Instagram" value={settings.content.instagram} onChange={(value) => set('content', 'instagram', value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Destacado manual</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="Precio referencial (CLP)"
            value={String(settings.payments.featuredPrice)}
            onChange={(value) => set('payments', 'featuredPrice', Number(value) || 0)}
          />
          <Field
            label="Duración al destacar (días)"
            value={String(settings.payments.featuredDurationDays)}
            onChange={(value) => set('payments', 'featuredDurationDays', Number(value) || 30)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Banner y portada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.content.adultBanner}
              onChange={(event) => set('content', 'adultBanner', event.target.checked)}
            />
            Mostrar aviso de mayoría de edad (18+). Apagado por defecto.
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.content.bannerEnabled}
              onChange={(event) => set('content', 'bannerEnabled', event.target.checked)}
            />
            Mostrar aviso global
          </label>
          <Field label="Texto del aviso" value={settings.content.bannerText} onChange={(value) => set('content', 'bannerText', value)} />
          <Field label="Hero, línea superior" value={settings.content.heroEyebrow} onChange={(value) => set('content', 'heroEyebrow', value)} />
          <Field label="Hero, título" value={settings.content.heroTitle} onChange={(value) => set('content', 'heroTitle', value)} />
          <Field label="Hero, subtítulo" value={settings.content.heroSubtitle} onChange={(value) => set('content', 'heroSubtitle', value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Motivos de rechazo</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="block text-sm">
            Uno por línea
            <textarea
              className="mt-1 w-full min-h-40 rounded-control border border-border bg-background px-3 py-2 text-sm"
              value={settings.moderation.rejectionReasons.join('\n')}
              onChange={(event) =>
                setDraft({
                  ...settings,
                  moderation: {
                    rejectionReasons: event.target.value.split('\n').map((line) => line.trim()).filter(Boolean),
                  },
                })
              }
            />
          </label>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-sm">
      {label}
      <Input className="mt-1" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}
