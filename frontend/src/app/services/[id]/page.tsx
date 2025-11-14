import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ServiceDetailContent } from '@/components/services/ServiceDetailContent';
import { getProfessionalById, professionals } from '@/data/professionals';

type ServiceDetailPageParams = {
  id: string;
};

export function generateStaticParams() {
  return professionals.map((professional) => ({ id: professional.id }));
}

export function generateMetadata({ params }: { params: ServiceDetailPageParams }): Metadata {
  const professional = getProfessionalById(params.id);

  if (!professional) {
    return {
      title: 'Servicio no encontrado · MiWeb',
      description: 'El anuncio solicitado no está disponible actualmente. Vuelve al catálogo para revisar otras opciones.',
    };
  }

  return {
    title: `${professional.name} · ${professional.service} | MiWeb`,
    description: professional.description,
  };
}

export default function ServiceDetailPage({ params }: { params: ServiceDetailPageParams }) {
  const professional = getProfessionalById(params.id);

  if (!professional) {
    notFound();
  }

  return <ServiceDetailContent professional={professional} />;
}
