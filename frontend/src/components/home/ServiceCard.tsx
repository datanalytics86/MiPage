'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';
import { formatPrice, getCategoryLabel } from '@/lib/utils';

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    category: string;
    price: number;
    priceType: string;
    city: string;
    coverPhoto: string;
    isPremium?: boolean;
    averageRating?: number;
    user?: {
      name: string;
      avatar?: string;
    };
  };
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const affinityScore = Math.min(100, Math.round(((service.averageRating ?? 4.6) / 5) * 100));
  const responseTime = Math.max(6, 24 - Math.round((service.averageRating ?? 4.2) * 3));
  const curatedTags =
    service.category === 'MASAJES'
      ? ['Aromas inmersivos', 'Tejido profundo']
      : service.category === 'MODELAJE'
      ? ['Editorial', 'Runway']
      : ['Club Privé', 'Aftercare'];

  return (
    <Link href={`/services/${service.id}`} className="group block">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5 p-[1.1px] transition-all duration-500 hover:-translate-y-1 hover:border-fire-400/60 hover:shadow-[0_40px_90px_-60px_rgba(255,0,92,0.8)]">
        <div className="pointer-events-none absolute inset-0 rounded-[2.25rem] bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.2),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-90" />
        <div className="relative rounded-[2.18rem] bg-gradient-to-br from-dark-950/95 via-dark-900/70 to-dark-900/80">
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 10% 20%, rgba(255,107,53,0.35) 0%, transparent 55%)' }} />
          <div className="absolute inset-0 opacity-25" style={{ background: 'radial-gradient(circle at 80% 90%, rgba(255,0,102,0.35) 0%, transparent 60%)' }} />
          <div className="pointer-events-none absolute -right-16 top-10 h-32 w-32 rounded-full border border-white/5 opacity-40" />
          <div className="relative overflow-hidden rounded-[2.18rem]">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-[2.18rem]">
              <Image
                src={service.coverPhoto}
                alt={service.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-dark-950/85 via-dark-950/20 to-transparent" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_55%)] opacity-0 transition-opacity duration-700 group-hover:opacity-80" />

              {/* Premium Badge */}
              {service.isPremium && (
                <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full border border-yellow-400/50 bg-yellow-500/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-yellow-100 backdrop-blur">
                  <span className="text-base">✨</span>
                  <span>Premium</span>
                </div>
              )}

              {/* Category Badge */}
              <div className="absolute left-5 bottom-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-dark-950/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-warm-100 backdrop-blur">
                  <span className="text-base">🏷️</span>
                  {getCategoryLabel(service.category)}
                </span>
              </div>

              <div className="absolute inset-x-6 -bottom-14 h-28 rounded-full bg-gradient-to-t from-fire-500/20 via-fire-500/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>

            {/* Content */}
            <div className="space-y-6 px-6 pb-7 pt-6">
              <div className="flex items-start justify-between">
                {service.user && (
                  <div className="flex items-center gap-3">
                    {service.user.avatar ? (
                      <Image
                        src={service.user.avatar}
                        alt={service.user.name}
                        width={40}
                        height={40}
                        className="rounded-full border border-white/20"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-dark-950/70 text-sm font-semibold text-fire-200">
                        {service.user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-warm-500">Host</p>
                      <p className="text-sm font-semibold text-warm-100">{service.user.name}</p>
                    </div>
                  </div>
                )}
                {service.averageRating && (
                  <div className="flex items-center gap-2 rounded-full border border-yellow-400/50 bg-yellow-400/15 px-3 py-1 text-sm text-yellow-200 backdrop-blur">
                    <StarIcon className="h-4 w-4" />
                    <span className="font-semibold">{service.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-[1.35rem] font-semibold text-warm-50 line-clamp-2 transition-colors group-hover:text-fire-200">
                  {service.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-[12px] uppercase tracking-[0.35em] text-warm-500">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-dark-950/70 px-3 py-1 text-warm-200">
                    <MapPinIcon className="h-4 w-4 text-fire-300" />
                    {service.city}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-dark-950/50 px-3 py-1 text-fire-200">
                    ⏱️ {service.priceType === 'hour' ? 'Por hora' : service.priceType === 'day' ? 'Por día' : 'Sesión'}
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <span className="relative inline-flex items-baseline gap-2 text-[2.25rem] font-bold text-transparent">
                    <span className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-fire-400 via-fire-500 to-lust-400 opacity-30" />
                    <span className="bg-gradient-to-r from-fire-200 via-fire-400 to-lust-400 bg-clip-text text-transparent">
                      {formatPrice(service.price)}
                    </span>
                    <span className="text-sm font-semibold text-fire-200">CLP</span>
                  </span>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-warm-500">Tarifa recomendada</p>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.4em] text-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-ping" />Disponible hoy
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-fire-400/40 bg-fire-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-fire-200 transition-all duration-300 group-hover:border-fire-400/70 group-hover:text-fire-100">
                    Ver detalles
                    <span className="text-base">→</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] uppercase tracking-[0.35em] text-warm-500">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-dark-950/50 px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-fire-400" />
                  Match seguro
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-dark-950/50 px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-lust-400" />
                  Concierge 24/7
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-warm-400">
                {curatedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-dark-950/60 px-3 py-1 transition-all duration-300 group-hover:border-fire-400/50 group-hover:text-fire-200"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fire-400 to-lust-400" />
                    {tag}
                  </span>
                ))}
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-dark-950/60 px-4 py-4">
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(circle at top, rgba(255,107,53,0.25) 0%, transparent 65%)' }} />
                <div className="relative flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-warm-400">
                  <div className="flex-1 pr-6">
                    <p className="text-warm-200">Índice de afinidad</p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-fire-400 via-fire-500 to-lust-400"
                        style={{ width: `${affinityScore}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-right text-warm-200">
                    <span className="text-sm font-semibold text-warm-50">{affinityScore}% match</span>
                    <span className="text-[10px] text-fire-200">Respuesta {responseTime}m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
