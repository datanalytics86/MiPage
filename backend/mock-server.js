const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Datos de ejemplo
const mockServices = [
  {
    id: '1',
    title: 'Sesión Fotográfica Profesional',
    description: 'Sesiones de fotografía profesional para retratos, books y portfolios. Incluye edición básica y entrega digital de las mejores fotos.',
    price: 75000,
    priceType: 'sesión',
    city: 'Santiago',
    category: 'FOTOGRAFIA',
    coverPhoto: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
    averageRating: 4.9,
    totalReviews: 47,
    isPremium: true,
  },
  {
    id: '2',
    title: 'Modelo para Campañas Publicitarias',
    description: 'Modelo profesional con experiencia en campañas de moda, publicidad y eventos corporativos. Portfolio disponible.',
    price: 120000,
    priceType: 'día',
    city: 'Santiago',
    category: 'MODELAJE',
    coverPhoto: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
    averageRating: 4.8,
    totalReviews: 32,
    isPremium: true,
  },
  {
    id: '3',
    title: 'Fotografía de Eventos Sociales',
    description: 'Cobertura fotográfica completa para matrimonios, cumpleaños y eventos corporativos. Incluye galería online.',
    price: 150000,
    priceType: 'evento',
    city: 'Viña del Mar',
    category: 'FOTOGRAFIA',
    coverPhoto: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
    averageRating: 4.7,
    totalReviews: 28,
    isPremium: false,
  },
  {
    id: '4',
    title: 'Modelo Editorial y Fashion',
    description: 'Modelo con experiencia en editorial de moda, pasarelas y sesiones de estudio. Disponible para viajes.',
    price: 80000,
    priceType: 'hora',
    city: 'Concepción',
    category: 'MODELAJE',
    coverPhoto: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
    averageRating: 4.6,
    totalReviews: 19,
    isPremium: false,
  },
  {
    id: '5',
    title: 'Staff para Eventos Corporativos',
    description: 'Equipo profesional para recepciones, ferias y eventos empresariales. Personal capacitado y presentable.',
    price: 45000,
    priceType: 'persona/día',
    city: 'Santiago',
    category: 'EVENTOS',
    coverPhoto: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    averageRating: 4.8,
    totalReviews: 41,
    isPremium: false,
  },
  {
    id: '6',
    title: 'Fotografía de Producto E-commerce',
    description: 'Fotos profesionales para tiendas online. Fondo blanco, lifestyle y 360°. Precio por producto.',
    price: 5000,
    priceType: 'producto',
    city: 'Santiago',
    category: 'FOTOGRAFIA',
    coverPhoto: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
    averageRating: 4.9,
    totalReviews: 56,
    isPremium: true,
  },
  {
    id: '7',
    title: 'Anfitrionas para Lanzamientos',
    description: 'Anfitrionas bilingües para lanzamientos de productos, inauguraciones y eventos VIP.',
    price: 55000,
    priceType: 'persona/día',
    city: 'Santiago',
    category: 'EVENTOS',
    coverPhoto: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    averageRating: 4.7,
    totalReviews: 23,
    isPremium: false,
  },
  {
    id: '8',
    title: 'Modelo Comercial TV',
    description: 'Modelo con experiencia en comerciales de televisión y videos publicitarios. Disponibilidad inmediata.',
    price: 200000,
    priceType: 'día',
    city: 'Santiago',
    category: 'MODELAJE',
    coverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    averageRating: 4.9,
    totalReviews: 15,
    isPremium: true,
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
      s.description.toLowerCase().includes(searchLower)
    );
  }

  if (minPrice) {
    filtered = filtered.filter(s => s.price >= parseInt(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter(s => s.price <= parseInt(maxPrice));
  }

  if (limit) {
    filtered = filtered.slice(0, parseInt(limit));
  }

  res.json({
    services: filtered,
    total: filtered.length,
  });
});

app.get('/api/services/:id', (req, res) => {
  const service = mockServices.find(s => s.id === req.params.id);
  if (service) {
    res.json(service);
  } else {
    res.status(404).json({ error: 'Servicio no encontrado' });
  }
});

// Auth routes (mock)
app.post('/api/auth/login', (req, res) => {
  res.json({
    user: {
      id: '1',
      name: 'Usuario Demo',
      email: req.body.email,
      role: 'USER',
    },
    token: 'mock-jwt-token',
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    user: {
      id: '2',
      name: req.body.name,
      email: req.body.email,
      role: 'USER',
    },
    token: 'mock-jwt-token',
  });
});

app.get('/api/auth/profile', (req, res) => {
  res.json({
    id: '1',
    name: 'Usuario Demo',
    email: 'demo@mipage.cl',
    role: 'USER',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'mock' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mock API Server running on http://0.0.0.0:${PORT}`);
  console.log(`   - Services: GET /api/services`);
  console.log(`   - Service:  GET /api/services/:id`);
  console.log(`   - Auth:     POST /api/auth/login, /api/auth/register`);
});
