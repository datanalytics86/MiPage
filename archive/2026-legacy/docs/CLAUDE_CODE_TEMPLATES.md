# 📋 Templates de Desarrollo - MiPage

Este archivo contiene templates obligatorios para mantener calidad y consistencia en el desarrollo.

---

## 🎯 **Template Simple - Tareas Individuales**

```markdown
═══════════════════════════════════════════════════════
🔍 FASE DE LECTURA OBLIGATORIA
═══════════════════════════════════════════════════════

Antes de escribir código, DEBES leer y analizar:

📖 Archivos de referencia:
- /PROMPT.md → Sección: [NÚMERO/NOMBRE DE SECCIÓN]
- /architecture.md → Sección: [NÚMERO/NOMBRE DE SECCIÓN]

📝 Tarea: Extrae y resume en 3-5 bullets:
- Requisitos funcionales clave
- Especificaciones de diseño (colores, tipografía, espaciado)
- Stack/librerías permitidas
- Convenciones de nomenclatura

═══════════════════════════════════════════════════════
💻 FASE DE IMPLEMENTACIÓN
═══════════════════════════════════════════════════════

Crea: [NOMBRE DEL ARCHIVO/COMPONENTE]
Ubicación: [PATH EXACTO según architecture.md]

Debe cumplir:
✅ [Requisito específico 1 del PROMPT.md]
✅ [Requisito específico 2 del PROMPT.md]
✅ [Requisito específico 3 del PROMPT.md]

Tecnologías permitidas:
- [Lista del PROMPT.md sección 2]

═══════════════════════════════════════════════════════
✓ FASE DE VALIDACIÓN
═══════════════════════════════════════════════════════

Al terminar, valida tu código contra este checklist:

**Diseño Visual**
- [ ] Paleta de colores: PROMPT.md sección 6.1
- [ ] Tipografía: Inter (tamaños según spec)
- [ ] Espaciado: Tailwind (p-4, m-6, etc.)
- [ ] Responsive: 375px, 768px, 1920px

**Arquitectura**
- [ ] Archivo en carpeta correcta (architecture.md)
- [ ] Imports organizados (externos → internos → tipos)
- [ ] Props tipadas con TypeScript strict
- [ ] Nomenclatura consistente

**Funcionalidad**
- [ ] Validaciones implementadas (PROMPT.md sección 8)
- [ ] Manejo de errores con try/catch
- [ ] Loading states presentes
- [ ] Accesibilidad básica (aria-labels, alt texts)

═══════════════════════════════════════════════════════
📊 FORMATO DE RESPUESTA OBLIGATORIO
═══════════════════════════════════════════════════════

📖 ARCHIVOS CONSULTADOS
- PROMPT.md → Secciones: [lista]
- architecture.md → Secciones: [lista]
- Otros: [si aplica]

🔑 PUNTOS CLAVE EXTRAÍDOS
- [Bullet 1]
- [Bullet 2]
- [Bullet 3]

💻 ARCHIVOS CREADOS/MODIFICADOS
src/
└── [path/archivo.ext]
    ├── Líneas: [número]
    ├── Props/Exports: [lista]
    └── Dependencias: [lista]

✅ VALIDACIÓN DE CUMPLIMIENTO
| Aspecto | Especificado en | Implementado | Estado |
|---------|-----------------|--------------|--------|
| Paleta de colores | PROMPT.md 6.1 | [valores] | ✅/❌ |
| Estructura carpetas | architecture.md | [path] | ✅/❌ |
| TypeScript strict | PROMPT.md 2 | Sí/No | ✅/❌ |
| Responsive | PROMPT.md 6 | Sí/No | ✅/❌ |

📝 DESVIACIONES (si las hay)
- Ninguna / [Explica por qué te desviaste con justificación]

🔄 CÓDIGO GENERADO
[Incluye el código completo aquí]

🧪 PRUEBA MANUAL RECOMENDADA
1. [Paso para probar funcionalidad]
2. [Paso para probar funcionalidad]

➡️ PRÓXIMO PASO SUGERIDO
[Qué deberíamos implementar después según el flujo del PROMPT.md]
```

---

## 🎯 **Template Complejo - Múltiples Archivos**

```markdown
═══════════════════════════════════════════════════════
🔍 FASE DE ANÁLISIS Y PLANIFICACIÓN
═══════════════════════════════════════════════════════

📖 LECTURA OBLIGATORIA:
Lee COMPLETAMENTE estos archivos antes de escribir código:
- /PROMPT.md → Secciones: [X, Y, Z]
- /architecture.md → Secciones: [A, B, C]
- [Otros archivos relevantes]

📋 TAREA GENERAL:
[Descripción de alto nivel de lo que se debe implementar]

🎯 OBJETIVOS ESPECÍFICOS:
1. [Objetivo 1 según PROMPT.md]
2. [Objetivo 2 según PROMPT.md]
3. [Objetivo 3 según PROMPT.md]

═══════════════════════════════════════════════════════
📐 FASE DE DISEÑO
═══════════════════════════════════════════════════════

Antes de codificar, responde:
1. ¿Qué archivos necesitas crear? (lista con paths completos)
2. ¿Cuál es la dependencia entre ellos? (orden de creación)
3. ¿Qué interfaces/tipos necesitas definir primero?
4. ¿Qué validaciones del PROMPT.md aplican aquí?

Presenta un PLAN DE IMPLEMENTACIÓN con orden de ejecución.

═══════════════════════════════════════════════════════
💻 FASE DE IMPLEMENTACIÓN ITERATIVA
═══════════════════════════════════════════════════════

Para CADA archivo que crees:
1. Anuncia: "Creando [nombre_archivo]"
2. Cita: "Basado en PROMPT.md sección [X] y architecture.md [Y]"
3. Implementa el código
4. Valida contra checklist (ver template simple)
5. Espera confirmación antes de continuar con el siguiente

⚠️ NO crees todos los archivos de una vez. Ve uno por uno.

═══════════════════════════════════════════════════════
✓ FASE DE VALIDACIÓN INTEGRAL
═══════════════════════════════════════════════════════

Después de crear todos los archivos, valida:

**Arquitectura**
- [ ] Todos los archivos en carpetas correctas
- [ ] Imports circulares: NO existen
- [ ] Estructura según architecture.md
- [ ] Separación de responsabilidades clara

**Integración**
- [ ] Componentes se integran correctamente
- [ ] Props pasan datos esperados
- [ ] Tipos compatibles en toda la cadena

**Testing mental**
- [ ] Flujo de usuario completo funciona
- [ ] Casos edge considerados
- [ ] Errores manejados en cada nivel

═══════════════════════════════════════════════════════
📊 REPORTE FINAL
═══════════════════════════════════════════════════════

🗂️ ARCHIVOS CREADOS (árbol completo)
src/
├── components/
│   ├── [archivo1.tsx]
│   └── [archivo2.tsx]
├── app/
│   └── [archivo3.tsx]
└── lib/
    └── [archivo4.ts]

📊 TABLA DE CUMPLIMIENTO
| Archivo | Especificación | Estado | Notas |
|---------|----------------|--------|-------|
| archivo1.tsx | PROMPT.md 6.2 | ✅ | - |
| archivo2.tsx | architecture.md 4.1 | ✅ | - |

🧪 PLAN DE PRUEBAS
1. [Acción 1] → Resultado esperado: [X]
2. [Acción 2] → Resultado esperado: [Y]
3. [Acción 3] → Resultado esperado: [Z]

📝 DOCUMENTACIÓN GENERADA
- [ ] Comentarios en código complejo
- [ ] JSDoc en funciones públicas
- [ ] README actualizado (si aplica)

⚠️ WARNINGS/CONSIDERACIONES
[Lista cualquier cosa que el desarrollador deba saber]

➡️ SIGUIENTE MILESTONE
[Según el roadmap del PROMPT.md, qué sigue]
```

---

## 🎯 **Template de Auditoría - Cada 3-4 Tareas**

```markdown
═══════════════════════════════════════════════════════
🔍 AUDITORÍA DE CUMPLIMIENTO - CHECKPOINT
═══════════════════════════════════════════════════════

⏸️ PAUSA EN EL DESARROLLO.
Vamos a verificar que TODO lo creado hasta ahora cumple con las specs.

═══════════════════════════════════════════════════════
📋 FASE 1: INVENTARIO
═══════════════════════════════════════════════════════

Lista TODOS los archivos creados desde el inicio del proyecto:

[Árbol completo de la estructura actual del proyecto]

═══════════════════════════════════════════════════════
🔎 FASE 2: VALIDACIÓN CONTRA PROMPT.md
═══════════════════════════════════════════════════════

Revisa CADA archivo contra el PROMPT.md:

**Sección 4: Estructura de carpetas**
- [ ] Todos los archivos en las carpetas correctas
- [ ] No hay archivos en ubicaciones no especificadas
- [ ] Nomenclatura consistente

**Sección 6: Diseño UI/UX**
- [ ] Paleta de colores correcta
- [ ] Tipografía consistente
- [ ] Espaciado Tailwind uniforme
- [ ] Responsive: 375px, 768px, 1920px

**Sección 8: Seguridad y Validaciones**
- [ ] Validación de inputs implementada
- [ ] Rate limiting presente
- [ ] Sanitización de datos

Lista CUALQUIER desviación encontrada.

═══════════════════════════════════════════════════════
🔎 FASE 3: VALIDACIÓN CONTRA architecture.md
═══════════════════════════════════════════════════════

Verifica cumplimiento con architecture.md:
- [ ] Estructura de imports consistente
- [ ] Componentes siguen patrón establecido
- [ ] Separación de lógica (lib/, components/, pages/)
- [ ] Props tipadas correctamente

═══════════════════════════════════════════════════════
📊 REPORTE DE AUDITORÍA
═══════════════════════════════════════════════════════

✅ CUMPLIMIENTOS (lista de cosas bien hechas)
- [Item 1]
- [Item 2]

⚠️ DESVIACIONES MENORES (funcionan pero no son exactas)
| Archivo | Problema | Spec Original | Implementado | Impacto |
|---------|----------|---------------|--------------|---------|
| [file] | [issue] | [spec] | [actual] | Bajo/Med|

❌ ERRORES CRÍTICOS (rompen la spec)
| Archivo | Error | Spec Violada | Acción Requerida |
|---------|-------|--------------|------------------|
| [file] | [err] | [section] | [fix needed] |

🔧 PLAN DE CORRECCIÓN
Si hay desviaciones/errores:
1. [Acción correctiva 1]
2. [Acción correctiva 2]
3. [Acción correctiva 3]

Prioridad: [Alta/Media/Baja]

═══════════════════════════════════════════════════════
✅ APROBACIÓN PARA CONTINUAR
═══════════════════════════════════════════════════════

- [ ] Auditoría completada
- [ ] Todas las desviaciones documentadas
- [ ] Plan de corrección aprobado
- [ ] Listo para continuar con siguiente fase
```

---

## 🎯 **Template de Corrección**

```markdown
═══════════════════════════════════════════════════════
🔧 CORRECCIÓN DE DESVIACIÓN
═══════════════════════════════════════════════════════

📍 ARCHIVO PROBLEMÁTICO: [path/al/archivo.ext]

❌ PROBLEMA DETECTADO:
[Descripción clara del problema]

📖 ESPECIFICACIÓN ORIGINAL:
Según [PROMPT.md/architecture.md] sección [X]:
"[Cita textual de la especificación]"

💡 IMPLEMENTACIÓN ACTUAL:
[Describe cómo está implementado actualmente]

═══════════════════════════════════════════════════════
🔍 ANÁLISIS DE LA DESVIACIÓN
═══════════════════════════════════════════════════════

¿Por qué sucedió?
- [Razón 1]
- [Razón 2]

¿Cuál es el impacto?
- Funcional: [Alto/Medio/Bajo]
- Visual: [Alto/Medio/Bajo]
- Performance: [Alto/Medio/Bajo]

═══════════════════════════════════════════════════════
✅ PLAN DE CORRECCIÓN
═══════════════════════════════════════════════════════

Pasos para corregir:
1. [Acción 1]
2. [Acción 2]
3. [Acción 3]

Archivos afectados:
- [archivo1.ext] → [tipo de cambio]
- [archivo2.ext] → [tipo de cambio]

═══════════════════════════════════════════════════════
💻 IMPLEMENTACIÓN DE LA CORRECCIÓN
═══════════════════════════════════════════════════════

[Implementa la corrección aquí]

═══════════════════════════════════════════════════════
✓ VALIDACIÓN POST-CORRECCIÓN
═══════════════════════════════════════════════════════

- [ ] Corrección implementada
- [ ] Cumple 100% con spec original
- [ ] No rompe otras funcionalidades
- [ ] Testing manual realizado
- [ ] Commit con mensaje descriptivo

Mensaje del commit sugerido:
"fix: [descripción] - cumple PROMPT.md sección [X]"
```

---

## 📚 **Guía de Uso**

### ¿Cuándo usar cada template?

| Situación | Template a Usar |
|-----------|----------------|
| Crear/modificar 1 archivo | Template Simple |
| Feature con 3+ archivos | Template Complejo |
| Cada 3-4 tareas completadas | Template Auditoría |
| Detectar desviación/error | Template Corrección |

### Workflow Recomendado:

```
1. Nueva tarea → Usar Template Simple/Complejo
2. Implementar código
3. Validar contra checklist
4. Commit
5. Cada 3 tareas → Auditoría
6. Si hay errores → Template Corrección
7. Repetir
```

### Ejemplos de Uso:

#### Ejemplo 1: Crear componente simple
```markdown
Usa: Template Simple
Referencia: PROMPT.md sección 6.2, architecture.md sección 4
Validar: Colores, tipografía, responsive
```

#### Ejemplo 2: Implementar feature completa
```markdown
Usa: Template Complejo
Plan: 1. Tipos, 2. Hook, 3. Componente, 4. Página
Validar: Integración completa
```

#### Ejemplo 3: Checkpoint semanal
```markdown
Usa: Template Auditoría
Revisar: Todos los archivos de la semana
Documentar: Desviaciones y plan de corrección
```

---

## 🎯 **Checklist de Calidad Universal**

Usa este checklist en TODOS los templates:

### Código
- [ ] TypeScript sin errores
- [ ] ESLint sin warnings
- [ ] Imports organizados
- [ ] Sin console.logs
- [ ] Comentarios en lógica compleja

### UI/UX
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Estados de loading
- [ ] Estados de error
- [ ] Accesibilidad básica
- [ ] Animaciones suaves

### Seguridad
- [ ] Inputs validados
- [ ] Datos sanitizados
- [ ] Permisos verificados
- [ ] CSRF protection
- [ ] SQL injection prevention

### Performance
- [ ] Lazy loading donde aplica
- [ ] Imágenes optimizadas
- [ ] Bundle size razonable
- [ ] No re-renders innecesarios
- [ ] Memoización apropiada

---

## 📝 **Notas Finales**

- **SIEMPRE consulta PROMPT.md y architecture.md antes de codificar**
- **NUNCA asumas especificaciones**
- **DOCUMENTA desviaciones con justificación**
- **VALIDA cada archivo contra el checklist**
- **HAZ auditorías periódicas**

---

**Última actualización:** 2024-11-05
**Mantenido por:** Equipo de Desarrollo MiPage
