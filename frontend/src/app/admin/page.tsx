'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/auth';
import { adminAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [pendingServices, setPendingServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showPhotosModal, setShowPhotosModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'ADMIN') {
      toast.error('No tienes permisos para acceder al panel de administración');
      router.push('/');
      return;
    }

    fetchData();
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingServices(),
      ]);

      setStats(statsRes.data);
      setPendingServices(pendingRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos del panel');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (serviceId: string) => {
    try {
      await adminAPI.approveService(serviceId);
      toast.success('Servicio aprobado');
      fetchData();
    } catch (error) {
      toast.error('Error al aprobar servicio');
    }
  };

  const handleReject = async (serviceId: string) => {
    try {
      await adminAPI.rejectService(serviceId);
      toast.success('Servicio rechazado');
      fetchData();
    } catch (error) {
      toast.error('Error al rechazar servicio');
    }
  };

  const handleViewPhotos = (service: any) => {
    setSelectedService(service);
    setShowPhotosModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600">Bienvenido, {user?.name}</p>
            </div>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Volver al sitio
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-600">
                    {stats.users?.total || 0}
                  </p>
                  <p className="text-gray-600 mt-2">Usuarios Totales</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {stats.services?.approved || 0}
                  </p>
                  <p className="text-gray-600 mt-2">Servicios Aprobados</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.services?.pending || 0}
                  </p>
                  <p className="text-gray-600 mt-2">Pendientes</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.reviews?.total || 0}
                  </p>
                  <p className="text-gray-600 mt-2">Reseñas</p>
                  <p className="text-sm text-gray-500 mt-1">
                    ⭐ {stats.reviews?.averageRating?.toFixed(1) || 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pending Services */}
        <Card>
          <CardHeader>
            <CardTitle>Servicios Pendientes de Aprobación ({pendingServices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingServices.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-gray-600">No hay servicios pendientes</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingServices.map((service) => (
                  <div
                    key={service.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex gap-6">
                      {/* Photo Preview */}
                      <div className="flex-shrink-0">
                        {service.coverPhoto && (
                          <div
                            className="relative w-48 h-48 rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => handleViewPhotos(service)}
                          >
                            <Image
                              src={service.coverPhoto}
                              alt={service.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                            {service.photos?.length > 1 && (
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                📷 {service.photos.length} fotos
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                👁️ Ver todas
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-xl text-gray-900">{service.title}</h3>
                              <Badge variant="warning">Pendiente</Badge>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="info">
                                {service.category === 'MODELAJE' ? '📸 Modelaje' : '💆 Masajes'}
                              </Badge>
                              <span className="text-lg font-bold text-primary-600">
                                ${service.price.toLocaleString()} CLP
                              </span>
                              <span className="text-sm text-gray-500">/ {service.priceType}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>

                        {/* Publisher Info */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-3">
                            {service.user?.avatar && (
                              <Image
                                src={service.user.avatar}
                                alt={service.user.name}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">Publicador: {service.user?.name}</p>
                              <p className="text-sm text-gray-500">{service.user?.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span>📍 {service.location}, {service.city}</span>
                          {service.region && <span>🗺️ {service.region}</span>}
                          <span>📅 {new Date(service.createdAt).toLocaleDateString('es-CL')}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t">
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => handleApprove(service.id)}
                            className="flex-1"
                          >
                            ✅ Aprobar Servicio
                          </Button>
                          <Button
                            variant="outline"
                            size="md"
                            onClick={() => handleViewPhotos(service)}
                          >
                            👁️ Ver Fotos
                          </Button>
                          <Button
                            variant="danger"
                            size="md"
                            onClick={() => handleReject(service.id)}
                          >
                            ❌ Rechazar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Photos Modal */}
      <Modal
        isOpen={showPhotosModal}
        onClose={() => {
          setShowPhotosModal(false);
          setSelectedService(null);
        }}
        title={`Fotos: ${selectedService?.title || ''}`}
      >
        {selectedService && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {selectedService.photos?.map((photo: string, index: number) => (
                <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                  <Image
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowPhotosModal(false)}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  handleApprove(selectedService.id);
                  setShowPhotosModal(false);
                }}
              >
                ✅ Aprobar
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  handleReject(selectedService.id);
                  setShowPhotosModal(false);
                }}
              >
                ❌ Rechazar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
