'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

interface HeroSectionProps {
  onSearch: (query: string, city: string) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, searchCity);
  };

  const popularSearches = [
    { label: '📸 Modelaje', query: 'modelaje' },
    { label: '💆 Masajes', query: 'masajes' },
    { label: '🏋️ Fitness', query: 'fitness' },
    { label: '💃 Eventos', query: 'eventos' },
  ];

  return (
    <section className="relative bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-4 w-72 h-72 bg-fire-500/10 rounded-full blur-3xl animate-pulse-fire" />
        <div className="absolute bottom-20 -right-4 w-96 h-96 bg-lust-500/10 rounded-full blur-3xl animate-pulse-fire" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        {/* Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-fire-500 via-lust-500 to-fire-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Servicios Profesionales
            </span>
            <br />
            <span className="text-warm-50">en Chile</span>
          </h1>
          <p className="text-xl md:text-2xl text-warm-300 max-w-3xl mx-auto">
            Encuentra los mejores profesionales de{' '}
            <span className="text-fire-400 font-semibold">modelaje</span>,{' '}
            <span className="text-lust-400 font-semibold">masajes</span> y más
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-8">
          <div className="card-dark p-4 shadow-dark-lg">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-warm-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="¿Qué servicio buscas?"
                  className="w-full pl-12 pr-4 py-3 bg-dark-850 border border-dark-700 rounded-lg text-warm-50 placeholder-warm-500 focus:border-fire-500 focus:ring-2 focus:ring-fire-500/20 focus:outline-none transition-all"
                />
              </div>

              {/* City Input */}
              <div className="md:w-64 relative">
                <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-warm-500" />
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="Ciudad"
                  className="w-full pl-12 pr-4 py-3 bg-dark-850 border border-dark-700 rounded-lg text-warm-50 placeholder-warm-500 focus:border-fire-500 focus:ring-2 focus:ring-fire-500/20 focus:outline-none transition-all"
                />
              </div>

              {/* Search Button */}
              <Button
                type="submit"
                variant="fire"
                size="lg"
                className="md:w-auto whitespace-nowrap"
              >
                🔍 Buscar
              </Button>
            </div>
          </div>
        </form>

        {/* Popular Searches */}
        <div className="text-center">
          <p className="text-warm-500 text-sm mb-3">Búsquedas populares:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularSearches.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(item.query);
                  onSearch(item.query, searchCity);
                }}
                className="px-4 py-2 bg-dark-850 text-warm-300 rounded-full text-sm font-medium hover:bg-dark-800 hover:text-fire-400 border border-dark-700 hover:border-fire-500 transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-fire-500 mb-2">500+</div>
            <div className="text-warm-400 text-sm">Profesionales</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-lust-500 mb-2">1000+</div>
            <div className="text-warm-400 text-sm">Servicios</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-fire-500 mb-2">4.8★</div>
            <div className="text-warm-400 text-sm">Calificación</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-lust-500 mb-2">24/7</div>
            <div className="text-warm-400 text-sm">Disponibilidad</div>
          </div>
        </div>
      </div>
    </section>
  );
}
