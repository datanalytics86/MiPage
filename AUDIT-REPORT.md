# AUDIT-REPORT — MiPage (Agente 0 · Auditor Forense)

**Fecha re-auditoría:** 2026-07-29  
**Repositorio:** `datanalytics86/MiPage`  
**Branch auditado:** `feat/tier1-supabase-consolidation`  
**HEAD al momento del escaneo:** `cc6a887` — *feat: tier-1 production ready + hard QAQC + cleanup*  
**Default branch remoto:** `claude/marketplace-services-app-011CUqB4gip6N34maEABp5TW` (`3576437`)  
**Live:** https://mi-page-lake.vercel.app  
**Método:** inventario recursivo del working tree + cruce imports/deps + secrets trackeados + type-check + Vitest + gap vs criterios Tier-1 del megaprompt  
**Alcance:** estado **actual consolidado** (post cleanup parcial). Baseline histórico del default branch se resume en §0.A.

---

## 0. Resumen ejecutivo (estado honesto)

| Dimensión | Estado real (branch Tier-1) | Gap vs objetivo Tier-1 |
|-----------|-----------------------------|-------------------------|
| Stack de producción | **Solo frontend Next.js** + Supabase | OK |
| Backend Express | **Archivado** en `archive/2026-legacy/backend/` | OK (no en path activo) |
| Secrets en tree activo | **Ningún `.env` trackeado** (solo examples) | Historial git aún puede contener `backend/.env` viejo |
| Docs overclaiming | Archivados; README honesto | Falta `DESIGN-SYSTEM.md` |
| UI base | Dropdown/Select/Label presentes; build type-check OK | **Sin design system élite** |
| Tema | **Light luxury** (cream/gold) | Megaprompt exige **dark premium** |
| Componentes foto | `ProviderCard` + galería en perfil | Falta PhotoGrid/Masonry, skeletons, empty states, gallery modal reutilizable |
| Publisher wizard | `/dashboard/avisos/nuevo` multi-step | Existe; pulible |
| Admin moderación | `/admin/proveedores` + preview/reject | Existe; UX mejorable |
| Tests | 24 unit (Vitest) verdes; smoke E2E Playwright | No cubre 5 flujos E2E completos sin credenciales |
| Lint | **Sin config ESLint** → `next lint` interactivo / roto | P0 residual |
| Root `package-lock.json` | **Stale** (workspaces backend + `luxeservices`) | P0 residual |
| Dual architecture en FE | **0** referencias Express/Prisma/API_URL | OK |
| Lighthouse ≥ 92 | **No medido** en esta pasada | Pendiente Agente 5 |

**Veredicto forense 2026-07-29:** el branch de consolidación **sí avanzó** respecto al default (archive backend, docs honestas, wizard, admin, tests unitarios, headers, migrations 006). **No es Tier-1 visual ni dark-premium.** Residual de higiene (ESLint, lockfile root, design system) debe cerrarse antes de llamar “listo”.

### 0.A Baseline del default branch (contexto)

En default (`3576437`) existía:

- Dual stack fantasma (Express + `temp-db.json` no consumido por FE)
- `backend/.env` commiteado con JWT predecible
- 25+ MD overclaiming “100% completo”
- UI rotas (`dropdown-menu` / `select` ausentes)
- Sin wizard listings ni tests FE

Eso **ya se abordó** en `cc6a887`. Este informe no repite la auditoría baseline como si fuera el estado actual.

---

## 1. Inventario de estructura (branch actual)

```
MiPage/
├── frontend/                 # ÚNICO path de producto
│   ├── src/                  # ~93 archivos, ~11.4k LOC
│   ├── supabase/             # schema + migrations 002–006
│   ├── e2e/                  # smoke Playwright
│   ├── scripts/              # seed, health, backup-check, validate-env
│   └── package.json          # name: mipage
├── archive/2026-legacy/      # backend + docs overclaim + scripts Codespaces
├── .github/workflows/ci-cd.yml
├── AUDIT-REPORT.md / ARCHITECTURE-DECISION.md / ADMIN-GUIDE.md / README.md
├── package.json              # scripts root → frontend (sin workspaces)
└── package-lock.json         # ⚠ STALE monorepo (ver §6)
```

**No existe** `backend/` en root. **No existe** `DESIGN-SYSTEM.md`.

---

## 2. Arquitectura real (Supabase-first)

| Capa | Tecnología real |
|------|-----------------|
| Auth | Supabase Auth + middleware RBAC |
| DB | Supabase Postgres + RLS |
| Storage | bucket `gallery` (+ policies 004) |
| API propia | Route handlers: contact, health, notify, payments/featured, account/delete-request |
| UI state | Zustand + React Query |
| Fallback sin env | `mockProviders` en home/explorar |
| Express/Prisma | Solo en archive — **0 imports en `frontend/src`** |

**Dominio de producto:** el “listing/aviso” es el **perfil de proveedor** (`providers.status`: pending → approved/rejected) + gallery + services menú + metadata.

---

## 3. Secrets y seguridad

### 3.1 Tracked (activo)

| Path | Riesgo |
|------|--------|
| `.env.example` / `frontend/.env.local.example` | Bajo (placeholders) |
| `archive/**/.env` | **No presentes** en tree |
| `backend/.env` | **Eliminado** del tree activo (histórico en git) |

### 3.2 Historial

- `git log -- backend/.env` muestra commits antiguos. **Rotar** cualquier secreto reutilizado (JWT demo, Cloudinary).
- Recomendación: `git filter-repo` o BFG **solo si** hubo keys reales de prod (evidencia actual: secrets de desarrollo).

### 3.3 Headers / middleware

- HSTS + CSP + XFO + nosniff presentes en `next.config.js`.
- CSP `font-src 'self' data:` **no incluye** `fonts.gstatic.com` / `fonts.googleapis.com` → tipografía Google puede romperse bajo CSP estricto.
- Middleware: en prod sin env Supabase → 503 en `/admin` y `/dashboard` (correcto). Dev sin env = no-op (aceptable con mocks).

### 3.4 Upload

- `uploadValidation.ts` + tests: mime allowlist, size, bloqueo extensiones peligrosas.
- Sin malware scan de terceros (aceptable para Tier-1 early; documentar).

---

## 4. Código muerto / residual / higiene

### 4.1 P0 — Cerrar en este pase Agente 0

| Ítem | Acción |
|------|--------|
| Sin `.eslintrc*` / eslint config | Crear config Next Strict no-interactiva |
| Root `package-lock.json` workspaces backend/`luxeservices` | Eliminar o regenerar vacío/simple; CI usa `frontend/package-lock.json` |
| CSP fonts incompleta | Ampliar `font-src` / `style-src` para Google Fonts **o** self-host fonts |
| `filterCities` / `sortOptions` dentro de `mockProviders.ts` | Extraer a `lib/filters.ts` (utilidades productivas vs demo data) |

### 4.2 P1 — Design / producto (Agentes 2–3)

| Ítem | Estado |
|------|--------|
| Dark theme premium | **Ausente** (tema light cream) |
| Design tokens documentados | Solo parcial en Tailwind |
| PhotoGrid / Masonry | No |
| EmptyState / Skeleton / ErrorState reutilizables | No (loading strings ad-hoc) |
| Gallery modal full-screen reutilizable | Parcial en `ProviderProfileClient` |
| Toast premium | Toaster básico existe |
| Page transitions | Framer en cards; no page-level |

### 4.3 P2 — Mantener temporalmente

| Ítem | Por qué |
|------|---------|
| `mockProviders` | Fallback demo sin Supabase env |
| `archive/2026-legacy/**` | Historia + referencia Prisma metadata |
| Cloudinary en `remotePatterns` | Imágenes legacy/Unsplash path; bajo costo mantener |
| `continue-on-error` en npm audit CI | Debe volverse blocking cuando audit limpio |

### 4.4 Archive (no borrar)

Todo `archive/2026-legacy/` se conserva: backend Express, temp-db demo, docs FASE-*, PROYECTO-COMPLETO, Codespaces scripts. Ver `archive/2026-legacy/README.md`.

---

## 5. Rutas de producto (estado real)

**Públicas:** `/`, `/explorar`, `/explorar/[category]`, `/favoritos`, `/perfil/[slug]`, `/perfil/[slug]/comentarios`, `/ayuda`, `/contacto`, `/privacidad`, `/terminos`, `/sobre-nosotros`  

**Auth:** `/login`, `/register`  

**Dashboard:** `/dashboard`, `/perfil`, `/servicios`, `/galeria`, `/resenas`, **`/avisos/nuevo`** (wizard)  

**Admin:** `/admin`, `/proveedores`, `/usuarios`, `/reportes`, `/configuracion`, `/metadata`  

**API:** `/api/contact`, `/health`, `/notify`, `/payments/featured`, `/account/delete-request`

**Ausentes (OK / fuera de scope):** chat, app móvil, i18n, geo avanzada, `/admin/avisos` separado (moderación unificada en proveedores).

---

## 6. Dependencias

### Frontend (en uso)

next, react, supabase, tanstack query, zustand, zod, framer-motion, lucide, radix (slot, avatar, dropdown, select, label), cva/clsx/tailwind-merge.

### Dev

vitest + coverage, playwright, typescript, eslint-config-next (presente en package pero **sin archivo config**).

### Root lockfile

```
package-lock.json → workspaces: backend + luxeservices  (OBSOLETO)
```

**Acción:** borrar root lock o regenerar sin workspaces. No usarlo en CI.

---

## 7. Features vs megaprompt

| Feature | Estado |
|---------|--------|
| Upload real + validación | Parcial–bueno |
| Wizard multi-step publish | Implementado |
| Admin approve/reject + fotos | Implementado |
| Metadata dinámica | Admin UI + migration 006 + defaults locales |
| Emails (Resend) | Route handler opcional |
| Mercado Pago featured | Route handler opcional (501 sin token) |
| Favoritos / reseñas / reportes | Implementado (UI) |
| Solo-admin guide | `ADMIN-GUIDE.md` |
| Design system élite | **Falta** |
| Dark theme | **Falta** |
| E2E 5 flujos + RBAC E2E | Smoke solo; RBAC unitario |
| Lighthouse ≥ 92 | No verificado |
| Sentry | Env opcional; wiring mínimo/ausente |

---

## 8. PRs abiertas (contexto remoto)

8 PRs abiertas (#2–#11). **#11** (listings + moderación) es la más relevante; lógica portada/adaptada a Supabase en este branch — **no mergear ciegas** PRs Express (#10) sobre este path.

| PR | Acción recomendada |
|----|--------------------|
| #11 | Cerrar o rebasar tras merge de este branch |
| #10 y Express-era | Cerrar como superseded por Supabase-first |
| UI antiguas #2–#6 | Cherry-pick visual selectivo solo si aporta |

---

## 9. Checklist post-cleanup residual (Agente 0)

- [x] Backend fuera del path activo (archive)
- [x] Docs overclaiming archivados
- [x] Sin `.env` secrets en tree activo
- [x] TypeScript `tsc --noEmit` OK
- [x] Vitest 24/24 OK
- [x] ESLint no-interactivo (`.eslintrc.json` Next core-web-vitals)
- [x] Root lockfile stale eliminado (CI usa `frontend/package-lock.json`)
- [x] Utils de filtros extraídas a `lib/filters.ts`
- [x] CSP fonts (Google Fonts permitido)
- [x] Dual stack residual en FE (ya limpio)

---

## 10. Recomendación al Agente 1

**Mantener Supabase-first estricto** (ya documentado en `ARCHITECTURE-DECISION.md`). Actualizar checkboxes de “hecho” tras este cleanup residual. **No** reintroducir Express.

---

## 11. Recomendación al Agente 2 (prioridad máxima)

1. Invertir a **dark premium** (tokens + globals + componentes).
2. Crear `DESIGN-SYSTEM.md` + tokens de motion/spacing.
3. Implementar: `PhotoGrid`, `ServiceCard` (alias ProviderCard elite), `EmptyState`, `Skeleton`, `ErrorState`, `GalleryLightbox`, micro-interacciones.
4. Mobile-first + aspect ratios de fotografía como producto principal.

---

## 12. Entregables Agente 0

| Entregable | Estado |
|------------|--------|
| Escaneo recursivo | Hecho |
| Secrets / dual stack / dead code | Este documento |
| Cleanup residual ejecutado | Commit de este pase |
| `AUDIT-REPORT.md` | Este archivo (re-auditoría 2026-07-29) |

**Siguiente:** Agente 1 (ADR checkboxes) → Agente 2 (Design System Tier-1).

---

*Agente 0 — Auditor Forense. No inventa features. Claims de “Tier-1 complete” deben contrastarse con §0 y §7.*
