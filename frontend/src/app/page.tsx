'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

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

type ProviderComment = {
  id: string;
  author: string;
  timestamp: string;
  text: string;
};

type ProviderUpdate = {
  id: string;
  publishedAt: string;
  title: string;
  summary: string;
  comments: ProviderComment[];
};

type UserReview = {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
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

const providerUpdates: Partial<Record<string, ProviderUpdate[]>> = {
  'aurora-ramirez': [
    {
      id: 'aurora-update-01',
      publishedAt: '06 Nov 2024 · 10:15',
      title: 'Serie "Luz suave" aprobada para vitrina',
      summary:
        'El set editorial final está listo para publicarse en la portada con tres fotografías principales en formato vertical.',
      comments: [
        {
          id: 'aurora-update-01-c1',
          author: 'Equipo Admin',
          timestamp: '06 Nov · 10:28',
          text: 'Ajustamos la temperatura de color para mantener consistencia con la paleta general.',
        },
      ],
    },
    {
      id: 'aurora-update-02',
      publishedAt: '03 Nov 2024 · 18:42',
      title: 'Nuevo paquete fashion film en revisión',
      summary:
        'Se añadieron clips cortos para campañas sociales. Se espera confirmación de musicalización con derechos liberados.',
      comments: [
        {
          id: 'aurora-update-02-c1',
          author: 'Moderación',
          timestamp: '03 Nov · 19:02',
          text: 'Por favor adjuntar créditos del estudio de audio antes de publicar.',
        },
      ],
    },
  ],
  'isabela-mena': [
    {
      id: 'isabela-update-01',
      publishedAt: '04 Nov 2024 · 09:20',
      title: 'Masajes de autor con nueva aromaterapia',
      summary:
        'Se cargó un set fotográfico donde se detalla el protocolo de aceites esenciales y el flujo de reserva.',
      comments: [
        {
          id: 'isabela-update-01-c1',
          author: 'Curador Wellness',
          timestamp: '04 Nov · 09:40',
          text: 'Añadimos notas de seguridad para clientes con alergias en la descripción.',
        },
        {
          id: 'isabela-update-01-c2',
          author: 'Publicante',
          timestamp: '04 Nov · 09:55',
          text: 'Checklist actualizado y reenviado para revisión final.',
        },
      ],
    },
    {
      id: 'isabela-update-02',
      publishedAt: '28 Oct 2024 · 15:05',
      title: 'Campaña "Tacto profundo" programada',
      summary:
        'Se calendarizó una promoción de media temporada con foco en clientes recurrentes y sesiones dobles.',
      comments: [
        {
          id: 'isabela-update-02-c1',
          author: 'Equipo Admin',
          timestamp: '28 Oct · 15:22',
          text: 'Promoción autorizada por 10 días. Se activarán recordatorios automáticos.',
        },
      ],
    },
  ],
  'ignacio-verdugo': [
    {
      id: 'ignacio-update-01',
      publishedAt: '01 Nov 2024 · 12:10',
      title: 'Sesión deportiva con feedback del kinesiólogo',
      summary:
        'Se agregaron fotografías de maniobras de liberación miofascial y el protocolo posterior al entrenamiento.',
      comments: [
        {
          id: 'ignacio-update-01-c1',
          author: 'Moderación',
          timestamp: '01 Nov · 12:24',
          text: 'Incluimos nota de tiempos de recuperación sugeridos para cada tipo de deportista.',
        },
      ],
    },
    {
      id: 'ignacio-update-02',
      publishedAt: '26 Oct 2024 · 08:50',
      title: 'Nueva galería post maratón',
      summary:
        'Fotos de trabajo en equipo con nutricionista y tabla de estiramientos descargable.',
      comments: [
        {
          id: 'ignacio-update-02-c1',
          author: 'Equipo Admin',
          timestamp: '26 Oct · 09:05',
          text: 'Archivos aprobados. Se publicará versión comprimida para dispositivos móviles.',
        },
      ],
    },
  ],
  'malena-rojas': [
    {
      id: 'malena-update-01',
      publishedAt: '05 Nov 2024 · 21:30',
      title: 'Carrusel haute couture con nueva dirección de arte',
      summary:
        'Se subieron imágenes backstage con notas de estilismo para reforzar el relato de pasarela.',
      comments: [
        {
          id: 'malena-update-01-c1',
          author: 'Dirección Creativa',
          timestamp: '05 Nov · 21:44',
          text: 'Se sugiere ordenar secuencia por texturas antes de agendar publicación.',
        },
      ],
    },
  ],
};

const userReviews: Partial<Record<string, UserReview[]>> = {
  'aurora-ramirez': [
    {
      id: 'aurora-review-01',
      author: 'Daniela P.',
      rating: 5,
      date: '04 Nov 2024',
      comment: 'El fashion film quedó impecable. Excelente dirección y puntualidad en la entrega.',
    },
    {
      id: 'aurora-review-02',
      author: 'Estudio Prisma',
      rating: 4,
      date: '29 Oct 2024',
      comment: 'Gran disposición en el set, solo ajustaríamos tiempos de respuesta en revisiones.',
    },
  ],
  'isabela-mena': [
    {
      id: 'isabela-review-01',
      author: 'María F.',
      rating: 5,
      date: '02 Nov 2024',
      comment: 'Masaje increíble, la aromaterapia personalizada marcó la diferencia.',
    },
    {
      id: 'isabela-review-02',
      author: 'Carla G.',
      rating: 4,
      date: '20 Oct 2024',
      comment: 'Experiencia muy relajante, me hubiese gustado un poco más de presión en la espalda.',
    },
  ],
  'ignacio-verdugo': [
    {
      id: 'ignacio-review-01',
      author: 'Club Runners',
      rating: 5,
      date: '31 Oct 2024',
      comment: 'Recuperación rápida y profesional. Ideal para equipos de alto rendimiento.',
    },
  ],
};

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
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [showUserReviews, setShowUserReviews] = useState(false);

  const filteredProfessionals = useMemo(() => {
    if (filter === 'all') return professionals;
    return professionals.filter((professional) => professional.category === filter);
  }, [filter]);

  const selectedProfessional = useMemo(() => {
    if (!selectedProfessionalId) return null;
    return professionals.find((professional) => professional.id === selectedProfessionalId) ?? null;
  }, [selectedProfessionalId]);

  useEffect(() => {
    if (!selectedProfessionalId) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedProfessionalId(null);
        setShowUserReviews(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProfessionalId]);

  const closeOverlay = () => {
    setSelectedProfessionalId(null);
    setShowUserReviews(false);
  };

  const selectedUpdates = selectedProfessional
    ? providerUpdates[selectedProfessional.id] ?? []
    : [];

  const selectedUserReviews = selectedProfessional
    ? userReviews[selectedProfessional.id] ?? []
    : [];

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
            <button
              key={professional.id}
              type="button"
              onClick={() => {
                setSelectedProfessionalId(professional.id);
                setShowUserReviews(false);
              }}
              className="group relative block aspect-[3/4] w-full overflow-hidden rounded-[32px] bg-neutral-200 text-left shadow-[0_30px_60px_rgba(15,15,15,0.12)]"
              aria-label={`Abrir actualizaciones de ${professional.name}`}
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
            </button>
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

      {selectedProfessional && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 px-4 pb-8 pt-20 sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={closeOverlay}
        >
          <div
            className="relative max-w-5xl w-full overflow-hidden rounded-[32px] border border-white/20 bg-white text-neutral-900 shadow-[0_40px_80px_rgba(15,15,15,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeOverlay}
              className="absolute right-5 top-5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs uppercase tracking-[0.28em] text-neutral-500 transition hover:border-neutral-900 hover:text-neutral-900"
            >
              Cerrar
            </button>

            <div className="grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[280px_1fr]">
              <div className="space-y-5">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[28px] bg-neutral-200">
                  <Image
                    src={selectedProfessional.image}
                    alt={selectedProfessional.name}
                    fill
                    sizes="280px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1 text-sm uppercase tracking-[0.28em] text-neutral-500">
                  <span>{selectedProfessional.service}</span>
                  <span className="block text-neutral-800">{selectedProfessional.location}</span>
                  <span className="block text-neutral-400">{formatPriceCLP(selectedProfessional.price)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <header className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.32em] text-neutral-400">Actualizaciones</p>
                  <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                    {selectedProfessional.name}
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Registro en tiempo real de lo que el oferente ha enviado para revisión y publicación.
                  </p>
                </header>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-neutral-500">
                    Bitácora del oferente
                  </h3>
                  {selectedUpdates.length ? (
                    <ul className="space-y-4">
                      {selectedUpdates.map((update) => (
                        <li key={update.id} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.26em] text-neutral-500">
                            <span>{update.publishedAt}</span>
                            <span>{selectedProfessional.nationality}</span>
                          </div>
                          <p className="mt-3 text-sm font-semibold text-neutral-900">{update.title}</p>
                          <p className="mt-2 text-sm text-neutral-600">{update.summary}</p>
                          {update.comments.length > 0 && (
                            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                              {update.comments.map((comment) => (
                                <li
                                  key={comment.id}
                                  className="rounded-2xl border border-neutral-200 bg-white px-4 py-3"
                                >
                                  <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">
                                    {comment.author} · {comment.timestamp}
                                  </p>
                                  <p className="mt-1 text-neutral-600">{comment.text}</p>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
                      Aún no hay actualizaciones cargadas por este oferente. Cada envío aparecerá aquí con fecha y comentarios.
                    </p>
                  )}
                </section>

                <div className="space-y-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                  <button
                    type="button"
                    onClick={() => setShowUserReviews((prev) => !prev)}
                    className="flex w-full items-center justify-between text-sm font-semibold text-neutral-700 transition hover:text-neutral-900"
                  >
                    <span>Leer comentarios de usuarios</span>
                    <span aria-hidden="true">{showUserReviews ? '−' : '+'}</span>
                  </button>

                  {showUserReviews && (
                    <section className="space-y-4">
                      {selectedUserReviews.length ? (
                        selectedUserReviews.map((review) => (
                          <article key={review.id} className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-4">
                            <div className="flex items-center justify-between text-sm text-neutral-500">
                              <p className="font-semibold text-neutral-900">{review.author}</p>
                              <span>{review.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <span
                                  key={index}
                                  className={`text-xs ${index < review.rating ? 'text-yellow-500' : 'text-neutral-300'}`}
                                  aria-hidden="true"
                                >
                                  ★
                                </span>
                              ))}
                              <span className="sr-only">Calificación: {review.rating} de 5</span>
                            </div>
                            <p className="text-sm text-neutral-600">{review.comment}</p>
                          </article>
                        ))
                      ) : (
                        <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-5 text-sm text-neutral-500">
                          Aún no hay reseñas publicadas por usuarios para este servicio.
                        </p>
                      )}
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
