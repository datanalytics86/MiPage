# 🏗️ ARCHITECTURE - Arquitectura Técnica de MiPage

**Versión:** 1.0
**Última actualización:** 2024-11-05
**Complementa:** PROMPT.md

---

## 1. VISIÓN GENERAL DE LA ARQUITECTURA

### 1.1 Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────┐
│                      USUARIO FINAL                       │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js 14)                  │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐   │
│  │   Pages    │  │ Components │  │  Lib (Utils)    │   │
│  │ (App Dir)  │  │   (UI)     │  │  API Client     │   │
│  └────────────┘  └────────────┘  └─────────────────┘   │
└─────────────┬───────────────────────────────────────────┘
              │ HTTP/HTTPS (REST API)
              ▼
┌─────────────────────────────────────────────────────────┐
│                 BACKEND (Express + Node)                 │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐   │
│  │   Routes   │  │Controllers │  │   Middleware    │   │
│  │            │  │            │  │  (Auth, Valid)  │   │
│  └────────────┘  └────────────┘  └─────────────────┘   │
└─────────────┬───────────────────────────────────────────┘
              │ Prisma ORM
              ▼
┌─────────────────────────────────────────────────────────┐
│          DATABASE (PostgreSQL / SQLite)                  │
│  ┌─────────┐  ┌─────────┐  ┌────────┐  ┌──────────┐   │
│  │  Users  │  │Services │  │Reviews │  │   Posts  │   │
│  └─────────┘  └─────────┘  └────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Patrón de Arquitectura

**Frontend:** Component-Based Architecture (React/Next.js)
- Componentes reutilizables
- Separación de presentación y lógica
- State management distribuido (Zustand + SWR)

**Backend:** Layered Architecture
```
Routes → Controllers → Services → Data Access (Prisma)
      ↓
  Middleware (Auth, Validation, Error Handling)
```

---

## 2. ESTRUCTURA DE DIRECTORIOS DETALLADA

### 2.1 Frontend (`/frontend`)

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker
│   └── icons/                     # App icons
│
├── src/
│   ├── app/                       # Next.js 14 App Router
│   │   ├── layout.tsx             # Root layout (header, footer)
│   │   ├── page.tsx               # Home page
│   │   ├── globals.css            # Global styles
│   │   │
│   │   ├── auth/                  # Autenticación
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # Login form
│   │   │   └── register/
│   │   │       └── page.tsx       # Registration form
│   │   │
│   │   ├── services/              # Servicios
│   │   │   ├── page.tsx           # Lista de servicios
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx       # Detalle de servicio
│   │   │   └── new/
│   │   │       └── page.tsx       # Crear servicio (PUBLISHER)
│   │   │
│   │   └── admin/                 # Panel de administración
│   │       └── page.tsx           # Dashboard admin
│   │
│   ├── components/
│   │   ├── ui/                    # Componentes base reutilizables
│   │   │   ├── Button.tsx         # Botón con variantes
│   │   │   ├── Input.tsx          # Input con validación
│   │   │   ├── Modal.tsx          # Modal con Headless UI
│   │   │   ├── Card.tsx           # Card container
│   │   │   ├── Badge.tsx          # Badge/Pill
│   │   │   └── Spinner.tsx        # Loading spinner
│   │   │
│   │   └── services/              # Componentes específicos
│   │       └── ServiceCard.tsx    # Card de servicio
│   │
│   ├── lib/                       # Librerías y utilidades
│   │   ├── api.ts                 # Cliente API (axios)
│   │   ├── auth.ts                # Zustand store (auth)
│   │   ├── utils.ts               # Funciones utilitarias
│   │   └── validations.ts         # Validaciones frontend
│   │
│   └── hooks/                     # Custom React hooks
│       ├── useDebounce.ts
│       ├── useLocalStorage.ts
│       └── useInfiniteScroll.ts
│
├── .env.local                     # Variables de entorno
├── next.config.js                 # Configuración Next.js
├── tailwind.config.js             # Configuración Tailwind
├── tsconfig.json                  # TypeScript config
└── package.json
```

### 2.2 Backend (`/backend`)

```
backend/
├── src/
│   ├── controllers/               # Lógica de negocio por entidad
│   │   ├── auth.controller.js     # Login, register, profile
│   │   ├── service.controller.js  # CRUD servicios
│   │   ├── review.controller.js   # CRUD reseñas
│   │   ├── user.controller.js     # Gestión usuarios
│   │   ├── post.controller.js     # Timeline posts
│   │   └── admin.controller.js    # Funciones admin
│   │
│   ├── routes/                    # Definición de endpoints
│   │   ├── auth.routes.js
│   │   ├── service.routes.js
│   │   ├── review.routes.js
│   │   ├── user.routes.js
│   │   ├── post.routes.js
│   │   └── admin.routes.js
│   │
│   ├── middleware/                # Middleware de Express
│   │   ├── auth.js                # Verificación JWT
│   │   ├── validation.js          # Validación express-validator
│   │   ├── error.js               # Error handler global
│   │   └── rateLimiter.js         # Rate limiting
│   │
│   ├── utils/                     # Utilidades
│   │   ├── logger.js              # Sistema de logs
│   │   └── helpers.js             # Funciones helper
│   │
│   └── index.js                   # Entry point
│
├── prisma/
│   ├── schema.prisma              # Esquema de BD
│   ├── seed.js                    # Datos de prueba
│   └── migrations/                # Migraciones (si usamos migrate)
│
├── .env                           # Variables de entorno
├── package.json
└── README.md
```

---

## 3. PATRONES DE DISEÑO

### 3.1 Frontend Patterns

#### Component Pattern
```tsx
// Estructura estándar de componente

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  // Props tipadas
  required: string;
  optional?: number;
  children?: React.ReactNode;
}

export function Component({ required, optional = 0, children }: ComponentProps) {
  // 1. Hooks
  const [state, setState] = useState<Type>(initialValue);

  // 2. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // 3. Handlers
  const handleEvent = () => {
    // Logic
  };

  // 4. Render
  return (
    <div className={cn('base-classes', conditionalClasses)}>
      {children}
    </div>
  );
}
```

#### Custom Hook Pattern
```tsx
// hooks/useSomething.ts

import { useState, useEffect } from 'react';

interface UseSomethingReturn {
  data: Type | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSomething(param: string): UseSomethingReturn {
  const [data, setData] = useState<Type | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await api.get(param);
      setData(result.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [param]);

  return { data, loading, error, refetch: fetchData };
}
```

#### API Client Pattern
```typescript
// lib/api.ts

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Manejar token expirado
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Funciones específicas por entidad
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const servicesAPI = {
  getAll: (params?: any) => api.get('/services', { params }),
  getById: (id: string) => api.get(`/services/${id}`),
  create: (data: any) => api.post('/services', data),
  update: (id: string, data: any) => api.put(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
};
```

### 3.2 Backend Patterns

#### Controller Pattern
```javascript
// controllers/service.controller.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Obtener todos los servicios con filtros
 * @route GET /api/services
 * @access Public
 */
const getAllServices = async (req, res) => {
  try {
    const { category, city, status = 'APPROVED', page = 1, limit = 12 } = req.query;

    const where = {
      status,
      ...(category && { category }),
      ...(city && { city }),
    };

    const services = await prisma.service.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular rating promedio
    const servicesWithRating = services.map(service => ({
      ...service,
      averageRating: service.reviews.length > 0
        ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length
        : 0,
    }));

    res.json({
      services: servicesWithRating,
      total: await prisma.service.count({ where }),
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
};

module.exports = {
  getAllServices,
  // ... otros métodos
};
```

#### Middleware Pattern
```javascript
// middleware/auth.js

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware de autenticación JWT
 * Verifica token y agrega user a req
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

/**
 * Middleware de autorización por rol
 * Uso: requireRole('ADMIN', 'PUBLISHER')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'No tienes permisos para esta acción'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
};
```

#### Route Pattern
```javascript
// routes/service.routes.js

const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');
const serviceController = require('../controllers/service.controller');

// Rutas públicas
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Rutas protegidas (requieren autenticación)
router.post(
  '/',
  authenticateToken,
  requireRole('PUBLISHER', 'ADMIN'),
  [
    body('title').trim().isLength({ min: 10, max: 100 }),
    body('description').trim().isLength({ min: 50, max: 2000 }),
    body('price').isFloat({ min: 1000, max: 10000000 }),
    body('category').isIn(['MODELAJE', 'MASAJES_PROFESIONALES']),
    body('photos').isArray({ min: 1, max: 10 }),
  ],
  serviceController.createService
);

router.put(
  '/:id',
  authenticateToken,
  requireRole('PUBLISHER', 'ADMIN'),
  serviceController.updateService
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole('PUBLISHER', 'ADMIN'),
  serviceController.deleteService
);

module.exports = router;
```

---

## 4. ESQUEMA DE BASE DE DATOS

### 4.1 Diagrama ER

```
┌─────────────────┐          ┌─────────────────┐
│      Users      │          │    Services     │
├─────────────────┤          ├─────────────────┤
│ id (PK)         │◄────┐    │ id (PK)         │
│ email (unique)  │     │    │ userId (FK)     │
│ password        │     └────┤ category        │
│ name            │          │ title           │
│ phone           │      ┌───┤ description     │
│ avatar          │      │   │ price           │
│ bio             │      │   │ location        │
│ role            │      │   │ photos[]        │
│ isVerified      │      │   │ status          │
│ createdAt       │      │   │ views           │
│ updatedAt       │      │   │ createdAt       │
└─────────────────┘      │   └─────────────────┘
         │               │            │
         │               │            │
         │               │            ▼
         │               │   ┌─────────────────┐
         │               │   │     Reviews     │
         │               │   ├─────────────────┤
         │               │   │ id (PK)         │
         │               └───┤ serviceId (FK)  │
         └───────────────────┤ userId (FK)     │
                             │ rating          │
                             │ comment         │
                             │ response        │
                             │ createdAt       │
                             └─────────────────┘

┌─────────────────┐          ┌─────────────────┐
│      Posts      │          │   Favorites     │
├─────────────────┤          ├─────────────────┤
│ id (PK)         │          │ id (PK)         │
│ userId (FK)     │          │ userId (FK)     │
│ content         │          │ serviceId (FK)  │
│ photos[]        │          │ createdAt       │
│ type            │          └─────────────────┘
│ likes           │
│ createdAt       │          ┌─────────────────┐
└─────────────────┘          │  Notifications  │
                             ├─────────────────┤
                             │ id (PK)         │
                             │ userId (FK)     │
                             │ title           │
                             │ message         │
                             │ type            │
                             │ link            │
                             │ isRead          │
                             │ createdAt       │
                             └─────────────────┘
```

### 4.2 Prisma Schema

Ver archivo completo en: `backend/prisma/schema.prisma`

**Enums principales:**
```prisma
enum Role {
  USER        // Usuario regular
  PUBLISHER   // Proveedor de servicios
  ADMIN       // Administrador
}

enum Category {
  MODELAJE              // Servicios de modelaje
  MASAJES_PROFESIONALES // Masajes profesionales
}

enum ServiceStatus {
  PENDING   // Pendiente de aprobación
  APPROVED  // Aprobado y visible
  REJECTED  // Rechazado por admin
  ARCHIVED  // Archivado por publisher
}
```

---

## 5. FLUJO DE DATOS

### 5.1 Flujo de Autenticación

```
Usuario → Frontend (Login Form)
    ↓
Envía POST /api/auth/login { email, password }
    ↓
Backend → Controller auth.login()
    ↓
Busca usuario en BD (Prisma)
    ↓
Compara password con bcrypt
    ↓
Genera JWT token
    ↓
Retorna { user, token }
    ↓
Frontend → Guarda en localStorage
    ↓
Frontend → Actualiza Zustand store
    ↓
Redirige a home (autenticado)
    ↓
Siguientes requests incluyen header:
Authorization: Bearer <token>
```

### 5.2 Flujo de Creación de Servicio

```
Publisher → /services/new
    ↓
Completa formulario
    ↓
Submit → POST /api/services
    ↓
Backend → Middleware auth (verificar token)
    ↓
Backend → Middleware requireRole('PUBLISHER')
    ↓
Backend → Validar datos (express-validator)
    ↓
Backend → Controller createService()
    ↓
Prisma → service.create({
  data: {
    userId,
    category,
    title,
    description,
    price,
    photos,
    status: 'PENDING',
  }
})
    ↓
Retorna servicio creado
    ↓
Frontend → Muestra confirmación
    ↓
Publisher recibe mensaje de éxito
```

### 5.3 Flujo de Moderación

```
Admin → /admin
    ↓
GET /api/admin/services/pending
    ↓
Backend → Middleware auth
    ↓
Backend → Middleware requireRole('ADMIN')
    ↓
Backend → Prisma.service.findMany({ where: { status: 'PENDING' } })
    ↓
Retorna lista de servicios
    ↓
Admin ve servicios con fotos
    ↓
Admin click "Aprobar"
    ↓
PUT /api/admin/services/:id/approve
    ↓
Backend → Prisma.service.update({
  where: { id },
  data: { status: 'APPROVED' }
})
    ↓
Servicio ahora visible en home
```

---

## 6. MANEJO DE ESTADO

### 6.1 Estado Global (Zustand)

Usar para:
- Autenticación (user, token)
- Configuración de usuario
- Preferencias de UI

```typescript
// lib/auth.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 6.2 Estado de Servidor (SWR)

Usar para:
- Fetch de datos
- Cache automático
- Revalidación

```typescript
// En componente
import useSWR from 'swr';
import { servicesAPI } from '@/lib/api';

function ServicesList() {
  const { data, error, isLoading, mutate } = useSWR(
    '/services',
    () => servicesAPI.getAll({ status: 'APPROVED' }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {data?.data.services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
```

### 6.3 Estado Local (useState)

Usar para:
- Estado de formularios
- UI state (modals, dropdowns)
- Estados efímeros

---

## 7. OPTIMIZACIÓN Y PERFORMANCE

### 7.1 Frontend

**Lazy Loading:**
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false,
});
```

**Image Optimization:**
```tsx
import Image from 'next/image';

<Image
  src={photo}
  alt={title}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

**Memoization:**
```tsx
import { useMemo, useCallback } from 'react';

const expensiveValue = useMemo(() =>
  computeExpensive(data),
  [data]
);

const handleClick = useCallback(() => {
  // handle
}, [dependencies]);
```

### 7.2 Backend

**Database Indexing:**
```prisma
model Service {
  // ...
  @@index([category])
  @@index([status])
  @@index([userId])
}
```

**Query Optimization:**
```javascript
// Malo: N+1 queries
const services = await prisma.service.findMany();
for (const service of services) {
  const user = await prisma.user.findUnique({ where: { id: service.userId } });
}

// Bueno: 1 query con include
const services = await prisma.service.findMany({
  include: {
    user: true,
  },
});
```

---

## 8. TESTING

### 8.1 Frontend Testing

**Unit Tests (Jest + React Testing Library):**
```tsx
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 8.2 Backend Testing

**Integration Tests (Jest + Supertest):**
```javascript
const request = require('supertest');
const app = require('../src/index');

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });
});
```

---

## 9. DEPLOYMENT

### 9.1 Frontend (Vercel)

**Configuración:**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

**Variables de Entorno:**
```
NEXT_PUBLIC_API_URL=https://api.mipage.cl
NEXT_PUBLIC_SOCKET_URL=https://api.mipage.cl
```

### 9.2 Backend (Railway)

**Configuración:**
```json
// railway.json (si existe)
{
  "build": {
    "command": "npm install && npx prisma generate",
    "output": "dist"
  },
  "start": {
    "command": "npm start"
  }
}
```

**Variables de Entorno:**
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
FRONTEND_URL=https://mipage.vercel.app
NODE_ENV=production
```

---

## 10. CONVENCIONES DE CÓDIGO

### 10.1 Nomenclatura

**TypeScript/JavaScript:**
```
Variables: camelCase
Constantes: UPPER_SNAKE_CASE
Funciones: camelCase
Clases: PascalCase
Interfaces: PascalCase
Types: PascalCase
Enums: PascalCase
```

**Archivos:**
```
Componentes React: PascalCase.tsx
Páginas Next.js: page.tsx, layout.tsx
Utils: camelCase.ts
Hooks: useCamelCase.ts
Controllers: camelCase.controller.js
```

### 10.2 Comentarios

```typescript
/**
 * Descripción de la función
 * @param param1 - Descripción del parámetro
 * @param param2 - Descripción del parámetro
 * @returns Descripción del return
 * @throws Error cuando...
 */
function myFunction(param1: string, param2: number): ReturnType {
  // Implementación
}
```

### 10.3 Imports

```typescript
// 1. Imports externos (librerías)
import React from 'react';
import { useState } from 'react';
import Link from 'next/link';

// 2. Imports internos (paths absolutos)
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

// 3. Imports de tipos
import type { Service, User } from '@/types';

// 4. Imports de estilos
import './styles.css';
```

---

## 11. GIT WORKFLOW

### 11.1 Branch Strategy

```
main (producción)
  ├── develop (desarrollo)
  │   ├── feature/nombre-feature
  │   ├── fix/nombre-fix
  │   └── refactor/nombre-refactor
```

### 11.2 Commit Messages

```
Format: <type>: <description>

Types:
- feat: Nueva funcionalidad
- fix: Bug fix
- docs: Documentación
- style: Formato, estilos
- refactor: Refactorización
- test: Tests
- chore: Tareas de mantenimiento

Examples:
feat: agregar página de creación de servicios
fix: resolver error en formulario de login
docs: actualizar README con instrucciones de deploy
refactor: optimizar consultas de base de datos
```

---

**Fin del documento architecture.md**
**Consulta este archivo junto con PROMPT.md**
**Última actualización:** 2024-11-05
