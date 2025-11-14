'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import {
  type ProfessionalService,
  type ServiceCategory,
  professionals,
} from '@/data/professionals';

type FilterOption = { id: 'all' | ServiceCategory; label: string };

const serviceFilters: FilterOption[] = [
  { id: 'all', label: 'Todos' },
  { id: 'modelaje', label: 'Modelaje' },
  { id: 'masajes', label: 'Masajes' },
];

const formatPriceCLP = (value: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);

function Rating({ rating, ratingCount }: Pick<ProfessionalService, 'rating' | 'ratingCount'>) {
  if (!rating) {
    return <span className="text-xs font-medium text-neutral-500">Sin calificaciones</span>;
  }

  return (
    <span className="text-xs font-medium text-neutral-700">
      ⭐ {rating.toFixed(1)} · {ratingCount}
    </span>
  );
}

export default function HomePage() {
  const [filter, setFilter] = useState<'all' | ServiceCategory>('all');

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
            <Link href="/auth/login?role=USER" className="transition hover:text-neutral-900">
              Cliente
            </Link>
          </nav>
        </div>
      </div>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-36 sm:px-6 sm:pt-40">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProfessionals.map((professional) => (
            <Link
              key={professional.id}
              href={`/services/${professional.id}`}
              className="group overflow-hidden rounded-[28px] border border-neutral-200/60 bg-white shadow-[0_18px_40px_rgba(15,15,15,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(15,15,15,0.12)]"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={professional.image}
                  alt={professional.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-700 ease-out group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-5 pt-16 text-white">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium uppercase tracking-[0.26em] text-white/80">
                      {professional.service}
                    </p>
                    <span className="text-lg font-semibold">{formatPriceCLP(professional.price)}</span>
                  </div>
                  <p className="text-xl font-semibold tracking-tight">{professional.name}</p>
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <span className="flex items-center gap-1 text-sm">
                      <span aria-hidden="true">📍</span>
                      {professional.location}
                    </span>
                    <Rating rating={professional.rating} ratingCount={professional.ratingCount} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
