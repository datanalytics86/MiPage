'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type AccountStatus = 'Activo' | 'Inactivo';

type ProfessionalRow = {
  id: string;
  name: string;
  service: string;
  status: AccountStatus;
  lastUpdate: string;
  city: string;
};

type Metric = {
  label: string;
  value: string;
  description: string;
};

const metrics: Metric[] = [
  {
    label: 'Profesionales publicados',
    value: '42',
    description: 'Perfiles aprobados y visibles en la galería.',
  },
  {
    label: 'Solicitudes pendientes',
    value: '5',
    description: 'Nuevos perfiles listos para revisión.',
  },
  {
    label: 'Cuentas inactivas',
    value: '2',
    description: 'Perfiles pausados por calidad o disponibilidad.',
  },
  {
    label: 'Satisfacción promedio',
    value: '4.9',
    description: 'Calificaciones verificadas de clientes.',
  },
];

const professionals: ProfessionalRow[] = [
  {
    id: 'mip-001',
    name: 'Aurora Ramírez',
    service: 'Modelaje editorial',
    status: 'Activo',
    lastUpdate: '05 Nov · 10:24',
    city: 'Santiago',
  },
  {
    id: 'mip-014',
    name: 'Ignacio Verdugo',
    service: 'Masajes deportivos',
    status: 'Activo',
    lastUpdate: '04 Nov · 18:02',
    city: 'Viña del Mar',
  },
  {
    id: 'mip-027',
    name: 'Emilia Sofía',
    service: 'Masajes sensoriales',
    status: 'Inactivo',
    lastUpdate: '02 Nov · 09:15',
    city: 'Concepción',
  },
  {
    id: 'mip-032',
    name: 'Renata Alegría',
    service: 'Modelaje beauty',
    status: 'Activo',
    lastUpdate: '02 Nov · 08:40',
    city: 'Santiago',
  },
];

const reportCards = [
  {
    title: 'Performance mensual',
    detail: 'Reservas confirmadas, cancelaciones y top ciudades.',
  },
  {
    title: 'Moderación de contenido',
    detail: 'Alertas de comentarios sensibles y seguimiento de SLA.',
  },
  {
    title: 'Disponibilidad por servicio',
    detail: 'Cruce entre agendas y tendencias de demanda.',
  },
];

const auditTrail = [
  {
    id: 'log-981',
    action: 'Aurora Ramírez · Precio actualizado a $85.000 CLP',
    author: 'Admin principal',
    timestamp: '05 Nov · 10:24',
  },
  {
    id: 'log-972',
    action: 'Se activó cuenta de Ignacio Verdugo',
    author: 'Equipo soporte',
    timestamp: '04 Nov · 18:02',
  },
  {
    id: 'log-958',
    action: 'Nueva promoción publicada por Emilia Sofía',
    author: 'Sistema automático',
    timestamp: '03 Nov · 11:47',
  },
];

const formFields = [
  'Nombre completo',
  'Nacionalidad',
  'Ciudad base',
  'Tipo de servicio',
  'Tarifa CLP',
  'Medidas o especialidad',
  'Portafolio fotográfico',
];

export default function AdminDashboard() {
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'Todos'>('Todos');

  const filteredProfessionals = useMemo(() => {
    if (statusFilter === 'Todos') return professionals;
    return professionals.filter((professional) => professional.status === statusFilter);
  }, [statusFilter]);

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-neutral-900">
      <header className="border-b border-neutral-200 bg-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Panel administrador</p>
            <h1 className="text-2xl font-semibold text-neutral-900">Control integral</h1>
          </div>
          <Link href="/" className="text-sm text-neutral-500 transition hover:text-neutral-900">
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        <section className="grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-neutral-900">{metric.value}</p>
              <p className="mt-2 text-sm text-neutral-500">{metric.description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.55fr,0.45fr]">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <header className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Gestión de profesionales</h2>
                <p className="text-xs text-neutral-500">Agrega, edita o pausa perfiles con formularios claros.</p>
              </div>
              <div className="flex gap-2">
                {(['Todos', 'Activo', 'Inactivo'] as (AccountStatus | 'Todos')[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStatusFilter(option)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      statusFilter === option
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </header>

            <div className="overflow-hidden rounded-2xl border border-neutral-200">
              <table className="min-w-full divide-y divide-neutral-200 text-sm">
                <thead className="bg-neutral-50 text-left uppercase tracking-[0.12em] text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Profesional</th>
                    <th className="px-4 py-3 font-medium">Servicio</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Última acción</th>
                    <th className="px-4 py-3 font-medium">Ciudad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {filteredProfessionals.map((professional) => (
                    <tr key={professional.id}>
                      <td className="px-4 py-4 font-medium text-neutral-900">{professional.name}</td>
                      <td className="px-4 py-4 text-neutral-500">{professional.service}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            professional.status === 'Activo'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {professional.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-neutral-500">{professional.lastUpdate}</td>
                      <td className="px-4 py-4 text-neutral-500">{professional.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900">Alta rápida</h2>
              <p className="mt-2 text-sm text-neutral-500">
                Formularios concisos con validaciones en vivo y previsualización de fotos.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-neutral-600">
                {formFields.map((field) => (
                  <li key={field} className="flex items-center gap-2">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-neutral-900" aria-hidden />
                    {field}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900">Moderación y alertas</h2>
              <p className="mt-2 text-sm text-neutral-500">
                Controla promociones, comentarios y documentación con flujos guiados.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                <li>Activación / desactivación instantánea de perfiles.</li>
                <li>Historial descargable de cambios por administrador.</li>
                <li>Notificaciones automáticas al detectar incidencias.</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.5fr,0.5fr]">
          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Reportes clave</h2>
            <div className="mt-4 grid gap-4">
              {reportCards.map((report) => (
                <div key={report.title} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm">
                  <p className="font-semibold text-neutral-900">{report.title}</p>
                  <p className="mt-1 text-neutral-500">{report.detail}</p>
                </div>
              ))}
            </div>
            <Link
              href="/#reportes"
              className="mt-6 inline-block text-sm font-semibold text-neutral-900 underline underline-offset-4"
            >
              Ver más reportes
            </Link>
          </article>

          <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Actividad reciente</h2>
            <ul className="mt-4 space-y-3 text-sm text-neutral-600">
              {auditTrail.map((entry) => (
                <li key={entry.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <p className="font-medium text-neutral-900">{entry.action}</p>
                  <p className="text-xs text-neutral-500">{entry.author} · {entry.timestamp}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}
