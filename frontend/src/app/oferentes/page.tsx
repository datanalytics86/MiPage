'use client';

import Link from 'next/link';

const activationSteps = [
  {
    title: 'Envía tu ficha inicial',
    detail: 'Regístrate, carga al menos tres fotos editoriales y completa tu descripción en tono profesional.',
  },
  {
    title: 'Revisión del administrador',
    detail: 'El equipo valida identidad, calidad visual y disponibilidad. Solo después se habilita tu vitrina.',
  },
  {
    title: 'Publicación controlada',
    detail: 'Cuando recibas el estado “Activo” podrás subir historias, promociones y responder comentarios.',
  },
];

const requirements = [
  'Documento de identidad vigente y contrato firmado.',
  'Portfolio fotográfico en formato vertical y horizontal.',
  'Tarifa base en CLP y ciudad principal de atención.',
];

const supportNotes = [
  'Tutorial de fotografía premium y guía de estilo minimalista.',
  'Plantilla editable para armar promociones estacionales.',
  'Soporte directo en horario extendido via chat editorial.',
];

export default function OferentesInicio() {
  return (
    <div className="min-h-screen bg-[#f7f6f4] text-neutral-900">
      <header className="border-b border-neutral-200 bg-white/90">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Portal publicantes</p>
            <h1 className="text-2xl font-semibold text-neutral-900">Tu vitrina comienza aquí</h1>
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
              <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Estado de acceso</p>
              <h2 className="text-xl font-semibold text-neutral-900">Pendiente de activación</h2>
              <p className="text-sm text-neutral-600">
                Tus anuncios permanecen ocultos hasta que un administrador cambie tu estado a <span className="font-semibold">Activo</span> en el dashboard oficial.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-sm text-neutral-600">
              <p className="font-semibold text-neutral-900">Siguiente paso</p>
              <p className="mt-1">Envía tu ficha completa y espera el correo de confirmación del equipo.</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
                <Link
                  href="/auth/register"
                  className="rounded-full bg-neutral-900 px-5 py-2 text-white transition hover:bg-neutral-800"
                >
                  Solicitar revisión
                </Link>
                <Link
                  href="/admin"
                  className="rounded-full border border-neutral-300 px-5 py-2 text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                >
                  Ver flujo del administrador
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[0.58fr,0.42fr]">
          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Checklist mínima</h2>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              {requirements.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neutral-900" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-neutral-500">
              La verificación tarda 24&nbsp;a&nbsp;48&nbsp;horas hábiles. Recibirás el estado actualizado por correo.
            </p>
          </article>

          <aside className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Recursos disponibles</h2>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              {supportNotes.map((note) => (
                <li key={note} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neutral-900" aria-hidden />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Cómo avanzas</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {activationSteps.map((step) => (
              <div key={step.title} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm">
                <p className="font-semibold text-neutral-900">{step.title}</p>
                <p className="mt-2 text-neutral-500">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm text-sm text-neutral-600">
          <h2 className="text-lg font-semibold text-neutral-900">Transparencia del flujo</h2>
          <p className="mt-2">
            Todo cambio que hagas quedará en estado <span className="font-semibold">En revisión</span> hasta que el administrador lo apruebe.
            Podrás ver el historial de acciones y la fecha de activación más reciente directamente desde tu panel.
          </p>
          <p className="mt-4">
            Si necesitas acelerar una campaña o pausar temporalmente un anuncio, escribe al equipo editorial; ellos gestionan la petición dentro del dashboard sin que tengas que salir de este portal.
          </p>
        </section>
      </main>
    </div>
  );
}
