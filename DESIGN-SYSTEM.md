# DESIGN-SYSTEM — MiPage Tier-1

**Tema:** Tactile Sensory Precision · Dark Lust  
**Producto principal:** fotografía  
**Stack UI:** Tailwind + OKLCH tokens + Radix + Framer Motion  
**Fecha:** 2026-08-16

---

## Dirección (Aesthetic Director)

Elegida: **B. Tactile Sensory Precision**  
Emoción: deseo controlado + precisión táctil + discreción.  
Descartadas: **A. Noir Editorial** (revista, no marketplace) y **C. Velvet Signal** (recae en el live “neurosensorial”).

Principio: la foto es el producto. El metal cálido (gold único) es el acento. El grano vive en el suelo, nunca sobre la foto.

---

## Tokens

### Color (OKLCH)

| Token | Valor | Uso |
|-------|-------|-----|
| `background` | `oklch(0.132 0.005 265)` | Página |
| `background-secondary` / `card` | `oklch(0.178 0.005 265)` | Superficies |
| `background-elevated` | `oklch(0.218 0.007 265)` | Dropdowns, modals |
| `background-dark` | `oklch(0.105 0.004 265)` | Footer / CTA band |
| `foreground` | `oklch(0.955 0.016 85)` | Texto |
| `foreground-secondary` | `oklch(0.802 0.014 80)` | Secundario AA |
| `foreground-muted` | `oklch(0.672 0.014 75)` | Hints |
| **`gold`** | `oklch(0.78 0.09 88)` | **Única familia.** CTA, precio, acento |
| `gold-light` / `gold-dark` | relative color desde `--gold` | Hover / pressed |
| `--gold-soft` / `--gold-line` / `--gold-ring` | `oklch(from var(--gold) … / α)` | Fills y hairlines |
| `rose` | `oklch(0.78 0.055 18)` | Masajes (suave) |
| `sage` | `oklch(0.72 0.055 130)` | Verificado |

No mezclar `#C9A962` y `#D4B56A`. Un solo gold.

### Tipo

| Rol | Familia | Uso |
|-----|---------|-----|
| Display | Cormorant Garamond | H1–H3, nombres, italic de acento |
| Body | DM Sans | UI, labels |

### Radio (irregular a propósito)

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-tight` | 5px | Badges |
| `--radius-control` | 10px | Botones, inputs, chips |
| `--radius-photo` | 22px | Cards foto |
| `--radius-panel` | 28px | Paneles grandes |

### Motion

| Token | Valor |
|-------|-------|
| `duration-fast / base / slow` | 160 / 280 / 520ms |
| `ease-premium` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Card hover | spring 380/28, `y: -3`, image scale `1.03` |
| Hero | `.reveal` stagger 80ms + `@starting-style` |
| Brand | `view-transition-name: brand-mark` |
| Reduced motion | duraciones → 1ms, view transitions off, `useReducedMotion` |

### Material

- Grain: `feTurbulence` **en el background del `body`**, blend overlay. Nunca `position: fixed` sobre fotos.
- Hairline gold en hero (borde izquierdo), no orbs.
- Scrim bottom en cards 3/4.

---

## Componentes clave

| Componente | Path | Rol |
|------------|------|-----|
| `BrandMark` | `components/layout/BrandMark.tsx` | Página + dog-ear gold |
| `ProviderCard` | `components/providers/ProviderCard.tsx` | Foto-first, radio photo |
| `chip-tactile` | `globals.css` | Categorías sin emoji |
| Primitives | `button`, `badge`, … | `rounded-control` |

### Photo rules

- Cards: **3/4**, `rounded-photo`, ring inset 8%
- `next/image` + `sizes` + `priority` solo LCP
- Hover scale ≤ 1.03 (no 1.05 — menos vitrine)

---

## Accesibilidad

- Focus: doble anillo `void` + `--gold-ring`
- Touch ≥ 44px en chips
- `prefers-reduced-motion` obligatorio
- Iconos decorativos `aria-hidden`; logo con `aria-label`

---

## Qué no hacer

- Orbs / blobs blur en hero
- Emojis en UI principal
- Radio uniforme 8/12/16 en todo
- Grano encima de fotografía
- Gold inconsistente (`#C9A962` vs `#D4B56A`)
- Copy “neurosensorial” / ritual / concierge

---

## Implementación

- `frontend/src/app/globals.css` + `frontend/tailwind.config.ts`
- Critique: `TIER1-CRITIQUE.md`
- Live: Production Branch debe ser `main` (`DEPLOY.md`)
