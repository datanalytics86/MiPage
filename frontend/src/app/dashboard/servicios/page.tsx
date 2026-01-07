'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, GripVertical, X, Save, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, cn } from '@/lib/utils'
import type { Service } from '@/types'

// Mock services
const initialServices: Service[] = [
  {
    id: 's1',
    provider_id: '1',
    name: 'Masaje Relajante',
    description: 'Masaje corporal completo con aceites esenciales.',
    price: 45000,
    duration: '60 min',
    is_active: true,
    sort_order: 0,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 's2',
    provider_id: '1',
    name: 'Masaje Descontracturante',
    description: 'Enfocado en zonas de tensión muscular.',
    price: 55000,
    duration: '60 min',
    is_active: true,
    sort_order: 1,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 's3',
    provider_id: '1',
    name: 'Masaje con Piedras Calientes',
    description: 'Experiencia premium con piedras volcánicas.',
    price: 70000,
    duration: '90 min',
    is_active: true,
    sort_order: 2,
    created_at: '2024-01-15T00:00:00Z',
  },
]

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
  const [services, setServices] = useState(initialServices)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState<ServiceFormData>(emptyService)

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

  const handleAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setFormData(emptyService)
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData(emptyService)
  }

  const handleSave = () => {
    if (isAdding) {
      const newService: Service = {
        id: `s${Date.now()}`,
        provider_id: '1',
        name: formData.name,
        description: formData.description,
        price: formData.price,
        duration: formData.duration,
        is_active: true,
        sort_order: services.length,
        created_at: new Date().toISOString(),
      }
      setServices([...services, newService])
    } else if (editingId) {
      setServices(
        services.map((s) =>
          s.id === editingId
            ? { ...s, ...formData }
            : s
        )
      )
    }
    handleCancel()
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      setServices(services.filter((s) => s.id !== id))
    }
  }

  const handleToggleActive = (id: string) => {
    setServices(
      services.map((s) =>
        s.id === id ? { ...s, is_active: !s.is_active } : s
      )
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Mis Servicios
          </h2>
          <p className="text-foreground-muted mt-1">
            Gestiona los servicios que ofreces a tus clientes
          </p>
        </div>
        <Button onClick={handleAdd} disabled={isAdding}>
          <Plus className="h-5 w-5 mr-2" />
          Agregar servicio
        </Button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-gold">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Nuevo servicio</h3>
                <ServiceForm
                  data={formData}
                  onChange={setFormData}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Services List */}
      <div className="space-y-4">
        {services.map((service) => (
          <motion.div
            key={service.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {editingId === service.id ? (
              <Card className="border-gold">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Editar servicio</h3>
                  <ServiceForm
                    data={formData}
                    onChange={setFormData}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className={cn(!service.is_active && 'opacity-60')}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <button className="mt-1 cursor-grab text-foreground-muted hover:text-foreground">
                      <GripVertical className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{service.name}</h3>
                        {!service.is_active && (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-sm text-foreground-secondary mb-2">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-foreground-muted">
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
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(service.id)}
                        title={service.is_active ? 'Desactivar' : 'Activar'}
                      >
                        <span className={cn(
                          'w-3 h-3 rounded-full',
                          service.is_active ? 'bg-success' : 'bg-foreground-muted'
                        )} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(service.id)}
                        className="text-error hover:text-error"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ))}
      </div>

      {services.length === 0 && !isAdding && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-8 w-8 text-foreground-muted" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Sin servicios
            </h3>
            <p className="text-foreground-secondary mb-4">
              Agrega los servicios que ofreces para que los clientes puedan verlos
            </p>
            <Button onClick={handleAdd}>
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
}: {
  data: ServiceFormData
  onChange: (data: ServiceFormData) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Nombre del servicio *</label>
          <Input
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Ej: Masaje Relajante"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Duración</label>
          <Input
            value={data.duration}
            onChange={(e) => onChange({ ...data, duration: e.target.value })}
            placeholder="Ej: 60 min"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Descripción</label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className="input-luxury resize-none"
          rows={2}
          placeholder="Describe brevemente el servicio..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Precio (CLP) *</label>
        <Input
          type="number"
          min={1000}
          value={data.price || ''}
          onChange={(e) => onChange({ ...data, price: parseInt(e.target.value) || 0 })}
          placeholder="45000"
          required
        />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={onSave} disabled={!data.name || !data.price}>
          <Save className="h-4 w-4 mr-2" />
          Guardar
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
