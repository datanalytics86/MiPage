'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/lib/auth';

type AccountStatus = 'Activo' | 'Inactivo';

type Service = {
  id: string;
  name: string;
  description: string;
  subcategories: string[];
  createdAt: string;
  updatedAt: string;
};

type MeasurementField = {
  id: string;
  label: string;
  isLocked?: boolean;
};

type AttributeOption = {
  id: string;
  label: string;
  isLocked?: boolean;
};

type CustomField = {
  id: string;
  label: string;
  description?: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  isLocked?: boolean;
};

type AttributeConfig = {
  measurements: MeasurementField[];
  nationalities: AttributeOption[];
  genders: AttributeOption[];
  customFields: CustomField[];
};

type Professional = {
  id: string;
  name: string;
  serviceId: string;
  status: AccountStatus;
  city: string;
  rate: string;
  rating: string;
  nationalityId: string;
  genderId: string;
  measurements: Record<string, string>;
  customValues: Record<string, string>;
  lastEdited: string;
};

type AdminSection = 'ANUNCIOS' | 'CONFIGURACION' | 'USUARIOS' | 'REPORTES';

const ADMIN_CREDENTIALS = {
  email: 'admin@mipage.cl',
  password: 'password123',
};

const initialServices: Service[] = [
  {
    id: 'service-modelaje-editorial',
    name: 'Modelaje editorial',
    description: 'Campañas de moda, beauty y editoriales impresas.',
    subcategories: ['Beauty', 'Pasarela minimalista'],
    createdAt: '12 Oct 2024 · 10:15',
    updatedAt: '28 Oct 2024 · 18:02',
  },
  {
    id: 'service-masaje-terapeutico',
    name: 'Masaje terapéutico',
    description: 'Sesiones clínicas y deportivas de tejido profundo.',
    subcategories: ['Deportivo', 'Recuperación'],
    createdAt: '18 Oct 2024 · 12:42',
    updatedAt: '02 Nov 2024 · 09:27',
  },
  {
    id: 'service-masaje-sensorial',
    name: 'Masaje sensorial',
    description: 'Experiencias inmersivas con aromaterapia y musicoterapia.',
    subcategories: ['Aromaterapia', 'Mindfulness'],
    createdAt: '23 Oct 2024 · 16:30',
    updatedAt: '04 Nov 2024 · 20:12',
  },
];

const initialAttributes: AttributeConfig = {
  measurements: [
    { id: 'altura', label: 'Altura (cm)', isLocked: true },
    { id: 'peso', label: 'Peso (kg)', isLocked: true },
    { id: 'busto', label: 'Busto (cm)', isLocked: true },
    { id: 'cintura', label: 'Cintura (cm)', isLocked: true },
    { id: 'cadera', label: 'Cadera (cm)', isLocked: true },
  ],
  nationalities: [
    { id: 'cl', label: 'Chile', isLocked: true },
    { id: 'ar', label: 'Argentina' },
    { id: 'pe', label: 'Perú' },
  ],
  genders: [
    { id: 'f', label: 'Femenino', isLocked: true },
    { id: 'm', label: 'Masculino' },
    { id: 'nb', label: 'No binario' },
  ],
  customFields: [
    { id: 'experiencia', label: 'Experiencia', description: 'Años o certificaciones principales.', type: 'text', isLocked: true },
    { id: 'idiomas', label: 'Idiomas', description: 'Idiomas en los que atiende.', type: 'text' },
    { id: 'colorCabello', label: 'Color de cabello', type: 'text' },
  ],
};

const initialProfessionals: Professional[] = [
  {
    id: 'mip-001',
    name: 'Aurora Ramírez',
    serviceId: 'service-modelaje-editorial',
    status: 'Activo',
    city: 'Santiago',
    rate: '$85.000 CLP',
    rating: '4.9',
    nationalityId: 'cl',
    genderId: 'f',
    measurements: {
      altura: '178',
      peso: '58',
      busto: '86',
      cintura: '62',
      cadera: '90',
    },
    customValues: {
      experiencia: '6 años en pasarela y beauty',
      idiomas: 'Español · Inglés',
      colorCabello: 'Castaño oscuro',
    },
    lastEdited: '05 Nov · 10:24',
  },
  {
    id: 'mip-014',
    name: 'Ignacio Verdugo',
    serviceId: 'service-masaje-terapeutico',
    status: 'Activo',
    city: 'Viña del Mar',
    rate: '$65.000 CLP',
    rating: '4.8',
    nationalityId: 'cl',
    genderId: 'm',
    measurements: {
      altura: '182',
      peso: '82',
      busto: '—',
      cintura: '—',
      cadera: '—',
    },
    customValues: {
      experiencia: '8 años · Kinesiología deportiva',
      idiomas: 'Español · Portugués',
      colorCabello: 'Negro',
    },
    lastEdited: '04 Nov · 18:02',
  },
  {
    id: 'mip-027',
    name: 'Emilia Sofía',
    serviceId: 'service-masaje-sensorial',
    status: 'Inactivo',
    city: 'Concepción',
    rate: '$72.000 CLP',
    rating: '4.7',
    nationalityId: 'ar',
    genderId: 'f',
    measurements: {
      altura: '170',
      peso: '57',
      busto: '84',
      cintura: '61',
      cadera: '88',
    },
    customValues: {
      experiencia: '5 años · Aromaterapia clínica',
      idiomas: 'Español · Inglés',
      colorCabello: 'Rubio cobrizo',
    },
    lastEdited: '02 Nov · 09:15',
  },
  {
    id: 'mip-032',
    name: 'Renata Alegría',
    serviceId: 'service-modelaje-editorial',
    status: 'Activo',
    city: 'Santiago',
    rate: '$95.000 CLP',
    rating: '5.0',
    nationalityId: 'cl',
    genderId: 'f',
    measurements: {
      altura: '176',
      peso: '56',
      busto: '84',
      cintura: '60',
      cadera: '88',
    },
    customValues: {
      experiencia: '7 años · Campañas beauty',
      idiomas: 'Español · Inglés · Francés',
      colorCabello: 'Castaño claro',
    },
    lastEdited: '02 Nov · 08:40',
  },
];

const formatAdminTimestamp = () =>
  new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(new Date())
    .replace('.', '');

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, expiresAt, logout } = useAuthStore();

  const [canRender, setCanRender] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>('ANUNCIOS');
  const [professionals, setProfessionals] = useState<Professional[]>(initialProfessionals);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [attributeConfig, setAttributeConfig] = useState<AttributeConfig>(initialAttributes);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>(initialProfessionals[0]?.id ?? '');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServices[0]?.id ?? '');

  const [dashboardFeedback, setDashboardFeedback] = useState<string | null>(null);
  const [configFeedback, setConfigFeedback] = useState<string | null>(null);

  const [newMeasurementLabel, setNewMeasurementLabel] = useState('');
  const [newNationality, setNewNationality] = useState('');
  const [newGender, setNewGender] = useState('');
  const [newCustomField, setNewCustomField] = useState({ label: '', description: '', type: 'text' as CustomField['type'] });
  const [newServiceDraft, setNewServiceDraft] = useState({ name: '', description: '', subcategory: '' });
  const [serviceDraft, setServiceDraft] = useState({ name: '', description: '', subcategory: '' });

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.replace('/auth/login?redirect=/admin');
      return;
    }

    if (expiresAt && expiresAt <= Date.now()) {
      logout();
      router.replace('/auth/login?redirect=/admin&reason=expired');
      return;
    }

    setCanRender(true);
  }, [expiresAt, hasHydrated, isAuthenticated, logout, router, user]);

  const measurementTemplate = useMemo(() => {
    return attributeConfig.measurements.reduce<Record<string, string>>((acc, field) => {
      acc[field.id] = '';
      return acc;
    }, {});
  }, [attributeConfig.measurements]);

  const customTemplate = useMemo(() => {
    return attributeConfig.customFields.reduce<Record<string, string>>((acc, field) => {
      acc[field.id] = '';
      return acc;
    }, {});
  }, [attributeConfig.customFields]);

  const serviceDictionary = useMemo(() => {
    return services.reduce<Record<string, Service>>((acc, service) => {
      acc[service.id] = service;
      return acc;
    }, {});
  }, [services]);

  const selectedProfessional = useMemo(
    () => professionals.find((professional) => professional.id === selectedProfessionalId) ?? null,
    [professionals, selectedProfessionalId],
  );

  const selectedService = useMemo(
    () => serviceDictionary[selectedServiceId] ?? null,
    [serviceDictionary, selectedServiceId],
  );

  const activeProfessionals = useMemo(
    () => professionals.filter((professional) => professional.status === 'Activo').length,
    [professionals],
  );

  const inactiveProfessionals = useMemo(
    () => professionals.filter((professional) => professional.status === 'Inactivo'),
    [professionals],
  );

  const serviceUsage = useMemo(() => {
    return services.map((service) => ({
      service,
      total: professionals.filter((professional) => professional.serviceId === service.id).length,
      activos: professionals.filter(
        (professional) => professional.serviceId === service.id && professional.status === 'Activo',
      ).length,
    }));
  }, [professionals, services]);

  const averageRating = useMemo(() => {
    const ratings = professionals
      .map((professional) => Number.parseFloat(professional.rating.replace(',', '.')))
      .filter((value) => !Number.isNaN(value));

    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, value) => acc + value, 0);
    return Number((sum / ratings.length).toFixed(2));
  }, [professionals]);

  const [formValues, setFormValues] = useState(() => {
    if (!selectedProfessional) {
      return {
        name: '',
        serviceId: services[0]?.id ?? '',
        city: '',
        rate: '',
        rating: '',
        nationalityId: attributeConfig.nationalities[0]?.id ?? '',
        genderId: attributeConfig.genders[0]?.id ?? '',
        measurements: measurementTemplate,
        customValues: customTemplate,
      };
    }

    return {
      name: selectedProfessional.name,
      serviceId: selectedProfessional.serviceId,
      city: selectedProfessional.city,
      rate: selectedProfessional.rate,
      rating: selectedProfessional.rating,
      nationalityId: selectedProfessional.nationalityId,
      genderId: selectedProfessional.genderId,
      measurements: { ...measurementTemplate, ...selectedProfessional.measurements },
      customValues: { ...customTemplate, ...selectedProfessional.customValues },
    };
  });

  useEffect(() => {
    if (!selectedProfessional) {
      setFormValues({
        name: '',
        serviceId: services[0]?.id ?? '',
        city: '',
        rate: '',
        rating: '',
        nationalityId: attributeConfig.nationalities[0]?.id ?? '',
        genderId: attributeConfig.genders[0]?.id ?? '',
        measurements: measurementTemplate,
        customValues: customTemplate,
      });
      return;
    }

    setFormValues({
      name: selectedProfessional.name,
      serviceId: selectedProfessional.serviceId,
      city: selectedProfessional.city,
      rate: selectedProfessional.rate,
      rating: selectedProfessional.rating,
      nationalityId: selectedProfessional.nationalityId,
      genderId: selectedProfessional.genderId,
      measurements: { ...measurementTemplate, ...selectedProfessional.measurements },
      customValues: { ...customTemplate, ...selectedProfessional.customValues },
    });
  }, [
    selectedProfessional,
    measurementTemplate,
    customTemplate,
    attributeConfig.genders,
    attributeConfig.nationalities,
    services,
  ]);

  useEffect(() => {
    if (!selectedService) {
      setServiceDraft({ name: '', description: '', subcategory: '' });
      return;
    }

    setServiceDraft({
      name: selectedService.name,
      description: selectedService.description,
      subcategory: '',
    });
  }, [selectedService]);

  useEffect(() => {
    if (!dashboardFeedback) return;
    const timeout = window.setTimeout(() => setDashboardFeedback(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [dashboardFeedback]);

  useEffect(() => {
    if (!configFeedback) return;
    const timeout = window.setTimeout(() => setConfigFeedback(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [configFeedback]);

  const updateLastEdited = () => `${formatAdminTimestamp()} · Admin`;

  const handleToggleStatus = (id: string) => {
    setProfessionals((current) =>
      current.map((professional) =>
        professional.id === id
          ? {
              ...professional,
              status: professional.status === 'Activo' ? 'Inactivo' : 'Activo',
              lastEdited: updateLastEdited(),
            }
          : professional,
      ),
    );
    setDashboardFeedback('Estado del anuncio actualizado.');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProfessional) return;

    setProfessionals((current) =>
      current.map((professional) =>
        professional.id === selectedProfessional.id
          ? {
              ...professional,
              name: formValues.name,
              serviceId: formValues.serviceId,
              city: formValues.city,
              rate: formValues.rate,
              rating: formValues.rating,
              nationalityId: formValues.nationalityId,
              genderId: formValues.genderId,
              measurements: { ...formValues.measurements },
              customValues: { ...formValues.customValues },
              lastEdited: updateLastEdited(),
            }
          : professional,
      ),
    );

    setDashboardFeedback('Ficha actualizada correctamente.');
  };

  const handleMeasurementChange = (measurementId: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [measurementId]: value,
      },
    }));
  };

  const handleCustomValueChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      customValues: {
        ...prev.customValues,
        [fieldId]: value,
      },
    }));
  };

  const handleServiceDraftChange = (field: 'name' | 'description', value: string) => {
    setServiceDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedService) return;
    if (!serviceDraft.name.trim()) {
      setConfigFeedback('El servicio necesita un nombre.');
      return;
    }

    setServices((current) =>
      current.map((service) =>
        service.id === selectedService.id
          ? {
              ...service,
              name: serviceDraft.name.trim(),
              description: serviceDraft.description.trim(),
              updatedAt: updateLastEdited(),
            }
          : service,
      ),
    );

    setConfigFeedback('Servicio actualizado.');
  };

  const handleAddSubcategory = () => {
    if (!selectedService) return;
    if (!serviceDraft.subcategory.trim()) return;

    const newLabel = serviceDraft.subcategory.trim();
    setServices((current) =>
      current.map((service) =>
        service.id === selectedService.id
          ? {
              ...service,
              subcategories: Array.from(new Set([...service.subcategories, newLabel])),
              updatedAt: updateLastEdited(),
            }
          : service,
      ),
    );
    setServiceDraft((prev) => ({ ...prev, subcategory: '' }));
    setConfigFeedback('Subcategoría añadida.');
  };

  const handleRemoveSubcategory = (subcategory: string) => {
    if (!selectedService) return;
    if (!window.confirm(`¿Eliminar la subcategoría «${subcategory}»?`)) return;

    setServices((current) =>
      current.map((service) =>
        service.id === selectedService.id
          ? {
              ...service,
              subcategories: service.subcategories.filter((item) => item !== subcategory),
              updatedAt: updateLastEdited(),
            }
          : service,
      ),
    );
    setConfigFeedback('Subcategoría eliminada.');
  };

  const handleCreateService = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newServiceDraft.name.trim()) {
      setConfigFeedback('El nuevo servicio requiere un nombre.');
      return;
    }

    const timestamp = updateLastEdited();
    const subcategories = newServiceDraft.subcategory
      ? [newServiceDraft.subcategory.trim()]
      : [];

    const newService: Service = {
      id: `service-${Date.now()}`,
      name: newServiceDraft.name.trim(),
      description: newServiceDraft.description.trim(),
      subcategories,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setServices((current) => [...current, newService]);
    setSelectedServiceId(newService.id);
    setNewServiceDraft({ name: '', description: '', subcategory: '' });
    setConfigFeedback('Nuevo servicio creado.');
  };

  const handleDeleteService = (serviceId: string) => {
    const service = serviceDictionary[serviceId];
    if (!service) return;

    if (professionals.some((professional) => professional.serviceId === serviceId)) {
      setConfigFeedback('No es posible eliminar un servicio asignado a profesionales.');
      return;
    }

    if (!window.confirm(`¿Eliminar el servicio «${service.name}»?`)) return;

    setServices((current) => {
      const updated = current.filter((item) => item.id !== serviceId);
      if (selectedServiceId === serviceId) {
        setSelectedServiceId(updated[0]?.id ?? '');
      }
      return updated;
    });
    setConfigFeedback('Servicio eliminado.');
  };

  const handleReorderService = (serviceId: string, direction: 'up' | 'down') => {
    setServices((current) => {
      const index = current.findIndex((service) => service.id === serviceId);
      if (index === -1) return current;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= current.length) return current;

      const reordered = [...current];
      const [service] = reordered.splice(index, 1);
      reordered.splice(newIndex, 0, service);
      return reordered;
    });
  };

  const ensureUniqueId = (label: string) =>
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `custom-${Date.now()}`;

  const handleAddMeasurementField = () => {
    const trimmed = newMeasurementLabel.trim();
    if (!trimmed) return;

    const id = ensureUniqueId(trimmed);
    if (attributeConfig.measurements.some((field) => field.id === id)) {
      setConfigFeedback('Ya existe un campo con ese nombre.');
      return;
    }

    const newField: MeasurementField = { id, label: trimmed };
    setAttributeConfig((current) => ({
      ...current,
      measurements: [...current.measurements, newField],
    }));
    setProfessionals((current) =>
      current.map((professional) => ({
        ...professional,
        measurements: { ...professional.measurements, [id]: '' },
      })),
    );
    setNewMeasurementLabel('');
    setConfigFeedback('Campo de medida agregado.');
  };

  const handleRemoveMeasurementField = (field: MeasurementField) => {
    if (field.isLocked) {
      setConfigFeedback('Este campo es obligatorio y no puede eliminarse.');
      return;
    }

    if (!window.confirm(`¿Eliminar el campo de medida «${field.label}»?`)) return;

    setAttributeConfig((current) => ({
      ...current,
      measurements: current.measurements.filter((item) => item.id !== field.id),
    }));
    setProfessionals((current) =>
      current.map((professional) => {
        const { [field.id]: _removed, ...rest } = professional.measurements;
        return {
          ...professional,
          measurements: rest,
        };
      }),
    );
    setConfigFeedback('Campo de medida eliminado.');
  };

  const handleAddNationality = () => {
    const trimmed = newNationality.trim();
    if (!trimmed) return;
    const id = ensureUniqueId(trimmed);
    if (attributeConfig.nationalities.some((option) => option.id === id)) {
      setConfigFeedback('Ya existe esa nacionalidad.');
      return;
    }

    setAttributeConfig((current) => ({
      ...current,
      nationalities: [...current.nationalities, { id, label: trimmed }],
    }));
    setNewNationality('');
    setConfigFeedback('Nacionalidad agregada.');
  };

  const handleRemoveNationality = (option: AttributeOption) => {
    if (option.isLocked) {
      setConfigFeedback('No puedes eliminar la nacionalidad base.');
      return;
    }

    if (professionals.some((professional) => professional.nationalityId === option.id)) {
      setConfigFeedback('Hay profesionales usando esta nacionalidad.');
      return;
    }

    if (!window.confirm(`¿Eliminar la nacionalidad «${option.label}»?`)) return;

    setAttributeConfig((current) => ({
      ...current,
      nationalities: current.nationalities.filter((item) => item.id !== option.id),
    }));
    setConfigFeedback('Nacionalidad eliminada.');
  };

  const handleAddGender = () => {
    const trimmed = newGender.trim();
    if (!trimmed) return;
    const id = ensureUniqueId(trimmed);
    if (attributeConfig.genders.some((option) => option.id === id)) {
      setConfigFeedback('Ya existe esa categoría de género.');
      return;
    }

    setAttributeConfig((current) => ({
      ...current,
      genders: [...current.genders, { id, label: trimmed }],
    }));
    setNewGender('');
    setConfigFeedback('Género agregado.');
  };

  const handleRemoveGender = (option: AttributeOption) => {
    if (option.isLocked) {
      setConfigFeedback('No puedes eliminar la opción predeterminada.');
      return;
    }

    if (professionals.some((professional) => professional.genderId === option.id)) {
      setConfigFeedback('Hay profesionales usando esta categoría.');
      return;
    }

    if (!window.confirm(`¿Eliminar la categoría «${option.label}»?`)) return;

    setAttributeConfig((current) => ({
      ...current,
      genders: current.genders.filter((item) => item.id !== option.id),
    }));
    setConfigFeedback('Categoría eliminada.');
  };

  const handleAddCustomField = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedLabel = newCustomField.label.trim();
    if (!trimmedLabel) {
      setConfigFeedback('El campo necesita un nombre visible.');
      return;
    }

    const id = ensureUniqueId(trimmedLabel);
    if (attributeConfig.customFields.some((field) => field.id === id)) {
      setConfigFeedback('Ya existe un campo con ese identificador.');
      return;
    }

    const field: CustomField = {
      id,
      label: trimmedLabel,
      description: newCustomField.description?.trim() || undefined,
      type: newCustomField.type,
    };

    setAttributeConfig((current) => ({
      ...current,
      customFields: [...current.customFields, field],
    }));
    setProfessionals((current) =>
      current.map((professional) => ({
        ...professional,
        customValues: { ...professional.customValues, [id]: '' },
      })),
    );
    setNewCustomField({ label: '', description: '', type: 'text' });
    setConfigFeedback('Campo personalizado agregado.');
  };

  const handleRemoveCustomField = (field: CustomField) => {
    if (field.isLocked) {
      setConfigFeedback('Este campo es obligatorio y no puede eliminarse.');
      return;
    }

    if (professionals.some((professional) => professional.customValues[field.id])) {
      setConfigFeedback('Limpia los datos asociados antes de eliminar este campo.');
      return;
    }

    if (!window.confirm(`¿Eliminar el campo «${field.label}»?`)) return;

    setAttributeConfig((current) => ({
      ...current,
      customFields: current.customFields.filter((item) => item.id !== field.id),
    }));
    setProfessionals((current) =>
      current.map((professional) => {
        const { [field.id]: _removed, ...rest } = professional.customValues;
        return {
          ...professional,
          customValues: rest,
        };
      }),
    );
    setConfigFeedback('Campo personalizado eliminado.');
  };

  if (!canRender) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c0c0c] text-sm text-neutral-300">
        Verificando acceso seguro...
      </div>
    );
  }

  const sectionTabs: { id: AdminSection; label: string }[] = [
    { id: 'ANUNCIOS', label: 'Anuncios' },
    { id: 'CONFIGURACION', label: 'Configuración' },
    { id: 'USUARIOS', label: 'Usuarios' },
    { id: 'REPORTES', label: 'Reportes' },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-neutral-900">
      <header className="border-b border-neutral-200 bg-white/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Administrador</p>
            <h1 className="text-2xl font-semibold text-neutral-900">Panel de control MiPage</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-neutral-200 px-3 py-1 text-neutral-600">
              Sesión {user?.email}
            </span>
            <Link href="/" className="text-neutral-500 transition hover:text-neutral-900">
              Ver portada
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-8 rounded-3xl border border-neutral-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Acceso de demostración</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Email <span className="font-medium text-neutral-900">{ADMIN_CREDENTIALS.email}</span> · Contraseña{' '}
                <span className="font-medium text-neutral-900">{ADMIN_CREDENTIALS.password}</span>
              </p>
            </div>
            <div className="flex gap-2 text-xs uppercase tracking-[0.2em] text-neutral-400">
              <span>{professionals.length} profesionales</span>
              <span>{services.length} servicios</span>
              <span>{attributeConfig.measurements.length} medidas</span>
            </div>
          </div>
        </section>

        <nav className="mb-8 flex flex-wrap gap-3">
          {sectionTabs.map((tab) => {
            const isActive = tab.id === activeSection;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`rounded-full px-5 py-2 text-sm transition ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'border border-neutral-300 bg-white text-neutral-600 hover:border-neutral-900 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
        {activeSection === 'ANUNCIOS' && (
          <div className="grid gap-8 lg:grid-cols-[0.5fr,0.5fr]">
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <header className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Listado de anuncios</h2>
                  <p className="text-sm text-neutral-500">Selecciona un profesional para actualizar datos o estado.</p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">{activeProfessionals} activos</span>
              </header>

              <ul className="space-y-2">
                {professionals.map((professional) => {
                  const isSelected = professional.id === selectedProfessionalId;
                  const serviceName = serviceDictionary[professional.serviceId]?.name ?? 'Sin servicio';
                  const nationality = attributeConfig.nationalities.find((option) => option.id === professional.nationalityId)?.label;

                  return (
                    <li key={professional.id}>
                      <button
                        type="button"
                        className={`flex w-full flex-col gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                          isSelected
                            ? 'border-neutral-900 bg-white shadow-sm'
                            : 'border-neutral-200 bg-neutral-50 hover:border-neutral-900 hover:bg-white'
                        }`}
                        onClick={() => setSelectedProfessionalId(professional.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">{professional.name}</p>
                            <p className="text-xs text-neutral-500">
                              {serviceName} · {professional.city} · {nationality ?? 'N/D'}
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
                          <span>Actualizado {professional.lastEdited}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
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
                        onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                        required
                      />
                    </label>

                    <label className="text-sm text-neutral-600">
                      Servicio principal
                      <select
                        value={formValues.serviceId}
                        onChange={(event) => setFormValues((prev) => ({ ...prev, serviceId: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                        required
                      >
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm text-neutral-600">
                      Ciudad base
                      <input
                        type="text"
                        value={formValues.city}
                        onChange={(event) => setFormValues((prev) => ({ ...prev, city: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                        required
                      />
                    </label>

                    <label className="text-sm text-neutral-600">
                      Nacionalidad
                      <select
                        value={formValues.nationalityId}
                        onChange={(event) => setFormValues((prev) => ({ ...prev, nationalityId: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                        required
                      >
                        {attributeConfig.nationalities.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm text-neutral-600">
                      Género
                      <select
                        value={formValues.genderId}
                        onChange={(event) => setFormValues((prev) => ({ ...prev, genderId: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                        required
                      >
                        {attributeConfig.genders.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm text-neutral-600">
                      Tarifa publicada
                      <input
                        type="text"
                        value={formValues.rate}
                        onChange={(event) => setFormValues((prev) => ({ ...prev, rate: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                        required
                      />
                    </label>

                    <label className="text-sm text-neutral-600">
                      Calificación visible
                      <input
                        type="text"
                        value={formValues.rating}
                        onChange={(event) => setFormValues((prev) => ({ ...prev, rating: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                        required
                      />
                    </label>
                  </fieldset>

                  <fieldset className="space-y-3">
                    <legend className="text-sm font-semibold text-neutral-900">Medidas configurables</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {attributeConfig.measurements.map((field) => (
                        <label key={field.id} className="text-xs text-neutral-600">
                          {field.label}
                          <input
                            type="text"
                            value={formValues.measurements[field.id] ?? ''}
                            onChange={(event) => handleMeasurementChange(field.id, event.target.value)}
                            className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                          />
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {attributeConfig.customFields.length > 0 && (
                    <fieldset className="space-y-3">
                      <legend className="text-sm font-semibold text-neutral-900">Campos personalizados</legend>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {attributeConfig.customFields.map((field) => (
                          <label key={field.id} className="text-xs text-neutral-600">
                            {field.label}
                            <input
                              type="text"
                              value={formValues.customValues[field.id] ?? ''}
                              onChange={(event) => handleCustomValueChange(field.id, event.target.value)}
                              className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
                            />
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )}

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

                  {dashboardFeedback && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {dashboardFeedback}
                    </div>
                  )}
                </form>
              ) : (
                <p className="text-sm text-neutral-500">Selecciona un profesional para editar su anuncio.</p>
              )}
            </section>
          </div>
        )}
        {activeSection === 'CONFIGURACION' && (
          <div className="grid gap-8 xl:grid-cols-[0.5fr,0.5fr]">
            <section className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <header className="space-y-1">
                <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Servicios</p>
                <h2 className="text-lg font-semibold text-neutral-900">Catálogo configurable</h2>
              </header>

              <div className="space-y-4">
                <ul className="space-y-2">
                  {services.map((service, index) => {
                    const isActive = service.id === selectedServiceId;
                    return (
                      <li key={service.id}>
                        <div
                          className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 transition ${
                            isActive
                              ? 'border-neutral-900 bg-white shadow-sm'
                              : 'border-neutral-200 bg-neutral-50 hover:border-neutral-900 hover:bg-white'
                          }`}
                        >
                          <button
                            type="button"
                            className="flex items-start justify-between gap-3 text-left"
                            onClick={() => setSelectedServiceId(service.id)}
                          >
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">{service.name}</p>
                              <p className="text-xs text-neutral-500">{service.description || 'Sin descripción'}</p>
                            </div>
                            <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">{service.subcategories.length} subcategorías</span>
                          </button>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                            <button
                              type="button"
                              onClick={() => handleReorderService(service.id, 'up')}
                              className="rounded-full border border-neutral-300 px-3 py-1 transition hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-300"
                              disabled={index === 0}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReorderService(service.id, 'down')}
                              className="rounded-full border border-neutral-300 px-3 py-1 transition hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-300"
                              disabled={index === services.length - 1}
                            >
                              ↓
                            </button>
                            <span>Creado {service.createdAt}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(service.id)}
                            className="self-start text-xs font-semibold text-lust-600 transition hover:text-lust-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {selectedService && (
                  <form onSubmit={handleServiceUpdate} className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <h3 className="text-sm font-semibold text-neutral-900">Editar servicio</h3>
                    <label className="text-xs text-neutral-600">
                      Nombre
                      <input
                        type="text"
                        value={serviceDraft.name}
                        onChange={(event) => handleServiceDraftChange('name', event.target.value)}
                        className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                        required
                      />
                    </label>
                    <label className="text-xs text-neutral-600">
                      Descripción
                      <textarea
                        value={serviceDraft.description}
                        onChange={(event) => handleServiceDraftChange('description', event.target.value)}
                        className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                        rows={3}
                      />
                    </label>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-neutral-900">Subcategorías</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedService.subcategories.map((subcategory) => (
                          <span
                            key={subcategory}
                            className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700"
                          >
                            {subcategory}
                            <button
                              type="button"
                              onClick={() => handleRemoveSubcategory(subcategory)}
                              className="text-neutral-500 hover:text-neutral-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={serviceDraft.subcategory}
                          onChange={(event) => setServiceDraft((prev) => ({ ...prev, subcategory: event.target.value }))}
                          placeholder="Nueva subcategoría"
                          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddSubcategory}
                          className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                        >
                          Añadir
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                    >
                      Guardar servicio
                    </button>
                  </form>
                )}

                <form onSubmit={handleCreateService} className="space-y-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
                  <h3 className="text-sm font-semibold text-neutral-900">Crear nuevo servicio</h3>
                  <label className="text-xs text-neutral-600">
                    Nombre
                    <input
                      type="text"
                      value={newServiceDraft.name}
                      onChange={(event) => setNewServiceDraft((prev) => ({ ...prev, name: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                      required
                    />
                  </label>
                  <label className="text-xs text-neutral-600">
                    Descripción
                    <textarea
                      value={newServiceDraft.description}
                      onChange={(event) => setNewServiceDraft((prev) => ({ ...prev, description: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                      rows={3}
                    />
                  </label>
                  <label className="text-xs text-neutral-600">
                    Subcategoría inicial
                    <input
                      type="text"
                      value={newServiceDraft.subcategory}
                      onChange={(event) => setNewServiceDraft((prev) => ({ ...prev, subcategory: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Crear servicio
                  </button>
                </form>
              </div>
            </section>

            <section className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <header className="space-y-1">
                <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Atributos</p>
                <h2 className="text-lg font-semibold text-neutral-900">Campos dinámicos</h2>
              </header>

              <div className="space-y-6">
                <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900">Medidas</h3>
                    <span className="text-xs text-neutral-500">{attributeConfig.measurements.length} campos</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attributeConfig.measurements.map((field) => (
                      <span key={field.id} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-neutral-700">
                        {field.label}
                        <button
                          type="button"
                          onClick={() => handleRemoveMeasurementField(field)}
                          className="text-neutral-400 hover:text-neutral-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMeasurementLabel}
                      onChange={(event) => setNewMeasurementLabel(event.target.value)}
                      placeholder="Nombre del campo"
                      className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddMeasurementField}
                      className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
                <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900">Nacionalidades</h3>
                    <span className="text-xs text-neutral-500">{attributeConfig.nationalities.length} opciones</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attributeConfig.nationalities.map((option) => (
                      <span key={option.id} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-neutral-700">
                        {option.label}
                        <button
                          type="button"
                          onClick={() => handleRemoveNationality(option)}
                          className="text-neutral-400 hover:text-neutral-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newNationality}
                      onChange={(event) => setNewNationality(event.target.value)}
                      placeholder="Agregar nacionalidad"
                      className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddNationality}
                      className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900">Géneros</h3>
                    <span className="text-xs text-neutral-500">{attributeConfig.genders.length} opciones</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attributeConfig.genders.map((option) => (
                      <span key={option.id} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-neutral-700">
                        {option.label}
                        <button
                          type="button"
                          onClick={() => handleRemoveGender(option)}
                          className="text-neutral-400 hover:text-neutral-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newGender}
                      onChange={(event) => setNewGender(event.target.value)}
                      placeholder="Agregar categoría"
                      className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddGender}
                      className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                <form onSubmit={handleAddCustomField} className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900">Campos personalizados</h3>
                    <span className="text-xs text-neutral-500">{attributeConfig.customFields.length} activos</span>
                  </div>
                  <div className="space-y-2">
                    {attributeConfig.customFields.map((field) => (
                      <div key={field.id} className="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-3 text-xs text-neutral-600">
                        <div>
                          <p className="font-semibold text-neutral-900">{field.label}</p>
                          {field.description && <p className="mt-1 text-neutral-500">{field.description}</p>}
                          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-neutral-400">Tipo {field.type}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(field)}
                          className="text-neutral-400 hover:text-neutral-900"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="text-xs text-neutral-600">
                    Nombre del campo
                    <input
                      type="text"
                      value={newCustomField.label}
                      onChange={(event) => setNewCustomField((prev) => ({ ...prev, label: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                      required
                    />
                  </label>
                  <label className="text-xs text-neutral-600">
                    Descripción opcional
                    <textarea
                      value={newCustomField.description}
                      onChange={(event) => setNewCustomField((prev) => ({ ...prev, description: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                      rows={2}
                    />
                  </label>
                  <label className="text-xs text-neutral-600">
                    Tipo de dato
                    <select
                      value={newCustomField.type}
                      onChange={(event) => setNewCustomField((prev) => ({ ...prev, type: event.target.value as CustomField['type'] }))}
                      className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    >
                      <option value="text">Texto</option>
                      <option value="number">Número</option>
                      <option value="select">Selección</option>
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Añadir campo
                  </button>
                </form>

                {configFeedback && (
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                    {configFeedback}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
        {activeSection === 'USUARIOS' && (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Activos</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-900">{activeProfessionals}</p>
                <p className="text-xs text-neutral-500">Profesionales publicados en la vitrina.</p>
              </div>
              <div className="rounded-3xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Inactivos</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-900">{inactiveProfessionals.length}</p>
                <p className="text-xs text-neutral-500">Pendientes de revisión o pausa solicitada.</p>
              </div>
              <div className="rounded-3xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Promedio rating</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-900">{averageRating.toFixed(2)}</p>
                <p className="text-xs text-neutral-500">Puntaje medio en todas las reseñas.</p>
              </div>
            </section>

            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <header className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Gestión directa</h2>
                  <p className="text-sm text-neutral-500">Activa o pausa perfiles desde esta tabla minimalista.</p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">{professionals.length} perfiles</span>
              </header>

              <div className="overflow-hidden rounded-2xl border border-neutral-200">
                <table className="min-w-full divide-y divide-neutral-200 text-sm">
                  <thead className="bg-neutral-50 text-left text-xs uppercase tracking-[0.28em] text-neutral-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-neutral-500">Profesional</th>
                      <th className="px-4 py-3 font-semibold text-neutral-500">Servicio</th>
                      <th className="px-4 py-3 font-semibold text-neutral-500">Estado</th>
                      <th className="px-4 py-3 font-semibold text-neutral-500">Última edición</th>
                      <th className="px-4 py-3 font-semibold text-neutral-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {professionals.map((professional) => {
                      const serviceName = serviceDictionary[professional.serviceId]?.name ?? 'Sin servicio';
                      return (
                        <tr key={professional.id}>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-neutral-900">{professional.name}</div>
                            <div className="text-xs text-neutral-500">{professional.city}</div>
                          </td>
                          <td className="px-4 py-3 text-neutral-600">{serviceName}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                professional.status === 'Activo'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-neutral-200 text-neutral-600'
                              }`}
                            >
                              {professional.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-neutral-500">{professional.lastEdited}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedProfessionalId(professional.id)}
                                className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900"
                              >
                                Revisar ficha
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(professional.id)}
                                className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900"
                              >
                                {professional.status === 'Activo' ? 'Pausar' : 'Activar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900">Últimas actualizaciones</h2>
              <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                {professionals
                  .slice()
                  .sort((a, b) => (a.lastEdited < b.lastEdited ? 1 : -1))
                  .slice(0, 5)
                  .map((professional) => (
                    <li key={professional.id} className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
                      <div>
                        <p className="font-semibold text-neutral-900">{professional.name}</p>
                        <p className="text-xs text-neutral-500">{professional.lastEdited}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedProfessionalId(professional.id)}
                        className="text-xs font-semibold text-neutral-500 transition hover:text-neutral-900"
                      >
                        Ver ficha
                      </button>
                    </li>
                  ))}
              </ul>
            </section>
          </div>
        )}
        {activeSection === 'REPORTES' && (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-4">
              <div className="rounded-3xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Servicios activos</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-900">{services.length}</p>
                <p className="text-xs text-neutral-500">Configurados en el catálogo actual.</p>
              </div>
              <div className="rounded-3xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Profesionales</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-900">{professionals.length}</p>
                <p className="text-xs text-neutral-500">Totales registrados en MiPage.</p>
              </div>
              <div className="rounded-3xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Campos dinámicos</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-900">{attributeConfig.measurements.length + attributeConfig.customFields.length}</p>
                <p className="text-xs text-neutral-500">Personalizados por administración.</p>
              </div>
              <div className="rounded-3xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Rating medio</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-900">{averageRating.toFixed(2)}</p>
                <p className="text-xs text-neutral-500">Calidad promedio de servicios.</p>
              </div>
            </section>

            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <header className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Uso por servicio</h2>
                  <p className="text-sm text-neutral-500">Profesionales asociados y estado publicado.</p>
                </div>
              </header>

              <div className="overflow-hidden rounded-2xl border border-neutral-200">
                <table className="min-w-full divide-y divide-neutral-200 text-sm">
                  <thead className="bg-neutral-50 text-left text-xs uppercase tracking-[0.28em] text-neutral-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-neutral-500">Servicio</th>
                      <th className="px-4 py-3 font-semibold text-neutral-500">Subcategorías</th>
                      <th className="px-4 py-3 font-semibold text-neutral-500">Total perfiles</th>
                      <th className="px-4 py-3 font-semibold text-neutral-500">Activos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {serviceUsage.map(({ service, total, activos }) => (
                      <tr key={service.id}>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-neutral-900">{service.name}</div>
                          <div className="text-xs text-neutral-500">Actualizado {service.updatedAt}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-500">{service.subcategories.join(', ') || '—'}</td>
                        <td className="px-4 py-3 text-neutral-600">{total}</td>
                        <td className="px-4 py-3 text-neutral-600">{activos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900">Checklist visual</h2>
              <ul className="mt-4 grid gap-3 text-sm text-neutral-600 md:grid-cols-2">
                <li className="rounded-2xl bg-neutral-50 px-4 py-3">
                  <span className="font-semibold text-neutral-900">Sesiones persistentes:</span> La sesión del administrador se mantiene hasta cerrar sesión manualmente.
                </li>
                <li className="rounded-2xl bg-neutral-50 px-4 py-3">
                  <span className="font-semibold text-neutral-900">Campos personalizables:</span> Medidas, nacionalidades, géneros y campos libres se pueden modificar sin perder historial.
                </li>
                <li className="rounded-2xl bg-neutral-50 px-4 py-3">
                  <span className="font-semibold text-neutral-900">Validaciones críticas:</span> No se eliminan servicios en uso ni campos protegidos.
                </li>
                <li className="rounded-2xl bg-neutral-50 px-4 py-3">
                  <span className="font-semibold text-neutral-900">Dashboard minimalista:</span> Todos los controles conviven en listados claros y formularios compactos.
                </li>
              </ul>
            </section>
          </div>
        )}
        <footer className="mt-12 text-center text-xs text-neutral-500">
          Control centralizado · MiPage Admin · {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
}
