'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, MapPinIcon, CameraIcon, SparklesIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import ButtonLink from '@/components/ui/ButtonLink';

interface HeroSectionProps {
  onSearch: (query: string, city: string) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(searchQuery, searchCity);
  };

  const categories = [
    {
      icon: CameraIcon,
      label: 'Fotografía',
      query: 'fotografia',
      description: 'Sesiones profesionales'
    },
    {
      icon: SparklesIcon,
      label: 'Modelaje',
      query: 'modelaje',
      description: 'Modelos para tu proyecto'
    },
    {
      icon: UserGroupIcon,
      label: 'Eventos',
      query: 'eventos',
      description: 'Staff para eventos'
    },
  ];

  const stats = [
    { value: '500+', label: 'Profesionales' },
    { value: '2.5k', label: 'Sesiones realizadas' },
    { value: '4.9', label: 'Calificación promedio' },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#050308]">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,107,53,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(236,72,153,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(5,3,8,0.8))]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 w-full">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">

          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-fire-400 to-secondary-500 animate-pulse" />
              <span className="text-sm text-warm-300 font-medium">Marketplace de servicios creativos</span>
            </div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-white">Conecta con </span>
                <span className="bg-gradient-to-r from-fire-400 via-secondary-400 to-fire-300 bg-clip-text text-transparent">
                  talento creativo
                </span>
                <span className="text-white"> profesional</span>
              </h1>
              <p className="text-lg text-warm-400 max-w-xl leading-relaxed">
                Encuentra fotógrafos, modelos y profesionales creativos para tus proyectos.
                Servicios verificados con la más alta calidad.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-8 py-6 border-y border-white/10">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-warm-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <ButtonLink
                href="/services"
                variant="fire"
                size="lg"
                className="px-8 py-4 rounded-xl text-base font-semibold shadow-lg shadow-fire-500/25"
              >
                Explorar servicios
              </ButtonLink>
              <ButtonLink
                href="/auth/register"
                variant="dark"
                size="lg"
                className="px-8 py-4 rounded-xl text-base font-semibold border border-white/20 bg-white/5 hover:bg-white/10 text-white"
              >
                Publicar mi servicio
              </ButtonLink>
            </div>
          </div>

          {/* Right Column - Search Card */}
          <div className="relative">
            {/* Glow effect behind card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-fire-500/20 via-secondary-500/20 to-fire-500/20 rounded-3xl blur-2xl opacity-50" />

            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8">
              {/* Search Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">¿Qué estás buscando?</h2>
                <span className="flex items-center gap-2 text-xs text-warm-400 bg-white/5 px-3 py-1.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Disponible ahora
                </span>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm text-warm-400 mb-1.5 block">Servicio</span>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-500" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Fotógrafo, modelo, maquillista..."
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder:text-warm-600 focus:border-fire-400 focus:outline-none focus:ring-2 focus:ring-fire-400/20 transition-all"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-sm text-warm-400 mb-1.5 block">Ubicación</span>
                    <div className="relative">
                      <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-500" />
                      <input
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                        placeholder="Santiago, Viña del Mar..."
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder:text-warm-600 focus:border-fire-400 focus:outline-none focus:ring-2 focus:ring-fire-400/20 transition-all"
                      />
                    </div>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="fire"
                  size="lg"
                  className="w-full py-4 rounded-xl text-base font-semibold"
                >
                  Buscar
                </Button>
              </form>

              {/* Category Quick Links */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-warm-500 mb-4">Categorías populares</p>
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => {
                        setSearchQuery(cat.query);
                        onSearch(cat.query, searchCity);
                      }}
                      className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-fire-400/50 transition-all duration-300"
                    >
                      <cat.icon className="h-6 w-6 text-warm-400 group-hover:text-fire-400 transition-colors" />
                      <span className="text-sm font-medium text-warm-300 group-hover:text-white transition-colors">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
