# 📖 Guía de Uso Completa - MiPage Marketplace

## 🎯 Descripción General

MiPage es un marketplace especializado en dos categorías de servicios profesionales:
- **Modelaje**: Sesiones fotográficas, eventos, publicidad
- **Masajes Profesionales**: Terapéuticos, relajación, deportivos

## 🚀 Inicio Rápido

### 1. Ejecutar el Backend con Datos de Prueba

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Ejecutar migraciones de Prisma
npx prisma migrate dev

# 🌱 IMPORTANTE: Ejecutar seed para crear datos de prueba
npm run seed

# Iniciar servidor
npm run dev
```

El comando `npm run seed` creará:
- ✅ 5 usuarios (1 admin, 3 publishers, 1 usuario)
- ✅ 6 servicios con fotos reales (3 modelaje, 3 masajes)
- ✅ 2 reseñas de ejemplo
- ✅ 2 posts de ejemplo

### 2. Ejecutar el Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear .env.local con:
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Iniciar aplicación
npm run dev
```

Abre http://localhost:3000

## 👥 Credenciales de Acceso

### 🔐 Administrador
```
Email: admin@mipage.cl
Password: password123
```
**Permisos**: Ver panel de admin, aprobar/rechazar servicios, gestionar usuarios

### ⭐ Publisher 1 (María - Modelaje)
```
Email: maria@example.com
Password: password123
```
**Permisos**: Crear servicios de modelaje, responder reseñas

### ⭐ Publisher 2 (Carlos - Masajes)
```
Email: carlos@example.com
Password: password123
```
**Permisos**: Crear servicios de masajes, responder reseñas

### 👤 Usuario Regular (Juan)
```
Email: juan@example.com
Password: password123
```
**Permisos**: Ver servicios, dejar reseñas, marcar favoritos

## 📋 Flujo de Trabajo Completo

### Para Publicadores (Publishers)

#### 1. Registro y Login
1. Ve a `/auth/register`
2. Selecciona "Publicador" (estrella ⭐)
3. Completa el formulario
4. Inicia sesión en `/auth/login`

#### 2. Crear un Nuevo Servicio
1. Una vez autenticado, ve a `/services/new`
2. Completa el formulario:
   - **Categoría**: Elige Modelaje 📸 o Masajes 💆
   - **Título**: Descriptivo y atractivo
   - **Descripción**: Detalla tu servicio, experiencia y qué incluye
   - **Precio**: En pesos chilenos (CLP)
   - **Ubicación**: Ciudad y región
   - **Fotos**: Agrega URLs de fotos profesionales

3. **Agregar Fotos**:
   ```
   💡 Puedes usar URLs de imágenes de:
   - Unsplash: https://unsplash.com/
   - Tu propio servidor
   - Cloudinary (cuando esté configurado)

   Ejemplo:
   https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800
   ```

4. Click en "Publicar Servicio"
5. Tu servicio quedará en estado PENDIENTE y será revisado por un admin

#### 3. Ver Estado de tus Servicios
- Ve a tu perfil (próximamente)
- O espera la notificación de aprobación

### Para Administradores

#### 1. Acceder al Panel de Administración
1. Inicia sesión con cuenta de admin
2. Ve a `/admin`

#### 2. Revisar Servicios Pendientes
En el panel verás:
- **Preview de la foto principal** del servicio
- **Datos del publicador** (nombre, email, avatar)
- **Detalles del servicio** (título, descripción, precio, ubicación)
- **Número total de fotos**

#### 3. Ver Galería de Fotos
1. Click en la foto principal O en el botón "👁️ Ver Fotos"
2. Se abrirá un modal con todas las fotos del servicio
3. Puedes aprobar o rechazar desde el modal

#### 4. Aprobar o Rechazar
- **✅ Aprobar**: El servicio se hace visible públicamente
- **❌ Rechazar**: El servicio es rechazado (el publisher puede editarlo)

### Para Usuarios Regulares

#### 1. Explorar Servicios
1. Navega la página principal
2. Usa los filtros:
   - **Categoría**: Modelaje o Masajes
   - **Ciudad**: Santiago, Valparaíso, etc.
   - **Rango de precio**: Min - Max
   - **Búsqueda**: Por palabra clave

#### 2. Ver Detalles de un Servicio
1. Click en cualquier servicio
2. Verás:
   - Galería de fotos completa
   - Descripción detallada
   - Precio y disponibilidad
   - Ubicación
   - Reseñas de otros usuarios
   - Datos del publisher

#### 3. Dejar una Reseña
1. Debes estar autenticado
2. Ve al servicio que quieres reseñar
3. Click en "Dejar Reseña"
4. Califica de 1 a 5 estrellas
5. Escribe tu comentario
6. Envía

## 🎨 Características Principales

### ✅ Fotos como Prioridad
- **Grid de fotos** en la página principal
- **Galería completa** en página de detalles
- **Preview en admin** para moderación rápida
- **Primera foto** se usa como cover automáticamente

### ✅ Sistema de Roles
- **USER**: Solo puede ver y reseñar
- **PUBLISHER**: Puede crear servicios
- **ADMIN**: Puede moderar contenido

### ✅ Moderación de Contenido
- Todo servicio nuevo está en PENDING
- Admin debe aprobar antes de publicar
- Preview de fotos para decisión informada

### ✅ Categorías Específicas
Solo dos categorías:
1. 📸 **Modelaje**: Para modelos y fotógrafos
2. 💆 **Masajes Profesionales**: Para terapeutas

## 🔧 Comandos Útiles

### Backend

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_de_migracion

# Regenerar cliente de Prisma
npx prisma generate

# Ver base de datos en navegador
npx prisma studio

# Ejecutar seed (crear datos de prueba)
npm run seed

# Ejecutar tests
npm test
```

### Frontend

```bash
# Build de producción
npm run build

# Ejecutar build localmente
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 📸 Usando Fotos de Prueba

### Opción 1: Unsplash (Recomendado)
```
https://images.unsplash.com/photo-[ID]?w=800&h=1000&fit=crop
```

Busca en https://unsplash.com/ y copia la URL

### Opción 2: Placeholders
```
https://picsum.photos/800/1000
```

### Opción 3: Tu propio servidor
Sube las fotos a tu servidor y usa la URL completa

## 🐛 Solución de Problemas

### "Error de conexión con backend"
- Verifica que el backend esté corriendo en http://localhost:3001
- Verifica que `NEXT_PUBLIC_API_URL` esté configurado correctamente

### "No puedo hacer login"
- Asegúrate de haber ejecutado `npm run seed` en el backend
- Usa las credenciales exactas (case-sensitive)
- Verifica que la base de datos esté conectada

### "Las fotos no se muestran"
- Verifica que las URLs sean válidas
- Usa URLs https:// (no http://)
- Prueba la URL en el navegador primero

### "No puedo crear servicios"
- Debes estar autenticado con rol PUBLISHER o ADMIN
- Los usuarios regulares (USER) no pueden crear servicios

## 📊 Próximas Mejoras

- [ ] Upload directo de fotos (Cloudinary)
- [ ] Sistema de mensajería entre usuarios
- [ ] Calendario de disponibilidad
- [ ] Pagos integrados
- [ ] App móvil (PWA)
- [ ] Notificaciones en tiempo real
- [ ] Sistema de reportes

## 🤝 Soporte

Si tienes problemas:
1. Revisa esta guía
2. Revisa los logs del backend
3. Verifica la consola del navegador (F12)
4. Contacta al equipo de desarrollo

---

**MiPage Marketplace** - Conectando profesionales con clientes 🚀
