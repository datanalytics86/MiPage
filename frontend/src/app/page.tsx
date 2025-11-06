'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { servicesAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import Button from '@/components/ui/Button';
import HeroSection from '@/components/home/HeroSection';
import CategoryTabs from '@/components/home/CategoryTabs';
import ServiceCard from '@/components/home/ServiceCard';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, selectedCategory, searchQuery, searchCity]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data } = await servicesAPI.getAll({ status: 'APPROVED' });
      setServices(data.services || []);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by city
    if (searchCity) {
      filtered = filtered.filter((s) =>
        s.city?.toLowerCase().includes(searchCity.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };

  const handleSearch = (query: string, city: string) => {
    setSearchQuery(query);
    setSearchCity(city);
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="bg-dark-900/95 backdrop-blur-sm shadow-dark border-b border-dark-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-fire-500 to-lust-500 bg-clip-text text-transparent">
                MiPage
              </h1>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/services"
                className="text-warm-300 hover:text-fire-400 transition-colors font-medium"
              >
                Explorar
              </Link>
              {user?.role === 'PUBLISHER' && (
                <Link
                  href="/services/new"
                  className="text-warm-300 hover:text-fire-400 transition-colors font-medium"
                >
                  Publicar
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="text-warm-300 hover:text-fire-400 transition-colors font-medium"
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <span className="text-warm-300 text-sm hidden md:inline">
                    Hola, {user.name}
                  </span>
                  <Link href="/services/new">
                    <Button variant="fire" size="md">
                      Publicar
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="dark" size="md">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="fire" size="md">
                      Registro
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection onSearch={handleSearch} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Tabs */}
        <div className="mb-8">
          <CategoryTabs
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Active Filters */}
        {(searchQuery || searchCity || selectedCategory) && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-warm-500 text-sm">Filtros activos:</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-1 bg-dark-850 text-warm-300 rounded-full text-sm border border-dark-700 hover:border-fire-500 flex items-center gap-2"
              >
                <span>🔍 {searchQuery}</span>
                <span className="text-fire-500">×</span>
              </button>
            )}
            {searchCity && (
              <button
                onClick={() => setSearchCity('')}
                className="px-3 py-1 bg-dark-850 text-warm-300 rounded-full text-sm border border-dark-700 hover:border-fire-500 flex items-center gap-2"
              >
                <span>📍 {searchCity}</span>
                <span className="text-fire-500">×</span>
              </button>
            )}
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-3 py-1 bg-dark-850 text-warm-300 rounded-full text-sm border border-dark-700 hover:border-fire-500 flex items-center gap-2"
              >
                <span>🏷️ {selectedCategory}</span>
                <span className="text-fire-500">×</span>
              </button>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchCity('');
                setSelectedCategory(null);
              }}
              className="px-3 py-1 text-fire-500 hover:text-fire-400 text-sm font-medium"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card-dark p-4 animate-pulse">
                <div className="aspect-[4/3] bg-dark-800 rounded-lg mb-4" />
                <div className="h-6 bg-dark-800 rounded mb-2" />
                <div className="h-4 bg-dark-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-warm-50">
                {selectedCategory
                  ? `Servicios de ${selectedCategory}`
                  : searchQuery || searchCity
                  ? 'Resultados de búsqueda'
                  : 'Servicios Destacados'}
              </h2>
              <span className="text-warm-500 text-sm">
                {filteredServices.length} {filteredServices.length === 1 ? 'servicio' : 'servicios'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-warm-50 mb-2">
              No se encontraron servicios
            </h3>
            <p className="text-warm-400 mb-6">
              Intenta con otros filtros o búsqueda
            </p>
            <Button
              variant="fire"
              onClick={() => {
                setSearchQuery('');
                setSearchCity('');
                setSelectedCategory(null);
              }}
            >
              Ver todos los servicios
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-dark-950 border-t border-dark-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-fire-500 to-lust-500 bg-clip-text text-transparent mb-3">
                MiPage
              </h3>
              <p className="text-warm-500 text-sm">
                La plataforma líder de servicios profesionales en Chile
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-warm-50 font-semibold mb-3">Explorar</h4>
              <ul className="space-y-2 text-warm-400 text-sm">
                <li>
                  <Link href="/services" className="hover:text-fire-400 transition-colors">
                    Todos los servicios
                  </Link>
                </li>
                <li>
                  <Link href="/services?category=MODELAJE" className="hover:text-fire-400 transition-colors">
                    Modelaje
                  </Link>
                </li>
                <li>
                  <Link href="/services?category=MASAJES" className="hover:text-fire-400 transition-colors">
                    Masajes
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-warm-50 font-semibold mb-3">Compañía</h4>
              <ul className="space-y-2 text-warm-400 text-sm">
                <li>
                  <Link href="/about" className="hover:text-fire-400 transition-colors">
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-fire-400 transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-fire-400 transition-colors">
                    Términos y condiciones
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-warm-50 font-semibold mb-3">Síguenos</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-dark-850 border border-dark-700 flex items-center justify-center hover:border-fire-500 hover:text-fire-400 text-warm-400 transition-all">
                  <span className="text-xl">📱</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-dark-850 border border-dark-700 flex items-center justify-center hover:border-fire-500 hover:text-fire-400 text-warm-400 transition-all">
                  <span className="text-xl">📷</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-dark-850 border border-dark-700 flex items-center justify-center hover:border-fire-500 hover:text-fire-400 text-warm-400 transition-all">
                  <span className="text-xl">🐦</span>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-dark-800 pt-8 text-center">
            <p className="text-warm-500 text-sm">
              © 2024 MiPage. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
