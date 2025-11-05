# MiPage Frontend

Aplicación Next.js 14 con React, TypeScript y Tailwind CSS.

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Configurar .env.local
cp .env.example .env.local
# Editar .env.local con las URLs del backend

# Iniciar en desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

## 📁 Estructura

```
frontend/
├── src/
│   ├── app/              # App Router (Next.js 14)
│   │   ├── page.tsx      # Página principal
│   │   ├── layout.tsx    # Layout principal
│   │   ├── services/     # Rutas de servicios
│   │   ├── auth/         # Rutas de autenticación
│   │   └── admin/        # Panel admin
│   ├── components/       # Componentes React
│   │   ├── layout/       # Header, Footer, Nav
│   │   ├── services/     # ServiceCard, ServiceGrid
│   │   ├── ui/           # Button, Input, Modal
│   │   └── auth/         # LoginForm, RegisterForm
│   ├── lib/              # Utilidades y helpers
│   │   ├── api.ts        # Cliente API
│   │   ├── auth.ts       # Auth store (Zustand)
│   │   ├── socket.ts     # WebSocket client
│   │   └── utils.ts      # Helpers
│   └── styles/
│       └── globals.css   # Estilos globales
├── public/               # Archivos estáticos
└── package.json
```

## 🎨 Componentes

### Layout
- `Header` - Navbar principal
- `Footer` - Footer del sitio
- `Sidebar` - Navegación lateral (admin)

### Services
- `ServiceGrid` - Grid de servicios
- `ServiceCard` - Tarjeta de servicio
- `ServiceDetail` - Vista detallada
- `ServiceForm` - Formulario crear/editar

### UI
- `Button` - Botón reutilizable
- `Input` - Input con validación
- `Modal` - Modal dialog
- `Toast` - Notificaciones

### Auth
- `LoginForm` - Formulario login
- `RegisterForm` - Formulario registro
- `ProtectedRoute` - HOC para rutas protegidas

## 🎨 Estilos

### Tailwind CSS

Personaliza en `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#0ea5e9',
        600: '#0284c7',
      }
    }
  }
}
```

### Clases Útiles

```jsx
<div className="bg-primary-500 text-white p-4 rounded-lg">
  Contenido
</div>
```

## 🔐 Autenticación

Usa Zustand para el estado global:

```typescript
import { useAuthStore } from '@/lib/auth';

function MyComponent() {
  const { user, isAuthenticated, setAuth, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <div>Hola {user.name}</div>;
}
```

## 📡 API Calls

```typescript
import { servicesAPI } from '@/lib/api';

// Obtener servicios
const { data } = await servicesAPI.getAll({
  category: 'MODELAJE',
  city: 'Santiago'
});

// Crear servicio
await servicesAPI.create({
  title: 'Mi Servicio',
  category: 'MODELAJE',
  // ...
});
```

## 🔌 WebSockets

```typescript
import { initSocket } from '@/lib/socket';

useEffect(() => {
  if (user) {
    const socket = initSocket(user.id);

    socket.on('notification', (data) => {
      toast.success(data.message);
    });

    return () => socket.disconnect();
  }
}, [user]);
```

## 📱 PWA

La app está configurada como PWA:

- ✅ Manifest.json
- ✅ Service Worker
- ✅ Offline support
- ✅ Install prompt

### Configurar

`next.config.js`:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
});
```

## 🧪 Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# E2E tests (Cypress)
npm run test:e2e
```

## 🚀 Build y Deploy

```bash
# Build
npm run build

# Analizar bundle
npm run build -- --analyze

# Iniciar producción
npm start
```

## 🎯 SEO

Next.js 14 con SSR/SSG para mejor SEO:

```typescript
// En cualquier página
export const metadata: Metadata = {
  title: 'Mi Página',
  description: 'Descripción',
  openGraph: {
    images: ['/og-image.jpg'],
  },
};
```

## 🔧 Configuración

### Variables de Entorno

**Desarrollo:** `.env.local`
**Producción:** Configurar en Vercel

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

## 📊 Performance

### Optimizaciones Incluidas

- ✅ Image optimization (next/image)
- ✅ Code splitting automático
- ✅ SWR para cache
- ✅ Lazy loading de componentes
- ✅ Compresión gzip

### Métricas

```bash
# Lighthouse CI
npm run lighthouse

# Bundle analyzer
npm run analyze
```

## 🎨 Customización

### Cambiar Logo

Reemplaza:
- `public/logo.png`
- `public/icon-192x192.png`
- `public/icon-512x512.png`

### Cambiar Colores

Edita `tailwind.config.js`:
```javascript
colors: {
  primary: { /* tus colores */ },
  secondary: { /* tus colores */ }
}
```

### Cambiar Fonts

`app/layout.tsx`:
```typescript
import { Inter, Roboto } from 'next/font/google';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700']
});
```

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [SWR](https://swr.vercel.app/)

## 🤝 Contribuir

Ver [CONTRIBUTING.md](../docs/CONTRIBUTING.md)

## 📄 Licencia

MIT
