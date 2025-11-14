'use client';

import Link from 'next/link';

const storySteps = [
  {
    title: 'Sube historias impactantes',
    detail: 'Crea secuencias de fotos verticales con texto y video corto. El sistema adapta la compresión automáticamente.',
  },
  {
    title: 'Agenda transparente',
    detail: 'Configura tu disponibilidad diaria y sincroniza con recordatorios de WhatsApp o correo.',
  },
  {
    title: 'Promociones inteligentes',
    detail: 'Define cupos limitados, precios dinámicos y mensajes destacados en portada.',
  },
];

const commentTools = [
  'Responde comentarios con plantillas personalizables.',
  'Marca conversaciones resueltas y filtra por reseñas destacadas.',
  'Activa alertas cuando recibas calificaciones debajo de 4 estrellas.',
];

const profileChecklist = [
  'Foto de portada en formato editorial.',
  'Descripción breve con especialidad y disponibilidad.',
  'Tarifa estándar y tarifas especiales por temporada.',
  'Galería de hasta 12 fotos en alta resolución.',
];

export default function OferentesPortal() {
  return (
    <div className="min-h-screen bg-[#f7f6f4] text-neutral-900">
      <header className="border-b border-neutral-200 bg-white/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Portal oferentes</p>
            <h1 className="text-2xl font-semibold text-neutral-900">Gestiona tu vitrina premium</h1>
          </div>
          <Link href="/auth/login" className="text-sm text-neutral-500 transition hover:text-neutral-900">
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 space-y-12">
        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Panel principal</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Visualiza tus reservas activas, métricas de satisfacción y promociones publicadas con una interfaz minimalista.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li>Resumen diario de solicitudes y confirmaciones.</li>
              <li>Indicadores de ingresos estimados por semana.</li>
              <li>Alertas en caso de documentación próxima a expirar.</li>
            </ul>
          </article>

          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Checklist del perfil</h2>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              {profileChecklist.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-neutral-900" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-neutral-500">Todos los cambios pasan por revisión automática antes de publicarse.</p>
          </article>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Historias y promociones</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {storySteps.map((step) => (
              <div key={step.title} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm">
                <p className="font-semibold text-neutral-900">{step.title}</p>
                <p className="mt-2 text-neutral-500">{step.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-neutral-500">
            Consejo: mantén actualizadas las promociones para aparecer en la portada de “destacados”.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-[0.6fr,0.4fr]">
          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Comentarios y reputación</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Da seguimiento a lo que dicen tus clientes y responde con el tono correcto.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              {commentTools.map((tool) => (
                <li key={tool} className="flex items-start gap-2">
                  <span className="inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neutral-900" aria-hidden />
                  <span>{tool}</span>
                </li>
              ))}
            </ul>
          </article>

          <aside className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Soporte dedicado</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Accede a tutoriales y acompañamiento para mejorar tu presentación y tu agenda.
            </p>
            <div className="mt-4 space-y-2 text-sm text-neutral-600">
              <p>• Biblioteca de presets fotográficos y guías de iluminación.</p>
              <p>• Auditorías trimestrales del perfil para subir de categoría.</p>
              <p>• Chat con el equipo editorial para optimizar textos.</p>
            </div>
          </aside>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Próximos pasos</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/auth/register" className="rounded-full bg-neutral-900 px-6 py-3 text-white transition hover:bg-neutral-700">
              Quiero publicar mis servicios
            </Link>
            <Link
              href="/auth/login"
              className="rounded-full border border-neutral-300 px-6 py-3 text-neutral-900 transition hover:border-neutral-900"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
