'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { servicesAPI } from '@/lib/api';
import ServiceCard from '@/components/services/ServiceCard';
import Header from '@/components/layout/Header';
import Spinner from '@/components/ui/Spinner';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  MapPinIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const categories = [
  { value: '', label: 'Todas las categorías' },
  { value: 'MODELAJE', label: 'Modelaje' },
  { value: 'FOTOGRAFIA', label: 'Fotografía' },
  { value: 'MASAJES_PROFESIONALES', label: 'Masajes Profesionales' },
];

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [filters]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (filters.category) params.category = filters.category;
      if (filters.city) params.city = filters.city;
      if (filters.search) params.search = filters.search;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      const { data } = await servicesAPI.getAll(params);
      setServices(data.services);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      toast.error('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      city: '',
      search: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const hasActiveFilters = filters.category || filters.city || filters.search || filters.minPrice || filters.maxPrice;

  return (
    <div className="min-h-screen bg-[#050308]">
      <Header />

      {/* Search Section */}
      <div className="border-b border-white/5 bg-dark-950/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-500" />
              <input
                type="text"
                placeholder="Buscar servicios..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-warm-600 focus:outline-none focus:border-fire-400 focus:ring-2 focus:ring-fire-400/20 transition-all"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            {/* Category Select */}
            <select
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-warm-200 focus:outline-none focus:border-fire-400 cursor-pointer appearance-none min-w-[200px]"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239e9e9e' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-dark-900 text-warm-200">
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-fire-500/10 border-fire-400/50 text-fire-400'
                  : 'bg-white/5 border-white/10 text-warm-300 hover:border-white/20'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Filtros</span>
              {hasActiveFilters && (
                <span className="h-2 w-2 rounded-full bg-fire-400" />
              )}
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-500" />
                <input
                  type="text"
                  placeholder="Ciudad"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-warm-600 focus:outline-none focus:border-fire-400 transition-all"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                />
              </div>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-500" />
                <input
                  type="number"
                  placeholder="Precio mínimo"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-warm-600 focus:outline-none focus:border-fire-400 transition-all"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                />
              </div>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-500" />
                <input
                  type="number"
                  placeholder="Precio máximo"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-warm-600 focus:outline-none focus:border-fire-400 transition-all"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {filters.category
                ? categories.find((c) => c.value === filters.category)?.label
                : 'Todos los Servicios'}
            </h1>
            <p className="text-warm-500 mt-1">
              {loading ? 'Cargando...' : `${services.length} servicios encontrados`}
            </p>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-warm-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="mt-4 text-warm-500">Cargando servicios...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
              <MagnifyingGlassIcon className="h-10 w-10 text-warm-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No se encontraron servicios
            </h3>
            <p className="text-warm-500 mb-6 max-w-md mx-auto">
              Intenta ajustar tus filtros de búsqueda o explora otras categorías
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-fire-500 hover:bg-fire-600 text-white font-medium transition-colors"
            >
              Ver todos los servicios
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
