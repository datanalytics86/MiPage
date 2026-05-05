require('dotenv').config();
// Inicializar Sentry antes que todo (graceful si no hay DSN)
require('./utils/sentry');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const serviceRoutes = require('./routes/service.routes');
const reviewRoutes = require('./routes/review.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const adminRoutes = require('./routes/admin.routes');
// Nuevas rutas - Sistema de Metadata
const metadataRoutes = require('./routes/metadata.routes');
const serviceTypesRoutes = require('./routes/serviceTypes.routes');
const publisherRoutes = require('./routes/publisher.routes');

// Importar middleware
const { rateLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// Configurar Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: false, // Desactivar CSP en desarrollo para Codespaces
  crossOriginEmbedderPolicy: false
}));

// Configuración CORS más permisiva para Codespaces
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'https://upgraded-space-pancake-q7gvrgw947g6cwqx-3000.app.github.dev'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origin (como desde curl, Postman, etc)
    if (!origin) return callback(null, true);

    // Permitir si está en la lista o si es una URL de github.dev
    if (allowedOrigins.includes(origin) || origin.includes('app.github.dev')) {
      callback(null, true);
    } else {
      callback(null, true); // En desarrollo, permitir todo
    }
  },
  credentials: true,
}));

// Middleware de parseo
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api/', rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Health check en /api/health también
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/providers', userRoutes); // Alias para /api/providers/:slug → user.routes
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
// Nuevas rutas - Sistema de Metadata
app.use('/api/metadata-fields', metadataRoutes);
app.use('/api/service-types', serviceTypesRoutes);
app.use('/api/publisher', publisherRoutes);

// Documentación API (Swagger)
if (process.env.NODE_ENV === 'development') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./utils/swagger');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Socket.io events
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 Usuario ${userId} unido a su sala`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

// Hacer io disponible en las rutas
app.set('io', io);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
  });
});

// Error handler global
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════╗
║     🚀 MiPage API Server              ║
╠════════════════════════════════════════╣
║  Puerto: ${PORT}                        ║
║  Host: ${HOST}                           ║
║  Entorno: ${process.env.NODE_ENV}      ║
║  Docs: http://localhost:${PORT}/api-docs  ║
╚════════════════════════════════════════╝
  `);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

module.exports = { app, server, io };
