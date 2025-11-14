'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type ServiceCategory = 'all' | 'modelaje' | 'masajes';

type Professional = {
  id: string;
  name: string;
  nationality: string;
  measurements: string;
  service: string;
  price: number;
  category: ServiceCategory;
  image: string;
  rating: number | null;
  ratingCount: number;
  location: string;
};

const serviceFilters: { id: ServiceCategory; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'modelaje', label: 'Modelaje' },
  { id: 'masajes', label: 'Masajes' },
];

const professionals: Professional[] = [
  {
    id: 'aurora-ramirez',
    name: 'Aurora Ramírez',
    nationality: 'Chilena',
    measurements: '87 · 60 · 89',
    service: 'Editorial & Fashion Film',
    price: 85000,
    category: 'modelaje',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=960&q=80',
    rating: 4.9,
    ratingCount: 84,
    location: 'Santiago, Chile',
  },
  {
    id: 'isabela-mena',
    name: 'Isabela Mena',
    nationality: 'Argentina',
    measurements: '90 · 64 · 92',
    service: 'Masajes de autor',
    price: 68000,
    category: 'masajes',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=960&q=80',
    rating: 5,
    ratingCount: 42,
    location: 'Providencia, Chile',
  },
  {
    id: 'valentina-fuentes',
    name: 'Valentina Fuentes',
    nationality: 'Colombiana',
    measurements: '86 · 61 · 90',
    service: 'Comercial & Retail',
    price: 52000,
    category: 'modelaje',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=960&q=80&sat=-25',
    rating: null,
    ratingCount: 0,
    location: 'Las Condes, Chile',
  },
  {
    id: 'ignacio-verdugo',
    name: 'Ignacio Verdugo',
    nationality: 'Chileno',
    measurements: '1,86 · 104 · 78 · 98',
    service: 'Masajes deportivos',
    price: 56000,
    category: 'masajes',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=960&q=80',
    rating: 4.7,
    ratingCount: 31,
    location: 'Vitacura, Chile',
  },
  {
    id: 'emilia-sofia',
    name: 'Emilia Sofía',
    nationality: 'Uruguaya',
    measurements: '85 · 58 · 88',
    service: 'Masajes sensoriales',
    price: 72000,
    category: 'masajes',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=960&q=80&sat=-50',
    rating: 4.8,
    ratingCount: 67,
    location: 'Ñuñoa, Chile',
  },
  {
    id: 'renata-alegria',
    name: 'Renata Alegría',
    nationality: 'Peruana',
    measurements: '88 · 62 · 90',
    service: 'Editorial & Beauty',
    price: 61000,
    category: 'modelaje',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=960&q=80',
    rating: 4.5,
    ratingCount: 19,
    location: 'Santiago Centro, Chile',
  },
  {
    id: 'malena-rojas',
    name: 'Malena Rojas',
    nationality: 'Chilena',
    measurements: '89 · 63 · 91',
    service: 'Pasarela & Haute Couture',
    price: 98000,
    category: 'modelaje',
    image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=960&q=80',
    rating: 4.8,
    ratingCount: 52,
    location: 'Santiago, Chile',
  },
  {
    id: 'felipe-caro',
    name: 'Felipe Caró',
    nationality: 'Chileno',
    measurements: '1,88 · 108 · 82 · 100',
    service: 'Masajes de recuperación deportiva',
    price: 64000,
    category: 'masajes',
    image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=960&q=80',
    rating: 4.9,
    ratingCount: 76,
    location: 'La Reina, Chile',
  },
  {
    id: 'gianna-paredes',
    name: 'Gianna Paredes',
    nationality: 'Peruana',
    measurements: '86 · 59 · 88',
    service: 'Editorial minimalista',
    price: 57000,
    category: 'modelaje',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=960&q=80',
    rating: 4.6,
    ratingCount: 33,
    location: 'Barrio Italia, Chile',
  },
  {
    id: 'mario-lagos',
    name: 'Mario Lagos',
    nationality: 'Chileno',
    measurements: '1,82 · 102 · 80 · 96',
    service: 'Masajes relajantes y aromaterapia',
    price: 52000,
    category: 'masajes',
    image: 'https://images.unsplash.com/photo-1556229010-5f7b59828e67?auto=format&fit=crop&w=960&q=80',
    rating: 4.4,
    ratingCount: 21,
    location: 'Providencia, Chile',
  },
  {
    id: 'luna-sanhueza',
    name: 'Luna Sanhueza',
    nationality: 'Chilena',
    measurements: '84 · 58 · 86',
    service: 'Masajes holísticos',
    price: 60000,
    category: 'masajes',
    image: 'https://images.unsplash.com/photo-1581579186983-91e062c03789?auto=format&fit=crop&w=960&q=80',
    rating: 4.7,
    ratingCount: 48,
    location: 'Santiago, Chile',
  },
  {
    id: 'micaela-fernandez',
    name: 'Micaela Fernández',
    nationality: 'Argentina',
    measurements: '87 · 61 · 89',
    service: 'Beauty & e-commerce',
    price: 53000,
    category: 'modelaje',
    image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=960&q=80',
    rating: 4.9,
    ratingCount: 89,
    location: 'Ñuñoa, Chile',
  },
];

const formatPriceCLP = (value: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);

function Rating({ rating, ratingCount }: { rating: number | null; ratingCount: number }) {
  if (!rating) {
    return <span className="tracking-[0.26em] text-neutral-100/70">Sin calificaciones</span>;
  }

  return <span className="tracking-[0.26em] text-neutral-100/70">⭐ {rating.toFixed(1)} · {ratingCount}</span>;
}

export default function HomePage() {
  const [filter, setFilter] = useState<ServiceCategory>('all');

  const filteredProfessionals = useMemo(() => {
    if (filter === 'all') return professionals;
    return professionals.filter((professional) => professional.category === filter);
  }, [filter]);

  return (
    <div className="relative min-h-screen bg-white text-neutral-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-4 pt-8 sm:px-6">
        <div className="pointer-events-auto flex w-full max-w-6xl items-center justify-between gap-6 rounded-full border border-neutral-200/70 bg-white/70 px-5 py-3 shadow-[0_18px_42px_rgba(15,15,15,0.08)] backdrop-blur">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.28em] text-neutral-700 transition hover:text-neutral-900"
          >
            MiPage
          </Link>
          <div className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.32em] text-neutral-500">
            {serviceFilters.map((option) => {
              const isActive = option.id === filter;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFilter(option.id)}
                  className={`rounded-full px-4 py-1.5 transition ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'bg-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <nav className="hidden items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-neutral-500 sm:flex">
            <Link href="/auth/login?role=ADMIN" className="transition hover:text-neutral-900">
              Admin
            </Link>
            <span aria-hidden="true" className="text-neutral-300">
              /
            </span>
            <Link href="/auth/login?role=PUBLISHER" className="transition hover:text-neutral-900">
              Oferente
            </Link>
            <span aria-hidden="true" className="text-neutral-300">
              /
            </span>
            <Link href="/auth/login?role=CLIENT" className="transition hover:text-neutral-900">
              Cliente
            </Link>
          </nav>
        </div>
      </div>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-36 sm:px-6 sm:pt-40">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProfessionals.map((professional) => (
            <article
              key={professional.id}
              className="group relative aspect-[3/4] overflow-hidden rounded-[32px] bg-neutral-200 shadow-[0_30px_60px_rgba(15,15,15,0.12)]"
            >
              <Image
                src={professional.image}
                alt={professional.name}
                fill
                priority
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-4 bottom-4 flex translate-y-4 flex-col gap-3 rounded-3xl border border-white/20 bg-black/65 p-5 text-white opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.26em] text-neutral-100/80">
                  <Rating rating={professional.rating} ratingCount={professional.ratingCount} />
                  <span>{formatPriceCLP(professional.price)}</span>
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight">{professional.name}</p>
                  <p className="mt-1 text-sm text-neutral-200/80">{professional.service}</p>
                </div>
                <dl className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.26em] text-neutral-200/80">
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Nacionalidad</dt>
                    <dd>{professional.nationality}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-px bg-white/30" aria-hidden="true" />
                    <dt className="sr-only">Medidas</dt>
                    <dd>{professional.measurements}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-px bg-white/30" aria-hidden="true" />
                    <dt className="sr-only">Ubicación</dt>
                    <dd>{professional.location}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>

        <div className="sm:hidden">
          <nav className="flex justify-center gap-4 text-[11px] uppercase tracking-[0.32em] text-neutral-400">
            <Link href="/auth/login?role=ADMIN" className="transition hover:text-neutral-900">
              Admin
            </Link>
            <Link href="/auth/login?role=PUBLISHER" className="transition hover:text-neutral-900">
              Oferente
            </Link>
            <Link href="/auth/login?role=CLIENT" className="transition hover:text-neutral-900">
              Cliente
            </Link>
          </nav>
        </div>
      </main>
    </div>
  );
}
