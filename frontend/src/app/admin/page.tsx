'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import { adminAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [pendingServices, setPendingServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
            <CardTitle>Servicios Pendientes de Aprobación</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingServices.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-gray-600">No hay servicios pendientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingServices.map((service) => (
                  <div
                    key={service.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{service.title}</h3>
                          <Badge variant="warning">Pendiente</Badge>
                          <Badge variant="info">
                            {service.category === 'MODELAJE' ? 'Modelaje' : 'Masajes'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>📍 {service.city}</span>
                          <span>💰 ${service.price}</span>
                          <span>👤 {service.user.name}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(service.id)}
                        >
                          ✅ Aprobar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(service.id)}
                        >
                          ❌ Rechazar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
