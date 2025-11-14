export type ServiceCategory = 'modelaje' | 'masajes';

export type ServiceThreadEntry = {
  id: string;
  author: string;
  role: 'oferente' | 'moderacion' | 'cliente';
  timestamp: string;
  message: string;
};

export type ActivityLogEntry = {
  id: string;
  timestamp: string;
  headline: string;
  detail: string;
};

export type UserReview = {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
};

export type ProfessionalService = {
  id: string;
  name: string;
  nationality: string;
  service: string;
  category: ServiceCategory;
  price: number;
  location: string;
  image: string;
  gallery: string[];
  rating: number | null;
  ratingCount: number;
  description: string;
  whatsapp: string;
  phone: string;
  thread: ServiceThreadEntry[];
  activity: ActivityLogEntry[];
  reviews: UserReview[];
};

export const professionals: ProfessionalService[] = [
  {
    id: 'aurora-ramirez',
    name: 'Aurora Ramírez',
    nationality: 'Chilena',
    service: 'Editorial & Fashion Film',
    category: 'modelaje',
    price: 85000,
    location: 'Santiago, Chile',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80&sat=-25',
      'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=900&q=80',
    ],
    rating: 4.9,
    ratingCount: 84,
    description:
      'Dirección y producción de sesiones editoriales minimalistas con foco en moda premium. Aurora lidera equipos multidisciplinarios y entrega piezas listas para campañas digitales o impresas en un máximo de 72 horas.',
    whatsapp: '+56988001122',
    phone: '+56223456789',
    thread: [
      {
        id: 'aurora-thread-01',
        author: 'Aurora Ramírez',
        role: 'oferente',
        timestamp: '06/11/2024 · 10:15',
        message: 'Subí la nueva secuencia "Luz suave" para vitrina. Incluye tres tomas verticales curadas para portada.',
      },
      {
        id: 'aurora-thread-02',
        author: 'Moderación',
        role: 'moderacion',
        timestamp: '06/11/2024 · 10:28',
        message: 'Revisamos la secuencia y ajustamos temperatura de color. Ya está lista para publicarse.',
      },
      {
        id: 'aurora-thread-03',
        author: 'Aurora Ramírez',
        role: 'oferente',
        timestamp: '03/11/2024 · 18:42',
        message: 'Cargué clips cortos para fashion film con licencias de audio liberadas. Espero feedback.',
      },
      {
        id: 'aurora-thread-04',
        author: 'Moderación',
        role: 'moderacion',
        timestamp: '01/11/2024 · 09:20',
        message: 'Confirmamos recepción de los contratos de cesión de imagen. Se adjuntaron al repositorio del cliente.',
      },
      {
        id: 'aurora-thread-05',
        author: 'Daniela P. (Cliente)',
        role: 'cliente',
        timestamp: '31/10/2024 · 21:05',
        message: 'Gracias por la entrega anticipada del material detrás de cámaras. Lo compartimos con la marca.',
      },
    ],
    activity: [
      {
        id: 'aurora-activity-01',
        timestamp: '06/11/2024 · 10:32',
        headline: 'Serie "Luz suave" aprobada',
        detail: 'Nuevo carrusel editorial habilitado para portada principal.',
      },
      {
        id: 'aurora-activity-02',
        timestamp: '03/11/2024 · 19:05',
        headline: 'Fashion film en revisión final',
        detail: 'Secuencia en video programada para campaña digital semana próxima.',
      },
      {
        id: 'aurora-activity-03',
        timestamp: '29/10/2024 · 11:50',
        headline: 'Actualización de book',
        detail: 'Se añadieron tres retratos en blanco y negro para clientes editoriales.',
      },
    ],
    reviews: [
      {
        id: 'aurora-review-01',
        author: 'Daniela P.',
        rating: 5,
        date: '04/11/2024',
        comment: 'El fashion film quedó impecable. Excelente dirección y puntualidad.',
        verified: true,
      },
      {
        id: 'aurora-review-02',
        author: 'Estudio Prisma',
        rating: 4,
        date: '29/10/2024',
        comment: 'Gran disposición en el set, solo ajustaríamos tiempos de respuesta.',
        verified: true,
      },
    ],
  },
  {
    id: 'isabela-mena',
    name: 'Isabela Mena',
    nationality: 'Argentina',
    service: 'Masajes de autor',
    category: 'masajes',
    price: 68000,
    location: 'Providencia, Chile',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1581579186983-91e062c03789?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80&sat=-50',
    ],
    rating: 5,
    ratingCount: 42,
    description:
      'Sesiones exclusivas de masaje sensorial con protocolos personalizados. Isabela combina aromaterapia, musicoterapia y técnicas de tejido profundo para liberar estrés y tensión muscular en 75 minutos.',
    whatsapp: '+56977665544',
    phone: '+56222334455',
    thread: [
      {
        id: 'isabela-thread-01',
        author: 'Isabela Mena',
        role: 'oferente',
        timestamp: '04/11/2024 · 09:20',
        message: 'Activé la campaña "Masajes de autor" con nuevo set fotográfico y protocolo completo.',
      },
      {
        id: 'isabela-thread-02',
        author: 'Moderación',
        role: 'moderacion',
        timestamp: '04/11/2024 · 09:40',
        message: 'Se agregaron notas de seguridad sobre alergias en la descripción. Todo aprobado.',
      },
      {
        id: 'isabela-thread-03',
        author: 'Isabela Mena',
        role: 'oferente',
        timestamp: '02/11/2024 · 12:05',
        message: 'Subí nuevas referencias de aromaterapia con mezcla cítrica y relajante.',
      },
      {
        id: 'isabela-thread-04',
        author: 'Moderación',
        role: 'moderacion',
        timestamp: '01/11/2024 · 17:18',
        message: 'Se aprobó el banner promocional para fines de semana. Actualizamos la tarifa destacada.',
      },
      {
        id: 'isabela-thread-05',
        author: 'Cliente verificado',
        role: 'cliente',
        timestamp: '31/10/2024 · 14:46',
        message: 'Confirmo asistencia a la sesión de mantenimiento. Gracias por acomodar el horario.',
      },
    ],
    activity: [
      {
        id: 'isabela-activity-01',
        timestamp: '04/11/2024 · 09:55',
        headline: 'Checklist wellness actualizado',
        detail: 'Se añadieron aceites esenciales nuevos y recomendaciones post sesión.',
      },
      {
        id: 'isabela-activity-02',
        timestamp: '28/10/2024 · 15:22',
        headline: 'Promoción "Tacto profundo"',
        detail: 'Descuento habilitado por 10 días para clientas frecuentes.',
      },
      {
        id: 'isabela-activity-03',
        timestamp: '18/10/2024 · 12:05',
        headline: 'Bitácora de reservas',
        detail: 'Se abrió agenda de sesiones dobles para fin de mes.',
      },
    ],
    reviews: [
      {
        id: 'isabela-review-01',
        author: 'María F.',
        rating: 5,
        date: '02/11/2024',
        comment: 'Masaje increíble, la aromaterapia personalizada marcó la diferencia.',
        verified: true,
      },
      {
        id: 'isabela-review-02',
        author: 'Carla G.',
        rating: 4,
        date: '20/10/2024',
        comment: 'Experiencia relajante, pediré un poco más de presión la próxima vez.',
        verified: true,
      },
      {
        id: 'isabela-review-03',
        author: 'Rodrigo L.',
        rating: 5,
        date: '11/10/2024',
        comment: 'Muy profesional, puntual y con excelente ambientación.',
        verified: true,
      },
    ],
  },
  {
    id: 'ignacio-verdugo',
    name: 'Ignacio Verdugo',
    nationality: 'Chileno',
    service: 'Masajes deportivos',
    category: 'masajes',
    price: 56000,
    location: 'Vitacura, Chile',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1556229010-5f7b59828e67?auto=format&fit=crop&w=900&q=80',
    ],
    rating: 4.7,
    ratingCount: 31,
    description:
      'Programa de recuperación muscular post entrenamiento. Ignacio trabaja con clubes deportivos en sesiones de 60 minutos que combinan liberación miofascial, stretching asistido y recomendaciones personalizadas.',
    whatsapp: '+56999887766',
    phone: '+56224556677',
    thread: [
      {
        id: 'ignacio-thread-01',
        author: 'Ignacio Verdugo',
        role: 'oferente',
        timestamp: '01/11/2024 · 12:10',
        message: 'Agregué fotos post maratón con protocolo de recuperación completo.',
      },
      {
        id: 'ignacio-thread-02',
        author: 'Moderación',
        role: 'moderacion',
        timestamp: '01/11/2024 · 12:24',
        message: 'Incluimos nota de tiempos de recuperación sugeridos para cada deportista.',
      },
      {
        id: 'ignacio-thread-03',
        author: 'Club Runners',
        role: 'cliente',
        timestamp: '31/10/2024 · 20:05',
        message: 'Equipo completo atendido. Excelente manejo de lesiones leves.',
      },
    ],
    activity: [
      {
        id: 'ignacio-activity-01',
        timestamp: '01/11/2024 · 12:24',
        headline: 'Sesión deportiva aprobada',
        detail: 'Nuevo protocolo post maratón disponible para equipos competitivos.',
      },
      {
        id: 'ignacio-activity-02',
        timestamp: '26/10/2024 · 09:05',
        headline: 'Galería post carrera',
        detail: 'Fotos y videos autorizados para vitrina en la app.',
      },
      {
        id: 'ignacio-activity-03',
        timestamp: '18/10/2024 · 08:30',
        headline: 'Actualización agenda intensiva',
        detail: 'Agenda abierta para equipos de alto rendimiento en noviembre.',
      },
    ],
    reviews: [
      {
        id: 'ignacio-review-01',
        author: 'Club Runners',
        rating: 5,
        date: '31/10/2024',
        comment: 'Recuperación rápida y profesional. Ideal para equipos de alto rendimiento.',
        verified: true,
      },
      {
        id: 'ignacio-review-02',
        author: 'Maratón Santiago',
        rating: 4,
        date: '22/10/2024',
        comment: 'Excelente técnica, sumaría más disponibilidad en fines de semana.',
        verified: true,
      },
    ],
  },
  {
    id: 'malena-rojas',
    name: 'Malena Rojas',
    nationality: 'Chilena',
    service: 'Pasarela & Haute Couture',
    category: 'modelaje',
    price: 98000,
    location: 'Santiago, Chile',
    image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80&sat=-25',
    ],
    rating: 4.8,
    ratingCount: 52,
    description:
      'Coordinación integral para editoriales de alta costura, pasarelas y campañas digitales. Malena ofrece asesorías de estilismo, preproducción y acompañamiento en vivo para equipos creativos.',
    whatsapp: '+56988776655',
    phone: '+56220998877',
    thread: [
      {
        id: 'malena-thread-01',
        author: 'Malena Rojas',
        role: 'oferente',
        timestamp: '05/11/2024 · 21:30',
        message: 'Subí backstage haute couture con nueva dirección de arte minimalista.',
      },
      {
        id: 'malena-thread-02',
        author: 'Dirección Creativa',
        role: 'moderacion',
        timestamp: '05/11/2024 · 21:44',
        message: 'Sugerimos ordenar secuencia por texturas antes de agendar publicación.',
      },
    ],
    activity: [
      {
        id: 'malena-activity-01',
        timestamp: '05/11/2024 · 21:50',
        headline: 'Carrusel haute couture aprobado',
        detail: 'Secuencia lista para portada premium durante la semana de la moda.',
      },
      {
        id: 'malena-activity-02',
        timestamp: '30/10/2024 · 16:10',
        headline: 'Casting editorial cerrado',
        detail: 'Nuevos clientes agendados para sesiones de noviembre.',
      },
    ],
    reviews: [
      {
        id: 'malena-review-01',
        author: 'Atelier Prisma',
        rating: 5,
        date: '01/11/2024',
        comment: 'Profesionalismo absoluto, entiende rápido las direcciones de arte.',
        verified: true,
      },
      {
        id: 'malena-review-02',
        author: 'Revista LUX',
        rating: 4,
        date: '23/10/2024',
        comment: 'Gran performance. Ajustaríamos tiempos de entrega de material final.',
        verified: true,
      },
    ],
  },
];

const professionalMap = new Map(professionals.map((professional) => [professional.id, professional]));

export function getProfessionalById(id: string): ProfessionalService | null {
  return professionalMap.get(id) ?? null;
}
