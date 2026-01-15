const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Datos de ejemplo completos
const mockServices = [
  {
    id: '1',
    title: 'Sesión Fotográfica Profesional',
    description: 'Sesiones de fotografía profesional para retratos, books y portfolios. Incluye edición básica y entrega digital de las mejores fotos.\n\nOfrezco:\n• Sesiones en estudio o locación\n• Iluminación profesional\n• 50+ fotos editadas\n• Entrega en alta resolución\n• Retoque profesional incluido',
    price: 75000,
    priceType: 'sesión',
    city: 'Santiago',
    location: 'Providencia',
    region: 'Región Metropolitana',
    category: 'FOTOGRAFIA',
    coverPhoto: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
    photos: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
      'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800',
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800',
      'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800',
    ],
    averageRating: 4.9,
    totalReviews: 47,
    views: 1234,
    isPremium: true,
    user: {
      id: 'u1',
      name: 'Carlos Mendoza',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      isVerified: true,
      createdAt: '2023-06-15T00:00:00Z',
    },
    availability: {
      days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      hours: '9:00 - 20:00',
    },
    reviews: [
      {
        id: 'r1',
        rating: 5,
        comment: 'Excelente fotógrafo! Las fotos quedaron increíbles, muy profesional y puntual.',
        createdAt: '2024-01-10T00:00:00Z',
        user: { name: 'María González', avatar: null },
      },
      {
        id: 'r2',
        rating: 5,
        comment: 'Super recomendado. La sesión fue muy amena y el resultado superó mis expectativas.',
        createdAt: '2024-01-05T00:00:00Z',
        user: { name: 'Pedro Silva', avatar: null },
        response: 'Muchas gracias Pedro! Fue un placer trabajar contigo.',
      },
    ],
    _count: { favorites: 89 },
  },
  {
    id: '2',
    title: 'Modelo para Campañas Publicitarias',
    description: 'Modelo profesional con experiencia en campañas de moda, publicidad y eventos corporativos.\n\nExperiencia en:\n• Campañas digitales\n• Catálogos de moda\n• Comerciales de TV\n• Eventos corporativos\n• Desfiles y pasarelas',
    price: 120000,
    priceType: 'día',
    city: 'Santiago',
    location: 'Las Condes',
    region: 'Región Metropolitana',
    category: 'MODELAJE',
    coverPhoto: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
    photos: [
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
    ],
    averageRating: 4.8,
    totalReviews: 32,
    views: 2156,
    isPremium: true,
    user: {
      id: 'u2',
      name: 'Valentina Rojas',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      isVerified: true,
      createdAt: '2023-03-20T00:00:00Z',
    },
    availability: {
      days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      hours: '8:00 - 18:00',
    },
    reviews: [],
    _count: { favorites: 156 },
  },
  {
    id: '3',
    title: 'Fotografía de Eventos Sociales',
    description: 'Cobertura fotográfica completa para matrimonios, cumpleaños y eventos corporativos.\n\nIncluye:\n• Cobertura de 8 horas\n• 2 fotógrafos\n• 500+ fotos editadas\n• Galería online privada\n• Álbum digital',
    price: 150000,
    priceType: 'evento',
    city: 'Viña del Mar',
    location: 'Centro',
    region: 'Valparaíso',
    category: 'FOTOGRAFIA',
    coverPhoto: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
    photos: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    ],
    averageRating: 4.7,
    totalReviews: 28,
    views: 890,
    isPremium: false,
    user: {
      id: 'u3',
      name: 'Studio Visual',
      avatar: null,
      isVerified: true,
      createdAt: '2022-11-10T00:00:00Z',
    },
    reviews: [],
    _count: { favorites: 45 },
  },
  {
    id: '4',
    title: 'Modelo Editorial y Fashion',
    description: 'Modelo con amplia experiencia en editorial de moda, pasarelas y sesiones de estudio. Disponible para viajes nacionales e internacionales.',
    price: 80000,
    priceType: 'hora',
    city: 'Concepción',
    location: 'Centro',
    region: 'Biobío',
    category: 'MODELAJE',
    coverPhoto: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
    photos: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
    ],
    averageRating: 4.6,
    totalReviews: 19,
    views: 567,
    isPremium: false,
    user: {
      id: 'u4',
      name: 'Camila Fernández',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      isVerified: false,
      createdAt: '2024-01-01T00:00:00Z',
    },
    reviews: [],
    _count: { favorites: 23 },
  },
  {
    id: '5',
    title: 'Staff para Eventos Corporativos',
    description: 'Equipo profesional para recepciones, ferias y eventos empresariales. Personal capacitado, presentable y bilingüe disponible.',
    price: 45000,
    priceType: 'persona/día',
    city: 'Santiago',
    location: 'Vitacura',
    region: 'Región Metropolitana',
    category: 'EVENTOS',
    coverPhoto: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    photos: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    ],
    averageRating: 4.8,
    totalReviews: 41,
    views: 1890,
    isPremium: false,
    user: {
      id: 'u5',
      name: 'EventPro Chile',
      avatar: null,
      isVerified: true,
      createdAt: '2022-05-15T00:00:00Z',
    },
    reviews: [],
    _count: { favorites: 67 },
  },
  {
    id: '6',
    title: 'Fotografía de Producto E-commerce',
    description: 'Fotos profesionales para tiendas online. Especializado en fotografía de producto con fondo blanco, lifestyle y 360°.',
    price: 5000,
    priceType: 'producto',
    city: 'Santiago',
    location: 'Ñuñoa',
    region: 'Región Metropolitana',
    category: 'FOTOGRAFIA',
    coverPhoto: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
    photos: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    ],
    averageRating: 4.9,
    totalReviews: 56,
    views: 2340,
    isPremium: true,
    user: {
      id: 'u6',
      name: 'ProductShot Studio',
      avatar: null,
      isVerified: true,
      createdAt: '2023-02-28T00:00:00Z',
    },
    reviews: [],
    _count: { favorites: 112 },
  },
  {
    id: '7',
    title: 'Anfitrionas para Lanzamientos',
    description: 'Anfitrionas profesionales bilingües para lanzamientos de productos, inauguraciones y eventos VIP. Servicio premium garantizado.',
    price: 55000,
    priceType: 'persona/día',
    city: 'Santiago',
    location: 'Providencia',
    region: 'Región Metropolitana',
    category: 'EVENTOS',
    coverPhoto: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    photos: [
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    ],
    averageRating: 4.7,
    totalReviews: 23,
    views: 445,
    isPremium: false,
    user: {
      id: 'u7',
      name: 'Premium Hostess',
      avatar: null,
      isVerified: true,
      createdAt: '2023-08-10T00:00:00Z',
    },
    reviews: [],
    _count: { favorites: 34 },
  },
  {
    id: '8',
    title: 'Modelo Comercial TV',
    description: 'Modelo con amplia experiencia en comerciales de televisión y videos publicitarios. Disponibilidad inmediata para castings y grabaciones.',
    price: 200000,
    priceType: 'día',
    city: 'Santiago',
    location: 'Las Condes',
    region: 'Región Metropolitana',
    category: 'MODELAJE',
    coverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
    ],
    averageRating: 4.9,
    totalReviews: 15,
    views: 3200,
    isPremium: true,
    user: {
      id: 'u8',
      name: 'Isabella Torres',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      isVerified: true,
      createdAt: '2023-01-05T00:00:00Z',
    },
    reviews: [],
    _count: { favorites: 234 },
  },
];

// Rutas API
app.get('/api/services', (req, res) => {
  let filtered = [...mockServices];
  const { category, city, search, minPrice, maxPrice, limit } = req.query;

  if (category) {
    filtered = filtered.filter(s => s.category === category);
  }

  if (city) {
    filtered = filtered.filter(s =>
      s.city.toLowerCase().includes(city.toLowerCase())
    );
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(s =>
      s.title.toLowerCase().includes(searchLower) ||
      s.description.toLowerCase().includes(searchLower) ||
      s.category.toLowerCase().includes(searchLower)
    );
  }

  if (minPrice) {
    filtered = filtered.filter(s => s.price >= parseInt(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter(s => s.price <= parseInt(maxPrice));
  }

  // Return simplified version for list
  const simplified = filtered.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    price: s.price,
    priceType: s.priceType,
    city: s.city,
    category: s.category,
    coverPhoto: s.coverPhoto,
    averageRating: s.averageRating,
    totalReviews: s.totalReviews,
    isPremium: s.isPremium,
  }));

  if (limit) {
    res.json({ services: simplified.slice(0, parseInt(limit)), total: simplified.length });
  } else {
    res.json({ services: simplified, total: simplified.length });
  }
});

app.get('/api/services/:id', (req, res) => {
  const service = mockServices.find(s => s.id === req.params.id);
  if (service) {
    res.json(service);
  } else {
    res.status(404).json({ error: 'Servicio no encontrado' });
  }
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }
  res.json({
    user: { id: '1', name: 'Usuario Demo', email, role: 'PUBLISHER', isVerified: true },
    token: 'mock-jwt-token-' + Date.now(),
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  res.json({
    user: { id: '2', name, email, role: 'USER', isVerified: false },
    token: 'mock-jwt-token-' + Date.now(),
  });
});

app.get('/api/auth/profile', (req, res) => {
  res.json({ id: '1', name: 'Usuario Demo', email: 'demo@mipage.cl', role: 'PUBLISHER', isVerified: true });
});

// Favorites
app.post('/api/services/:id/favorite', (req, res) => {
  res.json({ success: true, isFavorite: true });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'mock', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 MiPage Mock API Server running on http://0.0.0.0:${PORT}\n`);
});
