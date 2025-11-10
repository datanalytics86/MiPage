'use client';

import { useState, useEffect } from 'react';

interface ServiceType {
  id: string;
  name: string;
  label: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
}

interface CategoryTabsProps {
  onCategoryChange: (category: string | null) => void;
  selectedCategory: string | null;
}

export default function CategoryTabs({ onCategoryChange, selectedCategory }: CategoryTabsProps) {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  const fetchServiceTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/service-types`);

      if (!response.ok) throw new Error('Error al cargar tipos de servicio');

      const data = await response.json();
      setServiceTypes(data.data || []);
    } catch (error) {
      console.error('Error:', error);
      // Fallback con tipos por defecto
      setServiceTypes([
        {
          id: '1',
          name: 'MODELAJE',
          label: 'Modelaje',
          icon: '📸',
          color: '#EC4899',
          order: 1,
          isActive: true,
        },
        {
          id: '2',
          name: 'MASAJES',
          label: 'Masajes',
          icon: '💆',
          color: '#FF6B35',
          order: 2,
          isActive: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="px-6 py-3 rounded-full bg-dark-800 animate-pulse"
            style={{ width: '120px', height: '48px' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[2.2rem] border border-white/5 bg-white/5 p-3 backdrop-blur-xl">
      <div className="absolute inset-0 rounded-[2rem] border border-white/5 opacity-30" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="pointer-events-none absolute inset-y-6 left-0 w-[1px] bg-gradient-to-b from-transparent via-white/15 to-transparent" />
      <div className="relative flex gap-3 overflow-x-auto pb-2 pl-1 pr-10 hide-scrollbar scroll-smooth">
        {/* Tab "Todos" */}
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={`group relative flex items-center gap-3 overflow-hidden rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.32em] transition-all duration-300 before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.35)_45%,transparent_90%)] before:opacity-0 before:transition before:duration-500 before:ease-out hover:before:translate-x-0 hover:before:opacity-100 ${
            selectedCategory === null
              ? 'text-dark-900'
              : 'text-warm-200'
          }`}
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-fire-400 via-fire-500 to-lust-500 opacity-100" style={{ filter: selectedCategory === null ? 'none' : 'grayscale(0.2)', opacity: selectedCategory === null ? 1 : 0.12 }} />
          <span className="relative flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <span>{selectedCategory === null ? 'Todo el universo' : 'Todos'}</span>
          </span>
        </button>

        {/* Tabs dinámicos */}
        {serviceTypes.map((type) => {
          const isActive = selectedCategory === type.name;
          return (
            <button
              type="button"
              key={type.id}
              onClick={() => onCategoryChange(type.name)}
              className={`group relative flex items-center gap-3 overflow-hidden rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.32em] transition-all duration-300 before:absolute before:inset-0 before:bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.3)_45%,transparent_90%)] before:opacity-0 before:transition before:duration-500 before:ease-out hover:before:opacity-100 ${
                isActive
                  ? 'text-dark-900'
                  : 'text-warm-200 hover:text-warm-50'
              }`}
            >
              <span
                className="absolute inset-0 rounded-full border border-white/10"
                style={{
                  background: `linear-gradient(120deg, ${type.color ?? '#ff6b35'}26 0%, ${type.color ?? '#ff0066'}12 100%)`,
                  boxShadow: isActive ? `0 12px 30px ${type.color ?? '#ff6b35'}40` : undefined,
                  opacity: isActive ? 1 : 0.14,
                }}
              />
              <div
                className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-lg transition-all ${
                  isActive
                    ? 'scale-110 bg-white/90 text-dark-900'
                    : 'bg-dark-950/60 text-warm-50 group-hover:scale-105 group-hover:border-white/20'
                }`}
              >
                {type.icon ?? '✨'}
              </div>
              <span className="relative whitespace-nowrap">
                {type.label}
                <span className="absolute -bottom-2 left-0 right-0 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Fade gradient on scroll */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-dark-950 to-transparent" />
    </div>
  );
}
