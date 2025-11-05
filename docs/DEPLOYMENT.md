# Guía de Despliegue - MiPage

## 📋 Pre-requisitos

- Cuenta en GitHub
- Cuenta en Vercel (gratuita)
- Cuenta en Railway o Render (gratuita)
- Cuenta en Supabase (gratuita)
- Cuenta en Cloudinary (gratuita)

## 🚀 Despliegue Paso a Paso

### 1. Preparar el Repositorio

```bash
# Asegúrate de tener todo commiteado
git add .
git commit -m "Preparar para deployment"
git push origin main
```

### 2. Configurar Base de Datos (Supabase)

1. Ve a https://supabase.com
2. Crea un nuevo proyecto
3. Copia el `Connection String` (URI mode)
4. Guarda la `API URL` y `anon/public key`

**Ejecutar migraciones:**
```bash
cd backend
npx prisma db push
npx prisma db seed
```

### 3. Desplegar Backend (Railway)

#### Opción A: Desde la UI

1. Ve a https://railway.app
2. Click en "Start a New Project"
3. Selecciona "Deploy from GitHub repo"
4. Selecciona tu repositorio `MiPage`
5. Configura:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`

#### Configurar Variables de Entorno:

```env
DATABASE_URL=<tu-supabase-connection-string>
JWT_SECRET=<genera-un-secreto-seguro>
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=<tu-cloudinary-name>
CLOUDINARY_API_KEY=<tu-api-key>
CLOUDINARY_API_SECRET=<tu-api-secret>
PORT=3001
NODE_ENV=production
FRONTEND_URL=<tu-url-vercel-aqui>
```

**Generar JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

6. Click en "Deploy"
7. Copia la URL del backend (ej: `https://mipage-backend.up.railway.app`)

#### Opción B: Usando Railway CLI

```bash
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```

### 4. Desplegar Frontend (Vercel)

1. Ve a https://vercel.com
2. Click en "Add New Project"
3. Importa tu repositorio de GitHub
4. Configura:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

#### Configurar Variables de Entorno:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://tu-backend.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<tu-cloud-name>
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<tu-preset>
NEXT_PUBLIC_APP_NAME=MiPage
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

5. Click en "Deploy"
6. Copia la URL del frontend

### 5. Actualizar CORS en Backend

1. Ve a Railway
2. Actualiza la variable `FRONTEND_URL` con tu URL de Vercel
3. Redeploy si es necesario

### 6. Configurar Cloudinary Upload Preset

1. Ve a https://cloudinary.com
2. Settings > Upload
3. Add upload preset
4. **Name:** `mipage_preset` (o el que usaste)
5. **Signing Mode:** Unsigned
6. **Folder:** `mipage`
7. **Transformations:** Opcional (resize, quality, etc.)
8. Save

### 7. Configurar Dominio Personalizado (Opcional)

#### En Vercel:

1. Settings > Domains
2. Add domain
3. Sigue las instrucciones de DNS

#### En Railway:

1. Settings > Domains
2. Generate domain o conecta tu dominio

## 🔧 Troubleshooting

### Error: "Database connection failed"

**Solución:**
```bash
# Verifica que DATABASE_URL esté correcta
# Prueba la conexión
cd backend
npx prisma db push
```

### Error: "CORS policy"

**Solución:**
- Verifica que `FRONTEND_URL` en el backend tenga la URL correcta de Vercel
- No incluyas `/` al final

### Error: "JWT token invalid"

**Solución:**
- Verifica que `JWT_SECRET` sea el mismo en development y production
- Limpia cookies/localStorage en el navegador

### Error: Build falla en Vercel

**Solución:**
```bash
# Verifica que todas las env variables estén configuradas
# Prueba el build localmente
cd frontend
npm run build
```

### Error: "Prisma Client not generated"

**Solución:**
```bash
cd backend
npx prisma generate
# Agregar al build command: npm install && npx prisma generate
```

## 📊 Monitoreo

### Railway:

- Ve a tu proyecto > Metrics
- Monitorea CPU, RAM, Network

### Vercel:

- Analytics (automático)
- Speed Insights
- Web Vitals

### Supabase:

- Database > Logs
- Monitor queries lentas

## 🔄 CI/CD Automático

El proyecto incluye GitHub Actions que:

1. Ejecuta tests en cada PR
2. Hace linting de código
3. Type checking (TypeScript)
4. Deploy automático a main branch

**Configurar secrets en GitHub:**

Settings > Secrets and variables > Actions

```
TEST_DATABASE_URL=<db-para-tests>
NEXT_PUBLIC_API_URL=<tu-api-url>
```

## 📈 Escalado

### Gratis → Pagado

**Railway:**
- Free: $5/mes de crédito
- Pagado: Pay as you go (~$10-20/mes para tráfico bajo)

**Vercel:**
- Free: 100GB bandwidth
- Pro: $20/mes (uso comercial, más bandwidth)

**Supabase:**
- Free: 500MB DB, 2GB storage
- Pro: $25/mes (8GB DB, 100GB storage)

### Optimizaciones:

1. **Cache CDN:** Cloudflare (gratuito)
2. **Compresión de imágenes:** Automático con Cloudinary
3. **Database indexes:** Ya incluidos en Prisma schema
4. **API rate limiting:** Ya implementado

## 🔐 Seguridad en Producción

✅ HTTPS obligatorio (Vercel/Railway lo proveen)
✅ Environment variables nunca en código
✅ Rate limiting activo
✅ CORS configurado
✅ Headers de seguridad (Helmet.js)
✅ Input validation
✅ SQL injection protection (Prisma)

## 📱 PWA y Push Notifications

El frontend ya está configurado como PWA.

Para activar notificaciones push:

1. Configurar Firebase Cloud Messaging (gratuito)
2. Actualizar `frontend/src/lib/socket.ts`
3. Implementar service worker para notificaciones

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs en Railway/Vercel
2. Verifica todas las env variables
3. Consulta la documentación oficial:
   - https://railway.app/docs
   - https://vercel.com/docs
   - https://supabase.com/docs
4. Abre un issue en GitHub

---

**¡Felicitaciones! Tu aplicación está en producción 🎉**
