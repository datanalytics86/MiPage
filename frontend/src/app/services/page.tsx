'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { servicesAPI } from '@/lib/api';
import ServiceCard from '@/components/services/ServiceCard';
import Spinner from '@/components/ui/Spinner';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  BoltIcon,
  ArrowPathRoundedSquareIcon,
  SparklesIcon,
  StarIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  AdjustmentsHorizontalIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/auth';

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: initialCategory,
    city: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sortBy: 'createdAt',
    order: 'desc',
  });
  const [showFilters, setShowFilters] = useState(true);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: '',
    priceType: '',
    city: '',
    status: 'APPROVED',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [filters]);

  const filterCount = useMemo(
    () =>
      [
        filters.category,
        filters.city,
        filters.search,
        filters.minPrice,
        filters.maxPrice,
        filters.minRating,
      ].filter(Boolean).length,
    [filters]
  );

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (filters.category) params.category = filters.category;
      if (filters.city) params.city = filters.city;
      if (filters.search) params.search = filters.search;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
        params.order = filters.order;
      }

      const { data } = await servicesAPI.getAll(params);
      setServices(data.services);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      toast.error('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminEdit = (service: any) => {
    setEditTarget(service);
    setEditForm({
      title: service.title,
      description: service.description,
      price: String(service.price),
      priceType: service.priceType,
      city: service.city,
      status: service.status || 'APPROVED',
    });
  };

  const saveAdminEdit = async () => {
    if (!editTarget) return;

    setSavingEdit(true);
    try {
      await servicesAPI.update(editTarget.id, {
        title: editForm.title,
        description: editForm.description,
        price: Number(editForm.price),
        priceType: editForm.priceType,
        city: editForm.city,
        status: editForm.status,
      });

      setServices((prev) =>
        prev.map((service) =>
          service.id === editTarget.id
            ? {
                ...service,
                ...editForm,
                price: Number(editForm.price),
              }
            : service
        )
      );

      toast.success('Contenido actualizado para este servicio');
      setEditTarget(null);
    } catch (error) {
      console.error('Error al editar servicio:', error);
      toast.error('No pudimos guardar los cambios');
    } finally {
      setSavingEdit(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      category: initialCategory,
      city: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sortBy: 'createdAt',
      order: 'desc',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-primary-600/20 via-primary-500/10 to-cyan-500/10">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_45%)]" />
        </div>
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white tracking-tight">
              MiPage
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition"
              >
                Iniciar Sesión
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transition"
                >
                  Panel Admin
                </Link>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 items-center">
            <div className="space-y-3 lg:col-span-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1 text-xs font-semibold border border-white/20">
                <SparklesIcon className="h-4 w-4" />
                Explora, filtra y edita sin fricción
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Explora servicios con un look más editorial
              </h1>
              <p className="text-white/80 text-base max-w-2xl">
                Curaduría visual, presets inteligentes y control directo de administrador para pulir contenidos al instante.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white/90">
                  <CheckBadgeIcon className="h-5 w-5 text-emerald-300" />
                  Catálogo con rating y tendencia
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white/90">
                  <PaintBrushIcon className="h-5 w-5 text-amber-300" />
                  Estética reforzada
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white/90">
                  <ShieldCheckIcon className="h-5 w-5 text-cyan-300" />
                  Acceso admin inmediato
                </div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between text-sm text-white/70 mb-3">
                <span>Estado del catálogo</span>
                <span className="px-2 py-1 rounded-full bg-emerald-400/20 text-emerald-100 text-xs border border-emerald-500/40">
                  Live
                </span>
              </div>
              <div className="space-y-2 text-white">
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-sm text-white/70">Filtros activos</span>
                  <span className="text-lg font-bold">{filterCount}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-sm text-white/70">Preferencia</span>
                  <span className="text-sm font-semibold">
                    {filters.sortBy === 'rating'
                      ? 'Calidad primero'
                      : filters.sortBy === 'views'
                      ? 'Tendencias'
                      : filters.sortBy === 'price'
                      ? filters.order === 'asc'
                        ? 'Precio ↑'
                        : 'Precio ↓'
                      : 'Recientes'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-white/70">Calidad mínima</span>
                  <span className="text-sm font-semibold">
                    {filters.minRating ? `${filters.minRating}★` : 'Libre'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-900 font-semibold shadow-lg hover:-translate-y-0.5 transition"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Admin controls */}
      {isAdmin && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="rounded-2xl border border-primary-400/30 bg-primary-500/10 backdrop-blur shadow-xl p-4 flex flex-wrap items-center gap-4 text-white">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="h-8 w-8 text-primary-100" />
              <div>
                <p className="text-sm text-primary-100/80">Modo administración activo</p>
                <p className="text-lg font-semibold">Edita contenidos directamente en el catálogo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <Link
                href="/admin"
                className="px-4 py-2 rounded-lg bg-white text-primary-700 font-semibold shadow hover:-translate-y-0.5 transition"
              >
                Ir al panel
              </Link>
              <button
                onClick={() => toast.success('Selecciona “Editar” en cualquier tarjeta para actualizarla')}
                className="px-4 py-2 rounded-lg border border-white/30 text-white font-semibold hover:bg-white/10 transition"
              >
                Cómo editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {showFilters && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur shadow-2xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Buscar servicios..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-white/50"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              {/* Category */}
              <div className="flex gap-3">
                <select
                  className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <option value="">Todas las categorías</option>
                  <option value="MODELAJE">Modelaje</option>
                  <option value="MASAJES_PROFESIONALES">Masajes Profesionales</option>
                </select>

                <select
                  className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                  value={`${filters.sortBy}-${filters.order}`}
                  onChange={(e) => {
                    const [sortBy, order] = e.target.value.split('-');
                    setFilters({ ...filters, sortBy, order: order as 'asc' | 'desc' });
                  }}
                >
                  <option value="createdAt-desc">Más recientes</option>
                  <option value="rating-desc">Mejor valoración</option>
                  <option value="price-asc">Precio: bajo a alto</option>
                  <option value="price-desc">Precio: alto a bajo</option>
                  <option value="views-desc">Más vistos</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Ciudad"
                className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-white/50"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />
              <input
                type="number"
                placeholder="Precio mínimo"
                className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-white/50"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <input
                type="number"
                placeholder="Precio máximo"
                className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-white/50"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />

              <div className="md:col-span-1 lg:col-span-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white shadow-inner">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">Calificación mínima</span>
                  {filters.minRating && (
                    <button
                      className="text-primary-200 font-semibold"
                      onClick={() => setFilters({ ...filters, minRating: '' })}
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.minRating ? Number(filters.minRating) : 0}
                  onChange={(e) => setFilters({ ...filters, minRating: e.target.value || '' })}
                  className="w-full accent-primary-300 mt-3"
                />
                <p className="text-xs text-white/70 mt-2">
                  {filters.minRating
                    ? `${filters.minRating}+ estrellas · Priorizamos calidad`
                    : 'Sin mínimo de rating · Descubre nuevas propuestas'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 border border-primary-200/30 rounded-xl bg-primary-500/10 flex items-center gap-3">
                <StarIcon className="h-6 w-6 text-primary-100" />
                <div className="w-full">
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <span>Presets rápidos</span>
                    <button className="text-primary-100" onClick={resetFilters}>
                      Resetear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      className="px-3 py-1 text-xs rounded-full bg-white/10 text-white border border-white/20"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          minRating: '4.5',
                          sortBy: 'rating',
                          order: 'desc',
                        })
                      }
                    >
                      Top 4.5★
                    </button>
                    <button
                      className="px-3 py-1 text-xs rounded-full bg-white/10 text-white border border-white/20"
                      onClick={() => setFilters({ ...filters, sortBy: 'createdAt', order: 'desc' })}
                    >
                      Nuevos
                    </button>
                    <button
                      className="px-3 py-1 text-xs rounded-full bg-white/10 text-white border border-white/20"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          sortBy: 'price',
                          order: 'asc',
                          maxPrice: filters.maxPrice || '75000',
                        })
                      }
                    >
                      Precio amable
                    </button>
                    <button
                      className="px-3 py-1 text-xs rounded-full bg-white/10 text-white border border-white/20"
                      onClick={() => setFilters({ ...filters, sortBy: 'views', order: 'desc' })}
                    >
                      Tendencias
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-white/10 rounded-xl bg-white/5 shadow-inner text-white">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <BoltIcon className="h-5 w-5 text-amber-200" />
                  Insights en vivo
                </p>
                <div className="mt-3 space-y-2 text-sm text-white/80">
                  <div className="flex items-center justify-between">
                    <span>Modo orden</span>
                    <span className="font-semibold">
                      {filters.sortBy === 'rating'
                        ? 'Calidad primero'
                        : filters.sortBy === 'price'
                        ? filters.order === 'asc'
                          ? 'Precio creciente'
                          : 'Precio decreciente'
                        : filters.sortBy === 'views'
                        ? 'Tendencias activas'
                        : 'Más recientes'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Filtros activos</span>
                    <span className="font-semibold">{filterCount || 'Ninguno'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Curaduría</span>
                    <span className="font-semibold">
                      {filters.minRating ? `${filters.minRating}★` : 'Libre'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-white/10 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <ArrowPathRoundedSquareIcon className="h-5 w-5 text-primary-200" />
                  Limpieza rápida
                </p>
                <p className="text-xs text-white/70 mt-1">
                  Restaura la búsqueda sin perder la categoría inicial.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="px-3 py-1 text-xs rounded-full bg-white/10 border border-white/20 hover:bg-white/15"
                    onClick={resetFilters}
                  >
                    Reiniciar búsqueda
                  </button>
                  <button
                    className="px-3 py-1 text-xs rounded-full bg-white/10 border border-white/20 hover:bg-white/15"
                    onClick={() => setFilters({ ...filters, sortBy: 'rating', order: 'desc', minRating: '4' })}
                  >
                    Curaduría 4★+
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6 pt-4 text-white">
          <div>
            <p className="text-sm text-white/60">Catálogo</p>
            <h2 className="text-2xl font-bold">
              {filters.category
                ? filters.category === 'MODELAJE'
                  ? 'Servicios de Modelaje'
                  : 'Masajes Profesionales'
                : 'Todos los Servicios'}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <FunnelIcon className="h-4 w-4" />
              {filterCount} filtros
            </span>
            <span>{loading ? '...' : `${services.length} servicios`}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 text-white/80">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No se encontraron servicios</h3>
            <p className="text-white/70 mb-6">Intenta ajustar tus filtros de búsqueda</p>
            <button
              onClick={resetFilters}
              className="text-primary-200 hover:text-primary-100 font-semibold"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                highlight={index < 3 && filters.sortBy === 'rating'}
                onAdminEdit={isAdmin ? handleAdminEdit : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {editTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-gray-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-primary-600 font-semibold">
                  Edición rápida
                </p>
                <h3 className="text-xl font-bold">{editTarget.title}</h3>
              </div>
              <button
                onClick={() => setEditTarget(null)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Título</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Ciudad</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Descripción</label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editForm.description}
                  rows={3}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Precio</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tipo de precio</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editForm.priceType}
                  onChange={(e) => setEditForm({ ...editForm, priceType: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Estado</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="APPROVED">Publicado</option>
                  <option value="PENDING">En revisión</option>
                  <option value="REJECTED">Rechazado</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tips</label>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900 flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
                  <span>Los cambios se aplican inmediato al catálogo. Úsalo para correcciones rápidas.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditTarget(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveAdminEdit}
                disabled={savingEdit}
                className="px-5 py-2 rounded-lg bg-primary-600 text-white font-semibold shadow-lg hover:bg-primary-700 disabled:opacity-60"
              >
                {savingEdit ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
