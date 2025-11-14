import Link from 'next/link';

export default function ServiceNotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 text-neutral-700">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.32em] text-neutral-400">MiWeb · Servicios</p>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Servicio no disponible</h1>
        <p className="text-sm text-neutral-500">
          El anuncio que intentas abrir fue retirado o no existe. Elige otra profesional desde el catálogo principal.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.24em] text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
        >
          Volver al catálogo
        </Link>
      </div>
    </main>
  );
}
