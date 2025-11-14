'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type AccountStatus = 'Activo' | 'Inactivo';

type Professional = {
  id: string;
  name: string;
  service: string;
  status: AccountStatus;
  city: string;
  rate: string;
  rating: string;
  measurements: string;
  lastEdited: string;
};

const initialProfessionals: Professional[] = [
  {
    id: 'mip-001',
    name: 'Aurora Ramírez',
    service: 'Modelaje editorial',
    status: 'Activo',
    city: 'Santiago',
    rate: '$85.000 CLP',
    rating: '4.9',
    measurements: '86 · 62 · 90',
    lastEdited: '05 Nov · 10:24',
  },
  {
    id: 'mip-014',
    name: 'Ignacio Verdugo',
    service: 'Masajes deportivos',
    status: 'Activo',
    city: 'Viña del Mar',
    rate: '$65.000 CLP',
    rating: '4.8',
    measurements: 'Especialista tejido profundo',
    lastEdited: '04 Nov · 18:02',
  },
  {
    id: 'mip-027',
    name: 'Emilia Sofía',
    service: 'Masajes sensoriales',
    status: 'Inactivo',
    city: 'Concepción',
    rate: '$72.000 CLP',
    rating: '4.7',
    measurements: 'Terapia sensorial avanzada',
    lastEdited: '02 Nov · 09:15',
  },
  {
    id: 'mip-032',
    name: 'Renata Alegría',
    service: 'Modelaje beauty',
    status: 'Activo',
    city: 'Santiago',
    rate: '$95.000 CLP',
    rating: '5.0',
    measurements: '84 · 60 · 88',
    lastEdited: '02 Nov · 08:40',
  },
];

type EditableFields = Pick<Professional, 'name' | 'service' | 'city' | 'rate' | 'rating' | 'measurements'>;

const ADMIN_CREDENTIALS = {
  email: 'admin@mipage.cl',
  password: 'password123',
};

export default function AdminDashboard() {
  const [professionals, setProfessionals] = useState<Professional[]>(initialProfessionals);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>(initialProfessionals[0]?.id ?? '');
  const [formValues, setFormValues] = useState<EditableFields>(() => ({
    name: initialProfessionals[0]?.name ?? '',
    service: initialProfessionals[0]?.service ?? '',
    city: initialProfessionals[0]?.city ?? '',
    rate: initialProfessionals[0]?.rate ?? '',
    rating: initialProfessionals[0]?.rating ?? '',
    measurements: initialProfessionals[0]?.measurements ?? '',
  }));
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedProfessional = useMemo(
    () => professionals.find((professional) => professional.id === selectedProfessionalId),
    [professionals, selectedProfessionalId],
  );

  const activeProfessionals = useMemo(
    () => professionals.filter((professional) => professional.status === 'Activo').length,
    [professionals],
  );

  useEffect(() => {
    if (!selectedProfessional) return;
    setFormValues({
      name: selectedProfessional.name,
      service: selectedProfessional.service,
      city: selectedProfessional.city,
      rate: selectedProfessional.rate,
      rating: selectedProfessional.rating,
      measurements: selectedProfessional.measurements,
    });
  }, [selectedProfessional]);

  const updateLastEdited = () => new Date().toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const handleToggleStatus = (id: string) => {
    setProfessionals((current) =>
      current.map((professional) =>
        professional.id === id
          ? {
              ...professional,
              status: professional.status === 'Activo' ? 'Inactivo' : 'Activo',
              lastEdited: `${updateLastEdited()} · Admin`,
            }
          : professional,
      ),
    );
    setFeedback('Estado actualizado.');
  };

  const handleInputChange = (field: keyof EditableFields, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProfessional) return;

    setProfessionals((current) =>
      current.map((professional) =>
        professional.id === selectedProfessional.id
          ? {
              ...professional,
              ...formValues,
              lastEdited: `${updateLastEdited()} · Admin`,
            }
          : professional,
      ),
    );

    setFeedback('Cambios guardados.');
  };

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-neutral-900">
      <header className="border-b border-neutral-200 bg-white/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Administrador</p>
            <h1 className="text-2xl font-semibold text-neutral-900">Control de anuncios</h1>
          </div>
          <Link href="/" className="text-sm text-neutral-500 transition hover:text-neutral-900">
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-10 lg:grid-cols-[0.58fr,0.42fr]">
        <section className="space-y-5">
          <article className="rounded-3xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
            <h2 className="text-sm font-semibold text-neutral-900">Credenciales demo</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Email <span className="font-medium text-neutral-900">{ADMIN_CREDENTIALS.email}</span> · Contraseña{' '}
              <span className="font-medium text-neutral-900">{ADMIN_CREDENTIALS.password}</span>
            </p>
          </article>

          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <header className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Profesionales publicados</h2>
                <p className="text-sm text-neutral-500">Selecciona uno para editar o pausa el anuncio al instante.</p>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">{activeProfessionals} activos</span>
            </header>

            <ul className="space-y-2">
              {professionals.map((professional) => {
                const isSelected = professional.id === selectedProfessionalId;
                return (
                  <li key={professional.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 transition hover:bg-white">
                    <button
                      type="button"
                      className={`flex w-full flex-col gap-3 rounded-2xl px-4 py-4 text-left transition ${
                        isSelected ? 'border border-neutral-900 bg-white shadow-sm' : ''
                      }`}
                      onClick={() => setSelectedProfessionalId(professional.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{professional.name}</p>
                          <p className="text-xs text-neutral-500">
                            {professional.service} · {professional.city}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleToggleStatus(professional.id);
                          }}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            professional.status === 'Activo'
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                          }`}
                        >
                          {professional.status === 'Activo' ? 'Activo · Desactivar' : 'Inactivo · Activar'}
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-neutral-500">
                        <span>Tarifa {professional.rate}</span>
                        <span>Rating {professional.rating}</span>
                        <span>Medidas / especialidad {professional.measurements}</span>
                      </div>
                      <p className="text-xs text-neutral-400">Última edición {professional.lastEdited}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <header className="mb-5 space-y-1">
            <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Ficha seleccionada</p>
            <h2 className="text-xl font-semibold text-neutral-900">{selectedProfessional?.name ?? 'Selecciona un perfil'}</h2>
            {selectedProfessional && (
              <p className="text-xs text-neutral-500">ID {selectedProfessional.id} · Estado {selectedProfessional.status}</p>
            )}
          </header>

          {selectedProfessional ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <fieldset className="grid gap-4">
                <label className="text-sm text-neutral-600">
                  Nombre profesional
                  <input
                    type="text"
                    value={formValues.name}
                    onChange={(event) => handleInputChange('name', event.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                    required
                  />
                </label>

                <label className="text-sm text-neutral-600">
                  Servicio principal
                  <input
                    type="text"
                    value={formValues.service}
                    onChange={(event) => handleInputChange('service', event.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                    required
                  />
                </label>

                <label className="text-sm text-neutral-600">
                  Ciudad base
                  <input
                    type="text"
                    value={formValues.city}
                    onChange={(event) => handleInputChange('city', event.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                    required
                  />
                </label>

                <label className="text-sm text-neutral-600">
                  Tarifa publicada
                  <input
                    type="text"
                    value={formValues.rate}
                    onChange={(event) => handleInputChange('rate', event.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                    required
                  />
                </label>

                <label className="text-sm text-neutral-600">
                  Calificación visible
                  <input
                    type="text"
                    value={formValues.rating}
                    onChange={(event) => handleInputChange('rating', event.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                    required
                  />
                </label>

                <label className="text-sm text-neutral-600">
                  Medidas / especialidad
                  <input
                    type="text"
                    value={formValues.measurements}
                    onChange={(event) => handleInputChange('measurements', event.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                    required
                  />
                </label>
              </fieldset>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedProfessional.id)}
                  className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                >
                  {selectedProfessional.status === 'Activo' ? 'Pausar anuncio' : 'Reactivar anuncio'}
                </button>
              </div>

              {feedback && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {feedback}
                </div>
              )}
            </form>
          ) : (
            <p className="text-sm text-neutral-500">Selecciona un profesional para editar su anuncio.</p>
          )}
        </section>
      </main>
    </div>
  );
}
