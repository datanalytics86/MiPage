'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface ServiceType {
  id: string;
  name: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
}

export default function ServiceTypesManager() {
  const [types, setTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingType, setEditingType] = useState<ServiceType | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    description: '',
    icon: '📝',
    color: '#ff6b35',
    isActive: true,
  });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/service-types`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Error al cargar tipos de servicio');

      const data = await response.json();
      setTypes(data.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar tipos de servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const url = editingType
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/service-types/${editingType.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/service-types`;

      const response = await fetch(url, {
        method: editingType ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar tipo de servicio');
      }

      toast.success(editingType ? 'Tipo actualizado' : 'Tipo creado exitosamente');
      setShowCreateModal(false);
      setEditingType(null);
      resetForm();
      fetchTypes();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al guardar tipo de servicio');
    }
  };

  const handleDelete = async (typeId: string) => {
    if (!confirm('¿Estás seguro de eliminar este tipo de servicio?')) return;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/service-types/${typeId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Error al eliminar tipo de servicio');

      toast.success('Tipo eliminado');
      fetchTypes();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar tipo de servicio');
    }
  };

  const handleToggleActive = async (typeId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/service-types/${typeId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !isActive }),
        }
      );

      if (!response.ok) throw new Error('Error al actualizar');

      toast.success('Estado actualizado');
      fetchTypes();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const handleReorder = async (typeId: string, direction: 'up' | 'down') => {
    const typeIndex = types.findIndex(t => t.id === typeId);
    if (typeIndex === -1) return;

    const newTypes = [...types];
    const targetIndex = direction === 'up' ? typeIndex - 1 : typeIndex + 1;

    if (targetIndex < 0 || targetIndex >= newTypes.length) return;

    // Swap
    [newTypes[typeIndex], newTypes[targetIndex]] = [newTypes[targetIndex], newTypes[typeIndex]];

    // Update orders
    const typeOrders = newTypes.map((type, index) => ({
      id: type.id,
      order: index,
    }));

    try {
      const token = localStorage.getItem('token');

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/service-types/reorder`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ typeOrders }),
        }
      );

      setTypes(newTypes);
      toast.success('Orden actualizado');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al reordenar tipos');
    }
  };

  const handleEdit = (type: ServiceType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      label: type.label,
      description: type.description || '',
      icon: type.icon || '📝',
      color: type.color || '#ff6b35',
      isActive: type.isActive,
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      label: '',
      description: '',
      icon: '📝',
      color: '#ff6b35',
      isActive: true,
    });
  };

  const COMMON_ICONS = [
    '📸', '💆', '💃', '🎭', '🎨', '🎤', '🎵', '🏋️',
    '💅', '💄', '👗', '👠', '💼', '📱', '💻', '🎮',
    '🍽️', '🍷', '☕', '🎓', '📚', '✈️', '🚗', '🏠',
  ];

  const COMMON_COLORS = [
    '#ff6b35', '#ef4444', '#ec4899', '#a855f7', '#6366f1',
    '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981',
    '#84cc16', '#eab308', '#f59e0b', '#f97316',
  ];

  if (loading) {
    return (
      <div className="card-dark p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-fire-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-warm-200 mt-4">Cargando tipos de servicio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-warm-50">Tipos de Servicio</h2>
          <p className="text-warm-300 mt-1">
            Gestiona las categorías dinámicas para la home page
          </p>
        </div>
        <Button variant="fire" onClick={() => setShowCreateModal(true)}>
          ➕ Crear Tipo
        </Button>
      </div>

      {/* Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {types.length === 0 ? (
          <div className="col-span-full card-dark p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-warm-500">No hay tipos de servicio creados</p>
          </div>
        ) : (
          types.map((type, index) => (
            <div
              key={type.id}
              className="card-dark p-6 hover:shadow-fire-lg transition-all"
              style={{ borderLeft: `4px solid ${type.color}` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="text-4xl"
                    style={{ filter: `drop-shadow(0 0 8px ${type.color}40)` }}
                  >
                    {type.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-warm-50">{type.label}</h3>
                    <p className="text-sm text-warm-500">{type.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActive(type.id, type.isActive)}
                  className={`px-2 py-1 rounded text-xs ${
                    type.isActive ? 'status-active' : 'status-inactive'
                  }`}
                >
                  {type.isActive ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              {type.description && (
                <p className="text-sm text-warm-300 mb-4">{type.description}</p>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-dark-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReorder(type.id, 'up')}
                  disabled={index === 0}
                  title="Mover arriba"
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReorder(type.id, 'down')}
                  disabled={index === types.length - 1}
                  title="Mover abajo"
                >
                  ↓
                </Button>
                <Button
                  variant="dark"
                  size="sm"
                  onClick={() => handleEdit(type)}
                  className="flex-1"
                >
                  ✏️ Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(type.id)}
                >
                  🗑️
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingType(null);
          resetForm();
        }}
        title={editingType ? 'Editar Tipo de Servicio' : 'Crear Tipo de Servicio'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre técnico"
              placeholder="MODELAJE"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
              helperText="Mayúsculas, sin espacios"
              required
              disabled={!!editingType}
            />
            <Input
              label="Etiqueta visible"
              placeholder="Servicios de Modelaje"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-200 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-dark w-full h-20 resize-none"
              placeholder="Descripción opcional del tipo de servicio"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-200 mb-2">
                Icono (emoji)
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="input-dark flex-1 text-center text-2xl"
                  maxLength={2}
                />
                <div className="text-4xl">{formData.icon}</div>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {COMMON_ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className="p-2 text-2xl hover:bg-dark-800 rounded transition-colors"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-200 mb-2">
                Color
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="input-dark flex-1"
                  placeholder="#ff6b35"
                />
              </div>
              <div className="grid grid-cols-7 gap-2">
                {COMMON_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className="w-8 h-8 rounded hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-dark-700 bg-dark-850 text-fire-500 focus:ring-fire-500"
            />
            <span className="text-warm-200">Activo (visible en home page)</span>
          </label>

          {/* Preview */}
          <div className="card-dark-solid p-4 rounded-lg">
            <label className="block text-sm font-medium text-warm-200 mb-2">
              Vista Previa
            </label>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${formData.color}20`,
                color: formData.color,
                border: `1px solid ${formData.color}40`,
              }}
            >
              <span className="text-xl">{formData.icon}</span>
              <span>{formData.label}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
            <Button
              variant="dark"
              onClick={() => {
                setShowCreateModal(false);
                setEditingType(null);
                resetForm();
              }}
              type="button"
            >
              Cancelar
            </Button>
            <Button variant="fire" type="submit">
              {editingType ? '✓ Actualizar' : '✓ Crear Tipo'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
