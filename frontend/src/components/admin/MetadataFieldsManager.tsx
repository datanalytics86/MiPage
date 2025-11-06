'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface MetadataField {
  id: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  category: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: any;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  order: number;
  isActive: boolean;
  showInTable: boolean;
  _count?: {
    values: number;
  };
}

export default function MetadataFieldsManager() {
  const [fields, setFields] = useState<MetadataField[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingField, setEditingField] = useState<MetadataField | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fieldName: '',
    fieldLabel: '',
    fieldType: 'TEXT',
    category: 'PERSONAL',
    required: false,
    placeholder: '',
    helpText: '',
    options: '',
    isActive: true,
    showInTable: true,
  });

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/metadata-fields`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Error al cargar campos');

      const data = await response.json();
      setFields(data.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar campos de metadata');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      // Parse options if provided
      let parsedOptions = null;
      if (formData.options && (formData.fieldType === 'SELECT' || formData.fieldType === 'MULTISELECT' || formData.fieldType === 'RADIO')) {
        try {
          parsedOptions = JSON.parse(formData.options);
        } catch {
          // If not JSON, split by commas
          parsedOptions = formData.options.split(',').map(opt => opt.trim());
        }
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/metadata-fields`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            options: parsedOptions,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear campo');
      }

      toast.success('Campo creado exitosamente');
      setShowCreateModal(false);
      resetForm();
      fetchFields();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al crear campo');
    }
  };

  const handleUpdateField = async (fieldId: string, updates: Partial<MetadataField>) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/metadata-fields/${fieldId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) throw new Error('Error al actualizar campo');

      toast.success('Campo actualizado');
      fetchFields();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar campo');
    }
  };

  const handleDeleteField = async (fieldId: string, valueCount: number) => {
    if (valueCount > 0) {
      toast.error(`No se puede eliminar: ${valueCount} usuario(s) tienen valores en este campo`);
      return;
    }

    if (!confirm('¿Estás seguro de eliminar este campo?')) return;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/metadata-fields/${fieldId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Error al eliminar campo');

      toast.success('Campo eliminado');
      fetchFields();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar campo');
    }
  };

  const handleReorder = async (fieldId: string, direction: 'up' | 'down') => {
    const fieldIndex = fields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return;

    const newFields = [...fields];
    const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;

    if (targetIndex < 0 || targetIndex >= newFields.length) return;

    // Swap
    [newFields[fieldIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[fieldIndex]];

    // Update orders
    const fieldOrders = newFields.map((field, index) => ({
      id: field.id,
      order: index,
    }));

    try {
      const token = localStorage.getItem('token');

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/metadata-fields/reorder`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fieldOrders }),
        }
      );

      setFields(newFields);
      toast.success('Orden actualizado');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al reordenar campos');
    }
  };

  const resetForm = () => {
    setFormData({
      fieldName: '',
      fieldLabel: '',
      fieldType: 'TEXT',
      category: 'PERSONAL',
      required: false,
      placeholder: '',
      helpText: '',
      options: '',
      isActive: true,
      showInTable: true,
    });
  };

  const FIELD_TYPES = [
    { value: 'TEXT', label: 'Texto corto' },
    { value: 'TEXTAREA', label: 'Texto largo' },
    { value: 'NUMBER', label: 'Número' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'PHONE', label: 'Teléfono' },
    { value: 'URL', label: 'URL' },
    { value: 'SELECT', label: 'Selección única' },
    { value: 'MULTISELECT', label: 'Selección múltiple' },
    { value: 'CHECKBOX', label: 'Casilla de verificación' },
    { value: 'RADIO', label: 'Radio buttons' },
    { value: 'DATE', label: 'Fecha' },
    { value: 'TIME', label: 'Hora' },
  ];

  const CATEGORIES = [
    { value: 'PERSONAL', label: '👤 Personal' },
    { value: 'FISICA', label: '📏 Física' },
    { value: 'SERVICIO', label: '💼 Servicio' },
    { value: 'CONTACTO', label: '📞 Contacto' },
    { value: 'OTROS', label: '📋 Otros' },
  ];

  if (loading) {
    return (
      <div className="card-dark p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-fire-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-warm-200 mt-4">Cargando campos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-warm-50">Campos de Metadata</h2>
          <p className="text-warm-300 mt-1">
            Gestiona los campos personalizados para usuarios publishers
          </p>
        </div>
        <Button variant="fire" onClick={() => setShowCreateModal(true)}>
          ➕ Crear Campo
        </Button>
      </div>

      {/* Fields List */}
      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-warm-300 bg-dark-900">
                  Campo
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-warm-300 bg-dark-900">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-warm-300 bg-dark-900">
                  Categoría
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-warm-300 bg-dark-900">
                  Requerido
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-warm-300 bg-dark-900">
                  Activo
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-warm-300 bg-dark-900">
                  En Tabla
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-warm-300 bg-dark-900">
                  Valores
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-warm-300 bg-dark-900">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-warm-500">
                    <div className="text-6xl mb-4">📝</div>
                    <p>No hay campos personalizados creados</p>
                  </td>
                </tr>
              ) : (
                fields.map((field, index) => (
                  <tr key={field.id} className="border-b border-dark-800 hover:bg-dark-800 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-warm-50">{field.fieldLabel}</p>
                        <p className="text-sm text-warm-500">{field.fieldName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{field.fieldType}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-warm-200">{field.category}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={field.required ? 'text-lust-400' : 'text-warm-500'}>
                        {field.required ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleUpdateField(field.id, { isActive: !field.isActive })}
                        className={`px-2 py-1 rounded text-xs ${
                          field.isActive ? 'status-active' : 'status-inactive'
                        }`}
                      >
                        {field.isActive ? 'Sí' : 'No'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleUpdateField(field.id, { showInTable: !field.showInTable })}
                        className={`px-2 py-1 rounded text-xs ${
                          field.showInTable ? 'status-active' : 'status-inactive'
                        }`}
                      >
                        {field.showInTable ? 'Sí' : 'No'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center text-warm-200">
                      {field._count?.values || 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(field.id, 'up')}
                          disabled={index === 0}
                          title="Mover arriba"
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(field.id, 'down')}
                          disabled={index === fields.length - 1}
                          title="Mover abajo"
                        >
                          ↓
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteField(field.id, field._count?.values || 0)}
                          disabled={(field._count?.values || 0) > 0}
                          title={(field._count?.values || 0) > 0 ? 'No se puede eliminar: tiene valores asociados' : 'Eliminar campo'}
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Crear Campo Personalizado"
      >
        <form onSubmit={handleCreateField} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre técnico"
              placeholder="colorOjos"
              value={formData.fieldName}
              onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
              helperText="Sin espacios ni caracteres especiales"
              required
            />
            <Input
              label="Etiqueta visible"
              placeholder="Color de Ojos"
              value={formData.fieldLabel}
              onChange={(e) => setFormData({ ...formData, fieldLabel: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-200 mb-1">
                Tipo de campo
              </label>
              <select
                value={formData.fieldType}
                onChange={(e) => setFormData({ ...formData, fieldType: e.target.value })}
                className="input-dark w-full"
                required
              >
                {FIELD_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-200 mb-1">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-dark w-full"
                required
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Placeholder"
            placeholder="Texto de ayuda en el campo"
            value={formData.placeholder}
            onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
          />

          <Input
            label="Texto de ayuda"
            placeholder="Descripción del campo"
            value={formData.helpText}
            onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
          />

          {(formData.fieldType === 'SELECT' || formData.fieldType === 'MULTISELECT' || formData.fieldType === 'RADIO') && (
            <div>
              <label className="block text-sm font-medium text-warm-200 mb-1">
                Opciones (JSON o separadas por comas)
              </label>
              <textarea
                value={formData.options}
                onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                className="input-dark w-full h-24 resize-none"
                placeholder='["Azul", "Verde", "Café"] o Azul, Verde, Café'
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.required}
                onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                className="w-4 h-4 rounded border-dark-700 bg-dark-850 text-fire-500 focus:ring-fire-500"
              />
              <span className="text-warm-200">Requerido</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-dark-700 bg-dark-850 text-fire-500 focus:ring-fire-500"
              />
              <span className="text-warm-200">Activo</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showInTable}
                onChange={(e) => setFormData({ ...formData, showInTable: e.target.checked })}
                className="w-4 h-4 rounded border-dark-700 bg-dark-850 text-fire-500 focus:ring-fire-500"
              />
              <span className="text-warm-200">Mostrar en tabla</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
            <Button
              variant="dark"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              type="button"
            >
              Cancelar
            </Button>
            <Button variant="fire" type="submit">
              ✓ Crear Campo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
