'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { servicesAPI } from '@/lib/api';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/home/HeroSection';
import ServiceCard from '@/components/services/ServiceCard';
import Spinner from '@/components/ui/Spinner';
import { ArrowRightIcon, CameraIcon, SparklesIcon, UserGroupIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

const categories = [
  {
    id: 'FOTOGRAFIA',
    name: 'Fotografía',
    icon: CameraIcon,
    description: 'Fotógrafos profesionales para todo tipo de sesiones',
    color: 'from-fire-500 to-fire-600',
  },
  {
    id: 'MODELAJE',
    name: 'Modelaje',
    icon: SparklesIcon,
    description: 'Modelos para campañas, eventos y producciones',
    color: 'from-secondary-500 to-secondary-600',
  },
  {
    id: 'EVENTOS',
    name: 'Eventos',
    icon: UserGroupIcon,
    description: 'Staff profesional para tu próximo evento',
    color: 'from-primary-500 to-primary-600',
  },
];

const features = [
  {
    title: 'Profesionales verificados',
    description: 'Todos los proveedores pasan por un proceso de verificación',
  },
  {
    title: 'Pagos seguros',
    description: 'Transacciones protegidas y garantizadas',
  },
  {
    title: 'Soporte 24/7',
    description: 'Asistencia disponible cuando la necesites',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedServices();
  }, []);

  const fetchFeaturedServices = async () => {
    try {
      const { data } = await servicesAPI.getAll({ limit: 8 });
      setServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(
    (query: string, city: string) => {
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      if (city) params.set('city', city);
      router.push(`/services?${params.toString()}`);
    },
    [router]
  );

  return (
    <div className="min-h-screen bg-[#050308]">
      <Header />

      {/* Hero Section */}
      <HeroSection onSearch={handleSearch} />

      {/* Categories Section */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Explora por categoría
            </h2>
            <p className="text-warm-400 max-w-2xl mx-auto">
              Encuentra el talento creativo que necesitas para tu próximo proyecto
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/services?category=${category.id}`}
                className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-8 transition-all duration-300 hover:bg-white/10 hover:border-fire-400/30 hover:-translate-y-1"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${category.color} mb-4`}>
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-fire-300 transition-colors">
                  {category.name}
                </h3>
                <p className="text-warm-400 text-sm">
                  {category.description}
                </p>
                <ArrowRightIcon className="absolute bottom-8 right-8 h-5 w-5 text-warm-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section id="catalogo" className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Servicios destacados
              </h2>
              <p className="text-warm-400">
                Los profesionales mejor valorados de nuestra plataforma
              </p>
            </div>
            <Link
              href="/services"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-warm-300 hover:bg-white/10 hover:text-white transition-all"
            >
              Ver todos
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.slice(0, 8).map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-warm-400 mb-4">Aún no hay servicios publicados</p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-fire-500 hover:bg-fire-600 text-white font-medium transition-colors"
              >
                Sé el primero en publicar
              </Link>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-warm-300"
            >
              Ver todos los servicios
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 rounded-lg bg-fire-500/10 border border-fire-500/20">
                  <CheckBadgeIcon className="h-6 w-6 text-fire-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-warm-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Eres un profesional creativo?
          </h2>
          <p className="text-warm-400 mb-8 max-w-2xl mx-auto">
            Únete a nuestra comunidad de fotógrafos, modelos y profesionales del entretenimiento.
            Publica tus servicios y conecta con nuevos clientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-fire-500 to-fire-600 text-white font-semibold shadow-lg shadow-fire-500/25 hover:shadow-fire-500/40 transition-all"
            >
              Publicar mi servicio
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/20 text-warm-200 font-semibold hover:bg-white/10 transition-all"
            >
              Ver servicios disponibles
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-fire-400 to-secondary-400 bg-clip-text text-transparent">
                MiPage
              </span>
              <span className="text-warm-500 text-sm">
                © {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-warm-500">
              <Link href="/services" className="hover:text-warm-300 transition-colors">
                Servicios
              </Link>
              <Link href="/auth/register" className="hover:text-warm-300 transition-colors">
                Registrarse
              </Link>
              <Link href="/auth/login" className="hover:text-warm-300 transition-colors">
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
