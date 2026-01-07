'use client'

import React, { useState } from 'react'
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

export default function AdminConfiguracionPage() {
  const [activeSection, setActiveSection] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)

  // Mock settings state
  const [settings, setSettings] = useState({
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
  })

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    // Save logic here
    setHasChanges(false)
    alert('Configuración guardada')
  }

  const handleReset = () => {
    // Reset logic here
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Configuración
          </h2>
          <p className="text-foreground-muted mt-1">
            Administra la configuración global de la plataforma
          </p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-warning/10 text-warning">
              Cambios sin guardar
            </Badge>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Descartar
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sections Navigation */}
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
                  <span>{section.name}</span>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          {activeSection === 'general' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Información del sitio
                  </CardTitle>
                  <CardDescription>
                    Configuración básica de tu plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Nombre del sitio
                      </label>
                      <Input
                        value={settings.siteName}
                        onChange={(e) => handleChange('siteName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Zona horaria
                      </label>
                      <Input
                        value={settings.timezone}
                        onChange={(e) => handleChange('timezone', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Descripción del sitio
                    </label>
                    <Input
                      value={settings.siteDescription}
                      onChange={(e) => handleChange('siteDescription', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Moneda
                    </label>
                    <Input
                      value={settings.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Modo mantenimiento</CardTitle>
                  <CardDescription>
                    Activa el modo mantenimiento para realizar actualizaciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Modo mantenimiento
                      </p>
                      <p className="text-sm text-foreground-muted">
                        Los usuarios verán una página de mantenimiento
                      </p>
                    </div>
                    <button
                      onClick={() => handleChange('maintenanceMode', !settings.maintenanceMode)}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        settings.maintenanceMode ? 'bg-gold' : 'bg-muted'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Email Settings */}
          {activeSection === 'email' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Configuración de Email
                </CardTitle>
                <CardDescription>
                  Configura los emails del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email de soporte
                  </label>
                  <Input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email de administración
                  </label>
                  <Input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => handleChange('adminEmail', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configuración de Seguridad
                </CardTitle>
                <CardDescription>
                  Gestiona la seguridad y verificación de usuarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Verificación de email obligatoria
                    </p>
                    <p className="text-sm text-foreground-muted">
                      Los usuarios deben verificar su email para acceder
                    </p>
                  </div>
                  <button
                    onClick={() => handleChange('requireEmailVerification', !settings.requireEmailVerification)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      settings.requireEmailVerification ? 'bg-gold' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        settings.requireEmailVerification ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Verificación de identidad para proveedores
                    </p>
                    <p className="text-sm text-foreground-muted">
                      Los proveedores deben verificar su identidad
                    </p>
                  </div>
                  <button
                    onClick={() => handleChange('requireIdVerification', !settings.requireIdVerification)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      settings.requireIdVerification ? 'bg-gold' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        settings.requireIdVerification ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Permitir registro de proveedores
                    </p>
                    <p className="text-sm text-foreground-muted">
                      Los nuevos proveedores pueden registrarse
                    </p>
                  </div>
                  <button
                    onClick={() => handleChange('allowProviderRegistration', !settings.allowProviderRegistration)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      settings.allowProviderRegistration ? 'bg-gold' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        settings.allowProviderRegistration ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payments Settings */}
          {activeSection === 'payments' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Configuración de Pagos
                </CardTitle>
                <CardDescription>
                  Gestiona las comisiones y pagos de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Comisión de la plataforma (%)
                  </label>
                  <Input
                    type="number"
                    value={settings.commissionRate}
                    onChange={(e) => handleChange('commissionRate', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-foreground-muted">
                    Porcentaje que se cobra a los proveedores por cada transacción
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Retiro mínimo (CLP)
                  </label>
                  <Input
                    type="number"
                    value={settings.minWithdrawal}
                    onChange={(e) => handleChange('minWithdrawal', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-foreground-muted">
                    Monto mínimo que un proveedor puede retirar
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificaciones
                </CardTitle>
                <CardDescription>
                  Configura las notificaciones del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground-muted text-center py-8">
                  Configuración de notificaciones próximamente
                </p>
              </CardContent>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeSection === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Apariencia
                </CardTitle>
                <CardDescription>
                  Personaliza el aspecto de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground-muted text-center py-8">
                  Configuración de apariencia próximamente
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
