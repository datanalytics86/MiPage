# 🚀 EMPIEZA AQUÍ - Guía Rápida MiPage

**Marketplace de Servicios de Modelaje y Masajes Profesionales con Fotos**

---

## 📋 ¿Qué es MiPage?

MiPage es una plataforma web moderna para publicar y encontrar:

- 📸 **Servicios de Modelaje** (fotos profesionales, eventos, campañas)
- 💆 **Masajes Profesionales** (terapéuticos, relajantes, deportivos)

**Enfoque:** Grid de fotos intuitivo, reseñas de usuarios, perfiles profesionales.

---

## 🎯 3 Caminos Posibles

### 👀 1. SOLO QUIERO VER EL PROYECTO

```bash
# 1. Clonar
git clone https://github.com/datanalytics86/MiPage.git
cd MiPage

# 2. Ver la estructura
ls -la

# 3. Leer documentación
cat README.md
cat QUALITY-SUMMARY.md
```

**Documentos importantes:**
- `README.md` - Overview completo
- `QUALITY-SUMMARY.md` - Resumen de calidad
- `docs/` - Guías detalladas

---

### 💻 2. QUIERO CORRER LOCALMENTE

**Tiempo:** 20-30 minutos

**Sigue:** `docs/QUICK-START.md`

**Resumen rápido:**

```bash
# 1. Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# 2. Configurar base de datos (Supabase)
# Crear cuenta gratis en https://supabase.com
# Copiar connection string

# 3. Configurar variables de entorno
cp .env.example backend/.env
cp .env.example frontend/.env.local
# Editar con tus valores

# 4. Setup base de datos
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. Iniciar
cd backend && npm run dev        # Terminal 1
cd frontend && npm run dev       # Terminal 2

# 6. Abrir
http://localhost:3000
```

**Credenciales de prueba:**
- Admin: `admin@mipage.cl` / `password123`
- Publisher: `maria@example.com` / `password123`
- User: `juan@example.com` / `password123`

---

### 🚀 3. QUIERO DEPLOYAR A PRODUCCIÓN

**Tiempo:** 30 minutos

**⚠️ IMPORTANTE: Si tienes error 404 en Vercel, lee:** `DEPLOY-VERCEL-FIX.md`

#### A. Deploy Frontend (Vercel)

1. **Ve a:** https://vercel.com/new

2. **Importa:** `datanalytics86/MiPage`

3. **⚠️ CONFIGURACIÓN CRÍTICA:**
   ```
   Framework: Next.js
   Root Directory: frontend  ← ¡IMPORTANTE!
   Build Command: npm run build
   ```

4. **Variables de entorno:**
   ```
   NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api
   NEXT_PUBLIC_SOCKET_URL=https://tu-backend.railway.app
   ```

5. **Deploy** → Listo en 2-3 min

**Si tienes problemas:** Lee `DEPLOY-VERCEL-FIX.md`

#### B. Deploy Backend (Railway)

1. **Ve a:** https://railway.app

2. **New Project → Deploy from GitHub**

3. **Configuración:**
   ```
   Root Directory: backend
   ```

4. **Variables de entorno:**
   ```
   DATABASE_URL=tu-supabase-url
   JWT_SECRET=genera-uno-seguro
   CLOUDINARY_CLOUD_NAME=tu-cloud
   FRONTEND_URL=https://tu-proyecto.vercel.app
   ```

5. **Deploy** → Listo

**Guía detallada:** `docs/DEPLOYMENT.md`

---

## 📂 Estructura del Proyecto

```
MiPage/
├── frontend/              # Next.js 14 + React + Tailwind
│   ├── src/
│   │   ├── app/          # Pages (App Router)
│   │   ├── components/   # UI Components
│   │   ├── lib/          # Utils, API, Auth
│   │   └── hooks/        # Custom hooks
│   └── package.json
│
├── backend/              # Node.js + Express + Prisma
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API endpoints
│   │   └── middleware/   # Auth, validation
│   ├── prisma/           # Database schema
│   └── __tests__/        # Unit tests
│
├── docs/                 # Documentación
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── QUICK-START.md
│   └── ...
│
└── DEPLOY-VERCEL-FIX.md  # Solución error 404
```

---

## 🛠️ Stack Tecnológico

**Frontend:**
- Next.js 14 (App Router, SSR)
- React 18 (Hooks)
- TypeScript
- Tailwind CSS
- SWR (data fetching)
- Socket.io (real-time)

**Backend:**
- Node.js 20+
- Express.js
- Prisma ORM
- PostgreSQL (Supabase)
- JWT Authentication
- Socket.io

**Infraestructura:**
- Vercel (frontend) - GRATIS
- Railway (backend) - GRATIS
- Supabase (database) - GRATIS
- Cloudinary (images) - 25GB GRATIS

---

## 📚 Documentación Disponible

| Archivo | Descripción | Para quién |
|---------|-------------|------------|
| `README.md` | Overview general | Todos |
| `DEPLOY-VERCEL-FIX.md` | **Solución error 404** | **Si tienes error** |
| `QUALITY-SUMMARY.md` | Resumen de calidad | Desarrolladores |
| `docs/QUICK-START.md` | Inicio rápido | Principiantes |
| `docs/DEPLOYMENT.md` | Deploy detallado | DevOps |
| `docs/API.md` | Documentación API | Backend devs |
| `docs/CODE-QUALITY.md` | Estándares | Desarrolladores |
| `docs/TESTING.md` | Guía de tests | QA/Devs |
| `docs/PERFORMANCE.md` | Optimizaciones | Performance |
| `docs/MANAGEMENT-GUIDE.md` | Gestión diaria | No-técnicos |

---

## ⚡ Quick Commands

```bash
# Desarrollo local
npm run dev              # Iniciar frontend
cd backend && npm run dev    # Iniciar backend

# Tests
npm test                 # Backend tests
npm run test:coverage    # Con coverage

# Build
npm run build            # Build frontend
cd backend && npm start  # Producción backend

# Database
npx prisma studio        # Ver DB en navegador
npx prisma db push       # Aplicar cambios
npx prisma db seed       # Datos de prueba
```

---

## 🐛 Problemas Comunes

### Error 404 en Vercel

**Solución:** Lee `DEPLOY-VERCEL-FIX.md`

**TL;DR:** Configura `Root Directory: frontend` en Vercel

### Error "Cannot connect to database"

**Solución:**
1. Verifica `DATABASE_URL` en `backend/.env`
2. Asegúrate de que Supabase esté activo
3. Intenta: `npx prisma db push`

### Error "Module not found"

**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Backend no responde (CORS)

**Solución:**
- Verifica `FRONTEND_URL` en backend `.env`
- Debe ser la URL exacta de Vercel (sin `/` al final)

---

## ✅ Checklist de Setup

- [ ] Node.js 20+ instalado
- [ ] Git instalado
- [ ] Cuenta en Supabase (gratis)
- [ ] Cuenta en Cloudinary (gratis)
- [ ] Cuenta en Vercel (gratis)
- [ ] Cuenta en Railway (gratis)
- [ ] Repositorio clonado
- [ ] Variables de entorno configuradas

---

## 🎯 Características Principales

✅ **Grid de Fotos Intuitivo** - Masonry responsive
✅ **Sistema de Reseñas** - Rating 1-5 estrellas
✅ **Perfiles de Usuario** - Timeline de publicaciones
✅ **Búsqueda Avanzada** - Por categoría, ciudad, precio
✅ **Tiempo Real** - Notificaciones con Socket.io
✅ **PWA** - Instalar como app
✅ **Responsive** - Mobile-first design
✅ **SEO Optimizado** - Next.js SSR
✅ **Seguridad** - JWT, validaciones, rate limiting
✅ **Tests** - Jest + Supertest

---

## 🎨 Categorías

1. **Modelaje** 📸
   - Sesiones fotográficas
   - Modelos para eventos
   - Campañas publicitarias
   - Pasarelas

2. **Masajes Profesionales** 💆
   - Masajes terapéuticos
   - Masajes relajantes
   - Masajes deportivos
   - Aromaterapia

---

## 📞 Soporte

- **Documentación:** Carpeta `/docs`
- **GitHub Issues:** https://github.com/datanalytics86/MiPage/issues
- **Email:** soporte@mipage.cl (configura esto)

---

## 🚦 Próximos Pasos

**Elige tu camino:**

1. **Explorar:** Lee `README.md` y `QUALITY-SUMMARY.md`
2. **Desarrollar:** Sigue `docs/QUICK-START.md`
3. **Deployar:** Lee `DEPLOY-VERCEL-FIX.md` (si tienes error 404)

---

## 🎉 ¡Listo!

**Todo está preparado para que:**
- 👀 Explores el código
- 💻 Corras localmente
- 🚀 Despliegues a producción

**¿Tienes error 404 en Vercel?** → `DEPLOY-VERCEL-FIX.md`

**¿Primera vez con el proyecto?** → `docs/QUICK-START.md`

**¿Quieres deployar?** → `docs/DEPLOYMENT.md`

---

**Proyecto creado con ❤️ para servicios de Modelaje y Masajes Profesionales** 📸💆

**Última actualización:** Noviembre 2024
