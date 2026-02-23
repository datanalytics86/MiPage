'use client'

import React, { useMemo, useState } from 'react'
import {
  Settings,
  Globe,
  Mail,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Save,
  RotateCcw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type ThemeMode = 'system' | 'light' | 'dark'
type AccentColor = 'gold' | 'sage' | 'blush'
type DensityMode = 'compact' | 'comfortable'

interface SettingSection {
  id: string
  name: string
  icon: React.ElementType
  description: string
}

const sections: SettingSection[] = [
  { id: 'general', name: 'General', icon: Settings, description: 'Configuración básica del sitio' },
  { id: 'email', name: 'Email', icon: Mail, description: 'Plantillas y configuración de correo' },
  { id: 'notifications', name: 'Notificaciones', icon: Bell, description: 'Preferencias de notificaciones' },
  { id: 'security', name: 'Seguridad', icon: Shield, description: 'Autenticación y permisos' },
  { id: 'payments', name: 'Pagos', icon: CreditCard, description: 'Métodos de pago y comisiones' },
  { id: 'appearance', name: 'Apariencia', icon: Palette, description: 'Tema y personalización' },
]

const initialSettings = {
  siteName: 'LuxeServices',
  siteDescription: 'La plataforma premium para servicios de lujo',
  supportEmail: 'soporte@luxeservices.com',
  adminEmail: 'admin@luxeservices.com',
  timezone: 'America/Santiago',
  currency: 'CLP',
  commissionRate: 15,
  minWithdrawal: 50000,
  requireEmailVerification: true,
  requireIdVerification: true,
  allowProviderRegistration: true,
  maintenanceMode: false,
  notifyNewReview: true,
  notifyNewProvider: true,
  notifyNewReport: true,
  notifyDailySummary: false,
  themeMode: 'system' as ThemeMode,
  accentColor: 'gold' as AccentColor,
  density: 'comfortable' as DensityMode,
}

function ToggleRow({
  title,
  description,
  checked,
  onToggle,
}: {
  title: string
  description: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-foreground-muted">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          checked ? 'bg-gold' : 'bg-muted'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  )
}

export default function AdminConfiguracionPage() {
  const [activeSection, setActiveSection] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')
  const [settings, setSettings] = useState(initialSettings)

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === activeSection),
    [activeSection]
  )

  const handleChange = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
    setSaveStatus('idle')
  }

  const handleSave = () => {
    setHasChanges(false)
    setSaveStatus('saved')
  }

  const handleReset = () => {
    setSettings(initialSettings)
    setHasChanges(false)
    setSaveStatus('idle')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Configuración</h2>
          <p className="text-foreground-muted mt-1">Administra la configuración global de la plataforma</p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && <Badge variant="secondary">Configuración guardada</Badge>}
          {hasChanges && <Badge variant="secondary" className="bg-warning/10 text-warning">Cambios sin guardar</Badge>}
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                    activeSection === section.id
                      ? 'bg-gold/10 text-gold'
                      : 'text-foreground-secondary hover:text-foreground hover:bg-muted'
                  )}
                >
                  <section.icon className="h-5 w-5 shrink-0" />
                  <div>
                    <p>{section.name}</p>
                    <p className="text-xs opacity-70">{section.description}</p>
                  </div>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {selectedSection && (
            <div>
              <h3 className="font-display text-xl font-semibold">{selectedSection.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedSection.description}</p>
            </div>
          )}

          {activeSection === 'general' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Información del sitio</CardTitle>
                  <CardDescription>Configuración básica de tu plataforma</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Nombre del sitio</label>
                      <Input value={settings.siteName} onChange={(e) => handleChange('siteName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Zona horaria</label>
                      <Input value={settings.timezone} onChange={(e) => handleChange('timezone', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Descripción del sitio</label>
                    <Input value={settings.siteDescription} onChange={(e) => handleChange('siteDescription', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Moneda</label>
                    <Input value={settings.currency} onChange={(e) => handleChange('currency', e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Operación</CardTitle><CardDescription>Control global de disponibilidad del sitio</CardDescription></CardHeader>
                <CardContent>
                  <ToggleRow
                    title="Modo mantenimiento"
                    description="Los usuarios verán una página de mantenimiento."
                    checked={settings.maintenanceMode}
                    onToggle={() => handleChange('maintenanceMode', !settings.maintenanceMode)}
                  />
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'email' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Configuración de Email</CardTitle>
                <CardDescription>Define remitentes y correos de operación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email de soporte</label>
                  <Input type="email" value={settings.supportEmail} onChange={(e) => handleChange('supportEmail', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email de administración</label>
                  <Input type="email" value={settings.adminEmail} onChange={(e) => handleChange('adminEmail', e.target.value)} />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notificaciones</CardTitle>
                <CardDescription>Activa eventos clave para operación diaria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ToggleRow title="Nuevas reseñas" description="Notificar reseñas recién publicadas." checked={settings.notifyNewReview} onToggle={() => handleChange('notifyNewReview', !settings.notifyNewReview)} />
                <ToggleRow title="Nuevos proveedores" description="Notificar solicitudes de alta pendientes de revisión." checked={settings.notifyNewProvider} onToggle={() => handleChange('notifyNewProvider', !settings.notifyNewProvider)} />
                <ToggleRow title="Nuevos reportes" description="Notificar reportes de contenido en tiempo real." checked={settings.notifyNewReport} onToggle={() => handleChange('notifyNewReport', !settings.notifyNewReport)} />
                <ToggleRow title="Resumen diario" description="Enviar consolidado diario por email al admin." checked={settings.notifyDailySummary} onToggle={() => handleChange('notifyDailySummary', !settings.notifyDailySummary)} />
              </CardContent>
            </Card>
          )}

          {activeSection === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Seguridad</CardTitle>
                <CardDescription>Gestiona verificación y políticas de acceso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ToggleRow title="Verificación de email obligatoria" description="Los usuarios deben verificar email para operar." checked={settings.requireEmailVerification} onToggle={() => handleChange('requireEmailVerification', !settings.requireEmailVerification)} />
                <ToggleRow title="Verificación de identidad de proveedores" description="Solicitar verificación KYC previa a publicar." checked={settings.requireIdVerification} onToggle={() => handleChange('requireIdVerification', !settings.requireIdVerification)} />
                <ToggleRow title="Permitir registro de proveedores" description="Habilitar flujo de alta de nuevos proveedores." checked={settings.allowProviderRegistration} onToggle={() => handleChange('allowProviderRegistration', !settings.allowProviderRegistration)} />
              </CardContent>
            </Card>
          )}

          {activeSection === 'payments' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Pagos</CardTitle>
                <CardDescription>Comisiones y umbrales de retiro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Comisión de la plataforma (%)</label>
                  <Input type="number" value={settings.commissionRate} onChange={(e) => handleChange('commissionRate', parseInt(e.target.value || '0', 10))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Retiro mínimo (CLP)</label>
                  <Input type="number" value={settings.minWithdrawal} onChange={(e) => handleChange('minWithdrawal', parseInt(e.target.value || '0', 10))} />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Apariencia</CardTitle>
                <CardDescription>Configura tema visual del admin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tema</label>
                    <select className="input-luxury w-full" value={settings.themeMode} onChange={(e) => handleChange('themeMode', e.target.value as ThemeMode)}>
                      <option value="system">Sistema</option>
                      <option value="light">Claro</option>
                      <option value="dark">Oscuro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Color acento</label>
                    <select className="input-luxury w-full" value={settings.accentColor} onChange={(e) => handleChange('accentColor', e.target.value as AccentColor)}>
                      <option value="gold">Gold</option>
                      <option value="sage">Sage</option>
                      <option value="blush">Blush</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Densidad</label>
                    <select className="input-luxury w-full" value={settings.density} onChange={(e) => handleChange('density', e.target.value as DensityMode)}>
                      <option value="comfortable">Cómoda</option>
                      <option value="compact">Compacta</option>
                    </select>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/40 text-sm text-muted-foreground">
                  Vista previa: tema <span className="font-medium text-foreground">{settings.themeMode}</span>, acento{' '}
                  <span className="font-medium text-foreground">{settings.accentColor}</span>, densidad{' '}
                  <span className="font-medium text-foreground">{settings.density}</span>.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
