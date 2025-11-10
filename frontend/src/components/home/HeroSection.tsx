'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
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

  const trendingSearches = [
    { icon: '💆', label: 'Masajes inmersivos', query: 'masajes' },
    { icon: '📸', label: 'Producciones de modelaje', query: 'modelaje' },
    { icon: '🕯️', label: 'Rituales clandestinos', query: 'rituales' },
    { icon: '🏙️', label: 'Skyline experiences', query: 'skyline' },
  ];

  const sensoryProtocols = [
    {
      title: 'Concierge cifrado',
      description: 'Confirmaciones con IA afectiva, mensajería efímera y tracking discreto en segundos.',
      icon: '🔐',
    },
    {
      title: 'Ambientes programados',
      description: 'Iluminación reactiva, aromas inteligentes y playlists calibradas a tu biodata.',
      icon: '🌌',
    },
    {
      title: 'Upgrades a demanda',
      description: 'Sugerencias instantáneas de cápsulas premium según el tono del encuentro.',
      icon: '⚡',
    },
    {
      title: 'Aftercare exclusivo',
      description: 'Seguimiento privado, entregables sensoriales y nuevas invitaciones tailor-made.',
      icon: '💫',
    },
  ];

  const precisionMetrics = [
    { label: 'Hosts auditados', value: '326', meta: 'Latam verified' },
    { label: 'Match preciso', value: '94%', meta: 'Affinity index' },
    { label: 'Tiempo de confirmación', value: '3m 12s', meta: 'Concierge IA' },
  ];

  const cinematicStory = {
    city: 'Santiago · Masajes sensoriales',
    title: 'Elixir Sensations',
    description:
      'Penthouse curado con mapping lumínico, storytelling guiado y cápsulas aromáticas a tu medida.',
  };

  const orbitBadges = [
    {
      label: 'Agenda dinámica',
      caption: 'Slots disponibles cada 15 minutos',
      accent: 'from-fire-400/70 via-fire-500/20 to-transparent',
    },
    {
      label: 'Confidencialidad absoluta',
      caption: 'Protocolos KYC + NDA automáticos',
      accent: 'from-lust-500/70 via-lust-500/20 to-transparent',
    },
  ];

  const qaHighlights = [
    {
      icon: '🛡️',
      title: 'Protocolos QA QC',
      description: 'Tres auditorías humanas + IA antes de activar una escena en el catálogo.',
      metric: '3 capas',
      accent: 'from-emerald-400/30 via-emerald-400/10 to-transparent',
    },
    {
      icon: '📊',
      title: 'Telemetría en vivo',
      description: 'Supervisamos ratings, tiempos de respuesta y NPS en tiempo real.',
      metric: '24/7',
      accent: 'from-sky-400/30 via-sky-400/10 to-transparent',
    },
    {
      icon: '🔍',
      title: 'Verificación integral',
      description: 'Identidad, documentación legal y reputación digital verificadas por nuestro equipo.',
      metric: '100%',
      accent: 'from-fire-400/30 via-fire-400/10 to-transparent',
    },
  ];

  const kineticSignals = [
    {
      icon: '🛰️',
      label: 'Concierge activo',
      metric: '12 anfitriones',
      caption: 'En escena ahora mismo',
      accent: 'from-fire-400 via-fire-500 to-lust-500',
    },
    {
      icon: '💠',
      label: 'Reservas blindadas',
      metric: '98% confianza',
      caption: 'Pagos y NDA encriptados',
      accent: 'from-emerald-400 via-emerald-500 to-sky-400',
    },
    {
      icon: '🌫️',
      label: 'Ambiente calibrado',
      metric: '4.8/5',
      caption: 'Feedback de atmósfera',
      accent: 'from-lust-500 via-fire-500 to-amber-400',
    },
  ];

  const trustedCollectives = ['Lust Archive', 'Noir Society', 'Velvet Skyline', 'Aurora Privé'];

  return (
    <section className="relative overflow-hidden bg-[#050308]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.24),transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(255,0,120,0.24),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_45%,rgba(255,255,255,0.08)_100%)] opacity-30" />
        <div className="absolute inset-0 bg-noise" />
        <div className="absolute left-1/2 top-20 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,0,120,0.2)_0%,transparent_70%)] blur-[160px]" />
        <div className="absolute -left-44 bottom-0 h-[28rem] w-[28rem] rounded-full bg-fire-500/20 blur-[140px]" />
        <div className="absolute -right-32 top-28 h-[30rem] w-[30rem] rounded-full bg-lust-500/18 blur-[150px]" />
        <div className="hyper-grid absolute inset-0 opacity-60" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-28 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <div className="space-y-12">
            <span className="badge-spectrum">
              Concierge neurosensorial
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-fire-400 to-lust-500 animate-ping" />
            </span>

            <div className="space-y-6">
              <h1 className="text-balance text-4xl font-black leading-[1.05] md:text-[3.6rem]">
                <span className="bg-[conic-gradient(at_top_left,_#ffe5d6,_#ff6b35_35%,_#ff0061_70%,_#ffe5d6_100%)] bg-clip-text text-transparent">
                  Experiencias calibradas con precisión de estudio para cautivar cada sentido.
                </span>
              </h1>
              <p className="max-w-2xl text-lg text-warm-300">
                MiPage sincroniza datos biométricos, disponibilidad hiperlocal y narrativa inmersiva para diseñar encuentros de lujo absoluto. Coordina a tu anfitrión, activa upgrades y mantén un hilo confidencial en todo momento.
              </p>
            </div>

            <div className="signature-stack">
              {precisionMetrics.map((metric) => (
                <div key={metric.label}>
                  <strong className="block text-warm-200">{metric.meta}</strong>
                  <p className="text-3xl font-semibold text-warm-50">{metric.value}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.4em] text-warm-500">{metric.label}</p>
                </div>
              ))}
              {orbitBadges.map((badge) => (
                <div key={badge.label} className="relative overflow-hidden">
                  <strong className="block text-warm-200">{badge.label}</strong>
                  <p className="mt-2 text-sm text-warm-300">{badge.caption}</p>
                  <span
                    className={`absolute inset-0 rounded-[1.6rem] bg-gradient-to-r ${badge.accent} opacity-40`}
                    aria-hidden
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink
                href="/auth/register?plan=concierge"
                variant="fire"
                size="lg"
                className="rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-[0.35em] shadow-[0_40px_120px_-80px_rgba(255,0,120,0.9)]"
              >
                Activar concierge
              </ButtonLink>
              <ButtonLink
                href="#catalogo"
                variant="dark"
                size="lg"
                className="rounded-full border border-white/10 bg-transparent px-8 py-4 text-xs font-semibold uppercase tracking-[0.4em] text-warm-200 hover:border-fire-400/50"
                onClick={() => onSearch(searchQuery, searchCity)}
              >
                Ver agenda en vivo
              </ButtonLink>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {qaHighlights.map((qa) => (
                <div
                  key={qa.title}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-fire-400/50"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${qa.accent} opacity-30 transition-opacity duration-300 group-hover:opacity-80`} />
                  <div className="relative space-y-3">
                    <span className="text-2xl">{qa.icon}</span>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-warm-100">{qa.title}</h3>
                    <p className="text-sm text-warm-300">{qa.description}</p>
                    <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.45em] text-fire-200">
                      {qa.metric}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="trusted-band">
              {trustedCollectives.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>

          <div className="relative grid gap-6">
            <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/5 p-8 backdrop-blur-3xl">
              <span className="halo-beam" aria-hidden />
              <div className="relative space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] uppercase tracking-[0.4em] text-warm-400">
                  <span className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-dark-950/70 px-4 py-1.5 text-warm-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                    Motor de búsqueda sensorial
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-warm-200">
                    Disponible 24/7
                  </span>
                </div>

                <form onSubmit={handleSearch} className="relative grid gap-5 md:grid-cols-[1.1fr,0.9fr,auto]">
                  <label className="relative flex flex-col gap-2">
                    <span className="text-[10px] uppercase tracking-[0.45em] text-warm-500">Experiencia</span>
                    <div className="relative">
                      <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fire-300" />
                      <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Masajes sensoriales, anfitriones elite, fiestas privadas..."
                        className="w-full rounded-[1.9rem] border border-white/10 bg-dark-950/70 py-4 pl-12 pr-4 text-base text-warm-50 placeholder:text-warm-500 focus:border-fire-400 focus:outline-none focus:ring-2 focus:ring-fire-400/30"
                      />
                    </div>
                  </label>
                  <label className="relative flex flex-col gap-2">
                    <span className="text-[10px] uppercase tracking-[0.45em] text-warm-500">Ciudad</span>
                    <div className="relative">
                      <MapPinIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fire-300" />
                      <input
                        value={searchCity}
                        onChange={(event) => setSearchCity(event.target.value)}
                        placeholder="Santiago, Viña del Mar, Concepción..."
                        className="w-full rounded-[1.9rem] border border-white/10 bg-dark-950/70 py-4 pl-12 pr-4 text-base text-warm-50 placeholder:text-warm-500 focus:border-fire-400 focus:outline-none focus:ring-2 focus:ring-fire-400/30"
                      />
                    </div>
                  </label>
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      variant="fire"
                      size="lg"
                      className="w-full whitespace-nowrap rounded-[1.9rem] px-10 py-4 text-base font-semibold uppercase tracking-[0.35em]"
                    >
                      Buscar ahora
                    </Button>
                  </div>
                </form>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.45em] text-warm-500">
                    Escenas en tendencia
                    <span className="h-px flex-1 bg-gradient-to-r from-fire-500/60 via-white/10 to-transparent" />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {trendingSearches.map((item) => (
                      <button
                        type="button"
                        key={item.label}
                        onClick={() => {
                          setSearchQuery(item.query);
                          onSearch(item.query, searchCity);
                        }}
                        className="group relative flex items-center gap-3 overflow-hidden rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-warm-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-fire-400/60 hover:text-fire-100"
                      >
                        <span className="relative z-[1] text-base">{item.icon}</span>
                        <span className="relative z-[1]">{item.label}</span>
                        <span
                          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-80"
                          style={{ background: 'linear-gradient(120deg, rgba(255,107,53,0.28), rgba(255,0,120,0.22))' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="quality-console">
                  <div className="quality-console__header">
                    <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-warm-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-300 animate-ping" />
                      Auditoría continua
                    </span>
                    <Link
                      href="/debug"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-fire-200 transition-colors duration-200 hover:border-fire-400/60 hover:text-fire-100"
                    >
                      QA Live Deck
                      <span aria-hidden>↗</span>
                    </Link>
                  </div>
                  <div className="quality-console__grid">
                    {kineticSignals.map((signal) => (
                      <div key={signal.label} className="quality-console__tile">
                        <div className={`quality-console__halo bg-gradient-to-br ${signal.accent}`} aria-hidden />
                        <div className="relative space-y-2">
                          <span className="text-xl">{signal.icon}</span>
                          <p className="text-[11px] uppercase tracking-[0.4em] text-warm-400">{signal.label}</p>
                          <p className="text-lg font-semibold text-warm-50">{signal.metric}</p>
                          <p className="text-xs text-warm-300">{signal.caption}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="prestige-card p-8">
                <div className="relative space-y-6 text-sm text-warm-300">
                  <div className="space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.45em] text-warm-400">{cinematicStory.city}</span>
                    <h3 className="text-2xl font-semibold text-warm-50">{cinematicStory.title}</h3>
                    <p className="leading-relaxed">{cinematicStory.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-warm-300">
                    {['Storytelling guiado', 'Aftercare digital', 'Ambientación lumínica'].map((chip) => (
                      <span key={chip} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-dark-950/60 px-4 py-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fire-400 to-lust-500" />
                        {chip}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-dark-950/70 px-5 py-3">
                    <div className="space-y-1 text-xs uppercase tracking-[0.35em] text-warm-400">
                      <span className="inline-flex items-center gap-2 text-warm-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-ping" />
                        Slot activo
                      </span>
                      <span className="text-warm-200">Próxima sesión · 21:30 hrs</span>
                    </div>
                    <ButtonLink
                      href="/services"
                      variant="fire"
                      size="sm"
                      className="rounded-2xl px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.35em]"
                    >
                      Reservar ahora
                    </ButtonLink>
                  </div>
                </div>
              </div>

              <div className="prestige-card p-8">
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.4em] text-warm-400">
                    <span>Protocolos sensoriales</span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-warm-100">
                      Curated by Lust
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {sensoryProtocols.map((protocol) => (
                      <div key={protocol.title} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-dark-950/65 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-fire-400/40">
                        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-80" style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.28) 0%, transparent 60%)' }} />
                        <div className="relative space-y-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-dark-950/60 text-lg">
                            {protocol.icon}
                          </span>
                          <h4 className="text-sm font-semibold text-warm-100">{protocol.title}</h4>
                          <p className="text-xs leading-relaxed text-warm-400">{protocol.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-6 overflow-hidden rounded-[2.75rem] border border-white/10 bg-[rgba(8,5,12,0.85)] p-8 backdrop-blur-2xl">
              <div className="beam-mask" />
              <div className="relative space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] uppercase tracking-[0.4em] text-warm-400">
                  <span>Telemetría concierge</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">
                    Latido 92%
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {kineticSignals.map((signal) => (
                    <div key={signal.label} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-dark-950/70 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-fire-400/40">
                      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-80" style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.22) 0%, transparent 60%)' }} />
                      <div className="relative space-y-3 text-[11px] uppercase tracking-[0.35em] text-warm-400">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-warm-100">
                          <span className="text-base">{signal.icon}</span>
                          {signal.label}
                        </span>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-warm-200">
                            <span>{signal.caption}</span>
                            <span className="text-sm font-semibold text-warm-50">{signal.metric}</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div className={`h-full rounded-full bg-gradient-to-r ${signal.accent}`} style={{ width: '100%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
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
