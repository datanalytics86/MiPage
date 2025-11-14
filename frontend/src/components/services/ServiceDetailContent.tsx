'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useState, type ReactNode } from 'react';

import type { ProfessionalService } from '@/data/professionals';

const formatPriceCLP = (value: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);

const whatsappUrl = (number: string) => `https://wa.me/${number.replace(/[^0-9]/g, '')}`;

const telUrl = (number: string) => `tel:${number.replace(/[^0-9+]/g, '')}`;

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Calificación promedio ${rating.toFixed(1)} de 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < Math.round(rating) ? 'text-yellow-500' : 'text-neutral-300'}>
          ★
        </span>
      ))}
      <span className="text-sm font-medium text-neutral-600">{rating.toFixed(1)}</span>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  id,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="space-y-4 rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-[0_14px_28px_rgba(15,15,15,0.06)]">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">{title}</h2>
        {subtitle ? <p className="text-sm text-neutral-500">{subtitle}</p> : null}
      </header>
      <div className="space-y-4 text-neutral-700">{children}</div>
    </section>
  );
}

type ServiceDetailContentProps = {
  professional: ProfessionalService;
};

export function ServiceDetailContent({ professional }: ServiceDetailContentProps) {
  const [activePhoto, setActivePhoto] = useState(0);

  const hasReviews = professional.reviews.length > 0;
  const averageRating = professional.rating ?? 0;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900">
            ← Volver al catálogo
          </Link>
          <span className="text-xs uppercase tracking-[0.28em] text-neutral-400">MiWeb · Servicios destacados</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-10">
            <section className="space-y-4 rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-[0_18px_36px_rgba(15,15,15,0.08)]">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-200">
                <Image
                  src={professional.gallery[activePhoto] ?? professional.image}
                  alt={`${professional.name} - imagen ${activePhoto + 1}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 640px, 100vw"
                  priority
                />
              </div>
              {professional.gallery.length > 1 && (
                <div className="grid gap-3 sm:grid-cols-4">
                  {professional.gallery.map((photo, index) => (
                    <button
                      key={photo}
                      type="button"
                      onClick={() => setActivePhoto(index)}
                      className={`relative aspect-square overflow-hidden rounded-xl border transition ${
                        activePhoto === index
                          ? 'border-neutral-900 shadow-[0_8px_16px_rgba(15,15,15,0.12)]'
                          : 'border-transparent'
                      }`}
                      aria-label={`Ver imagen ${index + 1}`}
                    >
                      <Image src={photo} alt={`${professional.name} miniatura ${index + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <SectionCard title="Descripción del servicio" subtitle={`${professional.service} · ${professional.nationality}`}>
              <p className="text-base leading-relaxed text-neutral-700">{professional.description}</p>
            </SectionCard>

            <SectionCard title="Comentarios del servicio" subtitle="Foro trazable entre oferente, moderación y clientes verificados">
              <div className="space-y-3">
                <textarea
                  placeholder="Escribe un comentario..."
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 transition focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  rows={3}
                  disabled
                />
                <p className="text-xs text-neutral-400">
                  Inicia sesión con tu cuenta verificada para sumar comentarios. Cada aporte queda registrado con fecha, hora y rol participante.
                </p>
              </div>

              <ol className="space-y-4">
                {professional.thread.map((entry, index) => {
                  const previous = professional.thread[index - 1];
                  const showDivider = previous && previous.timestamp.split(' · ')[0] !== entry.timestamp.split(' · ')[0];

                  return (
                    <Fragment key={entry.id}>
                      {showDivider ? (
                        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-neutral-400">
                          <span className="h-px flex-1 bg-neutral-200" aria-hidden="true" />
                          {entry.timestamp.split(' · ')[0]}
                          <span className="h-px flex-1 bg-neutral-200" aria-hidden="true" />
                        </div>
                      ) : null}
                      <li className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                            <span>{entry.author}</span>
                            <span className="rounded-full bg-neutral-900/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-neutral-600">
                              {entry.role}
                            </span>
                          </div>
                          <span className="text-xs text-neutral-500">{entry.timestamp}</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-neutral-700">{entry.message}</p>
                      </li>
                    </Fragment>
                  );
                })}
              </ol>
            </SectionCard>

            <SectionCard id="bitacora" title="Bitácora del oferente" subtitle="Registro horario de publicaciones, promociones y ajustes">
              <ol className="space-y-3">
                {professional.activity.map((item) => (
                  <li key={item.id} className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-neutral-500">{item.timestamp}</p>
                    <p className="mt-2 text-sm font-semibold text-neutral-800">{item.headline}</p>
                    <p className="text-sm text-neutral-600">{item.detail}</p>
                  </li>
                ))}
              </ol>
            </SectionCard>

            <SectionCard id="resenas" title="Reseñas de usuarios" subtitle="Experiencias verificadas">
              {hasReviews ? (
                <div className="space-y-4">
                  {professional.reviews.map((review) => (
                    <article key={review.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-neutral-800">{review.author}</p>
                          {review.verified ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">✓ Verificado</span>
                          ) : null}
                        </div>
                        <span className="text-xs text-neutral-500">{review.date}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span key={index} className={index < review.rating ? 'text-yellow-500' : 'text-neutral-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-neutral-700">{review.comment}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-5 text-sm text-neutral-500">
                  Aún no hay reseñas para este servicio.
                </p>
              )}
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <div className="space-y-6 rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-[0_18px_36px_rgba(15,15,15,0.08)]">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Servicio</p>
                <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">{professional.name}</h1>
                <p className="text-sm text-neutral-500">{professional.service}</p>
              </div>

              <div className="space-y-2 rounded-2xl bg-neutral-900 px-5 py-4 text-white">
                <p className="text-sm uppercase tracking-[0.28em] text-white/60">Tarifa desde</p>
                <p className="text-3xl font-semibold">{formatPriceCLP(professional.price)}</p>
              </div>

              {professional.rating ? (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Calificación promedio</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Stars rating={averageRating} />
                    <span className="text-sm text-neutral-500">{professional.ratingCount} reseñas</span>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">📍</span>
                  {professional.location}
                </div>
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">📞</span>
                  <a
                    href={telUrl(professional.phone)}
                    className="text-neutral-700 underline decoration-neutral-300 decoration-2 underline-offset-4 transition hover:decoration-neutral-900"
                  >
                    {professional.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">💬</span>
                  <a
                    href={whatsappUrl(professional.whatsapp)}
                    className="text-neutral-700 underline decoration-neutral-300 decoration-2 underline-offset-4 transition hover:decoration-neutral-900"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {professional.whatsapp} (WhatsApp)
                  </a>
                </div>
              </div>

              <a
                href="#resenas"
                className="block rounded-full bg-emerald-500 px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.24em] text-white transition hover:bg-emerald-600"
              >
                Leer reviews usuarios
              </a>

              <a
                href="#bitacora"
                className="block rounded-full border border-neutral-200 px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.24em] text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
              >
                Ver bitácora completa
              </a>
            </div>

            <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-[0_12px_24px_rgba(15,15,15,0.06)]">
              <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-neutral-500">Pautas rápidas</h2>
              <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                <li>Reservas confirmadas tras validación de admin.</li>
                <li>La agenda se actualiza cada hora hábil.</li>
                <li>Los comentarios se moderan antes de publicarse.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default ServiceDetailContent;
