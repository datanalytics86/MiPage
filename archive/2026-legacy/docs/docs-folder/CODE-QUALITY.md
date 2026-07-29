# 📐 Guía de Calidad de Código - MiPage

## Estándares Implementados

### ✅ Componentes UI Profesionales

**Ubicación:** `frontend/src/components/ui/`

Todos los componentes UI siguen estos principios:

1. **TypeScript estricto** - Tipos definidos para todas las props
2. **Accesibilidad (a11y)** - ARIA labels, roles, navegación por teclado
3. **Responsive** - Mobile-first con Tailwind CSS
4. **Reutilizables** - Props configurables y extensibles
5. **Documentados** - JSDoc comments

**Componentes disponibles:**
- `Button` - Botones con variantes y estados de carga
- `Input` - Inputs con validación y mensajes de error
- `Modal` - Diálogos accesibles con Headless UI
- `Card` - Tarjetas con sub-componentes
- `Badge` - Etiquetas con variantes de color
- `Spinner` - Loading indicators
- `Skeleton` - Loading placeholders

**Ejemplo de uso:**

```tsx
import Button from '@/components/ui/Button';

<Button
  variant="primary"
  size="md"
  isLoading={isSubmitting}
  onClick={handleSubmit}
>
  Enviar
</Button>
```

### 🎣 Hooks Personalizados

**Ubicación:** `frontend/src/hooks/`

#### useDebounce
Debounce de valores para búsquedas y filtros

```typescript
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  // Se ejecuta 500ms después del último cambio
  fetchResults(debouncedSearch);
}, [debouncedSearch]);
```

#### useLocalStorage
Sincronización de estado con localStorage

```typescript
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

#### useInfiniteScroll
Infinite scroll para listados

```typescript
const lastElementRef = useInfiniteScroll({
  loading,
  hasMore,
  onLoadMore: fetchMoreServices,
});

<div ref={lastElementRef}>Último elemento</div>
```

#### useMediaQuery
Media queries responsive

```typescript
const isMobile = useIsMobile();
const isDesktop = useIsDesktop();
```

### 🛡️ Validaciones Robustas

**Ubicación:** `frontend/src/lib/validations.ts`

Sistema completo de validaciones:

```typescript
import { validate, validationRules } from '@/lib/validations';

const result = validate(email, [
  validationRules.required(),
  validationRules.email(),
]);

if (!result.isValid) {
  console.log(result.errors); // ["Email inválido"]
}
```

**Validadores incluidos:**
- ✅ Email
- ✅ Teléfono chileno
- ✅ RUT chileno
- ✅ Contraseña segura
- ✅ URL
- ✅ Longitud mínima/máxima
- ✅ Patrones personalizados

**Sanitizadores:**
```typescript
import { sanitize, format } from '@/lib/validations';

const clean = sanitize.html(userInput);
const formattedRut = format.rut('123456789');
const formattedPhone = format.phone('+56912345678');
```

### 🚨 Error Boundaries

**Ubicación:** `frontend/src/components/ErrorBoundary.tsx`

Captura errores de React y muestra UI de fallback:

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

Características:
- ✅ UI de error amigable
- ✅ Botón "Intentar de nuevo"
- ✅ Detalles de error en development
- ✅ Logging automático de errores

### 📊 Sistema de Logging

**Ubicación:** `backend/src/utils/logger.js`

Logger profesional con niveles:

```javascript
const { createLogger } = require('./utils/logger');
const logger = createLogger('AuthController');

logger.info('Usuario registrado', { userId: user.id });
logger.warn('Intento de login fallido', { email });
logger.error('Error en base de datos', { error: err.message });
logger.debug('Query ejecutado', { query, duration });
```

**Niveles:**
- `ERROR` - Errores críticos
- `WARN` - Advertencias
- `INFO` - Información general
- `DEBUG` - Debug detallado

**Features:**
- ✅ Colores en development
- ✅ JSON estructurado en production
- ✅ Contextos separados por módulo
- ✅ Timing de requests HTTP
- ✅ Timing de queries DB
- ✅ Listo para Sentry/CloudWatch

### 🧪 Testing

**Ubicación:** `backend/__tests__/`

Tests unitarios con Jest:

```javascript
describe('Auth API', () => {
  it('debe registrar un nuevo usuario', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      })
      .expect(201);

    expect(response.body).toHaveProperty('token');
  });
});
```

**Ejecutar tests:**
```bash
cd backend
npm test                # Todos los tests
npm run test:watch      # Watch mode
npm run test:coverage   # Con coverage
```

**Coverage target:** >80%

### ♿ Accesibilidad (a11y)

Todos los componentes cumplen con WCAG 2.1 AA:

**Principios implementados:**

1. **Navegación por teclado**
   ```tsx
   <Button onKeyDown={handleKeyDown} aria-label="Cerrar">
     ×
   </Button>
   ```

2. **ARIA attributes**
   ```tsx
   <Input
     aria-invalid={error ? 'true' : 'false'}
     aria-describedby="error-message"
   />
   ```

3. **Focus management**
   ```tsx
   <Modal>
     {/* Focus trap automático con Headless UI */}
   </Modal>
   ```

4. **Contraste de colores**
   - Todos los colores cumplen con ratio 4.5:1 mínimo
   - Probado con herramientas de contraste

5. **Textos alternativos**
   ```tsx
   <Image src={photo} alt={service.title} />
   ```

6. **Screen reader support**
   ```tsx
   <span className="sr-only">Cargando...</span>
   ```

### ⚡ Performance

**Optimizaciones implementadas:**

1. **Image Optimization** (Next.js)
   ```tsx
   <Image
     src={photo}
     alt={title}
     sizes="(max-width: 640px) 100vw, 50vw"
     loading="lazy"
   />
   ```

2. **Code Splitting**
   ```typescript
   const Modal = dynamic(() => import('@/components/ui/Modal'));
   ```

3. **Memoization**
   ```typescript
   const expensiveValue = useMemo(() => {
     return computeExpensiveValue(data);
   }, [data]);
   ```

4. **Debouncing**
   ```typescript
   const debouncedSearch = useDebounce(search, 500);
   ```

5. **Infinite Scroll** (vs pagination)
   - Mejor UX
   - Menor carga inicial

6. **SWR Caching**
   ```typescript
   const { data } = useSWR('/api/services', fetcher, {
     revalidateOnFocus: false,
     dedupingInterval: 60000,
   });
   ```

### 🔒 Seguridad

**Capas de seguridad implementadas:**

1. **Input Validation**
   - Backend: express-validator
   - Frontend: custom validations

2. **Sanitization**
   ```typescript
   const clean = sanitize.html(userInput);
   ```

3. **SQL Injection Prevention**
   - Prisma ORM (prepared statements)

4. **XSS Prevention**
   - React escape por defecto
   - Sanitización adicional

5. **CSRF Protection**
   - Tokens JWT
   - SameSite cookies

6. **Rate Limiting**
   ```javascript
   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 5,
   });
   ```

7. **Password Security**
   - Bcrypt con salt rounds: 10
   - Validación de contraseña fuerte

8. **Headers de Seguridad** (Helmet.js)
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection
   - HSTS

### 📝 Documentación

**JSDoc Comments:**

```typescript
/**
 * Hook para debounce de valores
 * Útil para búsquedas y filtros
 *
 * @param value - Valor a debounce
 * @param delay - Delay en ms (default: 500)
 * @returns Valor debounced
 *
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 500);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  // ...
}
```

**README files:**
- `/README.md` - Documentación general
- `/backend/README.md` - Backend específico
- `/frontend/README.md` - Frontend específico
- `/docs/` - Guías detalladas

### 🎨 Código Limpio

**Principios aplicados:**

1. **Single Responsibility**
   - Cada función hace una cosa
   - Componentes pequeños y enfocados

2. **DRY (Don't Repeat Yourself)**
   - Utilidades compartidas en `/lib`
   - Componentes reutilizables en `/components/ui`

3. **Naming Conventions**
   - Variables: camelCase
   - Componentes: PascalCase
   - Constantes: UPPER_SNAKE_CASE
   - Archivos: kebab-case o PascalCase

4. **File Organization**
   ```
   components/
   ├── ui/           # Componentes reutilizables
   ├── services/     # Específicos de servicios
   └── layout/       # Layout components
   ```

5. **Import Order**
   ```typescript
   // 1. React/Next
   import { useState } from 'react';
   import Image from 'next/image';

   // 2. External libs
   import { cn } from 'clsx';

   // 3. Internal
   import Button from '@/components/ui/Button';
   import { api } from '@/lib/api';

   // 4. Types
   import type { User } from '@/types';
   ```

### 🔍 Linting y Formatting

**ESLint:**
```bash
npm run lint        # Check
npm run lint:fix    # Fix automático
```

**Prettier:**
```bash
npm run format      # Format code
```

**Pre-commit hooks** (opcional):
```bash
npm install -D husky lint-staged

# .husky/pre-commit
npm run lint
npm run format
npm test
```

### 📊 Métricas de Calidad

**Objetivos:**
- ✅ Test Coverage: >80%
- ✅ Lighthouse Score: >90
- ✅ Bundle Size: <200KB (initial)
- ✅ First Contentful Paint: <1.5s
- ✅ Time to Interactive: <3.5s
- ✅ Accessibility Score: 100

**Medir:**
```bash
# Lighthouse
npm run lighthouse

# Bundle size
npm run build -- --analyze

# Tests coverage
npm run test:coverage
```

### 🚀 CI/CD Quality Gates

**GitHub Actions** (`.github/workflows/ci-cd.yml`):

```yaml
- Linting (ESLint)
- Type checking (TypeScript)
- Tests unitarios (Jest)
- Build check
- Deploy automático (solo si todo pasa)
```

### 📚 Recursos Adicionales

**Documentación:**
- [Component API](./COMPONENTS.md)
- [Hooks API](./HOOKS.md)
- [Validation Guide](./VALIDATIONS.md)
- [Testing Guide](./TESTING.md)

**Tools:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Checklist de Calidad

Antes de hacer merge:

- [ ] Tests pasan
- [ ] Coverage >80%
- [ ] Linter sin errores
- [ ] TypeScript sin errores
- [ ] Componentes accesibles
- [ ] Performance optimizada
- [ ] Documentación actualizada
- [ ] Code review aprobado

---

**Mantener la calidad es responsabilidad de todos** 🚀
