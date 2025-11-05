'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { servicesAPI } from '@/lib/api';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import { MagnifyingGlassIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/outline';

// Servicios de ejemplo (fallback si el backend no responde)
const EXAMPLE_SERVICES = [
  {
    id: 'example-1',
    title: 'Sesión Fotográfica Profesional',
    category: 'MODELAJE',
    price: 50000,
    priceType: 'hour',
    city: 'Santiago',
    coverPhoto: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1000&fit=crop',
    isPremium: true,
    averageRating: 4.9,
  },
  {
    id: 'example-2',
    title: 'Masaje Terapéutico Profesional',
    category: 'MASAJES_PROFESIONALES',
    price: 35000,
    priceType: 'session',
    city: 'Santiago',
    coverPhoto: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop',
    isPremium: false,
    averageRating: 5.0,
  },
  {
    id: 'example-3',
    title: 'Modelo para Eventos',
    category: 'MODELAJE',
    price: 80000,
    priceType: 'day',
    city: 'Providencia',
    coverPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1000&fit=crop',
    isPremium: true,
    averageRating: 4.8,
  },
  {
    id: 'example-4',
    title: 'Masaje Deportivo',
    category: 'MASAJES_PROFESIONALES',
    price: 40000,
    priceType: 'session',
    city: 'Las Condes',
    coverPhoto: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=600&fit=crop',
    isPremium: false,
    averageRating: 4.7,
  },
  {
    id: 'example-5',
    title: 'Sesión Lifestyle y Fitness',
    category: 'MODELAJE',
    price: 60000,
    priceType: 'hour',
    city: 'Vitacura',
    coverPhoto: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&h=1000&fit=crop',
    isPremium: false,
    averageRating: 4.9,
  },
  {
    id: 'example-6',
    title: 'Masaje Relajante',
    category: 'MASAJES_PROFESIONALES',
    price: 30000,
    priceType: 'session',
    city: 'Ñuñoa',
    coverPhoto: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&h=600&fit=crop',
    isPremium: false,
    averageRating: 4.6,
  },
];

// Testimonios
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Juan Pérez',
    role: 'Cliente',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
    rating: 5,
    comment: 'Excelente plataforma! Encontré justo lo que buscaba. Los profesionales son de primer nivel.',
  },
  {
    id: 2,
    name: 'María González',
    role: 'Publisher - Modelo',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    rating: 5,
    comment: 'MiPage me ha ayudado a conseguir más clientes. La plataforma es muy intuitiva.',
  },
  {
    id: 3,
    name: 'Carlos Ramírez',
    role: 'Publisher - Terapeuta',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    rating: 5,
    comment: 'Mis reservas han aumentado un 300% desde que uso la plataforma.',
  },
];

export default function HomePage() {
  const [services, setServices] = useState<any[]>(EXAMPLE_SERVICES);
  const [loading, setLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data } = await servicesAPI.getAll({ status: 'APPROVED' });
      if (data.services && data.services.length > 0) {
        setServices(data.services);
        setBackendConnected(true);
      }
    } catch (error) {
      console.log('Backend no disponible, mostrando servicios de ejemplo');
      setServices(EXAMPLE_SERVICES);
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Backend Warning */}
      {!backendConnected && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="max-w-7xl mx-auto text-center text-yellow-800 text-sm">
            <span>⚠️ <strong>Modo demo:</strong> Backend no conectado.</span>
            <span className="ml-2">Ver <a href="https://github.com/yourusername/mipage" className="underline font-semibold">guía de inicio</a></span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              📸 MiPage
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/services" className="text-gray-700 hover:text-primary-600">
                Servicios
              </Link>
              <Link href="/services/new" className="text-gray-700 hover:text-primary-600">
                Publicar
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-primary-600 font-medium"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition font-medium"
              >
                Registro
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Servicios Profesionales en Chile
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Modelaje y Masajes Profesionales
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold mb-8">Servicios Destacados</h2>
        <div className="photo-grid">
          {services.map((service) => (
            <Link key={service.id} href={`/services/${service.id}`} className="group">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-gray-200">
                <Image
                  src={service.coverPhoto}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
                {service.isPremium && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ⭐ Premium
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {getCategoryLabel(service.category)}
                  </span>
                  <div className="flex items-center text-yellow-500">
                    <span className="text-sm font-semibold">{service.averageRating?.toFixed(1)}</span>
                    <span className="ml-1">★</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1">{service.title}</h3>
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>{service.city}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary-600">{formatPrice(service.price)}</span>
                  <span className="text-sm text-gray-500">/{service.priceType}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonios */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Testimonios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Image src={t.avatar} alt={t.name} width={60} height={60} className="rounded-full" />
                  <div className="ml-4">
                    <h3 className="font-semibold">{t.name}</h3>
                    <p className="text-sm text-gray-600">{t.role}</p>
                    <div className="flex text-yellow-500">
                      {[...Array(t.rating)].map((_, i) => (
                        <StarIcon key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{t.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 MiPage. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
