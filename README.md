# MiPage - Marketplace de Servicios Profesionales

**Plataforma web moderna para servicios de Modelaje y Masajes Profesionales**

## 🚀 Características Principales

- **Grid de Fotos Intuitivo**: Visualización atractiva de servicios con imágenes de alta calidad
- **Sistema de Reseñas**: Usuarios pueden dejar comentarios y calificaciones
- **Perfiles de Usuario**: Timeline cronológico de publicaciones por usuario
- **Búsqueda Avanzada**: Filtros por categoría, ubicación y precio
- **Responsive & PWA**: Optimizado para móviles y desktop
- **Tiempo Real**: Notificaciones instantáneas con Socket.io
- **SEO Optimizado**: Next.js con SSR para mejor indexación

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14** - Framework React con SSR/SSG
- **React 18** - Biblioteca UI con hooks
- **Tailwind CSS** - Diseño responsive y moderno
- **TypeScript** - Tipado estático
- **SWR** - Cache y fetching de datos
- **Socket.io Client** - Notificaciones en tiempo real

### Backend
- **Node.js 20+** - Runtime JavaScript
- **Express.js** - Framework web minimalista
- **PostgreSQL** - Base de datos relacional
- **Prisma** - ORM moderno para Node.js
- **JWT** - Autenticación segura
- **Socket.io** - Comunicación bidireccional
- **Cloudinary** - Almacenamiento de imágenes

### Infraestructura
- **Supabase** - PostgreSQL gratuito y autenticación
- **Vercel** - Hosting frontend (gratuito)
- **Railway/Render** - Hosting backend (tier gratuito)
- **Cloudinary** - CDN de imágenes (gratuito hasta 25GB)

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

```bash
# Node.js 20.x o superior
node --version  # v20.x.x

# npm o yarn
npm --version   # 10.x.x

# Git
git --version   # 2.x.x
```

### Instalación de Prerrequisitos

**En Ubuntu/Debian:**
```bash
# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Git
sudo apt-get install git
```

**En macOS:**
```bash
# Instalar Homebrew primero (si no lo tienes)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js y Git
brew install node git
```

**En Windows:**
- Descarga Node.js desde: https://nodejs.org/
- Descarga Git desde: https://git-scm.com/

## 🚀 Setup Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio-url>
cd MiPage
```

### 2. Configurar Base de Datos (Supabase)

1. **Crear cuenta gratuita en Supabase**:
   - Ve a https://supabase.com
   - Crea una cuenta gratuita
   - Crea un nuevo proyecto

2. **Obtener credenciales**:
   - En tu proyecto Supabase, ve a Settings > Database
   - Copia el `Connection String` en modo `URI`
   - Guarda también la `API URL` y `anon/public key`

3. **Ejecutar migraciones**:
   ```bash
   # Las instrucciones detalladas están en backend/README.md
   ```

### 3. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

**Contenido de `.env`:**
```env
# Base de datos
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# JWT
JWT_SECRET="tu-secreto-super-seguro-cambia-esto-123456"
JWT_EXPIRES_IN="7d"

# Cloudinary (registrate en cloudinary.com - gratuito)
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"

# Email (opcional - SendGrid gratuito 100 emails/día)
SENDGRID_API_KEY="tu-sendgrid-key"
FROM_EMAIL="noreply@tudominio.com"

# Configuración
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

**Generar migraciones de Prisma:**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

**Iniciar backend:**
```bash
npm run dev
```

### 4. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Crear archivo .env.local
cp .env.example .env.local

# Editar .env.local
nano .env.local
```

**Contenido de `.env.local`:**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
```

**Iniciar frontend:**
```bash
npm run dev
```

### 5. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api-docs

## 📱 Funcionalidades

### Para Usuarios Visitantes
- ✅ Ver grid de servicios con fotos
- ✅ Buscar por categoría (Modelaje / Masajes Profesionales)
- ✅ Filtrar por ubicación y precio
- ✅ Ver detalles de servicios y perfiles

### Para Usuarios Registrados
- ✅ Crear cuenta y login
- ✅ Dejar reseñas y comentarios
- ✅ Guardar servicios favoritos
- ✅ Recibir notificaciones en tiempo real

### Para Publicadores
- ✅ Crear perfil de proveedor de servicios
- ✅ Publicar múltiples servicios con fotos
- ✅ Timeline cronológico de publicaciones
- ✅ Responder a reseñas
- ✅ Editar y actualizar publicaciones
- ✅ Ver estadísticas de visualizaciones

### Para Administradores
- ✅ Panel de administración
- ✅ Aprobar/rechazar publicaciones
- ✅ Moderar contenido y reseñas
- ✅ Gestionar usuarios
- ✅ Ver analytics del sitio

## 🔒 Seguridad

- **Autenticación JWT**: Tokens seguros con expiración
- **Validación de Inputs**: Sanitización en backend y frontend
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **CORS**: Configurado solo para dominios autorizados
- **Encriptación**: Contraseñas hasheadas con bcrypt
- **SQL Injection**: Prevenido con Prisma ORM
- **XSS Protection**: Sanitización de contenido HTML

## 📊 Base de Datos

### Esquema Principal

```
Users (usuarios)
├── id (UUID)
├── email (único)
├── password (hasheado)
├── name
├── role (user, publisher, admin)
└── createdAt

Services (servicios)
├── id (UUID)
├── userId (FK)
├── category (Modelaje | Masajes Profesionales)
├── title
├── description
├── price
├── location
├── photos (array)
├── status (pending, approved, rejected)
└── createdAt

Reviews (reseñas)
├── id (UUID)
├── serviceId (FK)
├── userId (FK)
├── rating (1-5)
├── comment
└── createdAt

Posts (publicaciones timeline)
├── id (UUID)
├── userId (FK)
├── content
├── photos (array)
└── createdAt
```

## 🎨 Estructura del Proyecto

```
MiPage/
├── frontend/               # Aplicación Next.js
│   ├── src/
│   │   ├── app/           # App Router de Next.js 14
│   │   ├── components/    # Componentes React reutilizables
│   │   ├── lib/           # Utilidades y configuraciones
│   │   └── styles/        # Estilos globales
│   ├── public/            # Archivos estáticos
│   └── package.json
├── backend/               # API Node.js/Express
│   ├── src/
│   │   ├── controllers/   # Lógica de endpoints
│   │   ├── models/        # Modelos Prisma
│   │   ├── routes/        # Rutas API
│   │   ├── middleware/    # Auth, validación, etc.
│   │   ├── services/      # Lógica de negocio
│   │   └── utils/         # Helpers
│   ├── prisma/            # Esquema y migraciones
│   └── package.json
├── docs/                  # Documentación adicional
└── README.md
```

## 🚀 Deployment

### Frontend (Vercel - Gratuito)

1. **Conectar a GitHub**:
   - Ve a https://vercel.com
   - Importa tu repositorio
   - Selecciona la carpeta `frontend`

2. **Variables de entorno**:
   - Agrega todas las de `.env.local`
   - Cambia las URLs a producción

3. **Deploy**:
   - Vercel lo hace automáticamente en cada push a main

### Backend (Railway - Gratuito)

1. **Conectar a GitHub**:
   - Ve a https://railway.app
   - Crea nuevo proyecto desde GitHub
   - Selecciona la carpeta `backend`

2. **Agregar PostgreSQL**:
   - Railway ofrece PostgreSQL gratuito
   - O mantén Supabase

3. **Variables de entorno**:
   - Agrega todas las de `.env`
   - Railway proporciona el `DATABASE_URL`

4. **Deploy**:
   - Se despliega automáticamente

### CI/CD (GitHub Actions)

El proyecto incluye workflows automáticos:
- Tests en cada PR
- Deploy automático a main
- Chequeo de tipos TypeScript
- Linting de código

## 💰 Costos y Monetización

### Costos (Tier Gratuito)
- ✅ **Supabase**: Gratuito hasta 500MB DB
- ✅ **Vercel**: Gratuito para proyectos personales
- ✅ **Railway**: $5/mes de crédito gratuito
- ✅ **Cloudinary**: 25GB gratuitos
- ⚠️ **Stripe** (pagos): 2.9% + $0.30 por transacción

### Monetización Sugerida
1. **Listings Premium**: $10-20/mes por destacado
2. **Publicidad**: Banners para negocios relacionados
3. **Comisión**: 5-10% en reservas directas
4. **Verificación**: $5 por verificación de proveedor
5. **Analytics**: $15/mes para proveedores

## 🔧 Gestión para No-Expertos

### Actualizar Contenido

**Agregar nueva categoría:**
```bash
# Editar backend/prisma/schema.prisma
enum Category {
  MODELAJE
  MASAJES
  TU_NUEVA_CATEGORIA  // Agregar aquí
}

# Aplicar cambios
cd backend
npx prisma db push
```

**Moderar contenido:**
- Accede al panel admin: https://tudominio.com/admin
- Usa las herramientas visuales para aprobar/rechazar

### Mantenimiento

```bash
# Actualizar dependencias (cada 2-3 meses)
cd frontend
npm update
cd ../backend
npm update

# Backup de base de datos (semanal)
# Supabase hace backups automáticos, o:
cd backend
npm run db:backup
```

### Escalar

1. **Más tráfico**: Vercel escala automáticamente
2. **Más categorías**: Editar enum en Prisma
3. **Más features**: Contratar desarrollador freelance (presupuesto: $500-2000)

## 📜 Cumplimiento Legal (Chile)

### Ley de Protección de Datos Personales (Ley 19.628)

1. **Consentimiento**: ✅ Incluido en registro
2. **Política de Privacidad**: Ver `/docs/privacy-policy-chile.md`
3. **Términos de Servicio**: Ver `/docs/terms-of-service.md`
4. **Derecho a eliminación**: Implementado en perfil de usuario

### Pasos Adicionales
- Registrar marca en INAPI (opcional): ~$150.000 CLP
- Obtener certificado SSL (gratuito con Vercel/Railway)
- Términos claros para contenido sensible

## 🧪 Testing

```bash
# Backend
cd backend
npm test
npm run test:coverage

# Frontend
cd frontend
npm test
npm run test:e2e
```

## 📚 Documentación Adicional

- [Guía de API](./docs/API.md)
- [Componentes Frontend](./docs/COMPONENTS.md)
- [Despliegue Avanzado](./docs/DEPLOYMENT.md)
- [Solución de Problemas](./docs/TROUBLESHOOTING.md)
- [Contribuir](./docs/CONTRIBUTING.md)

## 🤝 Soporte

- **Issues**: [GitHub Issues](../../issues)
- **Email**: soporte@tudominio.com
- **Docs**: https://docs.tudominio.com

## 📄 Licencia

MIT License - Ver [LICENSE](./LICENSE) para más detalles.

---

**Hecho con ❤️ para emprendedores chilenos**
