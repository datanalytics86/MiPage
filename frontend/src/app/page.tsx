'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { servicesAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import Button from '@/components/ui/Button';
import ButtonLink from '@/components/ui/ButtonLink';
import HeroSection from '@/components/home/HeroSection';
import CategoryTabs from '@/components/home/CategoryTabs';
import ServiceCard from '@/components/home/ServiceCard';

type CommandView = 'dashboard' | 'timeline';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [activePlaybook, setActivePlaybook] = useState<string>('executive');
  const [commandView, setCommandView] = useState<CommandView>('dashboard');
  const [activeBlueprint, setActiveBlueprint] = useState('holoflow');
  const [activeShowcase, setActiveShowcase] = useState('nebula');

  const previewServices = useMemo(
    () => [
      {
        id: 'preview-nebuluxe',
        title: 'Nebuluxe Velvet Ritual',
        category: 'MASAJES',
        price: 145000,
        priceType: 'session',
        city: 'Santiago Centro',
        coverPhoto:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
        isPremium: true,
        averageRating: 4.92,
        user: {
          name: 'Valentina',
          avatar:
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        },
      },
      {
        id: 'preview-skyline',
        title: 'Skyline Muse Production',
        category: 'MODELAJE',
        price: 220000,
        priceType: 'day',
        city: 'Vitacura',
        coverPhoto:
          'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&w=1200&q=80',
        isPremium: true,
        averageRating: 4.87,
        user: {
          name: 'Elias',
          avatar:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        },
      },
      {
        id: 'preview-club',
        title: 'Afterglow Privé Session',
        category: 'EVENTOS_PRIVADOS',
        price: 185000,
        priceType: 'session',
        city: 'Las Condes',
        coverPhoto:
          'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
        isPremium: false,
        averageRating: 4.78,
        user: {
          name: 'Renata',
          avatar:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
    []
  );

  const apiBaseUrl = api.defaults.baseURL;

  useEffect(() => {
    if (!newsletterSuccess) {
      return;
    }

    const timeout = setTimeout(() => setNewsletterSuccess(false), 4000);

    return () => clearTimeout(timeout);
  }, [newsletterSuccess]);

  const runwaySignals = [
    { icon: '🤖', label: 'Concierge IA encriptado' },
    { icon: '🛰️', label: 'Tracking en tiempo real' },
    { icon: '🎧', label: 'Audio 8D inmersivo' },
    { icon: '🕯️', label: 'Ambientaciones curadas' },
    { icon: '💎', label: 'Anfitriones verificados' },
    { icon: '🌌', label: 'Escenas multiciudad' },
  ];

  const sensoryStories = [
    {
      title: 'Chromatic Soirée',
      description:
        'Sesiones moduladas por IA con iluminación reactiva y playlists que evolucionan con tu mood.',
      location: 'Santiago Centro',
      accent: 'from-fire-500/25 via-fire-500/5 to-transparent',
      chips: ['Lust Verified', 'Audio 8D', 'Aftercare'],
      href: '/services?category=MASAJES',
    },
    {
      title: 'Velvet Skyline',
      description:
        'Terrazas privadas con mixología sensorial, proyecciones holográficas y narrativa personalizada.',
      location: 'Viña del Mar',
      accent: 'from-lust-500/25 via-lust-500/5 to-transparent',
      chips: ['Soft launch', 'Concierge 24/7', 'Sky rituals'],
      href: '/services?tag=destacados',
    },
    {
      title: 'Nocturnal Bloom',
      description:
        'Experiencias boutique con rituales de aromas, cápsulas wellness y protocolos discretos.',
      location: 'Concepción',
      accent: 'from-emerald-400/25 via-emerald-400/5 to-transparent',
      chips: ['Wellness', 'Mood sensing', 'Private driver'],
      href: '/services',
    },
  ];

  const auraMoments = [
    {
      title: 'Suites inmersivas',
      description:
        'Penthouse con mapping lumínico, aromas calibrados y sommelier sensorial orquestando cada escena.',
      metric: '98%',
      metricLabel: 'Índice de intimidad',
      highlights: ['Mapping lumínico', 'Sommelier sensorial', 'Aftercare digital'],
      gradient: 'from-fire-500/25 via-fire-500/5 to-transparent',
      tag: 'Soft launch',
    },
    {
      title: 'Rituales clandestinos',
      description:
        'Lofts privados con storytellers, proyecciones envolventes y cápsulas sorpresa personalizadas.',
      metric: '12 min',
      metricLabel: 'Promedio de activación',
      highlights: ['Storytelling inmersivo', 'Protocolos discretos', 'Cápsulas sorpresa'],
      gradient: 'from-lust-500/25 via-lust-500/5 to-transparent',
      tag: 'By invite',
    },
    {
      title: 'Wellness nocturno',
      description:
        'Programas sensoriales con sonidos binaurales, breathwork asistido y live coaching post sesión.',
      metric: '+87%',
      metricLabel: 'Feedback elevado',
      highlights: ['Audio binaural', 'Breathwork guiado', 'Concierge aftercare'],
      gradient: 'from-emerald-400/25 via-emerald-400/5 to-transparent',
      tag: 'Wellness club',
    },
  ];

  const conciergeSignals = [
    {
      icon: '⚡',
      title: 'Tiempo de respuesta',
      description: 'Concierge IA confirma upgrades y coordina movilidad en segundos.',
      value: '03m 20s',
      accent: 'from-fire-500/25 via-fire-500/5 to-transparent',
    },
    {
      icon: '🛰️',
      title: 'Cobertura híbrida',
      description: 'Hosts conectados en 6 ciudades con seguimiento dinámico de agenda.',
      value: '6 ciudades',
      accent: 'from-lust-500/25 via-lust-500/5 to-transparent',
    },
    {
      icon: '🔐',
      title: 'Protocolos discretos',
      description: 'Mensajería efímera, códigos encriptados y pagos blindados.',
      value: '100%',
      accent: 'from-emerald-400/25 via-emerald-400/5 to-transparent',
    },
    {
      icon: '🎼',
      title: 'Ambientación viva',
      description: 'Playlists biométricas y aromas inteligentes sincronizados con tu mood.',
      value: '24/7',
      accent: 'from-sky-400/25 via-sky-400/5 to-transparent',
    },
  ];

  const velvetSignals = [
    {
      label: 'Satisfacción sensorial',
      value: 96,
      caption: 'Feedback 5★ en los últimos 30 días',
      accent: 'from-fire-400 via-fire-500 to-lust-500',
    },
    {
      label: 'Rebookings exclusivos',
      value: 82,
      caption: 'Usuarios que repiten con el mismo host',
      accent: 'from-emerald-400 via-emerald-500 to-teal-400',
    },
  ];

  const cinematicShowcases = [
    {
      id: 'nebula',
      label: 'Nebula Prime',
      title: 'Nebula Prime Suite',
      description:
        'Un penthouse suspendido con mapping volumétrico, proyecciones 12K y coreografía lumínica controlada por biofeedback.',
      accent: 'from-fire-500/30 via-fire-400/10 to-transparent',
      metrics: [
        { label: 'Latencia de respuesta', value: '1.8 s', detail: 'Coreografía IA en vivo' },
        { label: 'Sensores biométricos', value: '12', detail: 'Puntos de lectura sincronizados' },
      ],
      gallery: ['Mapping 12K', 'Sommelier lumínico', 'Aftercare privado'],
      certifications: ['Protocolo QC Nebula', 'Cobertura NDA premium'],
      href: '/services?tag=nebula',
    },
    {
      id: 'obsidian',
      label: 'Obsidian Vault',
      title: 'Obsidian Vault Experience',
      description:
        'Bóveda blindada con tratamiento acústico espacial, cápsulas wellness y narrativa multisensorial en capas.',
      accent: 'from-lust-500/30 via-lust-400/10 to-transparent',
      metrics: [
        { label: 'Índice de confidencialidad', value: '99.7%', detail: 'Auditado semanalmente' },
        { label: 'Capas inmersivas', value: '05', detail: 'Audio 8D · Aromas reactivos · Iluminación táctil' },
      ],
      gallery: ['Cápsulas wellness', 'Control room privado', 'Curaduría sonora'],
      certifications: ['Lust Blackshield', 'QA Forensics'],
      href: '/services?tag=obsidian',
    },
    {
      id: 'aurora',
      label: 'Aurora Flow',
      title: 'Aurora Flow Residency',
      description:
        'Residencias itinerantes con auroras artificiales, mixología molecular y protocolos de privacidad biométrica.',
      accent: 'from-sky-500/30 via-emerald-400/10 to-transparent',
      metrics: [
        { label: 'Curvas de energía', value: '+84%', detail: 'Picos calibrados en 3 actos' },
        { label: 'Feedback post sesión', value: '4.98', detail: 'Escala 5★ verificada' },
      ],
      gallery: ['Auroras artificiales', 'Mixología molecular', 'Protocolos biométricos'],
      certifications: ['Velvet Privacy Seal', 'QA Concierge'],
      href: '/services?tag=aurora',
    },
  ];

  const cinematicProofPoints = [
    {
      icon: '🎬',
      title: 'Dirección creativa concierge',
      caption: 'Cada escena cuenta con showrunner dedicado y guion emocional calibrado en tiempo real.',
      accent: 'from-fire-400/30 via-fire-500/10 to-transparent',
    },
    {
      icon: '🛡️',
      title: 'QA de escena reforzado',
      caption: 'Auditoría de 72 puntos por turno con trazabilidad completa y reportes cifrados.',
      accent: 'from-emerald-400/30 via-emerald-500/10 to-transparent',
    },
    {
      icon: '📡',
      title: 'Telemetría continua',
      caption: 'Panel holo HUD para clientes con métricas de ambiente, privacidad y discreción.',
      accent: 'from-sky-400/30 via-sky-500/10 to-transparent',
    },
  ];

  const activeShowcaseData =
    cinematicShowcases.find((showcase) => showcase.id === activeShowcase) ?? cinematicShowcases[0];

  const commandViews = [
    {
      id: 'dashboard' as const,
      label: 'Panel sensor',
      icon: '🛰️',
      description: 'Supervisa reservas auditadas, tiempos de respuesta y garantías activas en vivo.',
    },
    {
      id: 'timeline' as const,
      label: 'Ruta operativa',
      icon: '🧭',
      description: 'Explora la secuencia concierge antes, durante y después de cada escena premium.',
    },
  ];

  const commandDashboardMetrics = [
    {
      label: 'Reservas auditadas',
      value: '128',
      delta: '+18%',
      context: 'Últimos 7 días',
    },
    {
      label: 'Tiempo de resolución',
      value: '04m 12s',
      delta: '-22%',
      context: 'Incidentes resueltos',
    },
    {
      label: 'Experiencias premium',
      value: '42',
      delta: '+9%',
      context: 'Protocolos con upgrade',
    },
    {
      label: 'Garantías activas',
      value: '15',
      delta: '100%',
      context: 'Cobertura concierge',
    },
  ];

  const commandDashboardStreams = [
    {
      title: 'Radar de confianza',
      caption: 'Hosts certificados + QA biométrico',
      highlights: ['Verificación documental', 'Escucha activa 24/7', 'Cierres de feedback en 6h'],
    },
    {
      title: 'Sensory uplifts',
      caption: 'Actualizaciones en vivo para escenas lust',
      highlights: ['Ambientaciones dinámicas', 'Chaperón discreto', 'Aftercare digital'],
    },
  ];

  const commandTimeline = [
    {
      time: 'T-12h',
      title: 'Briefing sensorial',
      detail: 'Concierge IA configura protocolos, playlist biométrica y movilidad blindada.',
      status: 'Confirmado',
    },
    {
      time: 'T-02h',
      title: 'Verificación discreta',
      detail: 'Hosts validan identidad, upgrades y códigos efímeros con QA en vivo.',
      status: 'Completado',
    },
    {
      time: 'T+00h',
      title: 'Escena en curso',
      detail: 'Monitor de confort, métricas de afinidad y soporte silencioso en segundo plano.',
      status: 'Monitoreo',
    },
    {
      time: 'T+04h',
      title: 'Aftercare y reporte',
      detail: 'Cierre con storytelling audiovisual, encuestas 8D y próximos upgrades sugeridos.',
      status: 'Agendado',
    },
  ];

  const commandTimelineGuardrails = [
    {
      label: 'Checklist legal',
      value: 'Firmas digitales + biometría',
    },
    {
      label: 'Protocolos wellness',
      value: 'Breathwork, hidratación y privacy coach',
    },
    {
      label: 'Seguimiento 360°',
      value: 'Concierge + IA + Host lead',
    },
  ];

  const futureLaunches = [
    {
      title: 'Velvet Archive 2.0',
      description: 'Colección privada de anfitriones con escenas cinematográficas y upgrades en vivo.',
      eta: 'Dic · 2024',
      status: 'Beta privada',
      accent: 'from-fire-500/30 via-fire-500/10 to-transparent',
    },
    {
      title: 'Lust Map Holográfico',
      description: 'Mapa inmersivo que muestra disponibilidad y atmósferas en tiempo real por ciudad.',
      eta: 'Ene · 2025',
      status: 'Vista previa',
      accent: 'from-lust-500/30 via-lust-500/10 to-transparent',
    },
    {
      title: 'Aftercare Studio',
      description: 'Programas post sesión con playlists personalizadas y entregables sensoriales.',
      eta: 'Mar · 2025',
      status: 'Roadmap',
      accent: 'from-sky-400/30 via-sky-400/10 to-transparent',
    },
  ];

  const luminaryVoices = [
    {
      name: 'Valentina Noir',
      role: 'Host Signature · Santiago',
      quote:
        'Mi concierge calibró luces, aromas y playlist con tus preferencias antes de que llegaras. No existe margen para el azar.',
      metric: '+28%',
      metricLabel: 'Repetición de clientes',
      badge: 'Chromatic Soirée',
      accent: 'from-fire-500/25 via-fire-500/5 to-transparent',
      symbol: '🌙',
    },
    {
      name: 'Gabriel Luxe',
      role: 'Concierge maestro · Viña del Mar',
      quote:
        'En minutos activamos mixólogos, fotógrafo y chofer privado. MiPage coordina cada escena como si fuese un set de cine.',
      metric: '3m 05s',
      metricLabel: 'Tiempo promedio de confirmación',
      badge: 'Velvet Skyline',
      accent: 'from-lust-500/25 via-lust-500/5 to-transparent',
      symbol: '🕶️',
    },
    {
      name: 'Amaia Bloom',
      role: 'Creative curator · Concepción',
      quote:
        'Las cápsulas wellness y el aftercare digital mantienen a mis invitados conectados con la experiencia durante días.',
      metric: '+21%',
      metricLabel: 'Upgrade promedio por sesión',
      badge: 'Nocturnal Bloom',
      accent: 'from-emerald-400/25 via-emerald-400/5 to-transparent',
      symbol: '🌿',
    },
    {
      name: 'Elena Cipher',
      role: 'Productora privada · Antofagasta',
      quote:
        'El modo sigiloso y los NDA automáticos permiten reuniones corporativas discretas sin comprometer la experiencia.',
      metric: '100%',
      metricLabel: 'Confidencialidad garantizada',
      badge: 'Skyline Vault',
      accent: 'from-sky-400/25 via-sky-400/5 to-transparent',
      symbol: '🔐',
    },
  ];

  const prestigeRoster = [
    {
      name: 'Naomi Cipher',
      role: 'Muse Velvet · Santiago',
      narrative: 'Curadora de cenas clandestinas con storytelling en tres actos y ambientación lumínica reactiva.',
      metric: '98% affinity',
      features: ['Guiones sensoriales', 'Concierge cifrado', 'Aftercare 72h'],
      accent: 'from-fire-500/25 via-fire-500/10 to-transparent',
      status: 'Agenda exclusiva',
    },
    {
      name: 'Ariel Lux',
      role: 'Host Signature · Viña del Mar',
      narrative: 'Terrazas holográficas con mixología molecular y playlists que evolucionan con cada invitado.',
      metric: '4.9 / 5',
      features: ['Skyline privado', 'Mixología reactiva', 'Fotografía artística'],
      accent: 'from-lust-500/25 via-lust-500/10 to-transparent',
      status: 'Soft launch',
    },
    {
      name: 'Isla Bloom',
      role: 'Wellness curator · Concepción',
      narrative: 'Programas nocturnos con breathwork asistido, cápsulas aromáticas y rituales inmersivos.',
      metric: '87% uplift',
      features: ['Biofeedback', 'Aromas inteligentes', 'Concierge wellness'],
      accent: 'from-emerald-400/25 via-emerald-400/10 to-transparent',
      status: 'Members only',
    },
    {
      name: 'Luca Halo',
      role: 'Creative producer · Antofagasta',
      narrative: 'Lofts con mapping 360°, fotógrafos de autor y cápsulas sorpresa sincronizadas.',
      metric: '12m setup',
      features: ['Mapping 360°', 'Equipo audiovisual', 'Protocolos NDA'],
      accent: 'from-sky-400/25 via-sky-400/10 to-transparent',
      status: 'By invite',
    },
  ];

  const immersionTimeline = [
    {
      phase: '01',
      title: 'Briefing cifrado',
      description: 'Concierge IA interpreta tus preferencias, bloquea agenda y prepara al anfitrión en menos de 5 minutos.',
    },
    {
      phase: '02',
      title: 'Escena calibrada',
      description: 'Ambientación lumínica, audio 8D y aromas inteligentes sincronizados con tu biodata y mood.',
    },
    {
      phase: '03',
      title: 'Upgrades en vivo',
      description: 'Cápsulas gourmet, mixología y storytelling adicional activados desde el panel de control Lust.',
    },
    {
      phase: '04',
      title: 'Aftercare privado',
      description: 'Seguimiento discreto, entregables digitales y nuevas invitaciones curadas para la próxima sesión.',
    },
  ];

  const controlLayers = [
    {
      title: 'Command Room',
      description: 'Coordina hosts, seguridad y movilidad con IA afectiva que mantiene cada detalle bajo confidencialidad.',
      metric: '03m 20s',
      metricLabel: 'Tiempo de activación',
      accent: 'from-fire-500/25 via-fire-500/10 to-transparent',
      badge: 'Live 24/7',
    },
    {
      title: 'Mood Monitor',
      description: 'Sensores biométricos ajustan iluminación, audio y narrativa según las micro reacciones de tus invitados.',
      metric: '94% match',
      metricLabel: 'Afinidad sensorial',
      accent: 'from-lust-500/25 via-lust-500/10 to-transparent',
      badge: 'IA afectiva',
    },
    {
      title: 'Security Vault',
      description: 'Pagos blindados, NDA automáticos y canales efímeros garantizan discreción absoluta en cada contacto.',
      metric: '100%',
      metricLabel: 'Protocolo confidencial',
      accent: 'from-slate-500/25 via-slate-500/10 to-transparent',
      badge: 'Zero leaks',
    },
    {
      title: 'Aftercare Studio',
      description: 'Entrega playlists personalizadas, cápsulas wellness y seguimiento premium sin salir de la aplicación.',
      metric: '72h',
      metricLabel: 'Duración aftercare',
      accent: 'from-emerald-400/25 via-emerald-400/10 to-transparent',
      badge: 'Soft touch',
    },
  ];

  const partnerSignatures = ['Velvet Labs', 'Noir Atelier', 'Skyline Privé', 'Chromatic Society', 'Lust Studios'];

  const immersionBlueprints = [
    {
      id: 'holoflow',
      label: 'HoloFlow Suite',
      title: 'HoloFlow Suite · Santiago',
      description:
        'Escenarios envolventes con mapping 360°, IA afectiva y cápsulas sensoriales sincronizadas minuto a minuto.',
      metrics: [
        { value: '02m 45s', label: 'Calibración inicial' },
        { value: '99.6%', label: 'Estabilidad de escena' },
        { value: '8 capas', label: 'Capas lumínicas activas' },
      ],
      features: ['Sommelier sensorial', 'Audio 8D adaptativo', 'Concierge dedicado'],
      accent: 'from-fire-500/25 via-fire-500/10 to-transparent',
      href: '/services?tag=skyline',
    },
    {
      id: 'velvet',
      label: 'Velvet Orbit',
      title: 'Velvet Orbit · Viña del Mar',
      description:
        'Terrazas holográficas con mixología molecular, narrativa guiada y seguridad discreta con NDA automático.',
      metrics: [
        { value: '03 hosts', label: 'Equipo dedicado' },
        { value: '4.9 / 5', label: 'Satisfacción promedio' },
        { value: '24/7', label: 'Cobertura concierge' },
      ],
      features: ['Mixología molecular', 'Fotógrafo de autor', 'Logística blindada'],
      accent: 'from-lust-500/25 via-lust-500/10 to-transparent',
      href: '/services?tag=destacados',
    },
    {
      id: 'bloom',
      label: 'Nocturnal Bloom',
      title: 'Nocturnal Bloom · Concepción',
      description:
        'Rituales wellness nocturnos con breathwork asistido, biofeedback y cápsulas aromáticas artesanales.',
      metrics: [
        { value: '87%', label: 'Feedback uplift' },
        { value: '72h', label: 'Aftercare activo' },
        { value: 'IA', label: 'Monitor biométrico' },
      ],
      features: ['Breathwork guiado', 'Cápsulas aromáticas', 'Aftercare digital'],
      accent: 'from-emerald-400/25 via-emerald-400/10 to-transparent',
      href: '/services?tag=wellness',
    },
  ] as const;

  const blueprintSignals = [
    {
      icon: '🛰️',
      title: 'Sensores en vivo',
      description: 'Monitoriza temperatura, audio y accesos con alertas calibradas por QA.',
      accent: 'from-fire-500/25 via-fire-500/10 to-transparent',
    },
    {
      icon: '🧬',
      title: 'Perfiles gemelos',
      description: 'Gemelos digitales proyectan recomendaciones personalizadas y upgrades sugeridos.',
      accent: 'from-lust-500/25 via-lust-500/10 to-transparent',
    },
    {
      icon: '🛡️',
      title: 'Blindaje total',
      description: 'Pagos, NDA y accesos cifrados con monitoreo 24/7 del concierge QA.',
      accent: 'from-emerald-400/25 via-emerald-400/10 to-transparent',
    },
    {
      icon: '🎥',
      title: 'Storytelling inmersivo',
      description: 'Escenas grabadas con cinematografía discreta y entregables personalizados.',
      accent: 'from-sky-400/25 via-sky-400/10 to-transparent',
    },
  ] as const;

  const qaPillars = [
    {
      icon: '🧾',
      title: 'Checklist 72 puntos',
      description: 'Revisamos identidad, contratos, imágenes y protocolos sanitarios antes de liberar agenda.',
      accent: 'from-emerald-400/25 via-emerald-400/5 to-transparent',
    },
    {
      icon: '🛰️',
      title: 'Monitoreo continuo',
      description: 'Alertas en vivo sobre NPS, tiempos de respuesta y upgrades ejecutados.',
      accent: 'from-sky-400/25 via-sky-400/5 to-transparent',
    },
    {
      icon: '🔐',
      title: 'Protocolos de riesgo',
      description: 'Seguimiento confidencial, pagos blindados y NDA automáticos para cada interacción.',
      accent: 'from-fire-500/25 via-fire-500/5 to-transparent',
    },
  ];

  const qaOutcomes = [
    {
      label: 'Incidencias resueltas',
      value: '< 2h',
      detail: 'SLA promedio de soporte elite',
      accent: 'from-fire-400 via-fire-500 to-lust-500',
    },
    {
      label: 'Reservas impecables',
      value: '99.2%',
      detail: 'Bookings sin fricción en los últimos 90 días',
      accent: 'from-emerald-400 via-emerald-500 to-teal-400',
    },
    {
      label: 'Auditorías mensuales',
      value: '480',
      detail: 'Checklist completados por QA y concierge',
      accent: 'from-sky-400 via-sky-500 to-indigo-400',
    },
  ];

  const qaNavigation = [
    {
      label: 'Ver hosts auditados',
      href: '/services?category=MODELAJE',
      caption: 'Catálogo con verificación triple',
    },
    {
      label: 'Panel QA en vivo',
      href: '/debug',
      caption: 'Telemetría y stress test de la plataforma',
    },
    {
      label: 'Controlar reservas',
      href: '/dashboard',
      caption: 'Supervisa pagos y upgrades en tiempo real',
    },
  ];

  const qaPlaybooks = [
    {
      id: 'executive',
      label: 'Corporate elite',
      summary:
        'Roadshows privados, cenas ejecutivas y experiencias corporativas protegidas por NDA dinámicos.',
      kpis: [
        { label: 'SLA incidentes', value: '01h 40m' },
        { label: 'Hosts certificados', value: '42' },
      ],
      checklist: [
        'Simulamos cada contacto crítico con staging QA antes del evento real.',
        'Activamos doble factor de identidad y NDA automáticos para cada invitado.',
        'Concierge IA monitorea pagos y upgrades en vivo con alertas de latencia.',
      ],
      action: { label: 'Agendar demo corporativa', href: '/contact?type=corporate' },
    },
    {
      id: 'lifestyle',
      label: 'Lifestyle signature',
      summary:
        'Experiencias boutique para grupos reducidos con storytelling inmersivo y ambientación reactiva.',
      kpis: [
        { label: 'Afinidad sensorial', value: '97%' },
        { label: 'Feedback 5★', value: '312' },
      ],
      checklist: [
        'Curamos playlists biométricas y aromas inteligentes alineados al mood invitado.',
        'Seguimiento de transporte y accesos con geofencing y reportes discretos.',
        'Aftercare digital con cápsulas personalizadas dentro de las 24 horas.',
      ],
      action: { label: 'Solicitar curaduría', href: '/concierge/brief' },
    },
    {
      id: 'wellness',
      label: 'Wellness nocturno',
      summary:
        'Programas sensoriales y protocolos de bienestar avalados por especialistas y QA clínico.',
      kpis: [
        { label: 'Supervisión médica', value: 'On-call' },
        { label: 'Rebookings', value: '82%' },
      ],
      checklist: [
        'Validamos certificados profesionales y protocolos sanitarios cada 30 días.',
        'Monitoreamos saturación ambiental y niveles de audio en tiempo real.',
        'Equipo aftercare disponible 72h para soporte y feedback biométrico.',
      ],
      action: { label: 'Diseñar ritual wellness', href: '/services?tag=wellness' },
    },
  ];

  const qaDiagnostics = [
    {
      label: 'Cobertura de enlaces',
      score: 100,
      detail: 'Links auditados y funcionales con monitoreo 24/7',
      accent: 'from-emerald-400 via-emerald-500 to-teal-400',
    },
    {
      label: 'Alertas resueltas',
      score: 94,
      detail: 'Incidencias QA cerradas en la última semana',
      accent: 'from-fire-400 via-fire-500 to-lust-500',
    },
    {
      label: 'Integridad de datos',
      score: 98,
      detail: 'Sincronización con panel de métricas y backups cifrados',
      accent: 'from-sky-400 via-sky-500 to-indigo-400',
    },
  ];

  const activePlaybookData =
    qaPlaybooks.find((playbook) => playbook.id === activePlaybook) ?? qaPlaybooks[0];

  const activeBlueprintData =
    immersionBlueprints.find((blueprint) => blueprint.id === activeBlueprint) ?? immersionBlueprints[0];

  const executiveShortcuts = [
    {
      icon: '🧭',
      label: 'Explorar catálogo',
      href: '/services',
      caption: 'Descubre anfitriones calibrados por QA',
    },
    {
      icon: '🤝',
      label: 'Activar concierge',
      href: '/auth/register?plan=concierge',
      caption: 'Diseña tu onboarding premium en minutos',
    },
    {
      icon: '🛡️',
      label: 'Auditorías en vivo',
      href: '/debug',
      caption: 'Consulta métricas, stress test y controles QA',
    },
    {
      icon: '📊',
      label: 'Dashboard operativo',
      href: '/dashboard',
      caption: 'Gestiona reservas, pagos y upgrades en tiempo real',
    },
  ];

  const innovationTracks = [
    {
      icon: '🧠',
      title: 'Atlas predictivo',
      description:
        'IA anticipa disponibilidad, propone anfitriones y valida logística multisede con un 95% de precisión en 120 segundos.',
      status: 'En vivo',
      accent: 'from-fire-500/25 via-fire-500/10 to-transparent',
    },
    {
      icon: '🎚️',
      title: 'Calibration Studio',
      description:
        'Panel sensorial que programa iluminación, audio 8D y aromas inteligentes antes del arribo del invitado.',
      status: 'Beta privada',
      accent: 'from-lust-500/25 via-lust-500/10 to-transparent',
    },
    {
      icon: '🛰️',
      title: 'Signal Guardian',
      description:
        'Monitoreo en vivo de NDA, pagos y canales efímeros con alertas QA QC para cada interacción.',
      status: 'IA asistida',
      accent: 'from-emerald-400/25 via-emerald-400/10 to-transparent',
    },
  ];

  const signatureReels = [
    {
      title: 'Aurora Prime',
      subtitle: 'Penthouse multisensorial',
      highlight: 'Mapping lumínico reactivo',
      statLabel: 'Afinidad',
      statValue: '97%',
      chips: ['Skyline 360°', 'Sommelier sensorial', 'Aftercare 72h'],
      accent: 'from-fire-500/30 via-fire-500/10 to-transparent',
      href: '/services?tag=skyline',
    },
    {
      title: 'Velvet Vault',
      subtitle: 'Rituales clandestinos',
      highlight: 'Ambientación controlada por IA',
      statLabel: 'Confianza',
      statValue: '100%',
      chips: ['NDA automático', 'Logística discreta', 'Concierge 24/7'],
      accent: 'from-lust-500/30 via-lust-500/10 to-transparent',
      href: '/services?tag=destacados',
    },
    {
      title: 'Nocturnal Bloom',
      subtitle: 'Wellness nocturno',
      highlight: 'Breathwork asistido en vivo',
      statLabel: 'Satisfacción',
      statValue: '94%',
      chips: ['Audio binaural', 'Cápsulas aromáticas', 'Aftercare digital'],
      accent: 'from-emerald-400/30 via-emerald-400/10 to-transparent',
      href: '/services?tag=wellness',
    },
  ];

  const complianceSignals = [
    {
      label: 'Integridad de escenas',
      value: 100,
      caption: 'Verificación humana + IA',
      accent: 'from-emerald-400 via-emerald-500 to-teal-400',
    },
    {
      label: 'Tiempo de respuesta',
      value: 92,
      caption: 'Concierge activo 24/7',
      accent: 'from-fire-400 via-fire-500 to-lust-500',
    },
    {
      label: 'Rebookings exclusivos',
      value: 84,
      caption: 'Clientes que repiten en <30 días',
      accent: 'from-sky-400 via-sky-500 to-indigo-400',
    },
  ];

  const footerNavigation = [
    {
      title: 'Explorar',
      links: [
        { label: 'Catálogo completo', href: '/services' },
        { label: 'Hosts certificados', href: '/services?tag=destacados' },
        { label: 'Experiencias wellness', href: '/services?tag=wellness' },
      ],
    },
    {
      title: 'Compañía',
      links: [
        { label: 'Sobre MiPage', href: '/about' },
        { label: 'Equipo concierge', href: '/about#team' },
        { label: 'Prensa & media', href: '/press' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Términos y condiciones', href: '/terms' },
        { label: 'Política de privacidad', href: '/privacy' },
        { label: 'Lineamientos de anfitriones', href: '/docs/hosts' },
      ],
    },
    {
      title: 'Soporte',
      links: [
        { label: 'Centro de ayuda', href: '/help' },
        { label: 'Status del sistema', href: '/status' },
        { label: 'Reportar incidente', href: '/support/incidents' },
      ],
    },
  ] as const;

  const socialLinks = [
    { label: 'Instagram', href: 'https://instagram.com/mipage', icon: '📸' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@mipage', icon: '🎬' },
    { label: 'X', href: 'https://x.com/mipage', icon: '🛰️' },
  ] as const;

  const conciergeChannels = [
    {
      label: 'Concierge 24/7',
      value: '+56 2 3210 0021',
      href: 'tel:+56232100021',
      caption: 'Tiempo medio de respuesta 3m 20s',
    },
    {
      label: 'Soporte cifrado',
      value: 'concierge@mipage.cl',
      href: 'mailto:concierge@mipage.cl',
      caption: 'Protocolos NDA automáticos',
    },
  ] as const;

  const currentYear = new Date().getFullYear();

  const fetchServices = useCallback(async () => {
    const isRemotePreview =
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      (apiBaseUrl?.includes('localhost') ?? false);

    try {
      setLoading(true);

      if (isRemotePreview) {
        console.info(
          'Activando dataset de servicios de demostración para el preview sin backend disponible.'
        );
        setServices(previewServices);
        return;
      }

      const { data } = await servicesAPI.getAll({ status: 'APPROVED' });
      const fetchedServices = Array.isArray(data?.services) && data.services.length > 0
        ? data.services
        : previewServices;
      setServices(fetchedServices);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      setServices(previewServices);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, previewServices]);

  const filterServices = useCallback(() => {
    let filtered = [...services];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by city
    if (searchCity) {
      filtered = filtered.filter((s) =>
        s.city?.toLowerCase().includes(searchCity.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [searchCity, searchQuery, selectedCategory, services]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    filterServices();
  }, [filterServices]);

  const handleSearch = (query: string, city: string) => {
    setSearchQuery(query);
    setSearchCity(city);
  };

  const handleNewsletterSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!newsletterEmail.trim()) {
        return;
      }

      setNewsletterSuccess(true);
      setNewsletterEmail('');
    },
    [newsletterEmail]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060405] text-warm-50">
      {/* Ambient grid */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.12),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(255,0,92,0.12),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_45%,rgba(255,255,255,0.02)_80%)]" />
        <div className="absolute left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,107,53,0.08)_0%,rgba(255,0,92,0)_70%)] blur-[120px]" />
        <div className="absolute -left-40 bottom-10 h-[28rem] w-[28rem] rounded-full bg-fire-500/20 blur-[140px]" />
        <div className="absolute -right-24 top-32 h-[26rem] w-[26rem] rounded-full bg-lust-500/25 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative sticky top-0 z-50 border-b border-white/5 bg-[rgba(8,6,10,0.82)] backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fire-500/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-fire-500/50 to-lust-500/40 blur-xl opacity-70 transition-opacity group-hover:opacity-100" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-dark-950/40 to-dark-800/40 text-2xl font-black text-white shadow-[0_25px_45px_-25px_rgba(255,0,92,0.6)]">
                M
              </span>
            </div>
            <div>
              <span className="block text-xl font-semibold uppercase tracking-[0.6em] text-warm-500">MiPage</span>
              <span className="block text-[11px] uppercase tracking-[0.4em] text-warm-400">Luxury Service Engine</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-warm-300 md:flex">
            {[{ label: 'Explorar', href: '/services' }, { label: 'Experiencias', href: '/services?tag=destacados' }, { label: 'Elite Club', href: '/services?tag=elite' }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex items-center gap-2 uppercase tracking-[0.35em] transition-colors duration-300 hover:text-fire-200"
              >
                <span className="h-1 w-1 rounded-full bg-fire-500 transition-colors duration-300 group-hover:bg-fire-300" />
                {item.label}
                <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-gradient-to-r from-fire-400 via-fire-500 to-lust-500 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
            {user?.role === 'PUBLISHER' && (
              <Link
                href="/services/new"
                className="relative flex items-center gap-2 uppercase tracking-[0.35em] text-fire-200 transition-colors duration-300 hover:text-fire-100"
              >
                <span className="h-1 w-1 rounded-full bg-fire-400" />Publicar
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="relative flex items-center gap-2 uppercase tracking-[0.35em] text-fire-200 transition-colors duration-300 hover:text-fire-100"
              >
                <span className="h-1 w-1 rounded-full bg-fire-400" />Admin
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.45em] text-warm-300 md:inline-flex">
                  Hola, {user.name}
                </span>
                <ButtonLink
                  href="/services/new"
                  variant="fire"
                  size="md"
                  className="rounded-full px-5 py-2 font-semibold uppercase tracking-[0.4em] shadow-[0_15px_45px_-25px_rgba(255,107,53,0.8)]"
                >
                  Publicar
                </ButtonLink>
              </>
            ) : (
              <>
                <ButtonLink
                  href="/auth/login"
                  variant="dark"
                  size="md"
                  className="rounded-full border border-white/10 bg-transparent px-5 py-2 uppercase tracking-[0.4em] text-warm-300 hover:border-fire-400/60"
                >
                  Login
                </ButtonLink>
                <ButtonLink
                  href="/auth/register"
                  variant="fire"
                  size="md"
                  className="rounded-full px-5 py-2 font-semibold uppercase tracking-[0.4em] shadow-[0_15px_45px_-25px_rgba(255,0,92,0.8)]"
                >
                  Únete ahora
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection onSearch={handleSearch} />

      {/* Executive Command Ribbon */}
      <div className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[rgba(10,7,14,0.92)] p-8 shadow-[0_70px_140px_-80px_rgba(255,0,92,0.85)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute -left-24 top-12 h-44 w-44 rounded-full bg-fire-500/22 blur-[140px]" />
          <div className="pointer-events-none absolute -right-20 bottom-10 h-48 w-48 rounded-full bg-lust-500/22 blur-[150px]" />
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl space-y-4">
              <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.4em] text-fire-200">
                Command center QA
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-ping" />
              </span>
              <h2 className="text-3xl font-semibold leading-tight text-warm-50">
                Accede a cada capa operativa del ecosistema Lust sin perder precisión.
              </h2>
              <p className="text-sm leading-relaxed text-warm-300">
                Activa anfitriones, consulta telemetría y valida auditorías en segundos. Cada acceso está protegido por protocolos cifrados y checklist QA permanente.
              </p>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
              {executiveShortcuts.map((shortcut) => (
                <ButtonLink
                  key={shortcut.href}
                  href={shortcut.href}
                  variant="dark"
                  size="lg"
                  fullWidth
                  prefetch={false}
                  className="group flex flex-col items-start justify-between gap-4 rounded-[1.75rem] border border-white/10 bg-dark-950/80 px-5 py-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-fire-400/50 hover:text-fire-100"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-lg text-fire-100">
                    {shortcut.icon}
                  </span>
                  <div className="space-y-2">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.4em] text-warm-400 transition-colors duration-300 group-hover:text-fire-200">
                      {shortcut.label}
                    </span>
                    <p className="text-sm leading-relaxed text-warm-300 transition-colors duration-300 group-hover:text-warm-50">
                      {shortcut.caption}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-fire-200 transition-colors duration-300 group-hover:text-fire-100">
                    Abrir panel
                    <span aria-hidden>↗</span>
                  </span>
                </ButtonLink>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Signal Runway */}
      <div className="relative mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-full border border-white/10 bg-[rgba(10,6,12,0.88)] px-6 py-4 shadow-[0_60px_120px_-70px_rgba(255,0,92,0.7)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute -left-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-fire-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-12 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-lust-500/30 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="relative flex items-center gap-8 overflow-hidden text-[10px] font-semibold uppercase tracking-[0.45em] text-warm-300">
            <div className="flex min-w-max items-center gap-8 marquee-track">
              {runwaySignals.map((signal) => (
                <span key={signal.label} className="flex items-center gap-3 whitespace-nowrap">
                  <span className="text-lg">{signal.icon}</span>
                  {signal.label}
                  <span className="h-px w-12 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </span>
              ))}
            </div>
            <div className="flex min-w-max items-center gap-8 marquee-track" aria-hidden="true">
              {runwaySignals.map((signal) => (
                <span key={`${signal.label}-duplicate`} className="flex items-center gap-3 whitespace-nowrap">
                  <span className="text-lg">{signal.icon}</span>
                  {signal.label}
                  <span className="h-px w-12 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </span>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 marquee-fade" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 rotate-180 marquee-fade" />
        </div>
      </div>

      {/* Main Content */}
      <main id="catalogo" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle,_rgba(255,107,53,0.12)_0%,rgba(5,5,5,0)_65%)]" />
          <div className="absolute inset-x-0 bottom-0 h-[28rem] bg-[radial-gradient(circle,_rgba(255,0,96,0.12)_0%,rgba(5,5,5,0)_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0)_45%,rgba(255,255,255,0.05)_100%)] opacity-40" />
        </div>

        {/* Category Tabs */}
        <div className="mb-14">
          <CategoryTabs
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Luxury Highlights */}
        <section className="mb-16 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(130deg, rgba(255,107,53,0.25) 0%, rgba(255,0,92,0.18) 100%)' }} />
            <div className="absolute -left-16 top-16 h-32 w-32 rounded-full bg-fire-500/30 blur-3xl" />
            <div className="absolute -right-14 bottom-12 h-32 w-32 rounded-full bg-lust-500/25 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="space-y-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-dark-950/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-fire-200">
                  Nueva generación
                </span>
                <h2 className="text-3xl font-semibold leading-tight text-warm-50">
                  Personalizamos tu viaje sensorial con algoritmos que aprenden de tus deseos.
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-warm-300">
                  Nuestro motor de recomendación combina preferencias, ubicación y disponibilidad en tiempo real para sugerirte anfitriones con afinidad auténtica. Más precisión, cero fricción.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[{ label: 'Hosts verificados', value: '320+' }, { label: 'Experiencias inmersivas', value: '210' }, { label: 'Tiempo medio de match', value: '08m' }].map((stat) => (
                  <div key={stat.label} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-dark-950/60 px-4 py-5 text-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.25),_transparent_60%)] opacity-40" />
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-70" />
                    <div className="relative text-2xl font-semibold text-fire-200">{stat.value}</div>
                    <div className="relative mt-1 text-[11px] uppercase tracking-[0.35em] text-warm-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                title: 'Curaduría biométrica',
                description: 'Validamos identidad, estilo y feedback verificable para mantener un catálogo impecable.',
                icon: '💎',
              },
              {
                title: 'Agenda cognitiva',
                description: 'Disponibilidad sincronizada con recordatorios automáticos y confirmación inmediata.',
                icon: '🧠',
              },
              {
                title: 'Experiencias inmersivas',
                description: 'Diseños sensoriales con playlists, ambientación y propuestas exclusivas por anfitrión.',
                icon: '🌌',
              },
              {
                title: 'Soporte 24/7',
                description: 'Concierge privado que resuelve ajustes en minutos, siempre con total confidencialidad.',
                icon: '🤝',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-fire-400/40"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.25) 0%, transparent 60%)' }} />
                <div className="relative flex flex-col gap-4">
                  <span className="text-3xl">{feature.icon}</span>
                  <h3 className="text-lg font-semibold text-warm-50">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-warm-300">{feature.description}</p>
                  <span className="inline-flex w-max items-center gap-2 rounded-full border border-fire-500/30 bg-fire-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.4em] text-fire-200">Inmersivo
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fire-400 to-lust-400 animate-ping" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Immersive timeline */}
        <section className="mb-16 relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.22),_transparent_60%)] opacity-40" />
          <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_45%,rgba(255,0,92,0.08)_100%)] opacity-40" />
          <div className="relative grid gap-8 lg:grid-cols-[0.55fr,1.45fr]">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-dark-950/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-fire-200">
                Ritual Lust Experience
              </span>
              <h3 className="text-3xl font-semibold text-warm-50">
                Deja que el algoritmo cuide cada detalle sensorial en cuatro momentos.
              </h3>
              <p className="text-sm leading-relaxed text-warm-300">
                Desde la primera inspiración hasta el feedback posterior, el journey se viste de holografías, mensajes personalizados y sorpresas ocultas.
              </p>
            </div>
            <div className="relative grid gap-6 md:grid-cols-2">
              {[{
                title: 'Descubrimiento prismático',
                description: 'Te mostramos hosts con afinidad vibracional, playlists e iluminación sugerida.',
                accent: 'from-fire-400/40 via-fire-500/10 to-transparent',
              }, {
                title: 'Confirmación inmersiva',
                description: 'Calendario inteligente, códigos secretos y check-in sin fricciones en minutos.',
                accent: 'from-lust-400/40 via-lust-500/10 to-transparent',
              }, {
                title: 'Sesión multisensorial',
                description: 'Guiones de ambientación, aromas y servicios extra sugeridos según tu mood.',
                accent: 'from-emerald-400/40 via-emerald-500/10 to-transparent',
              }, {
                title: 'Feedback calibrado',
                description: 'Un panel privado para calificar, desbloquear upgrades y recibir nuevas invitaciones.',
                accent: 'from-sky-400/40 via-sky-500/10 to-transparent',
              }].map((step, index) => (
                <div
                  key={step.title}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-dark-950/70 p-6 transition-all duration-300 hover:border-fire-400/40 hover:shadow-[0_25px_60px_-35px_rgba(255,0,92,0.65)]"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-80`} />
                  <div className="relative flex flex-col gap-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-fire-200">
                      {index + 1}
                    </div>
                    <h4 className="text-lg font-semibold text-warm-50">{step.title}</h4>
                    <p className="text-sm leading-relaxed text-warm-300">{step.description}</p>
                    <span className="text-[10px] uppercase tracking-[0.35em] text-warm-500">Detalle curado</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Signature Scenes */}
        <section className="mb-16 relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-white/[0.04] p-10 shadow-[0_50px_120px_-80px_rgba(255,0,92,0.8)] backdrop-blur-xl">
          <div className="pointer-events-none absolute -left-20 top-16 h-40 w-40 rounded-full bg-fire-500/25 blur-3xl floating-orb" />
          <div className="pointer-events-none absolute -right-24 bottom-10 h-48 w-48 rounded-full bg-lust-500/25 blur-3xl floating-orb" style={{ animationDelay: '2.5s' }} />
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="relative mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-fire-200">
                Colecciones inmersivas
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </span>
              <h3 className="text-3xl font-semibold text-warm-50">
                Escenarios sensoriales diseñados para cautivar cada noche.
              </h3>
              <p className="text-sm leading-relaxed text-warm-300">
                Seleccionamos cápsulas de experiencias con storytelling, gastronomía y ambientación premium para que cada cita tenga el guion perfecto. Descubre hosts con acceso a espacios privados, efectos lumínicos y concierge dedicado.
              </p>
            </div>
            <ButtonLink
              href="/services"
              variant="fire"
              size="lg"
              className="self-start rounded-full px-7 py-3 text-sm font-semibold uppercase tracking-[0.4em]"
            >
              Explorar ahora
            </ButtonLink>
          </div>
          <div className="relative grid gap-6 lg:grid-cols-3">
            {sensoryStories.map((story) => (
              <div
                key={story.title}
                className="group relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-dark-950/65 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-fire-400/50 hover:shadow-[0_45px_120px_-80px_rgba(255,0,92,0.9)]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${story.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-90`} />
                <div className="absolute -right-10 top-8 h-28 w-28 rounded-full border border-white/10 opacity-30" />
                <div className="relative flex h-full flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-warm-200">
                      <span className="text-base">📍</span>
                      {story.location}
                    </div>
                    <h4 className="text-2xl font-semibold text-warm-50">{story.title}</h4>
                    <p className="text-sm leading-relaxed text-warm-200">{story.description}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-warm-200">
                      {story.chips.map((chip) => (
                        <span
                          key={chip}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-dark-950/60 px-3 py-1 transition-colors duration-300 group-hover:border-white/40"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fire-400 to-lust-400" />
                          {chip}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={story.href}
                      className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-fire-200 transition-colors duration-300 hover:text-fire-100"
                    >
                      Ver anfitriones
                      <span className="text-base">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Aurora Mood Matrix */}
        <section className="mb-16 relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[rgba(10,6,12,0.92)] p-10 backdrop-blur-2xl">
          <div className="aurora-gradient pointer-events-none absolute -inset-1 opacity-60" />
          <div className="pointer-events-none absolute -left-24 top-16 h-48 w-48 rounded-full bg-fire-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-14 h-52 w-52 rounded-full bg-lust-500/20 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[0.9fr,1.1fr]">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-fire-200">
                Tecnología inmersiva 4D
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </span>
              <div className="space-y-4">
                <h3 className="text-3xl font-semibold text-warm-50">
                  Activamos atmósferas holográficas que evolucionan con tus micro reacciones.
                </h3>
                <p className="text-sm leading-relaxed text-warm-300">
                  Cada anfitrión integra sensores de mood, aromas inteligentes y storytelling dinámico. Nuestros algoritmos calibran la experiencia en vivo para mantenerte en tu zona de fascinación ideal.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {conciergeSignals.map((signal) => (
                  <div
                    key={signal.title}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-dark-950/70 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-fire-400/50 hover:shadow-[0_32px_80px_-60px_rgba(255,0,92,0.9)]"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${signal.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-80`} />
                    <div className="relative flex flex-col gap-4">
                      <div className="flex items-center justify-between text-sm text-warm-200">
                        <span className="inline-flex items-center gap-3 text-base font-semibold text-warm-50">
                          <span className="text-xl">{signal.icon}</span>
                          {signal.title}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-fire-100">
                          {signal.value}
                        </span>
                      </div>
                      <p className="text-[13px] leading-relaxed text-warm-300">{signal.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-dark-950/70 p-6">
                <div className="aurora-sheen pointer-events-none absolute inset-0 opacity-40" />
                <div className="relative flex flex-col gap-4">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.4em] text-warm-400">
                    <span>Experiencias calibradas</span>
                    <span className="text-fire-200">82%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-fire-400 via-fire-500 to-lust-500" style={{ width: '82%' }} />
                  </div>
                  <p className="text-sm leading-relaxed text-warm-300">
                    El motor predictivo ajusta iluminación, ambientación sonora y aftercare de cada cita en tiempo real.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-6">
              {auraMoments.map((moment, index) => (
                <div
                  key={moment.title}
                  className="tilt-card group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-dark-950/75 p-7 transition-all duration-500 hover:border-fire-400/60"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${moment.gradient} opacity-70`} />
                  <div className="absolute -right-16 top-14 h-36 w-36 rounded-full border border-white/10 opacity-20" />
                  <div className="relative flex flex-col gap-5">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.35em] text-warm-200">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-warm-100">
                        <span className="text-base">✨</span>
                        {moment.tag}
                      </span>
                      <span>#{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <h4 className="text-2xl font-semibold text-warm-50">{moment.title}</h4>
                    <p className="text-sm leading-relaxed text-warm-200">{moment.description}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-warm-300">
                      {moment.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-dark-950/60 px-3 py-1 transition-colors duration-300 group-hover:border-white/30"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fire-400 to-lust-400" />
                          {highlight}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-[11px] uppercase tracking-[0.35em] text-warm-200">
                      <span>{moment.metricLabel}</span>
                      <span className="text-2xl font-semibold text-warm-50">{moment.metric}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prestige Roster */}
        <section className="mb-16 relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[rgba(8,5,12,0.9)] p-10 backdrop-blur-2xl">
          <div className="pointer-events-none absolute -left-32 top-14 h-48 w-48 rounded-full bg-fire-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-28 bottom-12 h-56 w-56 rounded-full bg-lust-500/25 blur-[150px]" />
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="hyper-grid absolute inset-0 opacity-50" />
          </div>
          <div className="relative space-y-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-fire-200">
                  Hosts Signature
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                </span>
                <h3 className="text-3xl font-semibold text-warm-50">
                  Un roster cinematográfico listo para tu próximo ritual Lust.
                </h3>
                <p className="max-w-2xl text-sm leading-relaxed text-warm-300">
                  Conoce a los anfitriones que concentran las experiencias con mayor afinidad sensorial, storytelling curado y upgrades inmediatos.
                </p>
              </div>
              <div className="trusted-band">
                {partnerSignatures.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto hide-scrollbar">
              <div className="prestige-track">
                {prestigeRoster.map((host) => (
                  <div key={host.name} className="prestige-card p-7">
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${host.accent} opacity-30`} />
                    <div className="relative flex h-full flex-col gap-6">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-warm-400">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-warm-200">
                          {host.status}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold text-warm-100">
                          {host.metric}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-2xl font-semibold text-warm-50">{host.name}</h4>
                        <p className="mt-1 text-sm text-warm-300">{host.role}</p>
                      </div>
                      <p className="text-sm leading-relaxed text-warm-200">{host.narrative}</p>
                      <div className="mt-auto flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-warm-200">
                        {host.features.map((feature) => (
                          <span
                            key={feature}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-dark-950/60 px-3 py-1"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fire-400 to-lust-500" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Concierge Control Deck */}
        <section className="mb-16 relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[rgba(7,4,12,0.94)] p-10 backdrop-blur-2xl">
          <div className="signal-veil pointer-events-none absolute inset-0 opacity-30" />
          <div className="pointer-events-none absolute -left-32 top-10 h-44 w-44 rounded-full bg-fire-500/20 blur-[140px]" />
          <div className="pointer-events-none absolute -right-28 bottom-12 h-52 w-52 rounded-full bg-lust-500/25 blur-[150px]" />
          <div className="relative grid gap-12 lg:grid-cols-[0.78fr,1.22fr]">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-fire-200">
                  Control deck Lust
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                </span>
                <h3 className="text-3xl font-semibold text-warm-50">
                  Orquesta cada escena con precisión de estudio y protocolos cifrados.
                </h3>
                <p className="text-sm leading-relaxed text-warm-300">
                  Desde el briefing inicial hasta el aftercare, el panel Lust coordina hosts, ambientación y upgrades en tiempo real para que solo te concentres en disfrutar.
                </p>
              </div>

              <div className="space-y-6">
                {immersionTimeline.map((stage) => (
                  <div key={stage.phase} className="timeline-node">
                    <div className="relative ml-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                      <div className="mb-2 text-[11px] uppercase tracking-[0.4em] text-warm-400">Paso {stage.phase}</div>
                      <h4 className="text-xl font-semibold text-warm-50">{stage.title}</h4>
                      <p className="mt-3 text-sm leading-relaxed text-warm-300">{stage.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {controlLayers.map((layer) => (
                <div
                  key={layer.title}
                  className="group relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-[rgba(9,6,12,0.85)] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-fire-400/40"
                >
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${layer.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-70`} />
                  <div className="relative flex h-full flex-col gap-5">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-warm-400">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-warm-200">
                        {layer.badge}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold text-warm-100">
                        {layer.metric}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-semibold text-warm-50">{layer.title}</h4>
                      <p className="text-sm leading-relaxed text-warm-300">{layer.description}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-warm-400">
                      <span>{layer.metricLabel}</span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-dark-950/60 px-3 py-1 text-warm-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fire-400 to-lust-500" />
                        Monitor en vivo
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Immersion Blueprint Suite */}
        <section className="mb-16 relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[rgba(8,5,12,0.95)] p-10 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.14),transparent_65%)] opacity-80" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_45%,rgba(255,0,92,0.08)_100%)]" />
          <div className="pointer-events-none absolute -left-24 bottom-8 h-48 w-48 rounded-full bg-fire-500/25 blur-[150px]" />
          <div className="pointer-events-none absolute -right-16 top-12 h-52 w-52 rounded-full bg-lust-500/25 blur-[150px]" />
          <div className="pointer-events-none absolute inset-0 blueprint-matrix" />

          <div className="relative grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-fire-200">
                  Blueprint insignia
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                </span>
                <h3 className="text-3xl font-semibold text-warm-50">
                  Elige el set Lust y observa cómo respondemos con gemelos digitales y métricas en vivo.
                </h3>
                <p className="text-sm leading-relaxed text-warm-300 lg:max-w-2xl">
                  Cada blueprint concentra anfitriones, ambientación y protocolos QA para una puesta en escena impecable. Alterna entre suites y desbloquea la narrativa completa, métricas operativas y upgrades sugeridos.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {immersionBlueprints.map((blueprint) => {
                  const isActive = blueprint.id === activeBlueprint;

                  return (
                    <button
                      key={blueprint.id}
                      type="button"
                      onClick={() => setActiveBlueprint(blueprint.id)}
                      className={clsx(
                        'group relative overflow-hidden rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] transition-all duration-300',
                        isActive
                          ? 'border-fire-200/70 bg-white/10 text-fire-50 shadow-[0_20px_60px_-35px_rgba(255,107,53,0.75)]'
                          : 'border-white/10 text-warm-300 hover:border-fire-200/40 hover:text-fire-100'
                      )}
                      aria-pressed={isActive}
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        <span className="text-lg">{blueprint.label === 'Nocturnal Bloom' ? '🌿' : blueprint.id === 'velvet' ? '🕶️' : '🌌'}</span>
                        {blueprint.label}
                      </span>
                      {isActive && (
                        <span className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${blueprint.accent}`} aria-hidden />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl">
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${activeBlueprintData.accent} opacity-40`} />
                <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-fire-500/20 blur-[120px]" />
                <div className="pointer-events-none absolute -right-10 -bottom-16 h-40 w-40 rounded-full bg-lust-500/20 blur-[130px]" />

                <div className="relative space-y-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-2xl font-semibold text-warm-50">{activeBlueprintData.title}</h4>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-warm-200">{activeBlueprintData.description}</p>
                    </div>
                    <ButtonLink
                      href={activeBlueprintData.href}
                      variant="dark"
                      size="md"
                      className="rounded-full border border-white/15 bg-transparent px-5 py-2 uppercase tracking-[0.35em] text-warm-200 transition-all duration-300 hover:border-fire-300/60 hover:text-fire-100"
                      prefetch={false}
                    >
                      Reservar escena
                    </ButtonLink>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-warm-200">
                    {activeBlueprintData.features.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-dark-950/60 px-3 py-1"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fire-400 to-lust-500" />
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {activeBlueprintData.metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-dark-950/60 px-4 py-5 text-center"
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.28),transparent_60%)] opacity-30" />
                        <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-70" />
                        <div className="relative text-2xl font-semibold text-fire-200">{metric.value}</div>
                        <div className="relative mt-1 text-[11px] uppercase tracking-[0.35em] text-warm-500">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {blueprintSignals.map((signal) => (
                <div
                  key={signal.title}
                  className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(10,7,14,0.88)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-fire-400/40"
                >
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${signal.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-70`} />
                  <div className="relative flex h-full flex-col gap-4">
                    <span className="text-3xl">{signal.icon}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-warm-50">{signal.title}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-warm-300">{signal.description}</p>
                    </div>
                    <span className="mt-auto inline-flex w-max items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-warm-200">
                      QA activo
                      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fire-400 to-lust-500" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cinematic Vault Suite */}
        <section className="mb-16 relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[rgba(7,5,14,0.96)] p-10 backdrop-blur-3xl">
          <div className="pointer-events-none absolute inset-0 cinema-grid opacity-60" />
          <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-fire-500/20 blur-[150px]" />
          <div className="pointer-events-none absolute -right-32 bottom-12 h-64 w-64 rounded-full bg-lust-500/20 blur-[160px]" />
          <div className="pointer-events-none absolute inset-0 cinema-veil" />
          <div className="relative grid gap-10 xl:grid-cols-[0.85fr,1.15fr]">
            <div className="space-y-10">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-fire-200">
                  Concierge cinema
                  <span className="h-2 w-2 rounded-full bg-fire-300 animate-ping" />
                </span>
                <h3 className="text-3xl font-semibold text-warm-50">
                  Exhibiciones inmersivas con dirección creativa y protocolos blindados.
                </h3>
                <p className="text-sm leading-relaxed text-warm-300">
                  Selecciona una suite cinematográfica para visualizar métricas operativas, garantías de confidencialidad y los elementos protagonistas que cautivan a clientes de alto perfil.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {cinematicShowcases.map((showcase) => {
                  const isActive = showcase.id === activeShowcase;

                  return (
                    <button
                      key={showcase.id}
                      type="button"
                      onClick={() => setActiveShowcase(showcase.id)}
                      className={clsx(
                        'relative overflow-hidden rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] transition-all duration-300',
                        isActive
                          ? 'border-fire-300/80 bg-white/10 text-fire-100 shadow-[0_20px_60px_-40px_rgba(249,115,22,0.9)]'
                          : 'border-white/10 bg-white/5 text-warm-300 hover:border-fire-200/40 hover:text-fire-100',
                      )}
                    >
                      <span className="relative z-10">{showcase.label}</span>
                      {isActive && <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-fire-400/20 via-fire-500/20 to-lust-500/20" aria-hidden />}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {cinematicProofPoints.map((point) => (
                  <div
                    key={point.title}
                    className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-fire-400/40"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${point.accent} opacity-30 transition-opacity duration-500 group-hover:opacity-80`} aria-hidden />
                    <div className="relative space-y-3">
                      <span className="text-2xl">{point.icon}</span>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.35em] text-warm-100">{point.title}</h4>
                      <p className="text-sm leading-relaxed text-warm-300">{point.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[rgba(10,8,18,0.92)] p-8 cinema-panel">
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${activeShowcaseData.accent} opacity-70`} aria-hidden />
              <div className="pointer-events-none absolute inset-0 cinema-orbit" />
              <div className="relative space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-dark-950/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-warm-200">
                    {activeShowcaseData.label}
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fire-400 to-lust-500 animate-ping" />
                  </span>
                  <ButtonLink
                    href={activeShowcaseData.href}
                    variant="primary"
                    size="sm"
                    className="shadow-[0_20px_60px_-30px_rgba(249,115,22,0.65)]"
                  >
                    Reservar suite
                  </ButtonLink>
                </div>

                <div className="space-y-4">
                  <h4 className="text-2xl font-semibold text-warm-50">{activeShowcaseData.title}</h4>
                  <p className="text-sm leading-relaxed text-warm-200">{activeShowcaseData.description}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {activeShowcaseData.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-500 hover:-translate-y-0.5 hover:border-fire-300/40"
                    >
                      <div className="pointer-events-none absolute inset-0 cinema-metric-shimmer opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                      <div className="relative space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-warm-400">{metric.label}</p>
                        <p className="text-2xl font-semibold text-warm-50">{metric.value}</p>
                        <p className="text-sm text-warm-300">{metric.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="glow-divider" />

                <div className="grid gap-3 sm:grid-cols-2">
                  {activeShowcaseData.gallery.map((item) => (
                    <div
                      key={item}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-dark-950/60 p-4 transition-all duration-500 hover:-translate-y-0.5 hover:border-fire-300/30 cinema-gallery-tile"
                    >
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                      <div className="relative flex items-center justify-between gap-4 text-sm text-warm-200">
                        <span>{item}</span>
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-lg text-warm-100">↗</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  {activeShowcaseData.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-warm-200"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Velvet Pulse Observatory */}
        <section className="mb-16 relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[rgba(7,4,12,0.94)] p-10 backdrop-blur-2xl">
          <div className="signal-veil pointer-events-none absolute inset-0 opacity-40" />
          <div className="pointer-events-none absolute -left-28 top-12 h-48 w-48 rounded-full bg-fire-500/20 blur-[140px] floating-orb" />
          <div className="pointer-events-none absolute -right-24 bottom-10 h-56 w-56 rounded-full bg-lust-500/25 blur-[150px] floating-orb" style={{ animationDelay: '4s' }} />
          <div className="relative grid gap-10 lg:grid-cols-[0.72fr,1.28fr]">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-fire-200">
                  Velvet pulse en vivo
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                </span>
                <h3 className="text-3xl font-semibold text-warm-50">
                  Lecturas en tiempo real del club privado y sus próximos lanzamientos.
                </h3>
                <p className="text-sm leading-relaxed text-warm-300">
                  Monitorea la temperatura del ecosistema Lust: puntuaciones sensoriales, rebookings exclusivos y nuevos módulos en camino.
                  Cada métrica impulsa experiencias más inmersivas y seguras.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.05] p-6 holo-ring">
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.4em] text-warm-400">
                    <span>Score concierge</span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-fire-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      Tiempo real
                    </span>
                  </div>
                  <div className="space-y-5">
                    {velvetSignals.map((signal) => (
                      <div key={signal.label} className="space-y-3">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-warm-400">
                          <span>{signal.caption}</span>
                          <span className="text-sm font-semibold text-warm-100">{signal.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${signal.accent}`}
                            style={{ width: `${signal.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.35em] text-warm-300">
                    <span>Confirmación IA</span>
                    <span className="text-sm font-semibold text-warm-100">03m 12s</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {futureLaunches.map((launch) => (
                  <div
                    key={launch.title}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-5 transition-all duration-500 hover:-translate-y-1 hover:border-fire-400/40"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${launch.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-90`} />
                    <div className="relative flex flex-col gap-4">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-warm-400">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-dark-950/60 px-3 py-1 text-warm-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fire-400 to-lust-400 animate-ping" />
                          {launch.status}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-warm-200">{launch.eta}</span>
                      </div>
                      <div className="space-y-2 text-sm leading-relaxed text-warm-200">
                        <h4 className="text-xl font-semibold text-warm-50">{launch.title}</h4>
                        <p>{launch.description}</p>
                      </div>
                      <div className="glow-divider" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {luminaryVoices.map((voice) => (
                <div
                  key={voice.name}
                  className="group relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-dark-950/70 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-fire-400/50"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${voice.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-90`} />
                  <div className="relative flex h-full flex-col justify-between gap-6">
                    <div className="space-y-4">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-warm-200">
                        <span className="text-base">{voice.symbol}</span>
                        {voice.badge}
                      </span>
                      <p className="text-sm leading-relaxed text-warm-200">“{voice.quote}”</p>
                    </div>
                    <div className="space-y-3 text-[11px] uppercase tracking-[0.35em] text-warm-400">
                      <div className="flex items-center justify-between text-sm text-warm-100">
                        <div>
                          <p className="font-semibold text-warm-50">{voice.name}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.4em] text-warm-400">{voice.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-fire-100">{voice.metric}</p>
                          <p className="text-[10px] text-warm-300">{voice.metricLabel}</p>
                        </div>
                      </div>
                      <div className="h-1 rounded-full bg-white/10">
                        <div className="h-full w-full rounded-full bg-gradient-to-r from-fire-400 via-fire-500 to-lust-500" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Innovation Lab */}
        <section className="mb-16 relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[rgba(6,4,12,0.96)] p-10 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.18),transparent_70%)] opacity-60" />
          <div className="pointer-events-none absolute -left-28 top-10 h-48 w-48 rounded-full bg-fire-500/18 blur-[140px]" />
          <div className="pointer-events-none absolute -right-24 bottom-10 h-56 w-56 rounded-full bg-emerald-400/20 blur-[150px]" />
          <div className="pointer-events-none absolute inset-0 hyper-grid opacity-30" />
          <div className="relative grid gap-12 lg:grid-cols-[0.75fr,1.25fr]">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-fire-200">
                  Innovation lab
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-ping" />
                </span>
                <h3 className="text-3xl font-semibold text-warm-50">
                  Orquesta upgrades con herramientas QA diseñadas para producción en vivo.
                </h3>
                <p className="text-sm leading-relaxed text-warm-300">
                  Desde la calibración sensorial hasta la vigilancia de canales cifrados, nuestra suite experimental mantiene cada escena impecable y lista para impresionar a tus invitados.
                </p>
              </div>

              <div className="grid gap-4">
                {innovationTracks.map((track) => (
                  <div
                    key={track.title}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-dark-950/70 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-fire-400/40"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${track.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-80`} />
                    <div className="relative flex flex-col gap-3">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-warm-400">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-warm-200">
                          <span className="text-lg">{track.icon}</span>
                          {track.status}
                        </span>
                        <span className="text-warm-200">QA+</span>
                      </div>
                      <h4 className="text-lg font-semibold text-warm-50">{track.title}</h4>
                      <p className="text-sm leading-relaxed text-warm-300">{track.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="overflow-x-auto hide-scrollbar">
                <div className="flex min-w-full gap-6 snap-x snap-mandatory">
                  {signatureReels.map((reel) => (
                    <article
                      key={reel.title}
                      className="group relative min-w-[280px] snap-start overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-fire-400/40 sm:min-w-[320px]"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${reel.accent} opacity-40 transition-opacity duration-500 group-hover:opacity-80`} />
                      <div className="relative flex h-full flex-col gap-5">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-warm-400">
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-dark-950/60 px-3 py-1 text-warm-200">
                            {reel.subtitle}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold text-warm-100">
                            {reel.statValue}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-2xl font-semibold text-warm-50">{reel.title}</h4>
                          <p className="text-sm leading-relaxed text-warm-200">{reel.highlight}</p>
                          <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-warm-300">
                            {reel.chips.map((chip) => (
                              <span
                                key={chip}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-dark-950/60 px-3 py-1"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fire-400 to-lust-500" />
                                {chip}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-auto flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-warm-400">
                          <span>{reel.statLabel}</span>
                          <ButtonLink
                            href={reel.href}
                            variant="dark"
                            size="sm"
                            className="rounded-full border border-white/10 bg-transparent px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-warm-200 transition-all duration-300 hover:border-fire-400/60 hover:text-fire-100"
                            prefetch={false}
                          >
                            Explorar
                          </ButtonLink>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {complianceSignals.map((signal) => (
                  <div key={signal.label} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className={`absolute inset-0 bg-gradient-to-r ${signal.accent} opacity-20`} aria-hidden />
                    <div className="relative space-y-3 text-[11px] uppercase tracking-[0.35em] text-warm-400">
                      <div className="flex items-center justify-between text-warm-200">
                        <span>{signal.label}</span>
                        <span className="text-sm font-semibold text-warm-50">{signal.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${signal.accent}`}
                          style={{ width: `${signal.value}%` }}
                        />
                      </div>
                      <p className="text-xs normal-case tracking-normal text-warm-300">{signal.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Concierge Command Center */}
        <section className="mb-16 relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[rgba(5,4,10,0.94)] p-10 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.12),transparent_65%)] opacity-70" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_45%,rgba(56,189,248,0.08)_100%)] opacity-40" />
          <div className="pointer-events-none absolute -left-24 top-14 h-48 w-48 rounded-full bg-fire-500/25 blur-[140px]" />
          <div className="pointer-events-none absolute -right-20 bottom-12 h-56 w-56 rounded-full bg-lust-500/25 blur-[150px]" />
          <div className="relative z-10 flex flex-col gap-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-fire-100">
                  QA Command · Concierge
                  <span className="h-2 w-2 rounded-full bg-fire-300 animate-ping" />
                </span>
                <h3 className="text-3xl font-semibold text-warm-50">
                  Orquesta cada escena con precisión quirúrgica y un panel operativo digno del club Lust.
                </h3>
                <p className="text-sm leading-relaxed text-warm-300 lg:max-w-2xl">
                  Alterna entre la telemetría en vivo y la ruta concierge completa. Cada lectura se alimenta de sensores, feedback humano y protocolos blindados que aseguran experiencias impecables.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                {commandViews.map((view) => {
                  const isActive = commandView === view.id;

                  return (
                    <button
                      key={view.id}
                      type="button"
                      onClick={() => setCommandView(view.id)}
                      className={clsx(
                        'group relative overflow-hidden rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] transition-all duration-300',
                        isActive
                          ? 'border-fire-200/80 bg-white/10 text-fire-50 shadow-[0_18px_60px_-35px_rgba(239,68,68,0.75)]'
                          : 'border-white/10 text-warm-300 hover:border-fire-200/40 hover:text-fire-100'
                      )}
                      aria-pressed={isActive}
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        <span className="text-lg">{view.icon}</span>
                        {view.label}
                      </span>
                      {isActive && (
                        <span
                          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-fire-500/25 via-lust-500/15 to-sky-400/20"
                          aria-hidden
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-sm leading-relaxed text-warm-300 md:text-base">
              {commandViews.find((view) => view.id === commandView)?.description}
            </p>

            {commandView === 'dashboard' ? (
              <div className="grid gap-10 xl:grid-cols-[1.55fr,1fr]">
                <div className="grid gap-6 md:grid-cols-2">
                  {commandDashboardMetrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-fire-300/40"
                    >
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fire-500/15 via-fire-400/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="relative space-y-4">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-warm-300">
                          <span>{metric.context}</span>
                          <span
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-dark-950/70 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-fire-100"
                          >
                            {metric.delta}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm uppercase tracking-[0.35em] text-warm-400">{metric.label}</p>
                          <p className="text-4xl font-semibold text-warm-50">{metric.value}</p>
                        </div>
                        <div className="glow-divider" />
                        <p className="text-xs leading-relaxed text-warm-300">
                          Auditorías cruzadas con IA y concierge asignado aseguran cada reserva y contacto.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-6">
                  {commandDashboardStreams.map((stream) => (
                    <div
                      key={stream.title}
                      className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-dark-950/70 p-6 shadow-[0_32px_120px_-80px_rgba(255,56,120,0.75)]"
                    >
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-lust-500/15 via-fire-500/10 to-transparent opacity-80" />
                      <div className="relative space-y-4">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-warm-400">
                          <span>{stream.caption}</span>
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-warm-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                            Live
                          </span>
                        </div>
                        <h4 className="text-xl font-semibold text-warm-50">{stream.title}</h4>
                        <ul className="space-y-2 text-sm leading-relaxed text-warm-300">
                          {stream.highlights.map((highlight) => (
                            <li key={highlight} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fire-400 to-lust-400" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}

                  <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-400/10 via-fire-500/10 to-transparent opacity-80" />
                    <div className="relative space-y-4">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-warm-400">
                        <span>Soporte prioritario</span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-dark-950/60 px-3 py-1 text-warm-200">
                          Concierge 24/7
                        </span>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-semibold text-warm-50">Desk ejecutivo Lust QA</h4>
                        <p className="text-sm leading-relaxed text-warm-300">
                          Coordina auditorías express, upgrades de escena y seguimiento discreto sin salir del panel.
                        </p>
                      </div>
                      <ButtonLink
                        href="/services?category=VERIFICACION"
                        variant="fire"
                        size="sm"
                        className="w-full justify-between"
                      >
                        Agendar auditoría privada
                        <span aria-hidden>↗</span>
                      </ButtonLink>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-10 xl:grid-cols-[1.5fr,1fr]">
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-dark-950/70 p-8">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.18),transparent_70%)] opacity-70" />
                  <div className="pointer-events-none absolute inset-0 hyper-grid opacity-20" />
                  <div className="relative space-y-6">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-warm-400">
                      <span>Ruta concierge certificada</span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-warm-200">
                        Trail QA
                      </span>
                    </div>
                    <ol className="space-y-5">
                      {commandTimeline.map((step, index) => (
                        <li key={step.title} className="relative pl-8">
                          <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-gradient-to-r from-fire-400 to-lust-400" />
                          <div className="flex flex-wrap items-baseline justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.35em] text-warm-400">{step.time}</p>
                              <h4 className="text-lg font-semibold text-warm-50">{step.title}</h4>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-dark-950/60 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-warm-200">
                              {step.status}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-warm-300">{step.detail}</p>
                          {index < commandTimeline.length - 1 && (
                            <span className="absolute left-0 top-4 bottom-[-20px] w-px bg-gradient-to-b from-fire-400/60 via-white/10 to-transparent" />
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="relative overflow-hidden rounded-[1.85rem] border border-white/10 bg-white/[0.05] p-6">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fire-500/15 via-lust-500/10 to-transparent opacity-80" />
                    <div className="relative space-y-4">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-warm-400">
                        <span>Guardrails QA</span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-dark-950/60 px-3 py-1 text-warm-200">
                          Dual control
                        </span>
                      </div>
                      <ul className="space-y-3">
                        {commandTimelineGuardrails.map((guardrail) => (
                          <li key={guardrail.label} className="rounded-2xl border border-white/10 bg-dark-950/70 px-4 py-3">
                            <p className="text-[11px] uppercase tracking-[0.35em] text-warm-400">{guardrail.label}</p>
                            <p className="mt-2 text-sm leading-relaxed text-warm-200">{guardrail.value}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-[1.85rem] border border-white/10 bg-dark-950/70 p-6">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-400/15 via-emerald-400/10 to-transparent opacity-60" />
                    <div className="relative space-y-4">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-warm-400">
                        <span>Concierge escalation desk</span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-warm-200">
                          SLA 5 min
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-warm-300">
                        Escala upgrades, incidentes o nuevas escenas directo con el squad ejecutivo y registros trazables.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-warm-200">
                          📞 Línea discreta
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-warm-200">
                          🛰️ Canal cifrado
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-warm-200">
                          🎧 Concierge IA
                        </span>
                      </div>
                      <ButtonLink
                        href="/contacto"
                        variant="lust"
                        size="sm"
                        className="w-full justify-between"
                      >
                        Conectar con squad QA
                        <span aria-hidden>↗</span>
                      </ButtonLink>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Quality Assurance Deck */}
        <section className="mb-16 relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[rgba(6,5,12,0.96)] p-10 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),transparent_65%)] opacity-60" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_45%,rgba(56,189,248,0.08)_100%)] opacity-50" />
          <div className="pointer-events-none absolute -left-24 top-16 h-48 w-48 rounded-full bg-emerald-400/25 blur-[140px]" />
          <div className="pointer-events-none absolute -right-28 bottom-10 h-52 w-52 rounded-full bg-sky-400/25 blur-[140px]" />
          <div className="relative grid gap-12 lg:grid-cols-[0.75fr,1.25fr]">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-200">
                  QA · QC Elite
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-ping" />
                </span>
                <h3 className="text-3xl font-semibold text-warm-50">Calidad certificada para cada experiencia que sale al escenario.</h3>
                <p className="text-sm leading-relaxed text-warm-300">
                  Un equipo híbrido de auditores humanos e IA monitorea cada anfitrión, escena y transacción. El resultado es una plataforma sin fricciones, segura y lista para impresionar.
                </p>
              </div>

              <div className="grid gap-4">
                {qaOutcomes.map((outcome) => (
                  <div key={outcome.label} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className={`absolute inset-0 bg-gradient-to-r ${outcome.accent} opacity-20`} aria-hidden />
                    <div className="relative flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-warm-300">
                      <div>
                        <p className="text-warm-200">{outcome.label}</p>
                        <p className="mt-2 text-xs normal-case tracking-normal text-warm-400">{outcome.detail}</p>
                      </div>
                      <span className="text-2xl font-semibold text-warm-50">{outcome.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-3">
                {qaPillars.map((pillar) => (
                  <div
                    key={pillar.title}
                    className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-emerald-400/40"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${pillar.accent} opacity-30 transition-opacity duration-500 group-hover:opacity-80`} />
                    <div className="relative space-y-3">
                      <span className="text-2xl">{pillar.icon}</span>
                      <h4 className="text-sm font-semibold uppercase tracking-[0.35em] text-warm-100">{pillar.title}</h4>
                      <p className="text-sm leading-relaxed text-warm-300">{pillar.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="quality-links">
                {qaNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center justify-between gap-6 rounded-2xl border border-white/10 bg-dark-950/70 px-6 py-4 text-sm text-warm-200 transition-all duration-300 hover:border-emerald-400/40 hover:text-emerald-100"
                  >
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-warm-400">{item.label}</p>
                      <p className="mt-2 text-sm text-warm-300">{item.caption}</p>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-lg transition-all duration-300 group-hover:border-emerald-300/60 group-hover:text-emerald-200">
                      ↗
                    </span>
                  </Link>
                ))}
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-dark-950/70 p-6 shadow-[0_40px_120px_-80px_rgba(16,185,129,0.75)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),transparent_70%)] opacity-70" />
                <div className="pointer-events-none absolute inset-0 hyper-grid opacity-20" />
                <div className="relative space-y-6">
                  <div className="flex flex-wrap gap-3">
                    {qaPlaybooks.map((playbook) => {
                      const isActive = activePlaybook === playbook.id;

                      return (
                        <button
                          key={playbook.id}
                          type="button"
                          onClick={() => setActivePlaybook(playbook.id)}
                          className={`relative overflow-hidden rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] transition-all duration-300 ${
                            isActive
                              ? 'border-emerald-300/70 bg-white/10 text-emerald-100 shadow-[0_15px_45px_-30px_rgba(16,185,129,0.85)]'
                              : 'border-white/10 bg-white/5 text-warm-300 hover:border-emerald-200/40 hover:text-emerald-100'
                          }`}
                        >
                          <span className="relative z-10">{playbook.label}</span>
                          {isActive && (
                            <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-emerald-500/20 to-teal-400/20" aria-hidden />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                    <div className="space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.4em] text-warm-300">
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-warm-200">
                            🛡️ Playbook QA
                          </span>
                          <span className="text-emerald-200">Lust Verified</span>
                        </div>
                        <p className="text-lg font-semibold text-warm-50">{activePlaybookData.summary}</p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {activePlaybookData.kpis.map((kpi) => (
                          <div
                            key={kpi.label}
                            className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] uppercase tracking-[0.35em] text-warm-300"
                          >
                            <span className="text-warm-200">{kpi.label}</span>
                            <span className="text-xl font-semibold text-emerald-100">{kpi.value}</span>
                          </div>
                        ))}
                      </div>

                      <ul className="space-y-3 text-sm leading-relaxed text-warm-200">
                        {activePlaybookData.checklist.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      <div>
                        <ButtonLink
                          href={activePlaybookData.action.href}
                          variant="dark"
                          size="sm"
                          prefetch={false}
                          className="inline-flex items-center gap-3 rounded-full border border-emerald-300/50 bg-transparent px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-100 transition-all duration-300 hover:border-emerald-200 hover:text-emerald-50"
                        >
                          {activePlaybookData.action.label}
                          <span aria-hidden>↗</span>
                        </ButtonLink>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-dark-950/80 p-5">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.4em] text-warm-400">
                        <span>Monitoreo QA en vivo</span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-emerald-100">
                          <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                          Online
                        </span>
                      </div>

                      <div className="space-y-4">
                        {qaDiagnostics.map((diagnostic) => (
                          <div key={diagnostic.label} className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-warm-300">
                              <span>{diagnostic.label}</span>
                              <span className="text-sm font-semibold text-warm-100">{diagnostic.score}%</span>
                            </div>
                            <div className="relative h-2.5 overflow-hidden rounded-full bg-white/10">
                              <div
                                className={`absolute inset-y-0 left-0 h-full rounded-full bg-gradient-to-r ${diagnostic.accent}`}
                                style={{ width: `${diagnostic.score}%` }}
                              />
                            </div>
                            <p className="text-xs normal-case tracking-normal text-warm-400">{diagnostic.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Active Filters */}
        {(searchQuery || searchCity || selectedCategory) && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-warm-500 text-sm">Filtros activos:</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-3 py-1 bg-dark-850 text-warm-300 rounded-full text-sm border border-dark-700 hover:border-fire-500 flex items-center gap-2"
              >
                <span>🔍 {searchQuery}</span>
                <span className="text-fire-500">×</span>
              </button>
            )}
            {searchCity && (
              <button
                type="button"
                onClick={() => setSearchCity('')}
                className="px-3 py-1 bg-dark-850 text-warm-300 rounded-full text-sm border border-dark-700 hover:border-fire-500 flex items-center gap-2"
              >
                <span>📍 {searchCity}</span>
                <span className="text-fire-500">×</span>
              </button>
            )}
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="px-3 py-1 bg-dark-850 text-warm-300 rounded-full text-sm border border-dark-700 hover:border-fire-500 flex items-center gap-2"
              >
                <span>🏷️ {selectedCategory}</span>
                <span className="text-fire-500">×</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchCity('');
                setSelectedCategory(null);
              }}
              className="px-3 py-1 text-fire-500 hover:text-fire-400 text-sm font-medium"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-full rounded-3xl border border-dark-800/80 bg-dark-900/70 p-5 shadow-inner shadow-dark-800/50">
                <div className="mb-4 aspect-[4/3] rounded-2xl bg-dark-800/70" />
                <div className="mb-2 h-6 rounded-full bg-dark-800/70" />
                <div className="h-4 w-2/3 rounded-full bg-dark-800/70" />
              </div>
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-warm-50">
                {selectedCategory
                  ? `Servicios de ${selectedCategory}`
                  : searchQuery || searchCity
                  ? 'Resultados de búsqueda'
                  : 'Servicios Destacados'}
              </h2>
              <span className="rounded-full border border-fire-500/20 bg-fire-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-fire-300">
                {filteredServices.length} {filteredServices.length === 1 ? 'servicio' : 'servicios'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-warm-50 mb-2">
              No se encontraron servicios
            </h3>
            <p className="text-warm-400 mb-6">
              Intenta con otros filtros o búsqueda
            </p>
            <Button
              variant="fire"
              onClick={() => {
                setSearchQuery('');
                setSearchCity('');
                setSelectedCategory(null);
              }}
            >
              Ver todos los servicios
            </Button>
          </div>
        )}

        {/* Call to action */}
        <section className="mt-24 overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-dark-950/95 via-dark-900/70 to-dark-950/95 p-12 shadow-[0_60px_120px_-65px_rgba(255,0,92,0.8)]">
          <div className="grid gap-12 md:grid-cols-[1.1fr,0.9fr] md:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-fire-200">
                Club Privé
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </span>
              <h3 className="text-4xl font-semibold leading-tight text-warm-50">
                Accede a invitaciones secretas y upgrades personalizados en cada experiencia.
              </h3>
              <p className="max-w-xl text-sm leading-relaxed text-warm-300">
                Únete a la lista prioritaria para recibir códigos de cortesía, ambientaciones temáticas y anfitriones en soft launch antes que el resto. Cada semana una nueva obsesión diseñada solo para miembros.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  href="/auth/register"
                  variant="fire"
                  size="lg"
                  fullWidth
                  className="rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-[0.4em] sm:w-auto"
                >
                  Quiero mi invitación
                </ButtonLink>
                <ButtonLink
                  href="/services"
                  variant="dark"
                  size="lg"
                  fullWidth
                  className="rounded-full border border-white/10 bg-transparent px-8 py-4 text-sm font-semibold uppercase tracking-[0.4em] text-warm-200 hover:border-fire-400/50 sm:w-auto"
                >
                  Explorar servicios
                </ButtonLink>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -left-16 top-0 h-48 w-48 rounded-full bg-fire-500/30 blur-3xl" />
              <div className="absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-lust-500/30 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at top, rgba(255,107,53,0.3) 0%, transparent 65%)' }} />
                <div className="relative space-y-5 text-center">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-warm-400">Índice de fascinación</p>
                  <h4 className="text-3xl font-semibold text-warm-50">+94% reseñas 5★</h4>
                  <p className="text-sm leading-relaxed text-warm-300">
                    Los anfitriones certificados mantienen métricas de puntualidad, ambientación y hospitalidad superiores al estándar de la industria.
                  </p>
                  <div className="grid gap-4 text-left text-sm text-warm-200">
                    {['Concierge 24/7 encriptado', 'Pagos protegidos', 'Acceso anticipado a soft launches'].map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-full border border-white/10 bg-dark-950/50 px-4 py-2">
                        <span className="text-lg">⚡</span>
                        <span className="uppercase tracking-[0.35em]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-white/5 bg-[#050304]">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.12),transparent_65%)]" />
          <div className="pointer-events-none absolute inset-0 hyper-grid opacity-20" />
          <div className="pointer-events-none absolute -left-32 bottom-0 h-56 w-56 rounded-full bg-fire-500/18 blur-[140px]" />
          <div className="pointer-events-none absolute -right-28 top-0 h-56 w-56 rounded-full bg-lust-500/18 blur-[150px]" />

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.2fr,0.8fr]">
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.4em] text-fire-200">
                    Concierge verificado
                    <span className="h-2 w-2 rounded-full bg-emerald-300 animate-ping" />
                  </span>
                  <h3 className="text-3xl font-semibold text-warm-50">
                    Un motor de lujo diseñado para cautivar cada encuentro.
                  </h3>
                  <p className="max-w-xl text-sm leading-relaxed text-warm-300">
                    Coordinamos anfitriones, seguridad y ambientación con precisión QA QC. Escríbenos para activar tu onboarding o solicitar un demo ejecutivo personalizado.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {conciergeChannels.map((channel) => (
                    <Link
                      key={channel.href}
                      href={channel.href}
                      prefetch={false}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-dark-950/70 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-fire-400/50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-60" />
                      <div className="relative space-y-2 text-[11px] uppercase tracking-[0.35em] text-warm-400">
                        <span className="inline-flex items-center gap-2 text-warm-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fire-400 to-lust-500" />
                          {channel.label}
                        </span>
                        <span className="text-lg font-semibold text-warm-50">{channel.value}</span>
                        <p className="text-xs normal-case tracking-normal text-warm-300">{channel.caption}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.22),transparent_70%)] opacity-50" />
                <div className="relative space-y-6">
                  <div className="space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.4em] text-warm-400">Recibir agenda secreta</p>
                    <h4 className="text-2xl font-semibold text-warm-50">Newsletter Velvet Drop</h4>
                    <p className="text-sm leading-relaxed text-warm-300">
                      Lanzamientos privados, invitaciones anticipadas y protocolos exclusivos directo en tu bandeja cifrada.
                    </p>
                  </div>
                  <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                    <label htmlFor="newsletter-email" className="sr-only">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <input
                        id="newsletter-email"
                        type="email"
                        value={newsletterEmail}
                        onChange={(event) => setNewsletterEmail(event.target.value)}
                        required
                        placeholder="tu@email.com"
                        className="w-full rounded-full border border-white/15 bg-dark-950/70 px-5 py-4 text-sm text-warm-50 placeholder:text-warm-500 focus:border-fire-400 focus:outline-none focus:ring-2 focus:ring-fire-400/30"
                      />
                      <Button
                        type="submit"
                        variant="fire"
                        size="md"
                        className="absolute right-1.5 top-1.5 rounded-full px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.4em]"
                      >
                        Enviar
                      </Button>
                    </div>
                    <p className="text-[11px] leading-relaxed text-warm-400">
                      Prometemos cero spam. Solo lanzamientos de alto impacto y actualizaciones operativas clave.
                    </p>
                    <div aria-live="polite" className="min-h-[1.25rem] text-xs text-emerald-300">
                      {newsletterSuccess ? 'Gracias. Nuestro concierge te contactará en breve.' : null}
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
              {footerNavigation.map((section) => (
                <div key={section.title} className="space-y-3">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.4em] text-warm-200">{section.title}</h4>
                  <ul className="space-y-2 text-sm text-warm-400">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group flex items-center gap-2 transition-colors duration-300 hover:text-fire-200"
                        >
                          <span className="h-1 w-1 rounded-full bg-fire-400 transition-colors duration-300 group-hover:bg-fire-200" />
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-8 text-sm text-warm-400 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p>© {currentYear} MiPage. Todos los derechos reservados.</p>
                <p className="text-xs text-warm-500">Tecnología Lust Engine · Infraestructura certificada ISO/IEC 27001.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {socialLinks.map((social) => (
                  <Link
                    key={social.href}
                    href={social.href}
                    className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-dark-950/60 text-xl text-warm-300 transition-all duration-300 hover:border-fire-400/60 hover:text-fire-200"
                    aria-label={social.label}
                    target="_blank"
                    rel="noreferrer"
                    prefetch={false}
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
