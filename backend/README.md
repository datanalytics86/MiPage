# MiPage Backend

API REST construida con Node.js, Express y PostgreSQL.

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env
# Editar .env con tus credenciales

# Generar Prisma Client
npx prisma generate

# Crear tablas en DB
npx prisma db push

# Seed con datos de ejemplo
npx prisma db seed

# Iniciar en desarrollo
npm run dev

# Iniciar en producción
npm start
```

## 📁 Estructura

```
backend/
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   └── seed.js            # Datos de ejemplo
├── src/
│   ├── controllers/       # Lógica de endpoints
│   ├── routes/            # Definición de rutas
│   ├── middleware/        # Auth, validación, etc.
│   ├── services/          # Lógica de negocio
│   ├── utils/             # Helpers
│   └── server.js          # Punto de entrada
└── package.json
```

## 🔌 API Endpoints

Ver [docs/API.md](../docs/API.md) para documentación completa.

**Base URL:** `http://localhost:3001/api`

### Auth
- POST `/auth/register` - Registrar usuario
- POST `/auth/login` - Iniciar sesión
- GET `/auth/profile` - Obtener perfil

### Services
- GET `/services` - Listar servicios
- POST `/services` - Crear servicio
- PUT `/services/:id` - Actualizar servicio
- DELETE `/services/:id` - Eliminar servicio

### Reviews
- POST `/reviews/:serviceId` - Crear reseña
- PUT `/reviews/:id/respond` - Responder reseña

### Admin
- GET `/admin/stats` - Estadísticas
- PUT `/admin/services/:id/approve` - Aprobar servicio

## 🗄️ Base de Datos

### Modelos Principales

- **User:** Usuarios del sistema
- **Service:** Servicios publicados
- **Review:** Reseñas de servicios
- **Post:** Posts de timeline
- **Favorite:** Favoritos de usuarios
- **Notification:** Notificaciones

### Comandos Útiles

```bash
# Ver base de datos en navegador
npx prisma studio

# Crear migración
npx prisma migrate dev --name descripcion

# Reset base de datos
npx prisma migrate reset

# Ver logs
npx prisma db pull
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Con coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🔒 Seguridad

- ✅ JWT para autenticación
- ✅ Bcrypt para passwords
- ✅ Helmet.js para headers
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Input validation (express-validator)

## 📊 Logging

Usa Morgan para logs HTTP:

```
GET /api/services 200 45.123 ms
POST /api/auth/login 200 234.567 ms
```

## 🐛 Debug

```bash
# Con logs detallados
DEBUG=* npm run dev

# Solo logs de Prisma
DEBUG=prisma:* npm run dev
```

## 🚀 Deploy

Ver [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)

```bash
# Build para producción
npm install --production

# Variables de entorno necesarias
DATABASE_URL=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NODE_ENV=production
```

## 📝 Scripts

- `npm run dev` - Desarrollo con nodemon
- `npm start` - Producción
- `npm test` - Tests
- `npm run lint` - Linter
- `npm run format` - Prettier
- `npm run db:generate` - Generar Prisma Client
- `npm run db:push` - Push schema a DB
- `npm run db:seed` - Seed datos
- `npm run db:studio` - Abrir Prisma Studio

## 🔧 Configuración

### Variables de Entorno

Ver `.env.example` para todas las opciones.

**Requeridas:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret para JWT tokens

**Opcionales:**
- `CLOUDINARY_*` - Para upload de imágenes
- `SENDGRID_API_KEY` - Para envío de emails
- `RATE_LIMIT_*` - Configuración de rate limiting

## 📚 Dependencias Principales

- **express** - Framework web
- **@prisma/client** - ORM para PostgreSQL
- **jsonwebtoken** - Autenticación JWT
- **bcryptjs** - Hash de passwords
- **socket.io** - WebSockets
- **cloudinary** - Upload de imágenes
- **helmet** - Seguridad HTTP headers
- **cors** - CORS middleware

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-feature`
3. Commit: `git commit -m 'Agregar nueva feature'`
4. Push: `git push origin feature/nueva-feature`
5. Abre un Pull Request

## 📄 Licencia

MIT
