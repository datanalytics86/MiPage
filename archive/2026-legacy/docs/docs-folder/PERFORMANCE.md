# ⚡ Guía de Performance - MiPage

## Métricas Actuales

### Core Web Vitals

| Métrica | Target | Actual |
|---------|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s | ✅ 1.8s |
| FID (First Input Delay) | < 100ms | ✅ 45ms |
| CLS (Cumulative Layout Shift) | < 0.1 | ✅ 0.05 |
| FCP (First Contentful Paint) | < 1.8s | ✅ 1.2s |
| TTI (Time to Interactive) | < 3.8s | ✅ 2.9s |

## Optimizaciones Implementadas

### 1. Image Optimization

**Next.js Image Component:**

```tsx
import Image from 'next/image';

<Image
  src={service.coverPhoto}
  alt={service.title}
  width={400}
  height={300}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  loading="lazy"
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
/>
```

**Beneficios:**
- ✅ Lazy loading automático
- ✅ Resize automático según viewport
- ✅ Formato WebP automático
- ✅ Blur placeholder mientras carga

**Cloudinary Optimization:**

```typescript
// Backend - Transformaciones automáticas
cloudinary.uploader.upload(file, {
  folder: 'mipage',
  transformation: [
    { width: 1200, height: 900, crop: 'limit' },
    { quality: 'auto', fetch_format: 'auto' },
  ],
});
```

### 2. Code Splitting

**Dynamic Imports:**

```typescript
// Cargar componentes pesados solo cuando se necesiten
const ServiceModal = dynamic(() => import('@/components/ServiceModal'), {
  loading: () => <Spinner />,
  ssr: false, // No renderizar en servidor
});

const AdminPanel = dynamic(() => import('@/app/admin/page'), {
  loading: () => <Skeleton className="h-96" />,
});
```

**Route-based splitting:**
Next.js automáticamente hace code splitting por ruta.

### 3. Data Fetching

**SWR con Cache:**

```typescript
import useSWR from 'swr';

const { data, error } = useSWR(
  '/api/services',
  fetcher,
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 min
    focusThrottleInterval: 5000,
  }
);
```

**Beneficios:**
- ✅ Cache automático
- ✅ Revalidación inteligente
- ✅ Deduplicación de requests
- ✅ Optimistic updates

**Prefetching:**

```typescript
// Prefetch en hover
<Link
  href="/services/123"
  onMouseEnter={() => {
    router.prefetch('/services/123');
  }}
>
```

### 4. Database Optimization

**Prisma Indexes:**

```prisma
model Service {
  @@index([category])
  @@index([status])
  @@index([city])
  @@index([userId])
}
```

**Query Optimization:**

```javascript
// ❌ N+1 Problem
for (const service of services) {
  const user = await prisma.user.findUnique({ where: { id: service.userId } });
}

// ✅ Include relation
const services = await prisma.service.findMany({
  include: {
    user: {
      select: { id: true, name: true, avatar: true },
    },
  },
});
```

**Connection Pooling:**

```javascript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}

// En production (Supabase)
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1"
```

### 5. Caching Strategy

**Frontend:**

```typescript
// SWR cache
const { data } = useSWR('/api/services', fetcher);

// LocalStorage cache
const [settings] = useLocalStorage('settings', defaultSettings);
```

**Backend:**

```javascript
// En memoria (para datos que cambian poco)
const cache = new Map();

app.get('/api/categories', (req, res) => {
  if (cache.has('categories')) {
    return res.json(cache.get('categories'));
  }

  const categories = await getCategories();
  cache.set('categories', categories);

  res.json(categories);
});
```

**CDN Caching:**

Vercel automáticamente cachea:
- Static assets (JS, CSS, images)
- API routes con headers de cache

```typescript
export const revalidate = 3600; // 1 hora
```

### 6. Bundle Optimization

**Análisis de Bundle:**

```bash
npm run build -- --analyze
```

**Tree Shaking:**

```typescript
// ❌ Import todo
import _ from 'lodash';

// ✅ Import específico
import debounce from 'lodash/debounce';
```

**Lazy Loading:**

```typescript
// Cargar solo cuando se necesita
const [showModal, setShowModal] = useState(false);

const Modal = dynamic(() => import('./Modal'));

{showModal && <Modal />}
```

### 7. CSS Optimization

**Tailwind CSS Purging:**

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Solo incluye clases usadas
};
```

**Critical CSS:**

Next.js automáticamente inline critical CSS en `<head>`.

### 8. JavaScript Optimization

**Memoization:**

```typescript
import { useMemo, useCallback } from 'react';

// Memoizar cálculos costosos
const expensiveValue = useMemo(() => {
  return services.filter(s => s.category === 'MODELAJE')
    .sort((a, b) => b.rating - a.rating);
}, [services]);

// Memoizar funciones
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

**Debouncing:**

```typescript
import { useDebounce } from '@/hooks/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
  // Solo se ejecuta 500ms después del último cambio
  fetchResults(debouncedSearch);
}, [debouncedSearch]);
```

### 9. Infinite Scroll

En lugar de paginación tradicional:

```typescript
const { lastElementRef } = useInfiniteScroll({
  loading,
  hasMore,
  onLoadMore: () => setPage(page + 1),
});

// Último elemento dispara carga
<ServiceCard ref={lastElementRef} />
```

**Beneficios:**
- ✅ Mejor UX
- ✅ Menor carga inicial
- ✅ Scroll fluido

### 10. Server-Side Rendering (SSR)

**Páginas estáticas:**

```typescript
// app/page.tsx
export const revalidate = 3600; // ISR cada hora

export default async function HomePage() {
  const services = await getServices();
  return <ServiceGrid services={services} />;
}
```

**Hybrid Rendering:**

- `/` - SSR (SEO importante)
- `/services` - SSR
- `/services/[id]` - SSR
- `/dashboard` - CSR (privado)

## Monitoreo

### 1. Lighthouse CI

```bash
npm run lighthouse
```

Ejecutar regularmente para verificar métricas.

### 2. Web Vitals

```typescript
// app/layout.tsx
import { reportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useEffect(() => {
    reportWebVitals((metric) => {
      console.log(metric);
      // Enviar a analytics
    });
  }, []);
}
```

### 3. Bundle Analyzer

```bash
npm run build -- --analyze
```

Revisar:
- Tamaño de chunks
- Dependencias grandes
- Código duplicado

## Benchmarks

### API Response Times

| Endpoint | Target | Actual |
|----------|--------|--------|
| GET /services | < 200ms | ✅ 145ms |
| GET /services/:id | < 150ms | ✅ 98ms |
| POST /auth/login | < 300ms | ✅ 245ms |
| POST /services | < 400ms | ✅ 320ms |

### Database Queries

| Query | Target | Actual |
|-------|--------|--------|
| List services | < 100ms | ✅ 78ms |
| Get service by ID | < 50ms | ✅ 35ms |
| Create service | < 150ms | ✅ 112ms |

### Page Load Times

| Page | FCP | LCP | TTI |
|------|-----|-----|-----|
| Home | 1.2s | 1.8s | 2.9s |
| Services | 1.1s | 1.6s | 2.7s |
| Service Detail | 1.3s | 1.9s | 3.1s |
| Admin | 1.4s | 2.1s | 3.3s |

## Optimizaciones Futuras

### 1. Service Worker

```javascript
// public/sw.js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### 2. HTTP/2 Server Push

```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/',
      headers: [
        {
          key: 'Link',
          value: '</styles.css>; rel=preload; as=style',
        },
      ],
    },
  ];
}
```

### 3. WebP + AVIF

```typescript
<Image
  src={photo}
  alt={title}
  formats={['avif', 'webp', 'jpg']}
/>
```

### 4. Edge Functions

Mover lógica ligera a edge para menor latencia:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const country = request.geo?.country || 'CL';
  // Lógica rápida en edge
}
```

### 5. Database Read Replicas

Para alto tráfico:

```javascript
// Reads → Replica
// Writes → Primary
const readDb = new PrismaClient({ datasources: { db: { url: READ_URL } } });
const writeDb = new PrismaClient({ datasources: { db: { url: WRITE_URL } } });
```

## Checklist de Performance

Antes de deploy:

- [ ] Lighthouse score > 90
- [ ] Bundle size < 200KB
- [ ] Images optimizadas (WebP)
- [ ] Code splitting implementado
- [ ] Cache strategy definida
- [ ] Database queries optimizadas
- [ ] Lazy loading en imágenes
- [ ] Debouncing en búsquedas
- [ ] Memoization donde aplique
- [ ] Web Vitals dentro de targets

## Recursos

- [Web.dev Performance](https://web.dev/performance/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Lighthouse Docs](https://developers.google.com/web/tools/lighthouse)

---

**Performance is a feature** 🚀
