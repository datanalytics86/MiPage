'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { servicesAPI } from '@/lib/api';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    search: '',
  });

  useEffect(() => {
    fetchServices();
  }, [filters]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data } = await servicesAPI.getAll(filters);
      setServices(data.services);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      toast.error('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              MiPage
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/services" className="text-gray-700 hover:text-primary-600">
                Servicios
              </Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-primary-600">
                Cómo Funciona
              </Link>
              <Link href="/become-publisher" className="text-gray-700 hover:text-primary-600">
                Publica tu Servicio
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-primary-600"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Encuentra los Mejores Servicios Profesionales
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Modelaje y Masajes Profesionales en Chile
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-2 flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar servicios..."
                className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <select
              className="px-4 py-3 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">Todas las categorías</option>
              <option value="MODELAJE">Modelaje</option>
              <option value="MASAJES_PROFESIONALES">Masajes Profesionales</option>
            </select>
            <button
              onClick={fetchServices}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold mb-8">Servicios Destacados</h2>

        {loading ? (
          <div className="photo-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 aspect-[4/3] rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No se encontraron servicios</p>
          </div>
        ) : (
          <div className="photo-grid">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-gray-200">
                  {service.coverPhoto && (
                    <Image
                      src={service.coverPhoto}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {service.isPremium && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Premium
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {getCategoryLabel(service.category)}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <span className="text-sm font-semibold">
                        {service.averageRating?.toFixed(1) || 'N/A'}
                      </span>
                      <span className="ml-1">★</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-primary-600 transition">
                    {service.title}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>{service.city}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary-600">
                      {formatPrice(service.price)}
                    </span>
                    <span className="text-sm text-gray-500">/{service.priceType}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">MiPage</h3>
              <p className="text-gray-400">
                La mejor plataforma para encontrar servicios profesionales en Chile
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about">Nosotros</Link></li>
                <li><Link href="/contact">Contacto</Link></li>
                <li><Link href="/terms">Términos</Link></li>
                <li><Link href="/privacy">Privacidad</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categorías</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/services?category=MODELAJE">Modelaje</Link></li>
                <li><Link href="/services?category=MASAJES_PROFESIONALES">Masajes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Síguenos</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MiPage. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
