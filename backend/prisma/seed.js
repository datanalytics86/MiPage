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
  await prisma.service.deleteMany();
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

  // Crear reseñas
  await prisma.review.create({
    data: {
      serviceId: service1.id,
      userId: user1.id,
      rating: 5,
      comment: 'Excelente profesional, muy puntual y con gran actitud. Las fotos quedaron increíbles. Totalmente recomendada.',
    },
  });

  await prisma.review.create({
    data: {
      serviceId: service3.id,
      userId: user1.id,
      rating: 5,
      comment: 'El mejor masaje que he recibido. Carlos es muy profesional y realmente sabe lo que hace. Mi espalda quedó como nueva.',
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
  console.log('  Publisher 1: maria@example.com / password123');
  console.log('  Publisher 2: carlos@example.com / password123');
  console.log('  User: juan@example.com / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
