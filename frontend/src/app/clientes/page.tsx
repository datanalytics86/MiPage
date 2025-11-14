'use client';

import Link from 'next/link';

const commentSteps = [
  {
    title: 'Crea tu cuenta',
    detail: 'Regístrate con correo verificado y acepta las normas de reseñas confiables.',
  },
  {
    title: 'Confirma una experiencia',
    detail: 'Solo podrás comentar servicios que hayas reservado y completado dentro de la plataforma.',
  },
  {
    title: 'Comparte tu reseña',
    detail: 'Evalúa con estrellas, añade observaciones y envía evidencia opcional para acelerar la moderación.',
  },
];

const guidelines = [
  'Sé específico con tiempos, trato y ambiente. Evita datos sensibles.',
  'Las calificaciones inferiores a 3 estrellas activan seguimiento del equipo de soporte.',
  'Puedes editar tu reseña durante las primeras 24 horas después de publicada.',
];

const benefits = [
  'Acceso a historial de reservas y comprobantes descargables.',
  'Alertas cuando tus profesionales favoritos abren nuevos horarios.',
  'Panel personal para seguir respuestas de oferentes y estado de moderación.',
];

const reviewLedger = [
  {
    id: 'review-001',
    client: 'María Contreras',
    professional: 'Aurora Ramírez',
    service: 'Editorial & Fashion Film',
    rating: 5,
    submittedAt: '04 Nov 2024 · 21:18',
    status: 'Publicada',
    comment:
      'Dirección impecable y tiempos perfectos. La coordinación previa facilitó todo el rodaje.',
  },
  {
    id: 'review-002',
    client: 'Diego Vargas',
    professional: 'Ignacio Verdugo',
    service: 'Masajes deportivos',
    rating: 4,
    submittedAt: '03 Nov 2024 · 12:42',
    status: 'En moderación',
    comment:
      'Excelente técnica, solicité ajuste de presión y respondió de inmediato. Esperando aprobación para actualizar foto.',
  },
  {
    id: 'review-003',
    client: 'Claudia Reyes',
    professional: 'Emilia Sofía',
    service: 'Masajes sensoriales',
    rating: 5,
    submittedAt: '29 Oct 2024 · 19:05',
    status: 'Publicada',
    comment:
      'Ambiente cuidadosamente diseñado, aromaterapia y playlists alineados con la sesión. Repetiré.',
  },
];

export default function ClientesInicio() {
  return (
    <div className="min-h-screen bg-[#f7f6f4] text-neutral-900">
      <header className="border-b border-neutral-200 bg-white/90">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Portal comentarios</p>
            <h1 className="text-2xl font-semibold text-neutral-900">Comparte reseñas con contexto</h1>
          </div>
          <Link href="/auth/login" className="text-sm text-neutral-500 transition hover:text-neutral-900">
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 space-y-10">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Acceso moderado</p>
              <h2 className="text-xl font-semibold text-neutral-900">Reseñas verificadas</h2>
              <p className="text-sm text-neutral-600">
                Cada comentario se vincula a una reserva real. Nuestro equipo revisa tono, lenguaje y veracidad antes de
                publicarlo para mantener el estándar premium.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-sm text-neutral-600">
              <p className="font-semibold text-neutral-900">¿Listo para comentar?</p>
              <p className="mt-1">Activa tu cuenta y confirma tu primera sesión para habilitar el formulario.</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
                <Link
                  href="/auth/register"
                  className="rounded-full bg-neutral-900 px-5 py-2 text-white transition hover:bg-neutral-800"
                >
                  Crear cuenta
                </Link>
                <Link
                  href="/auth/login"
                  className="rounded-full border border-neutral-300 px-5 py-2 text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                >
                  Ya estoy registrado
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Pasos para dejar tu comentario</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {commentSteps.map((step) => (
              <div key={step.title} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm">
                <p className="font-semibold text-neutral-900">{step.title}</p>
                <p className="mt-2 text-neutral-500">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[0.55fr,0.45fr]">
          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Guías de estilo</h2>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              {guidelines.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neutral-900" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-neutral-500">
              El administrador puede ocultar comentarios que incumplan las políticas o estén en revisión.
            </p>
          </article>

          <aside className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Ventajas de estar registrado</h2>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neutral-900" aria-hidden />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm text-sm text-neutral-600">
          <h2 className="text-lg font-semibold text-neutral-900">Moderación transparente</h2>
          <p className="mt-2">
            Recibirás notificaciones cuando tu reseña cambie de estado: en revisión, publicada o con ajustes solicitados. El administrador conserva
            la última palabra para garantizar que solo testimonios verificables aparezcan en la galería principal.
          </p>
          <p className="mt-4">
            Si detectas información inexacta, puedes reportarla desde tu panel; el equipo editorial responderá dentro de las siguientes 12 horas hábiles.
          </p>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Historial de reseñas</h2>
              <p className="text-sm text-neutral-500">Cada entrada conserva fecha, calificación y estado visible en tu panel.</p>
            </div>
            <Link
              href="/auth/login?role=CLIENT"
              className="text-xs uppercase tracking-[0.28em] text-neutral-500 transition hover:text-neutral-900"
            >
              Ver mi actividad
            </Link>
          </div>

          <ul className="mt-6 space-y-4">
            {reviewLedger.map((review) => (
              <li key={review.id} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-neutral-900">{review.client}</p>
                    <span className="text-xs uppercase tracking-[0.26em] text-neutral-500">{review.submittedAt}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs uppercase tracking-[0.28em] text-neutral-400">
                    <span>{'⭐'.repeat(review.rating)}{review.rating < 5 ? '☆'.repeat(5 - review.rating) : ''}</span>
                    <span className="h-3 w-px bg-neutral-300" aria-hidden />
                    <span>{review.professional}</span>
                    <span className="h-3 w-px bg-neutral-300" aria-hidden />
                    <span>{review.service}</span>
                    <span className="h-3 w-px bg-neutral-300" aria-hidden />
                    <span className={review.status === 'Publicada' ? 'text-emerald-500' : 'text-neutral-500'}>{review.status}</span>
                  </div>
                  <p className="text-sm text-neutral-600">{review.comment}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
