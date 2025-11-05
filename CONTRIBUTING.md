# 🤝 Guía de Contribución - MiPage

Gracias por tu interés en contribuir a MiPage. Esta guía te ayudará a empezar.

---

## 🚀 Inicio Rápido

1. **Fork el repositorio**
2. **Clona tu fork:**
   ```bash
   git clone https://github.com/tu-usuario/MiPage.git
   cd MiPage
   ```
3. **Crea una rama:**
   ```bash
   git checkout -b feature/mi-nueva-feature
   ```
4. **Haz tus cambios**
5. **Commit y push:**
   ```bash
   git add .
   git commit -m "Agregar nueva feature"
   git push origin feature/mi-nueva-feature
   ```
6. **Abre un Pull Request**

---

## 📋 Reglas de Contribución

### Commits

Usa commits descriptivos siguiendo Conventional Commits:

```
feat: agregar búsqueda por precio
fix: corregir error en login
docs: actualizar README
style: formatear código con Prettier
refactor: reorganizar componentes
test: agregar tests para servicios
chore: actualizar dependencias
```

### Code Style

- **ESLint:** Seguir reglas definidas
- **Prettier:** Formatear antes de commit
- **TypeScript:** Usar tipos estrictos
- **Naming:**
  - Components: `PascalCase`
  - Functions: `camelCase`
  - Files: `kebab-case` o `PascalCase` (componentes)

### Pull Requests

**Antes de abrir un PR:**

- [ ] Tests pasan (`npm test`)
- [ ] Linter sin errores (`npm run lint`)
- [ ] Build exitoso (`npm run build`)
- [ ] Documentación actualizada
- [ ] Changelog actualizado (si aplica)

**Template del PR:**

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

## Testing
- [ ] Tests agregados/actualizados
- [ ] Tests pasan localmente

## Checklist
- [ ] Code review hecho
- [ ] Documentación actualizada
- [ ] Sin console.logs
```

---

## 🧪 Testing

**Ejecutar tests:**

```bash
# Backend
cd backend
npm test
npm run test:coverage

# Frontend
cd frontend
npm test
```

**Agregar nuevos tests:**

```javascript
// backend/__tests__/mi-feature.test.js
describe('Mi Feature', () => {
  it('debe hacer algo', async () => {
    // Test aquí
    expect(resultado).toBe(esperado);
  });
});
```

**Coverage mínimo:** 80%

---

## 🎨 Componentes UI

Al agregar nuevos componentes:

1. **Crear en:** `frontend/src/components/ui/`
2. **Incluir:**
   - Props con TypeScript
   - Variantes configurables
   - Accesibilidad (ARIA)
   - Documentación JSDoc

**Ejemplo:**

```tsx
import { forwardRef } from 'react';

interface MyComponentProps {
  /** Descripción de la prop */
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

/**
 * Componente de ejemplo
 * @example
 * <MyComponent variant="primary">Hola</MyComponent>
 */
const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  ({ variant = 'primary', children }, ref) => {
    return (
      <div ref={ref} className={...}>
        {children}
      </div>
    );
  }
);

export default MyComponent;
```

---

## 📚 Documentación

**Actualizar docs cuando:**
- Agregas nuevas features
- Cambias API endpoints
- Modificas configuración
- Agregas dependencias

**Ubicación:**
- API: `docs/API.md`
- Componentes: JSDoc en el código
- Guías: `docs/*.md`

---

## 🐛 Reportar Bugs

**Template de Issue:**

```markdown
**Descripción del bug:**
Descripción clara y concisa

**Pasos para reproducir:**
1. Ir a '...'
2. Click en '...'
3. Ver error

**Comportamiento esperado:**
Qué debería pasar

**Screenshots:**
Si aplica

**Entorno:**
- OS: [ej. macOS]
- Browser: [ej. Chrome 120]
- Version: [ej. 1.0.0]
```

---

## 💡 Sugerir Features

**Template:**

```markdown
**Feature sugerida:**
Descripción clara

**Problema que resuelve:**
Por qué es útil

**Alternativas consideradas:**
Otras opciones

**Contexto adicional:**
Screenshots, ejemplos, etc.
```

---

## 📊 Áreas de Contribución

### 🎯 Alta Prioridad
- [ ] Tests para todos los endpoints
- [ ] Tests E2E con Cypress
- [ ] Integración con pasarela de pagos
- [ ] Chat en tiempo real
- [ ] Notificaciones push

### 🎨 UI/UX
- [ ] Modo oscuro
- [ ] Más componentes UI
- [ ] Animaciones
- [ ] Mejoras de accesibilidad

### 🔧 Backend
- [ ] Más endpoints API
- [ ] Optimizaciones de DB
- [ ] Cache con Redis
- [ ] Background jobs

### 📱 Frontend
- [ ] Progressive Web App mejorado
- [ ] Offline mode
- [ ] Service Workers
- [ ] Image lazy loading mejorado

### 📚 Documentación
- [ ] Video tutorials
- [ ] Más ejemplos
- [ ] Traducción a inglés
- [ ] API examples

---

## 🏆 Reconocimientos

Los contribuidores serán:
- Listados en `CONTRIBUTORS.md`
- Mencionados en releases
- Reconocidos en la documentación

---

## ❓ Preguntas

- **General:** Abre un Issue
- **Seguridad:** Email privado (no crear issue público)
- **Discusión:** GitHub Discussions

---

## 📜 Código de Conducta

### Nuestra Promesa

Nos comprometemos a hacer de la participación en este proyecto una experiencia libre de acoso para todos.

### Comportamiento Esperado

- ✅ Ser respetuoso
- ✅ Aceptar críticas constructivas
- ✅ Enfocarse en lo mejor para la comunidad
- ✅ Mostrar empatía

### Comportamiento Inaceptable

- ❌ Lenguaje ofensivo
- ❌ Trolling o comentarios insultantes
- ❌ Acoso público o privado
- ❌ Publicar información privada

---

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la misma licencia del proyecto (MIT).

---

**¡Gracias por contribuir a MiPage!** 🎉

Si tienes dudas, no dudes en preguntar en los Issues.
