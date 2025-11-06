'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    rut?: string;
    edad?: number;
    nacionalidad?: string;
    altura?: number;
    peso?: number;
    contextura?: string;
    medidas?: string;
    region?: string;
    ciudad?: string;
    comuna?: string;
    direccion?: string;
    tipoServicio?: string;
    biografia?: string;
    horarios?: string;
    tarifas?: string;
    customValues?: Array<{
      id: string;
      value: string;
      field: {
        fieldName: string;
        fieldLabel: string;
        fieldType: string;
        category: string;
      };
    }>;
  };
  services?: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  _count?: {
    services: number;
    reviews: number;
  };
}

export default function UserDetailsModal({ isOpen, onClose, userId }: UserDetailsModalProps) {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/full`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Error al cargar usuario');

      const data = await response.json();
      setUser(data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar detalles del usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Usuario">
      <div className="space-y-6">
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-fire-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-warm-200 mt-4">Cargando detalles...</p>
          </div>
        ) : user ? (
          <>
            {/* Basic Info */}
            <div className="card-dark-solid p-6">
              <h3 className="text-lg font-semibold text-warm-50 mb-4 flex items-center gap-2">
                👤 Información Básica
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-warm-500">Nombre</label>
                  <p className="text-warm-50 font-medium">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm text-warm-500">Email</label>
                  <p className="text-warm-50">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-warm-500">Teléfono</label>
                  <p className="text-warm-50">{user.phone || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-warm-500">Rol</label>
                  <div className="mt-1">
                    <Badge variant={user.role === 'ADMIN' ? 'lust' : user.role === 'PUBLISHER' ? 'fire' : 'default'}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-warm-500">Estado de Aprobación</label>
                  <div className="mt-1">
                    <span className={
                      user.approvalStatus === 'ACTIVE' ? 'status-active' :
                      user.approvalStatus === 'PENDING' ? 'status-pending' :
                      user.approvalStatus === 'INACTIVE' ? 'status-inactive' :
                      user.approvalStatus === 'REJECTED' ? 'status-rejected' :
                      'status-pending'
                    }>
                      {user.approvalStatus}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-warm-500">Activo</label>
                  <p className="text-warm-50">{user.isActive ? '✅ Sí' : '❌ No'}</p>
                </div>
              </div>
            </div>

            {/* Fixed Metadata */}
            {user.metadata && (
              <div className="card-dark-solid p-6">
                <h3 className="text-lg font-semibold text-warm-50 mb-4 flex items-center gap-2">
                  📋 Datos Personales
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-warm-500">RUT</label>
                    <p className="text-warm-50">{user.metadata.rut || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-warm-500">Edad</label>
                    <p className="text-warm-50">{user.metadata.edad || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-warm-500">Nacionalidad</label>
                    <p className="text-warm-50">{user.metadata.nacionalidad || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-warm-500">Tipo de Servicio</label>
                    <p className="text-warm-50">{user.metadata.tipoServicio || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Physical Data */}
            {user.metadata && (user.metadata.altura || user.metadata.peso || user.metadata.contextura) && (
              <div className="card-dark-solid p-6">
                <h3 className="text-lg font-semibold text-warm-50 mb-4 flex items-center gap-2">
                  📏 Datos Físicos
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-warm-500">Altura (cm)</label>
                    <p className="text-warm-50">{user.metadata.altura || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-warm-500">Peso (kg)</label>
                    <p className="text-warm-50">{user.metadata.peso || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-warm-500">Contextura</label>
                    <p className="text-warm-50">{user.metadata.contextura || '-'}</p>
                  </div>
                  {user.metadata.medidas && (
                    <div className="col-span-3">
                      <label className="text-sm text-warm-500">Medidas</label>
                      <p className="text-warm-50">{user.metadata.medidas}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {user.metadata && (user.metadata.region || user.metadata.ciudad) && (
              <div className="card-dark-solid p-6">
                <h3 className="text-lg font-semibold text-warm-50 mb-4 flex items-center gap-2">
                  📍 Ubicación
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-warm-500">Región</label>
                    <p className="text-warm-50">{user.metadata.region || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-warm-500">Ciudad</label>
                    <p className="text-warm-50">{user.metadata.ciudad || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-warm-500">Comuna</label>
                    <p className="text-warm-50">{user.metadata.comuna || '-'}</p>
                  </div>
                  {user.metadata.direccion && (
                    <div className="col-span-2">
                      <label className="text-sm text-warm-500">Dirección</label>
                      <p className="text-warm-50">{user.metadata.direccion}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Service Info */}
            {user.metadata && (user.metadata.biografia || user.metadata.horarios || user.metadata.tarifas) && (
              <div className="card-dark-solid p-6">
                <h3 className="text-lg font-semibold text-warm-50 mb-4 flex items-center gap-2">
                  💼 Información del Servicio
                </h3>
                {user.metadata.biografia && (
                  <div className="mb-4">
                    <label className="text-sm text-warm-500">Biografía</label>
                    <p className="text-warm-50 whitespace-pre-wrap">{user.metadata.biografia}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {user.metadata.horarios && (
                    <div>
                      <label className="text-sm text-warm-500">Horarios</label>
                      <p className="text-warm-50 whitespace-pre-wrap">{user.metadata.horarios}</p>
                    </div>
                  )}
                  {user.metadata.tarifas && (
                    <div>
                      <label className="text-sm text-warm-500">Tarifas</label>
                      <p className="text-warm-50 whitespace-pre-wrap">{user.metadata.tarifas}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Custom Fields */}
            {user.metadata?.customValues && user.metadata.customValues.length > 0 && (
              <div className="card-dark-solid p-6">
                <h3 className="text-lg font-semibold text-warm-50 mb-4 flex items-center gap-2">
                  🔧 Campos Personalizados
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {user.metadata.customValues.map((customValue) => (
                    <div key={customValue.id}>
                      <label className="text-sm text-warm-500">
                        {customValue.field.fieldLabel}
                      </label>
                      <p className="text-warm-50">{customValue.value}</p>
                      <span className="text-xs text-dark-500">
                        {customValue.field.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {user.services && user.services.length > 0 && (
              <div className="card-dark-solid p-6">
                <h3 className="text-lg font-semibold text-warm-50 mb-4 flex items-center gap-2">
                  📝 Servicios Publicados ({user.services.length})
                </h3>
                <div className="space-y-2">
                  {user.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
                      <span className="text-warm-50">{service.title}</span>
                      <span className={
                        service.status === 'APPROVED' ? 'status-active' :
                        service.status === 'PENDING' ? 'status-pending' :
                        'status-rejected'
                      }>
                        {service.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="card-dark-solid p-6">
              <h3 className="text-lg font-semibold text-warm-50 mb-4 flex items-center gap-2">
                📊 Estadísticas
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-fire-500">{user._count?.services || 0}</p>
                  <p className="text-sm text-warm-500">Servicios</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-lust-500">{user._count?.reviews || 0}</p>
                  <p className="text-sm text-warm-500">Reseñas</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-warm-500">Registrado</p>
                  <p className="text-warm-50">{new Date(user.createdAt).toLocaleDateString('es-CL')}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
              <Button variant="dark" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-warm-500">
            No se pudo cargar la información del usuario
          </div>
        )}
      </div>
    </Modal>
  );
}
