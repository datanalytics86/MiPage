# 🧪 Guía de Testing - MiPage

## Estrategia de Testing

### Pirámide de Testing

```
        /\
       /E2E\         (10%) - End-to-End
      /------\
     /Integration\   (20%) - Integración
    /------------\
   /  Unit Tests  \  (70%) - Unitarios
  /----------------\
```

## 1. Tests Unitarios (Jest)

### Backend

**Ubicación:** `backend/__tests__/`

**Setup:**

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
  ],
  testMatch: ['**/__tests__/**/*.test.js'],
};
```

**Ejemplo - Controller:**

```javascript
// __tests__/auth.test.js
const request = require('supertest');
const { app } = require('../src/server');

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
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
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('debe fallar con email duplicado', async () => {
      // Crear usuario primero
      await createUser({ email: 'test@example.com' });

      // Intentar duplicar
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(409);
    });
  });
});
```

**Ejemplo - Service:**

```javascript
// __tests__/services.test.js
describe('Service Functions', () => {
  let serviceId;

  beforeAll(async () => {
    // Setup
    await cleanDatabase();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  it('debe crear un servicio', async () => {
    const service = await createService({
      title: 'Test Service',
      category: 'MODELAJE',
      price: 50000,
    });

    expect(service).toHaveProperty('id');
    expect(service.title).toBe('Test Service');

    serviceId = service.id;
  });

  it('debe obtener servicio por ID', async () => {
    const service = await getServiceById(serviceId);

    expect(service.id).toBe(serviceId);
    expect(service.title).toBe('Test Service');
  });
});
```

### Frontend

**Setup:**

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
```

**Ejemplo - Component:**

```typescript
// __tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/Button';

describe('Button Component', () => {
  it('debe renderizar correctamente', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('debe llamar onClick cuando se clickea', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('debe estar disabled cuando isLoading es true', () => {
    render(<Button isLoading>Click me</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('debe aplicar la variante correcta', () => {
    const { container } = render(
      <Button variant="danger">Delete</Button>
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-red-600');
  });
});
```

**Ejemplo - Hook:**

```typescript
// __tests__/useDebounce.test.ts
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  jest.useFakeTimers();

  it('debe debounce el valor', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // Cambiar valor
    rerender({ value: 'updated' });

    // Todavía debe ser el valor anterior
    expect(result.current).toBe('initial');

    // Avanzar timers
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Ahora debe ser el nuevo valor
    expect(result.current).toBe('updated');
  });
});
```

## 2. Tests de Integración

**Ejemplo - API Flow:**

```javascript
// __tests__/service-flow.test.js
describe('Service Creation Flow', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // 1. Registrar usuario
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'publisher@test.com',
        password: 'password123',
        name: 'Publisher',
        role: 'PUBLISHER',
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  it('debe crear, obtener y actualizar un servicio', async () => {
    // 2. Crear servicio
    const createResponse = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        category: 'MODELAJE',
        title: 'Test Service',
        description: 'Description',
        price: 50000,
        location: 'Santiago',
        city: 'Santiago',
      })
      .expect(201);

    const serviceId = createResponse.body.service.id;

    // 3. Obtener servicio
    const getResponse = await request(app)
      .get(`/api/services/${serviceId}`)
      .expect(200);

    expect(getResponse.body.title).toBe('Test Service');

    // 4. Actualizar servicio
    await request(app)
      .put(`/api/services/${serviceId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        price: 60000,
      })
      .expect(200);

    // 5. Verificar actualización
    const updatedService = await request(app)
      .get(`/api/services/${serviceId}`)
      .expect(200);

    expect(updatedService.body.price).toBe(60000);
  });
});
```

## 3. Tests E2E (Cypress - Opcional)

**Setup:**

```bash
npm install -D cypress
```

```javascript
// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false,
  },
};
```

**Ejemplo:**

```javascript
// cypress/e2e/service-search.cy.js
describe('Service Search', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('debe buscar servicios por categoría', () => {
    // Seleccionar categoría
    cy.get('select').select('MODELAJE');

    // Click en buscar
    cy.get('button').contains('Buscar').click();

    // Verificar resultados
    cy.get('[data-testid="service-card"]').should('have.length.greaterThan', 0);
    cy.contains('Modelaje').should('be.visible');
  });

  it('debe abrir detalle de servicio', () => {
    // Click en primer servicio
    cy.get('[data-testid="service-card"]').first().click();

    // Verificar que estamos en detalle
    cy.url().should('include', '/services/');
    cy.get('h1').should('be.visible');
    cy.get('[data-testid="service-description"]').should('be.visible');
  });
});
```

## 4. Mocking

### Mock de API

```typescript
// __tests__/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/services', (req, res, ctx) => {
    return res(
      ctx.json({
        services: [
          {
            id: '1',
            title: 'Mock Service',
            price: 50000,
          },
        ],
      })
    );
  }),
];
```

```typescript
// __tests__/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Mock de Prisma

```javascript
// __tests__/mocks/prisma.js
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  service: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

module.exports = { prisma: mockPrisma };
```

## 5. Coverage

**Ejecutar con coverage:**

```bash
# Backend
cd backend
npm run test:coverage

# Frontend
cd frontend
npm run test:coverage
```

**Target de coverage:**

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

**Reporte:**

```bash
# Abrir reporte HTML
open coverage/lcov-report/index.html
```

## 6. Comandos Útiles

```bash
# Backend
cd backend
npm test                    # Todos los tests
npm run test:watch          # Watch mode
npm run test:coverage       # Con coverage
npm test -- auth.test.js    # Test específico
npm test -- --verbose       # Verbose

# Frontend
cd frontend
npm test                    # Todos los tests
npm run test:watch          # Watch mode
npm run test:coverage       # Con coverage
npm test Button             # Tests que contengan "Button"

# E2E (Cypress)
npx cypress open            # UI
npx cypress run             # Headless
```

## 7. Best Practices

### ✅ DO

```javascript
// Nombres descriptivos
it('debe retornar 404 cuando el servicio no existe', () => {
  // ...
});

// Arrange, Act, Assert
it('debe crear un servicio', async () => {
  // Arrange
  const serviceData = { title: 'Test' };

  // Act
  const service = await createService(serviceData);

  // Assert
  expect(service.title).toBe('Test');
});

// Mock solo lo necesario
jest.mock('@/lib/api', () => ({
  servicesAPI: {
    getAll: jest.fn(),
  },
}));

// Cleanup después de cada test
afterEach(() => {
  jest.clearAllMocks();
});
```

### ❌ DON'T

```javascript
// Nombres vagos
it('test 1', () => { /* ... */ });

// Tests frágiles
expect(response.body).toMatchSnapshot(); // Evitar snapshots

// Demasiados mocks
jest.mock('todo-el-modulo'); // Mock solo lo necesario

// Tests dependientes
it('test que depende del test anterior', () => {
  // Cada test debe ser independiente
});
```

## 8. CI/CD Integration

**GitHub Actions:**

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## 9. Debugging Tests

```bash
# Node inspect
node --inspect-brk node_modules/.bin/jest

# Chrome DevTools
chrome://inspect

# VS Code
# Agregar en .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
}
```

## 10. Performance Testing

```javascript
// __tests__/performance.test.js
describe('Performance', () => {
  it('debe cargar servicios en menos de 200ms', async () => {
    const start = Date.now();

    await request(app).get('/api/services');

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(200);
  });
});
```

## Checklist de Testing

Antes de merge:

- [ ] Tests unitarios para nueva funcionalidad
- [ ] Tests pasan localmente
- [ ] Coverage >80%
- [ ] Tests de integración para flows críticos
- [ ] CI/CD pasa
- [ ] Sin tests skipped (`it.skip`)
- [ ] Sin console.log en tests

---

**Testing is not optional** ✅
