'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, GripVertical, Save, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import {
  useProviderServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '@/hooks/useServices'
import { useToast } from '@/stores/uiStore'
import type { Service } from '@/types/database'

interface ServiceFormData {
  name: string
  description: string
  price: number
  duration: string
}

const emptyService: ServiceFormData = {
  name: '',
  description: '',
  price: 0,
  duration: '',
}

export default function DashboardServiciosPage() {
  const toast = useToast()
  const { provider } = useAuth()
  const { data: services = [], isLoading } = useProviderServices(provider?.id)
  const createService = useCreateService()
  const updateService = useUpdateService()
  const deleteService = useDeleteService()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState<ServiceFormData>(emptyService)

  if (!provider) {
    return (
      <p className="text-foreground-secondary">No tienes un perfil de proveedor asociado.</p>
    )
  }

  const handleEdit = (service: Service) => {
    setEditingId(service.id)
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration: service.duration || '',
    })
    setIsAdding(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData(emptyService)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.price) return

    try {
      if (isAdding) {
        await createService.mutateAsync({
          providerId: provider.id,
          input: {
            ...formData,
            sort_order: services.length,
          },
        })
        toast.success('Servicio creado')
      } else if (editingId) {
        await updateService.mutateAsync({
          id: editingId,
          providerId: provider.id,
          updates: formData,
        })
        toast.success('Servicio actualizado')
      }
      handleCancel()
    } catch {
      toast.error('Error', 'No se pudo guardar el servicio')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este servicio?')) return
    try {
      await deleteService.mutateAsync({ id, providerId: provider.id })
      toast.success('Servicio eliminado')
    } catch {
      toast.error('Error', 'No se pudo eliminar')
    }
  }

  const handleToggleActive = async (service: Service) => {
    try {
      await updateService.mutateAsync({
        id: service.id,
        providerId: provider.id,
        updates: { is_active: !service.is_active },
      })
    } catch {
      toast.error('Error', 'No se pudo cambiar el estado')
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Mis Servicios</h2>
          <p className="text-foreground-muted mt-1">
            Los precios se sincronizan automáticamente con tu perfil público
          </p>
        </div>
        <Button onClick={() => { setIsAdding(true); setEditingId(null); setFormData(emptyService) }} disabled={isAdding}>
          <Plus className="h-5 w-5 mr-2" />
          Agregar servicio
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-gold">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Nuevo servicio</h3>
                <ServiceForm data={formData} onChange={setFormData} onSave={handleSave} onCancel={handleCancel} saving={createService.isPending} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <motion.div key={service.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {editingId === service.id ? (
                <Card className="border-gold">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Editar servicio</h3>
                    <ServiceForm data={formData} onChange={setFormData} onSave={handleSave} onCancel={handleCancel} saving={updateService.isPending} />
                  </CardContent>
                </Card>
              ) : (
                <Card className={cn(!service.is_active && 'opacity-60')}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <GripVertical className="h-5 w-5 mt-1 text-foreground-muted" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{service.name}</h3>
                        {!service.is_active && <Badge variant="secondary">Inactivo</Badge>}
                      </div>
                      {service.description && (
                        <p className="text-sm text-foreground-secondary mb-2">{service.description}</p>
                      )}
                      <div className="flex gap-4 text-sm text-foreground-muted">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatPrice(service.price)}
                        </span>
                        {service.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {service.duration}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleToggleActive(service)} title="Activar/desactivar">
                        <span className={cn('w-3 h-3 rounded-full', service.is_active ? 'bg-success' : 'bg-muted-foreground')} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="text-error">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && services.length === 0 && !isAdding && (
        <Card>
          <CardContent className="p-12 text-center">
            <Plus className="h-8 w-8 mx-auto mb-4 text-foreground-muted" />
            <h3 className="font-display text-xl font-semibold mb-2">Sin servicios</h3>
            <p className="text-foreground-secondary mb-4">Agrega los servicios que ofreces</p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Agregar primer servicio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ServiceForm({
  data,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  data: ServiceFormData
  onChange: (data: ServiceFormData) => void
  onSave: () => void
  onCancel: () => void
  saving?: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre del servicio *</label>
          <Input value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} placeholder="Masaje Relajante" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Duración</label>
          <Input value={data.duration} onChange={(e) => onChange({ ...data, duration: e.target.value })} placeholder="60 min" />
        </div>
      </div>
      <textarea
        value={data.description}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        className="input-luxury resize-none w-full"
        rows={2}
        placeholder="Descripción..."
      />
      <div className="space-y-2">
        <label className="text-sm font-medium">Precio (CLP) *</label>
        <Input type="number" min={1000} value={data.price || ''} onChange={(e) => onChange({ ...data, price: parseInt(e.target.value) || 0 })} />
      </div>
      <div className="flex gap-3">
        <Button onClick={onSave} disabled={!data.name || !data.price || saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  )
}