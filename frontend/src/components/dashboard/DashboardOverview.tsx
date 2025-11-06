'use client';

import { useEffect, useState } from 'react';
import { servicesAPI, usersAPI } from '@/lib/api';
import {
  ChartBarIcon,
  EyeIcon,
  StarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalServices: number;
  approvedServices: number;
  pendingServices: number;
  rejectedServices: number;
  totalViews: number;
  totalBookings: number;
  averageRating: number;
  totalEarnings: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalServices: 0,
    approvedServices: 0,
    pendingServices: 0,
    rejectedServices: 0,
    totalViews: 0,
    totalBookings: 0,
    averageRating: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const { data } = await servicesAPI.getMy();
      const services = data.data || [];

      // Calculate stats
      const totalServices = services.length;
      const approvedServices = services.filter((s: any) => s.status === 'APPROVED').length;
      const pendingServices = services.filter((s: any) => s.status === 'PENDING').length;
      const rejectedServices = services.filter((s: any) => s.status === 'REJECTED').length;

      // Calculate total views (sum of views from all services)
      const totalViews = services.reduce((sum: number, s: any) => sum + (s.views || 0), 0);

      // Calculate total bookings (sum of bookings from all services)
      const totalBookings = services.reduce((sum: number, s: any) => sum + (s.bookings || 0), 0);

      // Calculate average rating across all services
      const ratingsSum = services.reduce((sum: number, s: any) => sum + (s.averageRating || 0), 0);
      const averageRating = totalServices > 0 ? ratingsSum / totalServices : 0;

      // Calculate total earnings (bookings * average price)
      const totalEarnings = services.reduce(
        (sum: number, s: any) => sum + (s.bookings || 0) * (s.price || 0),
        0
      );

      setStats({
        totalServices,
        approvedServices,
        pendingServices,
        rejectedServices,
        totalViews,
        totalBookings,
        averageRating,
        totalEarnings,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Servicios',
      value: stats.totalServices,
      icon: ChartBarIcon,
      color: 'fire',
      bgColor: 'bg-fire-500/10',
      textColor: 'text-fire-500',
      borderColor: 'border-fire-500/30',
    },
    {
      label: 'Aprobados',
      value: stats.approvedServices,
      icon: CheckCircleIcon,
      color: 'green',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500',
      borderColor: 'border-green-500/30',
    },
    {
      label: 'Pendientes',
      value: stats.pendingServices,
      icon: ClockIcon,
      color: 'yellow',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-500',
      borderColor: 'border-yellow-500/30',
    },
    {
      label: 'Rechazados',
      value: stats.rejectedServices,
      icon: XCircleIcon,
      color: 'lust',
      bgColor: 'bg-lust-500/10',
      textColor: 'text-lust-500',
      borderColor: 'border-lust-500/30',
    },
    {
      label: 'Vistas Totales',
      value: stats.totalViews.toLocaleString(),
      icon: EyeIcon,
      color: 'fire',
      bgColor: 'bg-fire-500/10',
      textColor: 'text-fire-500',
      borderColor: 'border-fire-500/30',
    },
    {
      label: 'Reservas',
      value: stats.totalBookings,
      icon: ChartBarIcon,
      color: 'lust',
      bgColor: 'bg-lust-500/10',
      textColor: 'text-lust-500',
      borderColor: 'border-lust-500/30',
    },
    {
      label: 'Calificación Promedio',
      value: stats.averageRating.toFixed(1),
      icon: StarIcon,
      color: 'yellow',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-500',
      borderColor: 'border-yellow-500/30',
      suffix: '★',
    },
    {
      label: 'Ingresos Totales',
      value: `$${stats.totalEarnings.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'green',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500',
      borderColor: 'border-green-500/30',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="card-dark p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-dark-800 rounded-lg" />
            </div>
            <div className="h-8 bg-dark-800 rounded mb-2 w-20" />
            <div className="h-4 bg-dark-800 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-warm-50 mb-2">Dashboard</h2>
        <p className="text-warm-400">
          Resumen de tus servicios y estadísticas
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`card-dark p-6 border ${stat.borderColor} hover:scale-105 transition-transform duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
            <div className={`text-3xl font-bold ${stat.textColor} mb-1`}>
              {stat.value}
              {stat.suffix && (
                <span className="text-2xl ml-1">{stat.suffix}</span>
              )}
            </div>
            <div className="text-warm-500 text-sm font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 card-dark p-6">
        <h3 className="text-xl font-bold text-warm-50 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-fire text-left">
            <div className="text-lg mb-1">➕ Crear Nuevo Servicio</div>
            <div className="text-sm opacity-90">Publica un nuevo servicio</div>
          </button>
          <button className="btn-fire-outline text-left">
            <div className="text-lg mb-1">📝 Crear Actualización</div>
            <div className="text-sm opacity-90">Comparte novedades con tus clientes</div>
          </button>
          <button className="btn-fire-outline text-left">
            <div className="text-lg mb-1">👤 Editar Perfil</div>
            <div className="text-sm opacity-90">Actualiza tu información</div>
          </button>
        </div>
      </div>
    </div>
  );
}
