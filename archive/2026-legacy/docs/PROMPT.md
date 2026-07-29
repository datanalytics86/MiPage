# 📋 PROMPT - Especificaciones del Proyecto MiPage

**Versión:** 1.0
**Última actualización:** 2024-11-05
**Proyecto:** MiPage - Marketplace de Servicios Profesionales

---

## 1. VISIÓN GENERAL DEL PROYECTO

### 1.1 Descripción
MiPage es un marketplace especializado en dos categorías de servicios profesionales en Chile:
- **Modelaje**: Sesiones fotográficas, eventos, publicidad, fashion
- **Masajes Profesionales**: Terapéuticos, relajación, deportivos

### 1.2 Objetivo Principal
Conectar profesionales (publishers) con clientes, priorizando contenido visual de alta calidad (fotos).

### 1.3 Características Clave
- ✅ Grid de fotos como elemento principal
- ✅ Sistema de roles (USER, PUBLISHER, ADMIN)
- ✅ Moderación de contenido
- ✅ Sistema de reseñas y calificaciones
- ✅ Búsqueda y filtros avanzados
- ✅ Responsive design (mobile-first)

---

## 2. STACK TECNOLÓGICO

### 2.1 Frontend
```
Framework: Next.js 14 (App Router)
Lenguaje: TypeScript
Estilos: Tailwind CSS
UI Components: Componentes custom + Headless UI
Iconos: Heroicons
Estado: Zustand (auth), SWR (data fetching)
Imágenes: next/image
Notificaciones: react-hot-toast
```

### 2.2 Backend
```
Runtime: Node.js 20+
Framework: Express.js
ORM: Prisma
Base de Datos: PostgreSQL (Supabase) / SQLite (desarrollo)
Autenticación: JWT + bcrypt
Validación: express-validator
Seguridad: Helmet.js, CORS, Rate Limiting
```

### 2.3 Infraestructura
```
Frontend Hosting: Vercel (gratuito)
Backend Hosting: Railway/Render (gratuito)
Base de Datos: Supabase (gratuito) / SQLite (local)
Imágenes: URLs externas (Unsplash, Cloudinary)
```

---

## 3. ARQUITECTURA DEL SISTEMA

### 3.1 Roles de Usuario

#### USER (Usuario Regular)
- Ver servicios públicos
- Buscar y filtrar
- Dejar reseñas (requiere login)
- Marcar favoritos
- Ver perfiles de publishers

#### PUBLISHER (Publicador)
- Todo lo de USER
- Crear servicios con fotos
- Responder reseñas
- Ver estadísticas
- Gestionar su contenido

#### ADMIN (Administrador)
- Todo lo de PUBLISHER
- Aprobar/rechazar servicios
- Moderar contenido
- Ver panel de administración
- Gestionar usuarios

### 3.2 Estados de Servicio
```
PENDING   → Recién creado, esperando aprobación
APPROVED  → Aprobado por admin, visible públicamente
REJECTED  → Rechazado por admin
ARCHIVED  → Archivado por el publisher
```

---

## 4. ESTRUCTURA DEL PROYECTO

### 4.1 Estructura de Carpetas

```
MiPage/
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js 14 App Router
│   │   │   ├── page.tsx           # Home
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── auth/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── services/
│   │   │   │   ├── page.tsx       # Listado
│   │   │   │   ├── [id]/page.tsx  # Detalle
│   │   │   │   └── new/page.tsx   # Crear
│   │   │   └── admin/
│   │   │       └── page.tsx       # Panel admin
│   │   ├── components/
│   │   │   ├── ui/                # Componentes base
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   └── services/          # Componentes de servicios
│   │   │       └── ServiceCard.tsx
│   │   ├── lib/
│   │   │   ├── api.ts            # Cliente API
│   │   │   ├── auth.ts           # Store de auth
│   │   │   ├── utils.ts          # Utilidades
│   │   │   └── validations.ts    # Validaciones
│   │   └── styles/
│   │       └── globals.css
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/           # Lógica de endpoints
│   │   ├── routes/                # Definición de rutas
│   │   ├── middleware/            # Auth, validación, etc.
│   │   ├── services/              # Lógica de negocio
│   │   └── utils/                 # Helpers
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── package.json
├── docs/                          # Documentación
├── PROMPT.md                      # Este archivo
├── architecture.md                # Arquitectura técnica
└── CLAUDE_CODE_TEMPLATES.md      # Templates de desarrollo
```

### 4.2 Convenciones de Nomenclatura

#### Archivos
```
Componentes React: PascalCase (Button.tsx, ServiceCard.tsx)
Páginas Next.js: lowercase (page.tsx, layout.tsx)
Utilidades: camelCase (api.ts, utils.ts)
Tipos: PascalCase (types.ts con exports PascalCase)
```

#### Variables y Funciones
```
Variables: camelCase (const userName, let isLoading)
Constantes: UPPER_SNAKE_CASE (const API_URL, MAX_FILE_SIZE)
Funciones: camelCase (function fetchData, const handleClick)
Componentes: PascalCase (const Button, function Modal)
Hooks: camelCase con 'use' (useAuth, useDebounce)
```

#### Clases CSS (Tailwind)
```
Usar utility classes de Tailwind
Evitar CSS custom a menos que sea necesario
Nomenclatura: kebab-case para clases custom
```

---

## 5. FLUJOS DE USUARIO

### 5.1 Flujo de Registro y Login

```
Usuario visita sitio
    ↓
Click "Registrarse"
    ↓
Selecciona rol (USER o PUBLISHER)
    ↓
Completa formulario
    ↓
Backend crea usuario con password hasheado
    ↓
Retorna JWT token
    ↓
Frontend guarda token en localStorage
    ↓
Usuario autenticado → Redirect a home
```

### 5.2 Flujo de Creación de Servicio (PUBLISHER)

```
Publisher hace login
    ↓
Va a /services/new
    ↓
Completa formulario:
  - Categoría (Modelaje/Masajes)
  - Título
  - Descripción
  - Precio y tipo
  - Ubicación
  - Fotos (URLs)
    ↓
Submit → Backend valida datos
    ↓
Crea servicio con status PENDING
    ↓
Notifica a admins (socket.io)
    ↓
Publisher recibe confirmación
    ↓
Espera aprobación de admin
```

### 5.3 Flujo de Moderación (ADMIN)

```
Admin hace login
    ↓
Va a /admin
    ↓
Ve lista de servicios PENDING
    ↓
Para cada servicio:
  - Ve preview de foto principal
  - Ve datos del publisher
  - Click "Ver Fotos" → Modal con galería
    ↓
Decide:
  - Aprobar → Status cambia a APPROVED
  - Rechazar → Status cambia a REJECTED
    ↓
Publisher recibe notificación
    ↓
Si aprobado → Servicio visible en home
```

### 5.4 Flujo de Búsqueda y Visualización

```
Usuario en home
    ↓
Ve grid de servicios APPROVED
    ↓
Usa filtros:
  - Categoría
  - Ciudad
  - Rango de precio
  - Búsqueda por texto
    ↓
Click en servicio
    ↓
Ve página de detalle:
  - Galería de fotos (todas)
  - Descripción completa
  - Precio y disponibilidad
  - Reseñas de otros usuarios
  - Datos del publisher
    ↓
Si autenticado:
  - Puede dejar reseña
  - Puede marcar favorito
  - Puede contactar
```

---

## 6. DISEÑO UI/UX

### 6.1 Paleta de Colores

```css
/* Colores Primarios */
--primary-50: #f0f9ff
--primary-100: #e0f2fe
--primary-200: #bae6fd
--primary-300: #7dd3fc
--primary-400: #38bdf8
--primary-500: #0ea5e9
--primary-600: #0284c7  /* Principal */
--primary-700: #0369a1
--primary-800: #075985
--primary-900: #0c4a6e

/* Colores Secundarios */
--secondary-500: #ec4899
--secondary-600: #db2777

/* Grises */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827

/* Estados */
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6
```

### 6.2 Tipografía

```css
/* Font Family */
font-family: 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', sans-serif

/* Tamaños */
--text-xs: 0.75rem     /* 12px */
--text-sm: 0.875rem    /* 14px */
--text-base: 1rem      /* 16px */
--text-lg: 1.125rem    /* 18px */
--text-xl: 1.25rem     /* 20px */
--text-2xl: 1.5rem     /* 24px */
--text-3xl: 1.875rem   /* 30px */
--text-4xl: 2.25rem    /* 36px */
--text-5xl: 3rem       /* 48px */
--text-6xl: 3.75rem    /* 60px */

/* Weights */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### 6.3 Espaciado

```
Usar sistema de Tailwind:
- p-1: 0.25rem (4px)
- p-2: 0.5rem (8px)
- p-3: 0.75rem (12px)
- p-4: 1rem (16px)
- p-6: 1.5rem (24px)
- p-8: 2rem (32px)
- p-12: 3rem (48px)

Misma escala para:
- margin (m-*)
- gap
- width/height
```

### 6.4 Componentes Clave

#### Button
```tsx
Variantes: primary, secondary, outline, ghost, danger
Tamaños: sm, md, lg
Estados: default, hover, active, disabled, loading
Accesibilidad: ARIA labels, keyboard navigation
```

#### Input
```tsx
Props: label, error, helperText, icon
Estados: default, focus, error, disabled
Estilos: Fondo blanco, borde gris, padding visible
Validación: Mostrar errores en rojo debajo
```

#### ServiceCard
```tsx
Estructura:
- Foto (aspect-ratio 4:3)
- Badge de categoría
- Rating con estrellas
- Título
- Ubicación (con icono)
- Precio
- Badge Premium (si aplica)

Hover: Scale up de foto (105%)
```

### 6.5 Responsive Breakpoints

```css
/* Mobile First */
Default: < 640px (móvil)
sm: 640px (tablet pequeña)
md: 768px (tablet)
lg: 1024px (desktop)
xl: 1280px (desktop grande)
2xl: 1536px (desktop extra grande)
```

### 6.6 Grid de Fotos

```css
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Responsive */
@media (min-width: 640px) {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

@media (min-width: 1024px) {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}
```

---

## 7. API ENDPOINTS

### 7.1 Autenticación

```
POST   /api/auth/register      - Registrar usuario
POST   /api/auth/login         - Iniciar sesión
GET    /api/auth/profile       - Obtener perfil
PUT    /api/auth/profile       - Actualizar perfil
PUT    /api/auth/change-password - Cambiar contraseña
```

### 7.2 Servicios

```
GET    /api/services           - Listar servicios (filtros en query)
GET    /api/services/:id       - Obtener servicio por ID
POST   /api/services           - Crear servicio (PUBLISHER)
PUT    /api/services/:id       - Actualizar servicio (PUBLISHER)
DELETE /api/services/:id       - Eliminar servicio (PUBLISHER)
POST   /api/services/:id/favorite - Toggle favorito (USER)
GET    /api/services/favorites - Listar favoritos (USER)
```

### 7.3 Reseñas

```
POST   /api/reviews/:serviceId - Crear reseña (USER)
PUT    /api/reviews/:id/respond - Responder reseña (PUBLISHER)
PUT    /api/reviews/:id        - Actualizar reseña (USER)
DELETE /api/reviews/:id        - Eliminar reseña (USER/ADMIN)
```

### 7.4 Admin

```
GET    /api/admin/stats        - Estadísticas generales (ADMIN)
GET    /api/admin/services/pending - Servicios pendientes (ADMIN)
PUT    /api/admin/services/:id/approve - Aprobar servicio (ADMIN)
PUT    /api/admin/services/:id/reject - Rechazar servicio (ADMIN)
GET    /api/admin/users        - Listar usuarios (ADMIN)
DELETE /api/admin/users/:id    - Eliminar usuario (ADMIN)
PUT    /api/admin/users/:id/verify - Verificar usuario (ADMIN)
```

---

## 8. SEGURIDAD Y VALIDACIONES

### 8.1 Autenticación
- ✅ Passwords hasheados con bcrypt (10 rounds)
- ✅ JWT tokens con expiración (7 días)
- ✅ Tokens en headers: `Authorization: Bearer <token>`
- ✅ Verificación de token en cada request protegido

### 8.2 Validaciones de Input

#### Email
```typescript
- Formato válido (regex)
- Único en la base de datos
- Máximo 255 caracteres
```

#### Password
```typescript
- Mínimo 8 caracteres
- Al menos 1 letra
- Al menos 1 número
```

#### Título de Servicio
```typescript
- Mínimo 10 caracteres
- Máximo 100 caracteres
- Sin HTML/scripts
```

#### Descripción
```typescript
- Mínimo 50 caracteres
- Máximo 2000 caracteres
- Sanitizar HTML
```

#### Precio
```typescript
- Número positivo
- Mínimo 1000 CLP
- Máximo 10000000 CLP
```

#### Fotos
```typescript
- Array de URLs válidas
- Mínimo 1 foto
- Máximo 10 fotos
- URLs https://
- Formato: jpg, png, webp
```

### 8.3 Rate Limiting

```javascript
Login: 5 intentos por 15 minutos
Registro: 3 cuentas por hora por IP
API General: 100 requests por 15 minutos
Upload: 10 archivos por hora
```

### 8.4 CORS

```javascript
Permitir:
- Origen: FRONTEND_URL (variable de entorno)
- Métodos: GET, POST, PUT, DELETE
- Headers: Authorization, Content-Type
- Credentials: true
```

---

## 9. DATOS DE PRUEBA (SEED)

### 9.1 Usuarios

```javascript
Admin:
  email: admin@mipage.cl
  password: password123
  role: ADMIN

Publishers:
  maria@example.com / password123 (Modelaje)
  carlos@example.com / password123 (Masajes)
  sofia@example.com / password123 (Modelaje)

Usuario Regular:
  juan@example.com / password123
```

### 9.2 Servicios

```
6 servicios totales:
- 3 de Modelaje (varios con fotos de Unsplash)
- 3 de Masajes Profesionales (fotos de Unsplash)
- Algunos en APPROVED
- Algunos en PENDING
- Precios entre 25,000 y 80,000 CLP
```

### 9.3 Reseñas

```
2 reseñas de ejemplo con ratings 4.5-5.0
```

---

## 10. CRITERIOS DE ACEPTACIÓN

### 10.1 Funcionalidad

- [ ] Usuario puede registrarse con rol USER o PUBLISHER
- [ ] Usuario puede hacer login y recibir token JWT
- [ ] Publisher puede crear servicio con múltiples fotos
- [ ] Servicio creado queda en PENDING
- [ ] Admin puede ver servicios PENDING en panel
- [ ] Admin puede aprobar/rechazar servicios
- [ ] Servicios APPROVED aparecen en home
- [ ] Usuario puede buscar/filtrar servicios
- [ ] Usuario autenticado puede dejar reseñas
- [ ] Publisher puede responder reseñas

### 10.2 UI/UX

- [ ] Inputs visibles con fondo blanco y bordes
- [ ] Fotos se cargan correctamente
- [ ] Grid de fotos responsive
- [ ] Navegación fluida sin lags
- [ ] Testimonios visibles en home
- [ ] Loading states en operaciones async
- [ ] Mensajes de error claros
- [ ] Confirmaciones de acciones exitosas

### 10.3 Seguridad

- [ ] Passwords hasheados en BD
- [ ] Tokens JWT válidos y verificados
- [ ] Validación de inputs en frontend y backend
- [ ] Rate limiting implementado
- [ ] CORS configurado correctamente
- [ ] SQL injection prevención (Prisma ORM)

### 10.4 Performance

- [ ] Build de Next.js exitoso sin errores
- [ ] Imágenes optimizadas con next/image
- [ ] Bundle size razonable (< 200kb First Load JS)
- [ ] Lazy loading de componentes pesados
- [ ] Cache de datos con SWR

---

## 11. CASOS DE USO PRIORITARIOS

### Caso de Uso 1: Ver Servicios sin Login
```
Actor: Usuario Anónimo
Precondiciones: Ninguna
Flujo:
1. Usuario abre home
2. Ve grid con 6+ servicios APPROVED
3. Puede filtrar por categoría/ciudad
4. Puede buscar por texto
5. Click en servicio → Ve detalle
6. Ve fotos, descripción, precio, reseñas
Postcondiciones: Usuario puede ver información pública
```

### Caso de Uso 2: Publisher Crea Servicio
```
Actor: Publisher Autenticado
Precondiciones: Tiene cuenta PUBLISHER y está logueado
Flujo:
1. Va a /services/new
2. Selecciona categoría
3. Completa formulario
4. Agrega 3-5 fotos por URL
5. Submit
6. Backend valida y crea servicio PENDING
7. Publisher ve confirmación
8. Espera aprobación de admin
Postcondiciones: Servicio existe en BD con status PENDING
```

### Caso de Uso 3: Admin Modera Servicio
```
Actor: Admin Autenticado
Precondiciones: Existe al menos 1 servicio PENDING
Flujo:
1. Admin va a /admin
2. Ve lista de servicios PENDING
3. Para cada uno ve preview de foto y datos
4. Click "Ver Fotos" → Modal con galería
5. Decide aprobar o rechazar
6. Click "Aprobar"
7. Backend cambia status a APPROVED
8. Servicio ahora visible en home
Postcondiciones: Servicio aprobado y visible públicamente
```

---

## 12. ROADMAP

### Fase 1: MVP (COMPLETADO ✅)
- [x] Estructura del proyecto
- [x] Autenticación básica
- [x] CRUD de servicios
- [x] Panel de admin
- [x] Sistema de reseñas
- [x] UI components base
- [x] Seed con datos de prueba

### Fase 2: Mejoras (PRÓXIMAS)
- [ ] Upload directo de imágenes (Cloudinary)
- [ ] Sistema de mensajería
- [ ] Notificaciones en tiempo real
- [ ] Calendario de disponibilidad
- [ ] Búsqueda avanzada con Algolia

### Fase 3: Escalamiento
- [ ] Sistema de pagos (Stripe/Mercado Pago)
- [ ] Verificación de identidad
- [ ] Sistema de reportes
- [ ] Analytics avanzados
- [ ] App móvil nativa

---

## 13. GLOSARIO

| Término | Definición |
|---------|------------|
| Publisher | Usuario con rol PUBLISHER que puede crear servicios |
| Service | Oferta de servicio de modelaje o masaje |
| Cover Photo | Primera foto del servicio, usada en grid |
| PENDING | Estado de servicio recién creado, esperando aprobación |
| APPROVED | Estado de servicio aprobado, visible públicamente |
| Seed | Script que llena la BD con datos de prueba |
| JWT | JSON Web Token, usado para autenticación |
| ORM | Object-Relational Mapping (Prisma) |

---

**Fin del documento PROMPT.md**
**Consulta este archivo antes de implementar cualquier feature**
**Última actualización:** 2024-11-05
