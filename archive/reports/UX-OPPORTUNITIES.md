# UX-OPPORTUNITIES — MiPage

**Fecha:** 2026-07-29  
**Branch:** `main`  
**Alcance:** Grupo B · 4 agentes UX  

Tono objetivo: **luxury calmado** — claro, corto, sin hype vacío.

---

## Matriz impacto × esfuerzo

| # | Oportunidad | Impacto | Esfuerzo | Prioridad |
|---|-------------|---------|----------|-----------|
| 1 | Empty explorar accionable + tip ciudad | Alto | Bajo | **Quick win** ✅ |
| 2 | Wizard step hints (3 pasos) | Alto | Bajo | **Quick win** ✅ |
| 3 | Registro provider: checklist “qué sigue” | Alto | Bajo | **Quick win** ✅ |
| 4 | Admin “cola del día” CTA | Alto | Bajo | **Quick win** ✅ (Grupo C) |
| 5 | Preview fotos ordenable drag-drop en wizard | Medio | Medio | Medio plazo |
| 6 | Onboarding tour 3 pasos (spotlight) | Medio | Medio | Medio plazo |
| 7 | Favoritos empty premium | Medio | Bajo | **Quick win** ✅ |
| 8 | Contacto WhatsApp prefill desde perfil | Alto | Bajo | **Quick win** ✅ (`lib/whatsapp.ts`) |
| 9 | Filtros explorar como chips mobile | Medio | Bajo | **Quick win** ✅ |
| 10 | Hint PENDING en dashboard publisher | Alto | Bajo | **Quick win** ✅ |
| 11 | i18n ES formal / informal | Bajo | Alto | Backlog |

---

## Quick wins implementados (esta entrega)

### 1. Explorar vacío

**Antes:** “No se encontraron resultados…” genérico.  
**Ahora:** “Nadie por aquí todavía” + tip Santiago/Viña + CTA limpiar filtros + invitación a publicar.

### 2. Wizard publisher

Hints por paso:

1. Nombre real + fotos se moderan  
2. Mínimo 3 fotos nítidas  
3. Precio + PENDING al enviar  

### 3. Post-registro provider

Checklist numerada:

1. Confirmar correo  
2. Login → dashboard  
3. Wizard **Publicar aviso**  
4. Esperar revisión  

Botón secundario “Ir al wizard de aviso”.

### 4. Microcopy admin (con C)

Banner “Cola del día” con copy accionable y deep-link a pendientes.

### 5. Chips de filtros mobile (explorar)

Categoría + verificados + ciudad como chips táctiles (`aria-pressed`), selects en desktop.

### 6. PENDING = paso normal (dashboard)

Tarjeta gold: badge PENDING, explicación calmada, CTAs “Mejorar aviso” / “Subir fotos”.

### 7. Rechazo empático (admin)

Motivos predefinidos que indican **qué corregir** (no punitivos).

---

## Mejoras de medio plazo (no implementadas)

| Mejora | Notas |
|--------|-------|
| Drag-and-drop reorder fotos en wizard | Ya hay reorden en galería dashboard |
| Tour first-run | localStorage `onboarding_v1` |
| Prefill WhatsApp con UTM/source MiPage | `wa.me/?text=` ya parcial en perfil |
| Skeletons consistentes en dashboard home | Usar `ProviderGridSkeleton` |

---

## Ejemplos de microcopy (antes → después)

| Contexto | Antes | Después |
|----------|-------|---------|
| Empty explorar | No se encontraron resultados | Nadie por aquí todavía |
| Empty explorar body | Intenta ajustar filtros… | Prueba otra ciudad… Si eres profesional, publica tu aviso… |
| Registro OK (provider) | Perfil pendiente de aprobación (párrafo) | Siguiente: publica tu aviso (pasos 1–4) |
| Toast favorito | (genérico) | Mantener: “Agregado a favoritos” / “Inicia sesión…” |
| Wizard step 2 error | Sube al menos 3 fotos | Igual + hint de calidad en header del step |
| Admin empty cola | Sin proveedores aún | Cola limpia — sin pendientes críticos (`summarizeAdminDay`) |

---

## Principios UX aplicados

1. **Una acción primaria** por pantalla (publicar / moderar / explorar).  
2. **Estados vacíos = siguiente paso**, no callejón.  
3. **Fotos primero** — copy y UI refuerzan que la imagen es el producto.  
4. **Human moderation visible** — PENDING no es un error, es un paso.  
5. **Dark luxury** — sin mayúsculas gritando, sin emojis excesivos en admin.

---

## Checklist agentes B

| # | Agente | Entrega |
|---|--------|---------|
| 1 | Onboarding / first-time | Registro checklist ✅ |
| 2 | Publisher wizard | Step hints ✅ |
| 3 | Visitor journey | Empty explorar ✅ |
| 4 | Microcopy & feedback | Tabla + toasts existentes |

---

*Documento vivo — priorizar quick wins antes de features grandes.*
