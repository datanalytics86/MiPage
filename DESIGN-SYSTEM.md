# DESIGN-SYSTEM — MiPage Tier-1

**Tema:** Dark premium (Lust) · **Producto principal:** fotografía  
**Stack UI:** Tailwind + CSS variables + Radix primitives + Framer Motion  
**Fecha:** 2026-07-29

---

## Principios

1. **La foto es el producto** — aspect ratios correctos, lazy load, blur placeholders, hover sutil.
2. **Dark first** — fondos `#0A0A0B` / surfaces elevadas; nunca blanco plano en UI principal.
3. **Jerarquía tipográfica** — Display (Cormorant Garamond) + Body (DM Sans).
4. **Estados hermosos** — loading / empty / error / success siempre con acción clara.
5. **Mobile-first** — touch targets ≥ 44px; grids 1→2→3→4.
6. **Motion con propósito** — 150–300ms, easings suaves; no decoración sin feedback.

---

## Tokens

### Color

| Token | Valor | Uso |
|-------|-------|-----|
| `background` | `#0A0A0B` | Página |
| `background-secondary` / `card` | `#141416` | Superficies |
| `background-elevated` | `#1C1C20` | Dropdowns, modals |
| `foreground` | `#F5F0E8` | Texto principal |
| `foreground-secondary` | `#C4BEB8` | Texto secundario (AA) |
| `foreground-muted` | `#9A948E` | Hints (AA) |
| `gold` | `#D4B56A` | CTA, acentos, precio (AA con texto `#0A0A0B`) |
| `gold-light` / `gold-dark` | `#E5D4A1` / `#A88B3D` | Hover / deep |
| `rose` | `#D4A5A5` | Masajes / soft accent |
| `sage` | `#9CAF88` | Verificado / success soft |
| `success` / `warning` / `error` | verdes/ámbar/rojo muted | Estados |
| `border` | `rgba(255,255,255,0.08)` | Separadores |

### Tipografía

| Rol | Familia | Pesos | Uso |
|-----|---------|-------|-----|
| Display | Cormorant Garamond | 400–700 | H1–H3, nombres en cards |
| Body | DM Sans | 400, 500, 700 | UI, body, labels |

Escala: `text-xs` → `text-sm` → `base` → `lg` → display `2xl–6xl`.

### Espaciado y radio

- Ritmo: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`
- Radios: `sm 0.375rem` · `md 0.5rem` · `lg 0.75rem` · `xl 1rem` · `2xl 1.25rem`
- Cards de foto: `rounded-2xl` + overflow hidden

### Sombras y glass

- `shadow-soft` — elevación sutil en dark
- `shadow-gold` — glow en CTA
- `glass` — `bg-white/5 backdrop-blur-md border border-white/10`

### Motion

| Token | Valor |
|-------|-------|
| `duration-fast` | 150ms |
| `duration-base` | 250ms |
| `duration-slow` | 400ms |
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Card hover | `y: -4`, scale image `1.05` |

---

## Componentes clave

| Componente | Path | Rol |
|------------|------|-----|
| `ProviderCard` | `components/providers/ProviderCard.tsx` | ServiceCard premium |
| `PhotoGrid` | `components/ui/PhotoGrid.tsx` | Grid / masonry fotos |
| `GalleryLightbox` | `components/ui/GalleryLightbox.tsx` | Full-screen gallery |
| `EmptyState` | `components/ui/EmptyState.tsx` | Vacío accionable |
| `ErrorState` | `components/ui/ErrorState.tsx` | Error + retry |
| `Skeleton` / `ProviderCardSkeleton` / `ProviderGridSkeleton` / `ListRowSkeleton` | `components/ui/Skeleton.tsx` | Loading unificado (home, explorar, admin, favoritos) |
| `Toaster` | `components/ui/Toaster.tsx` | Feedback toast |
| Primitives | `button`, `input`, `badge`, `card`, `select`, `dropdown` | Base |

### Photo rules

- Aspect portrait cards: **3/4**
- Hero / cover: **16/9** o full-bleed con gradient scrim
- `next/image` + `sizes` correctos + `priority` solo LCP
- Placeholder: blur o skeleton `bg-muted animate-pulse`
- Lightbox: teclado Escape / flechas; focus trap simple

---

## Patrones de página

```
Header glass sticky
→ Hero / título sección
→ Filtros (surface elevated)
→ Grid ProviderCard | PhotoGrid
→ EmptyState si 0 resultados
→ Footer muted
```

Admin: misma base dark; cards de moderación con **preview grande** de fotos.

---

## Accesibilidad

- Contraste texto principal ≥ AA sobre dark
- Focus ring `ring-gold/50`
- Iconos decorativos `aria-hidden`; botones con `aria-label`
- No información solo por color (badges + texto)

---

## Qué no hacer

- Fondos blancos en páginas públicas
- Imágenes sin aspect-ratio (CLS)
- Spinners genéricos sin skeleton de layout
- Docs que digan “visual élite” sin estos tokens aplicados

---

## Implementación

- Tokens: `frontend/tailwind.config.ts` + `frontend/src/app/globals.css`
- Tema activo por defecto: **dark** (`html` class / CSS vars en `:root`)
- Extender componentes en `frontend/src/components/ui/`

*Mantenido por el equipo de producto. Cambios de token = PR con screenshot mobile+desktop.*
