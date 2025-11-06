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
    <div className="relative">
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
        {/* Tab "Todos" */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-fire-500 to-fire-600 text-white shadow-fire-lg scale-105'
              : 'bg-dark-850 text-warm-300 border border-dark-700 hover:border-fire-500 hover:text-fire-400'
          }`}
        >
          <span className="text-xl">🔥</span>
          <span>Todos</span>
        </button>

        {/* Tabs dinámicos */}
        {serviceTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onCategoryChange(type.name)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${
              selectedCategory === type.name
                ? 'text-white shadow-lg scale-105'
                : 'bg-dark-850 text-warm-300 border border-dark-700 hover:text-warm-50'
            }`}
            style={
              selectedCategory === type.name
                ? {
                    background: `linear-gradient(135deg, ${type.color} 0%, ${type.color}dd 100%)`,
                    boxShadow: `0 4px 14px 0 ${type.color}66`,
                  }
                : {
                    borderColor: selectedCategory === type.name ? type.color : undefined,
                  }
            }
            onMouseEnter={(e) => {
              if (selectedCategory !== type.name) {
                e.currentTarget.style.borderColor = type.color || '#FF6B35';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategory !== type.name) {
                e.currentTarget.style.borderColor = '';
              }
            }}
          >
            {type.icon && <span className="text-xl">{type.icon}</span>}
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Fade gradient on scroll */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-dark-950 to-transparent pointer-events-none" />
    </div>
  );
}
