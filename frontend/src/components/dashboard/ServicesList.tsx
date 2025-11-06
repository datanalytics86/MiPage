'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { servicesAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  title: string;
  category: string;
  price: number;
  priceType: string;
  city: string;
  coverPhoto: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  views?: number;
  bookings?: number;
  averageRating?: number;
  createdAt: string;
  rejectionReason?: string;
}

export default function ServicesList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data } = await servicesAPI.getMy();
      setServices(data.data || []);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      toast.error('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;

    try {
      await servicesAPI.delete(id);
      toast.success('Servicio eliminado exitosamente');
      fetchServices();
    } catch (error) {
      console.error('Error al eliminar servicio:', error);
      toast.error('Error al eliminar servicio');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success" dot>Aprobado</Badge>;
      case 'PENDING':
        return <Badge variant="warning" dot>Pendiente</Badge>;
      case 'REJECTED':
        return <Badge variant="danger" dot>Rechazado</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const filteredServices = services.filter((service) => {
    if (filter === 'ALL') return true;
    return service.status === filter;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-dark p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-32 h-24 bg-dark-800 rounded-lg" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-dark-800 rounded w-1/3" />
                <div className="h-4 bg-dark-800 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-warm-50 mb-2">Mis Servicios</h2>
          <p className="text-warm-400">
            Gestiona tus servicios publicados
          </p>
        </div>
        <Link href="/services/new">
          <Button variant="fire" size="lg">
            <PlusIcon className="h-5 w-5 mr-2" />
            Crear Servicio
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'ALL'
              ? 'bg-fire-500 text-white shadow-fire'
              : 'bg-dark-850 text-warm-300 border border-dark-700 hover:border-fire-500'
          }`}
        >
          Todos ({services.length})
        </button>
        <button
          onClick={() => setFilter('APPROVED')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'APPROVED'
              ? 'bg-green-500 text-white shadow-lg'
              : 'bg-dark-850 text-warm-300 border border-dark-700 hover:border-green-500'
          }`}
        >
          Aprobados ({services.filter((s) => s.status === 'APPROVED').length})
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'PENDING'
              ? 'bg-yellow-500 text-white shadow-lg'
              : 'bg-dark-850 text-warm-300 border border-dark-700 hover:border-yellow-500'
          }`}
        >
          Pendientes ({services.filter((s) => s.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilter('REJECTED')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'REJECTED'
              ? 'bg-lust-500 text-white shadow-lust'
              : 'bg-dark-850 text-warm-300 border border-dark-700 hover:border-lust-500'
          }`}
        >
          Rechazados ({services.filter((s) => s.status === 'REJECTED').length})
        </button>
      </div>

      {/* Services List */}
      {filteredServices.length === 0 ? (
        <div className="card-dark p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-bold text-warm-50 mb-2">
            No hay servicios
          </h3>
          <p className="text-warm-400 mb-6">
            {filter === 'ALL'
              ? 'Aún no has creado ningún servicio'
              : `No tienes servicios ${filter.toLowerCase()}`}
          </p>
          <Link href="/services/new">
            <Button variant="fire">
              Crear tu primer servicio
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="card-dark hover:shadow-dark-lg transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="relative w-40 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-dark-900">
                    <Image
                      src={service.coverPhoto}
                      alt={service.title}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title & Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/services/${service.id}`}
                          className="text-xl font-bold text-warm-50 hover:text-fire-400 transition-colors line-clamp-1"
                        >
                          {service.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-2 text-sm text-warm-400">
                          <span className="badge-modelaje text-xs">{service.category}</span>
                          <span>📍 {service.city}</span>
                          <span className="text-fire-500 font-semibold">
                            {formatPrice(service.price)} / {service.priceType === 'hour' ? 'hora' : 'día'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(service.status)}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-warm-400">
                        <EyeIcon className="h-4 w-4" />
                        <span>{service.views || 0} vistas</span>
                      </div>
                      <div className="flex items-center gap-2 text-warm-400">
                        <span>📅</span>
                        <span>{service.bookings || 0} reservas</span>
                      </div>
                      {service.averageRating && (
                        <div className="flex items-center gap-2 text-warm-400">
                          <span>⭐</span>
                          <span>{service.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-warm-500">
                        <span>🕐</span>
                        <span>
                          {new Date(service.createdAt).toLocaleDateString('es-CL')}
                        </span>
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {service.status === 'REJECTED' && service.rejectionReason && (
                      <div className="bg-lust-500/10 border border-lust-500/30 rounded-lg p-3 mb-4">
                        <p className="text-lust-400 text-sm font-medium mb-1">
                          ⚠️ Motivo de rechazo:
                        </p>
                        <p className="text-warm-300 text-sm">{service.rejectionReason}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Link href={`/services/${service.id}`}>
                        <Button variant="dark" size="sm">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
                      <Link href={`/services/${service.id}/edit`}>
                        <Button variant="dark" size="sm">
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="dark"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                        className="hover:!bg-lust-500/10 hover:!text-lust-400 hover:!border-lust-500"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
