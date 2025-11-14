'use client';

import Link from 'next/link';

const benefits = [
  {
    title: 'Reseñas verificadas',
    detail: 'Comparte tu experiencia solo después de una reserva confirmada. Mantiene la confianza para toda la comunidad.',
  },
  {
    title: 'Calificaciones con contexto',
    detail: 'Evalúa servicio, puntualidad y ambientación. Tus notas alimentan los reportes para administradores y oferentes.',
  },
  {
    title: 'Listas personalizadas',
    detail: 'Crea colecciones privadas con tus profesionales favoritos y recibe alertas cuando liberen nuevos horarios.',
  },
];

const steps = [
  'Regístrate con correo verificado para habilitar reservas.',
  'Explora perfiles completos con precios, disponibilidad y comentarios destacados.',
  'Agenda en un par de clics y sigue el estado desde tu panel personal.',
  'Después de la sesión, califica y deja una reseña moderada por el equipo.',
];

const safetyNotes = [
  'Datos protegidos con autenticación robusta y doble factor opcional.',
  'Historial de interacciones y comprobantes descargables.',
  'Equipo de soporte disponible 24/7 para incidencias o cambios de agenda.',
];

export default function ClientesExperience() {
  return (
    <div className="min-h-screen bg-[#f7f6f4] text-neutral-900">
      <header className="border-b border-neutral-200 bg-white/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Portal clientes</p>
            <h1 className="text-2xl font-semibold text-neutral-900">Tu experiencia, cuidada de principio a fin</h1>
          </div>
          <Link href="/auth/login" className="text-sm text-neutral-500 transition hover:text-neutral-900">
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 space-y-12">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Beneficios principales</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm">
                <p className="font-semibold text-neutral-900">{benefit.title}</p>
                <p className="mt-2 text-neutral-500">{benefit.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[0.55fr,0.45fr]">
          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Cómo funciona</h2>
            <ol className="mt-4 space-y-2 text-sm text-neutral-600">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-0.5 text-xs font-semibold text-neutral-400">0{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </article>

          <aside className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Seguridad y soporte</h2>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              {safetyNotes.map((note) => (
                <li key={note} className="flex items-start gap-2">
                  <span className="inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neutral-900" aria-hidden />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Listo para comenzar</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Una vez registrado podrás guardar favoritos, coordinar visitas y recibir notificaciones personalizadas.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/auth/register" className="rounded-full bg-neutral-900 px-6 py-3 text-white transition hover:bg-neutral-700">
              Crear cuenta
            </Link>
            <Link
              href="/auth/login"
              className="rounded-full border border-neutral-300 px-6 py-3 text-neutral-900 transition hover:border-neutral-900"
            >
              Ya estoy registrado
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
