const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  // Limpiar datos existentes
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.post.deleteMany();
  await prisma.review.deleteMany();
  await prisma.serviceUpdate.deleteMany();
  await prisma.service.deleteMany();
  await prisma.customFieldValue.deleteMany();
  await prisma.userMetadata.deleteMany();
  await prisma.metadataField.deleteMany();
  await prisma.serviceType.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Base de datos limpiada');

  // Crear usuarios
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@mipage.cl',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      isVerified: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  const publisher1 = await prisma.user.create({
    data: {
      email: 'maria@example.com',
      password: hashedPassword,
      name: 'María González',
      role: 'PUBLISHER',
      isVerified: true,
      bio: 'Modelo profesional con 5 años de experiencia',
      phone: '+56912345678',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
      isActive: true,
      approvalStatus: 'ACTIVE',
    },
  });

  const publisher2 = await prisma.user.create({
    data: {
      email: 'carlos@example.com',
      password: hashedPassword,
      name: 'Carlos Martínez',
      role: 'PUBLISHER',
      isVerified: true,
      bio: 'Terapeuta profesional certificado',
      phone: '+56987654321',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
      isActive: true,
      approvalStatus: 'ACTIVE',
    },
  });

  const publisher3 = await prisma.user.create({
    data: {
      email: 'sofia@example.com',
      password: hashedPassword,
      name: 'Sofía Rodríguez',
      role: 'PUBLISHER',
      isVerified: true,
      bio: 'Modelo y artista',
      phone: '+56911223344',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia',
      isActive: false,
      approvalStatus: 'REGISTERED',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'juan@example.com',
      password: hashedPassword,
      name: 'Juan Pérez',
      role: 'USER',
      isVerified: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=juan',
    },
  });

  console.log('✅ Usuarios creados');

  // Crear tipos de servicio
  const tipoModelaje = await prisma.serviceType.create({
    data: {
      name: 'MODELAJE',
      label: 'Servicios de Modelaje',
      description: 'Modelos profesionales para eventos, sesiones y campañas',
      icon: '📸',
      color: '#EC4899',
      order: 1,
      isActive: true,
    },
  });

  const tipoMasajes = await prisma.serviceType.create({
    data: {
      name: 'MASAJES',
      label: 'Masajes Profesionales',
      description: 'Servicios de masajes terapéuticos y relajantes',
      icon: '💆‍♀️',
      color: '#8B5CF6',
      order: 2,
      isActive: true,
    },
  });

  console.log('✅ Tipos de servicio creados');

  // Crear campos de metadata personalizables
  const campoColorOjos = await prisma.metadataField.create({
    data: {
      fieldName: 'colorOjos',
      fieldLabel: 'Color de Ojos',
      fieldType: 'SELECT',
      category: 'PERSONAL',
      options: JSON.stringify(['Azul', 'Verde', 'Café', 'Negro', 'Miel', 'Gris']),
      order: 1,
      showInTable: true,
      isActive: true,
    },
  });

  const campoColorPelo = await prisma.metadataField.create({
    data: {
      fieldName: 'colorPelo',
      fieldLabel: 'Color de Pelo',
      fieldType: 'SELECT',
      category: 'PERSONAL',
      options: JSON.stringify(['Rubio', 'Castaño', 'Negro', 'Rojo', 'Gris', 'Otro']),
      order: 2,
      showInTable: true,
      isActive: true,
    },
  });

  const campoExperiencia = await prisma.metadataField.create({
    data: {
      fieldName: 'experiencia',
      fieldLabel: 'Años de Experiencia',
      fieldType: 'NUMBER',
      category: 'SERVICIO',
      minValue: 0,
      maxValue: 50,
      order: 3,
      showInTable: true,
      isActive: true,
    },
  });

  const campoCertificaciones = await prisma.metadataField.create({
    data: {
      fieldName: 'certificaciones',
      fieldLabel: 'Certificaciones',
      fieldType: 'TEXTAREA',
      category: 'SERVICIO',
      maxLength: 500,
      placeholder: 'Detalla tus certificaciones profesionales',
      order: 4,
      showInTable: false,
      isActive: true,
    },
  });

  console.log('✅ Campos de metadata creados');

  // Crear metadata para publisher1 (María - Modelo)
  const metadata1 = await prisma.userMetadata.create({
    data: {
      userId: publisher1.id,
      rut: '12345678-9',
      edad: 26,
      nacionalidad: 'Chilena',
      altura: 172,
      peso: 58,
      contextura: 'ATLETICA',
      medidas: '90-60-90',
      region: 'Región Metropolitana',
      ciudad: 'Santiago',
      comuna: 'Providencia',
      tipoServicio: 'MODELAJE',
      biografia: 'Modelo profesional con 5 años de experiencia en moda, publicidad y eventos. He trabajado con marcas reconocidas y tengo experiencia en pasarelas nacionales e internacionales.',
      horarios: JSON.stringify({
        lunes: '09:00-18:00',
        martes: '09:00-18:00',
        miercoles: '09:00-18:00',
        jueves: '09:00-18:00',
        viernes: '09:00-18:00',
      }),
      tarifas: 'Desde $50.000 por hora. Paquetes especiales disponibles.',
    },
  });

  // Valores custom para publisher1
  await prisma.customFieldValue.create({
    data: {
      metadataId: metadata1.id,
      fieldId: campoColorOjos.id,
      value: 'Verde',
    },
  });

  await prisma.customFieldValue.create({
    data: {
      metadataId: metadata1.id,
      fieldId: campoColorPelo.id,
      value: 'Castaño',
    },
  });

  await prisma.customFieldValue.create({
    data: {
      metadataId: metadata1.id,
      fieldId: campoExperiencia.id,
      value: '5',
    },
  });

  // Crear metadata para publisher2 (Carlos - Masajista)
  const metadata2 = await prisma.userMetadata.create({
    data: {
      userId: publisher2.id,
      rut: '98765432-1',
      edad: 35,
      nacionalidad: 'Chileno',
      region: 'Región Metropolitana',
      ciudad: 'Santiago',
      comuna: 'Las Condes',
      tipoServicio: 'MASAJES_PROFESIONALES',
      biografia: 'Terapeuta certificado con más de 10 años de experiencia. Especializado en masajes terapéuticos, deportivos y relajantes. Atención personalizada en consultorio equipado.',
      horarios: JSON.stringify({
        lunes: '10:00-20:00',
        miercoles: '10:00-20:00',
        viernes: '10:00-20:00',
        sabado: '10:00-18:00',
      }),
      tarifas: 'Desde $35.000 por sesión. Descuentos en paquetes de 4 o más sesiones.',
    },
  });

  await prisma.customFieldValue.create({
    data: {
      metadataId: metadata2.id,
      fieldId: campoExperiencia.id,
      value: '10',
    },
  });

  await prisma.customFieldValue.create({
    data: {
      metadataId: metadata2.id,
      fieldId: campoCertificaciones.id,
      value: 'Certificado en Masoterapia - Instituto Profesional. Curso de Masaje Deportivo - 2018. Formación en Aromaterapia - 2020.',
    },
  });

  console.log('✅ Metadata de usuarios creada');

  // Crear servicios de modelaje
  const service1 = await prisma.service.create({
    data: {
      userId: publisher1.id,
      category: 'MODELAJE',
      title: 'Sesión Fotográfica Profesional',
      description: 'Modelo profesional disponible para sesiones fotográficas de moda, publicidad y catálogos. Experiencia en pasarelas y campañas publicitarias.',
      price: 50000,
      priceType: 'hour',
      location: 'Santiago Centro',
      city: 'Santiago',
      region: 'Metropolitana',
      photos: [
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
      ],
      coverPhoto: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
      status: 'APPROVED',
      views: 245,
      availability: {
        days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        hours: '09:00 - 18:00',
      },
    },
  });

  const service2 = await prisma.service.create({
    data: {
      userId: publisher1.id,
      category: 'MODELAJE',
      title: 'Modelo para Eventos y Promociones',
      description: 'Disponible para eventos corporativos, lanzamientos de productos y activaciones de marca. Actitud profesional y puntualidad garantizada.',
      price: 80000,
      priceType: 'session',
      location: 'Providencia',
      city: 'Santiago',
      region: 'Metropolitana',
      photos: [
        'https://images.unsplash.com/photo-1581382575275-97901c2635b7?w=800',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
      ],
      coverPhoto: 'https://images.unsplash.com/photo-1581382575275-97901c2635b7?w=800',
      status: 'APPROVED',
      views: 189,
      isPremium: true,
    },
  });

  // Crear servicios de masajes
  const service3 = await prisma.service.create({
    data: {
      userId: publisher2.id,
      category: 'MASAJES_PROFESIONALES',
      title: 'Masaje Terapéutico y Descontracturante',
      description: 'Masajes terapéuticos profesionales para aliviar tensiones musculares, estrés y dolor. Técnicas especializadas de masaje sueco y deportivo.',
      price: 35000,
      priceType: 'session',
      location: 'Las Condes',
      city: 'Santiago',
      region: 'Metropolitana',
      photos: [
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
        'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800',
      ],
      coverPhoto: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
      status: 'APPROVED',
      views: 412,
      availability: {
        days: ['Lunes', 'Miércoles', 'Viernes', 'Sábado'],
        hours: '10:00 - 20:00',
      },
    },
  });

  const service4 = await prisma.service.create({
    data: {
      userId: publisher2.id,
      category: 'MASAJES_PROFESIONALES',
      title: 'Masaje Relajante con Aromaterapia',
      description: 'Sesiones de masaje relajante combinado con aromaterapia para reducir el estrés y promover el bienestar. Ambiente tranquilo y profesional.',
      price: 40000,
      priceType: 'hour',
      location: 'Vitacura',
      city: 'Santiago',
      region: 'Metropolitana',
      photos: [
        'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800',
      ],
      coverPhoto: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800',
      status: 'APPROVED',
      views: 328,
      isPremium: true,
    },
  });

  console.log('✅ Servicios creados');

  // Crear actualizaciones de servicios
  await prisma.serviceUpdate.create({
    data: {
      serviceId: service1.id,
      type: 'PROMOTION',
      title: '¡Descuento Especial esta Semana!',
      content: 'Reserva tu sesión fotográfica esta semana y obtén un 20% de descuento. Válido para nuevos clientes. ¡No te lo pierdas! 📸✨',
      imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800',
      isPinned: true,
      isActive: true,
    },
  });

  await prisma.serviceUpdate.create({
    data: {
      serviceId: service1.id,
      type: 'ANNOUNCEMENT',
      title: 'Nuevos Horarios Disponibles',
      content: 'Ahora con disponibilidad los fines de semana. Reserva tu sesión con anticipación para asegurar tu cupo.',
      isActive: true,
    },
  });

  await prisma.serviceUpdate.create({
    data: {
      serviceId: service3.id,
      type: 'NEWS',
      title: 'Nuevo Servicio de Masaje Deportivo',
      content: 'Incorporé una nueva técnica especializada para deportistas. Ideal para recuperación muscular después de entrenamientos intensos.',
      isActive: true,
    },
  });

  await prisma.serviceUpdate.create({
    data: {
      serviceId: service3.id,
      type: 'SCHEDULE',
      title: 'Cambio Temporal de Horarios',
      content: 'Durante este mes estaré atendiendo de lunes a viernes de 10:00 a 20:00. Los sábados solo con reserva previa.',
      isActive: true,
    },
  });

  console.log('✅ Actualizaciones de servicios creadas');

  // Crear reseñas
  await prisma.review.create({
    data: {
      serviceId: service1.id,
      userId: user1.id,
      rating: 5,
      comment: 'Excelente profesional, muy puntual y con gran actitud. Las fotos quedaron increíbles. Totalmente recomendada.',
      photos: [],
    },
  });

  await prisma.review.create({
    data: {
      serviceId: service3.id,
      userId: user1.id,
      rating: 5,
      comment: 'El mejor masaje que he recibido. Carlos es muy profesional y realmente sabe lo que hace. Mi espalda quedó como nueva.',
      photos: [],
      response: 'Muchas gracias Juan! Me alegra mucho que hayas tenido una buena experiencia. Espero verte pronto.',
      respondedAt: new Date(),
    },
  });

  console.log('✅ Reseñas creadas');

  // Crear posts
  await prisma.post.create({
    data: {
      userId: publisher1.id,
      content: '¡Nuevas fechas disponibles para sesiones fotográficas! Descuento del 20% en reservas para la próxima semana. 📸✨',
      type: 'promotion',
      likes: 12,
      photos: ['https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800'],
    },
  });

  await prisma.post.create({
    data: {
      userId: publisher2.id,
      content: 'Recordatorio: Esta semana tengo horarios disponibles de lunes a viernes. ¡Reserva tu sesión de masaje relajante! 💆‍♂️',
      type: 'update',
      likes: 8,
      photos: [],
    },
  });

  console.log('✅ Posts creados');

  // Crear notificaciones
  await prisma.notification.create({
    data: {
      userId: publisher1.id,
      title: 'Nueva reseña',
      message: 'Juan Pérez dejó una reseña en tu servicio',
      type: 'review',
      link: `/services/${service1.id}`,
    },
  });

  console.log('✅ Notificaciones creadas');

  console.log('\n🎉 Seed completado exitosamente!\n');
  console.log('📝 Credenciales de prueba:');
  console.log('  Admin: admin@mipage.cl / password123');
  console.log('  Publisher 1 (Activo): maria@example.com / password123');
  console.log('  Publisher 2 (Activo): carlos@example.com / password123');
  console.log('  Publisher 3 (Inactivo): sofia@example.com / password123');
  console.log('  User: juan@example.com / password123\n');
  console.log('📊 Datos creados:');
  console.log('  - 5 usuarios (1 admin, 3 publishers, 1 user)');
  console.log('  - 2 tipos de servicio');
  console.log('  - 4 campos de metadata personalizables');
  console.log('  - 2 publishers con metadata completa');
  console.log('  - 4 servicios aprobados');
  console.log('  - 4 actualizaciones de servicios');
  console.log('  - 2 reseñas\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
