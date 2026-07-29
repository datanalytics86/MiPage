# AUDIT-REPORT — MiPage (Agente 0 · Auditor Forense)

**Fecha de auditoría:** 2026-07-28  
**Repositorio:** `datanalytics86/MiPage`  
**Branch auditado (default):** `claude/marketplace-services-app-011CUqB4gip6N34maEABp5TW`  
**HEAD:** `3576437` — *feat: registro automatico de proveedores pendientes y seed demo*  
**Live actual (declarado):** https://mi-page-lake.vercel.app  
**Método:** clone fresco + inventario recursivo + cruce de imports/deps + revisión de secrets trackeados + PRs abiertas  
**Alcance:** estado real del default branch. Features de PRs no mergeadas se marcan como *fuera de HEAD*.

---

## 0. Resumen ejecutivo (estado honesto)

| Dimensión | Estado real en HEAD | Overclaim en docs |
|-----------|---------------------|-------------------|
| Stack de producción en Vercel | **Solo frontend Next.js** (`vercel.json` → `frontend/`) | README describe dual Express+Prisma+Socket.io “completo” |
| Datos en runtime frontend | **Supabase-first** (hooks + Auth + RLS) con **fallback mock** | “100% completo”, “listo para producción” |
| Backend Express | **Código legacy no consumido por frontend** | “Backend 100% funcional” |
| Persistencia backend | **`temp-db.json` + TempPrismaClient**, no Prisma real en controllers | “PostgreSQL + Prisma” |
| Upload de imágenes | **Parcial:** `useUploadGalleryFile` + Storage SQL; validación client débil; sin malware scan | Cloudinary en README/env como si fuera el path principal |
| Listings / moderación de avisos | **No existe** en HEAD (`/dashboard/avisos`, `/admin/avisos` ausentes). Está en **PR #11** (otra branch) | README: “Publisher crea servicio → PENDING → Admin aprueba” |
| Metadata dinámica | **Solo en backend Prisma** (controllers). **Cero** tablas/UI Supabase de metadata | FASE-* y SISTEMA-METADATA como “implementado” |
| Tests duros | **Backend:** 1 suite auth + Jest. **Frontend:** 0 tests, 0 Playwright | “Tests configurados”, CI con `test:ci` / `type-check` inexistentes |
| Seguridad | `backend/.env` **commiteado** con `JWT_SECRET`; UI imports rotos; CORS backend “permitir todo” | Helmet/JWT “seguro” |
| Docs | **33 Markdown**, ~335 KB, muchos overclaims | — |
| PRs abiertas | **8** (#2, #4, #5, #6, #8, #9, #10, #11) | — |

**Veredicto forense:** el default branch es un **frontend Supabase en progreso** con un **backend Express fantasma** y un **vertedero documental**. No es Tier-1. No es autosustentable sin cleanup + features críticas + QAQC.

---

## 1. Inventario de estructura (HEAD)

```
MiPage/
├── frontend/          # Next.js 14 + Supabase (ÚNICO path de producto real)
├── backend/           # Express + temp-db + Prisma schema (LEGACY / no cableado al FE)
├── docs/              # 7 guías (parcialmente obsoletas)
├── public/            # solo manifest.json huérfano (root)
├── .github/workflows/ # CI roto / desalineado
├── 25+ *.md en root   # FASE-*, PROYECTO-COMPLETO, SOLUCION-*, CODESPACES_*, etc.
├── vercel.json        # deploy solo frontend
├── package.json       # workspaces frontend+backend; scripts solo frontend
└── package-lock.json  # root (no hay lockfiles en frontend/ ni backend/)
```

**Conteos aproximados**

| Área | Archivos | LOC (aprox.) |
|------|----------|--------------|
| `frontend/src` | 76 | ~9,420 |
| `backend/src` | 23 | ~4,559 |
| Markdown total | 33 | ~335 KB |
| `backend/temp-db.json` | 1 | ~14 KB |

**Nombre inconsistente:** `frontend/package.json` → `"name": "luxeservices"` (rebrand incompleto).

---

## 2. Dualidad de clientes (Supabase vs Prisma/Express) — HALLAZGO CRÍTICO

### 2.1 Qué usa el frontend HOY

| Capa | Tecnología real |
|------|-----------------|
| Auth | Supabase Auth (`AuthContext`, middleware) |
| DB | Supabase client (`from('providers'|'profiles'|…)` ) |
| Storage | Supabase Storage bucket `gallery` (`useGallery.ts`) |
| API propia Next | Solo `POST /api/contact` (route handler Next, no Express) |
| Estado UI | Zustand + React Query |
| Fallback sin env | `mockProviders.ts` en home y explorar |

**Cruce forense:** búsquedas de `NEXT_PUBLIC_API_URL`, `localhost:3001`, `/api/services`, `/api/auth` en `frontend/src` → **sin consumo del backend Express**. El único `fetch` API relevante es `/api/contact` (Next).

### 2.2 Qué es el backend HOY

| Capa | Realidad |
|------|----------|
| Framework | Express + Socket.io montado |
| “ORM” en controllers | `TempPrismaClient` desde `backend/src/utils/tempDB.js` → **`temp-db.json`** |
| Prisma real | `schema.prisma` (SQLite) + seed + **tests** importan `@prisma/client`; **controllers de app no** |
| Auth | JWT + bcrypt locales (paralelo a Supabase Auth) |
| Cloudinary | en `package.json` y `.env` — **0 requires en `backend/src`** |
| SendGrid | en package.json — **0 requires en src** (export ExcelJS sí en userManagement) |
| Swagger | solo en development |

### 2.3 Modelos de dominio **incompatibles**

| Concepto | Backend Prisma | Frontend Supabase |
|----------|----------------|-------------------|
| Roles | `USER` / `PUBLISHER` / `ADMIN` | `user` / `provider` / `admin` |
| Unidad publicable | `Service` (listing con status PENDING/APPROVED/…) | `providers` (perfil con status) + `services` (menú de precios del perfil) |
| Moderación | Aprobar **servicios** | Aprobar **proveedores** |
| Metadata fields | `MetadataField`, `CustomFieldValue`, `UserMetadata` | **No existe en schema.sql** |
| Favoritos / reviews | Modelos Prisma | Tablas Supabase + store |
| Auth identity | email/password en tabla User | `auth.users` + `profiles` |

**Conclusión arquitectónica (input para Agente 1):** no hay “dual stack” operativo; hay **un stack vivo (Supabase)** y **un stack muerto (Express/temp-db/Prisma schema)**. Consolidar = **Supabase-first** y aislar/eliminar `backend/`.

---

## 3. Secrets y superficie de seguridad

### 3.1 Archivos sensibles trackeados por git

| Path | Tracked | Riesgo |
|------|---------|--------|
| `backend/.env` | **SÍ** | **CRÍTICO** — JWT y config de entorno en historial |
| `backend/temp-db.json` | **SÍ** | Alto — hashes bcrypt + datos demo; credenciales de prueba |
| `.env.example` | Sí (OK) | Bajo — placeholders |
| `backend/.env.example` | Sí (OK) | Bajo |
| `frontend/.env.local.example` | Sí (OK) | Bajo — menciona DEMO_SEED_PASSWORD ejemplo |

### 3.2 Contenido relevante de `backend/.env` (valores de desarrollo, pero **no deben estar en git**)

- `JWT_SECRET="mipage-secret-key-development-testing-2024"` (**predecible**)
- `DATABASE_URL="file:./dev.db"`
- Cloudinary demo placeholders
- `FRONTEND_URL` apuntando a un Codespaces GitHub dev URL
- `PORT=3001`, `NODE_ENV=development`

### 3.3 `.gitignore` insuficiente

- Ignora `.env` genérico, pero **`backend/.env` ya está tracked** → el ignore no lo saca del índice.
- No ignora explícitamente `backend/temp-db.json`, `*.db`, `dev.db` (solo `backend/prisma/dev.db`).
- No hay política clara de `supabase/.temp`, coverage frontend, etc.

### 3.4 Backend CORS / Helmet

- `server.js`: en práctica **permite cualquier origin** (`callback(null, true)` en else).
- CSP de Helmet **desactivado**.
- No aplica al deploy Vercel actual (backend no se despliega), pero es deuda peligrosa si alguien lo levanta.

### 3.5 Frontend security headers

`next.config.js` tiene X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy. **Falta HSTS y CSP** (no hay CSP estricto).

### 3.6 Middleware RBAC

- Protege `/dashboard` y `/admin` **solo si** `hasSupabaseEnv()`.
- Si faltan env vars: **middleware no-op** → rutas admin/dashboard accesibles sin auth a nivel edge (las páginas client pueden fallar, pero la puerta está abierta).

---

## 4. Código muerto / legacy / roto

### 4.1 P0 — Rompe build o es secreto en repo (eliminar o arreglar YA)

| Ítem | Justificación | Acción recomendada |
|------|---------------|--------------------|
| `backend/.env` | Secret/config en git | **Eliminar del tree + rotar JWT**; purge history si hubo keys reales |
| Missing `frontend/src/components/ui/dropdown-menu.tsx` | Importado por `Header.tsx`, `admin/proveedores`, `admin/usuarios` | **Crear componente o quitar imports** — build TypeScript/Next falla |
| Missing `frontend/src/components/ui/select.tsx` | Importado por admin pages + comentarios | Idem |
| `backend/` completo (si se elige Supabase-first) | Frontend no lo consume; dualidad de dominio | **Archivar o borrar** tras decisión Agente 1 |
| `backend/temp-db.json` + `tempDB.js` + `create-db.js` + `scripts/regenerate-temp-db.js` | Shim JSON, no producción | Eliminar / archivar con backend |
| Root `.env.example` con `NEXT_PUBLIC_API_URL` / Socket / Cloudinary como path principal | Documenta stack muerto | Reescribir a Supabase-only |

### 4.2 P1 — Legacy / docs overclaiming (archivar, no borrar a ciegas)

Mover a `/archive/2026-legacy/` (preserva historia de decisiones):

| Archivo / carpeta | Motivo |
|-------------------|--------|
| `PROYECTO-COMPLETO.md` | Título “100% COMPLETO”; inventa SWR, Socket.io client, rutas `/services/new` que no existen en HEAD |
| `FASE-2-COMPLETADA.md` … `FASE-6-COMPLETADA.md` | “COMPLETADO AL 100%”; Backend 100% + Frontend 100% — falso respecto a product gaps |
| `AUDITORIA-CALIDAD-2024-11-05.md` | Auditoría vieja con scores 100% y estructura desactualizada |
| `QUALITY-SUMMARY.md` | “Listo para producción” |
| `RESUMEN_FINAL.md`, `SESION_COMPLETADA.md` | Narrativa de sesión/fase cerrada |
| `SOLUCION-ACCESO-ADMIN.md`, `SOLUCION-ERROR-404.md` | Troubleshooting puntual legacy |
| `DEPLOY-VERCEL-FIX.md` | Fix one-off; debe subsumirse en docs de deploy honestas |
| `ACCESO_CODESPACES.md`, `CODESPACES_SETUP.md` | Codespaces-centric; no es runbook de prod |
| `CLAUDE_CODE_TEMPLATES.md`, `PROMPT.md` | Meta-prompts de agentes; no producto |
| `SISTEMA-METADATA-IMPLEMENTACION.md` | Metadata solo en backend legacy |
| `START-HERE.md`, `INICIO-RAPIDO.md`, `QUICK_START.md`, `GUIA-USO-COMPLETA.md` | Duplican README con claims del stack Express |
| `architecture.md` (root) | Describe Prisma/Express como core; desalineado del live |
| `docs/API.md`, `docs/DEPLOYMENT.md`, `docs/MANAGEMENT-GUIDE.md`, etc. | Parcialmente Express-era; revisar uno a uno |
| `public/manifest.json` (root) | Huérfano; el FE usa `frontend/public/site.webmanifest` |
| `start-dev.sh`, `stop-dev.sh` | Probablemente orquestan dual-stack Codespaces |

### 4.3 P2 — Código frontend sospechoso / residual

| Ítem | Evidencia | Acción |
|------|-----------|--------|
| `frontend/src/lib/mockProviders.ts` | Usado activamente como fallback en `page.tsx` y `ExplorarContent.tsx` | **No borrar aún**: es fallback de demo. Post-Tier-1: acotar a `NODE_ENV=development` o seed real únicamente |
| `filterCities` / `sortOptions` en mock file | Mezcla utilidades reales con mocks | Extraer utilidades a `lib/filters.ts`; dejar mocks solo en demo |
| `ProviderProfileClient.tsx` | Existe y se usa vía perfil; revisar si hay dead exports | Mantener si el perfil lo importa |
| Nombre package `luxeservices` | Branding viejo | Renombrar a `mipage` / `mi-page` |
| Cloudinary en `next.config.js` remotePatterns | Path legacy; Storage Supabase es el actual | Mantener solo si se usa CDN externo; si no, limpiar o documentar |

### 4.4 P3 — Backend internals (si se elimina backend, todo va junto)

| Path | Notas |
|------|-------|
| `backend/src/controllers/*` | Toda la lógica de negocio Express |
| `backend/src/routes/*` | Admin, auth, metadata, publisher, etc. |
| `backend/prisma/*` | Schema rico (metadata, approvals) **no migrado a Supabase** — **extraer ideas antes de borrar** |
| `backend/__tests__/auth.test.js` | Única suite; depende de PrismaClient real, no TempDB |
| `backend/package.json` deps: cloudinary (0 uso), socket.io (stub events), swagger, multer (parcial) | Dead/overkill deps |

---

## 5. Imports / componentes / rutas muertas o rotas

### 5.1 Componentes UI faltantes (imports rotos)

```
@/components/ui/dropdown-menu  → Header, admin/proveedores, admin/usuarios
@/components/ui/select         → admin/proveedores, admin/usuarios, admin/reportes, perfil/.../comentarios
```

UI real presente: `avatar`, `badge`, `button`, `card`, `input`, `Toaster` únicamente.

### 5.2 Rutas de producto (HEAD)

**Existen:**

- Público: `/`, `/explorar`, `/explorar/[category]`, `/favoritos`, `/perfil/[slug]`, `/perfil/[slug]/comentarios`, `/ayuda`, `/contacto`, `/privacidad`, `/terminos`, `/sobre-nosotros`
- Auth: `/login`, `/register`
- Dashboard provider: `/dashboard`, `/dashboard/perfil`, `/dashboard/servicios`, `/dashboard/galeria`, `/dashboard/resenas`
- Admin: `/admin`, `/admin/proveedores`, `/admin/usuarios`, `/admin/reportes`, `/admin/configuracion`
- API: `/api/contact`

**NO existen en HEAD (pero docs/PR las asumen):**

- `/dashboard/avisos`, `/dashboard/avisos/nuevo` (PR #11)
- `/admin/avisos` moderación de listings (PR #11)
- `/services/new` (README — redirect a explorar para `/services`)

**Redirects legacy** en `next.config.js`: `/services` → `/explorar`, `/auth/*` → `/login|/register`.

### 5.3 Rutas backend (muertas respecto al FE)

Todas bajo `/api/*` Express: auth, services, reviews, users, posts, admin, metadata-fields, service-types, publisher — **sin cliente en frontend HEAD**.

---

## 6. Dependencias no usadas / inconsistentes

### 6.1 Frontend (`frontend/package.json`)

| Dependencia | Uso en `src` | Veredicto |
|-------------|--------------|-----------|
| `@radix-ui/react-slot` | `button.tsx` | KEEP |
| `@radix-ui/react-avatar` | `avatar.tsx` | KEEP |
| `@radix-ui/react-dropdown-menu` | package ok, **falta wrapper** | KEEP (después de crear UI) |
| `@radix-ui/react-select` | package ok, **falta wrapper** | KEEP (después de crear UI) |
| `@radix-ui/react-dialog` | **0 imports** | CANDIDATE REMOVE (o implementar UI) |
| `@radix-ui/react-tabs` | 0 | REMOVE |
| `@radix-ui/react-checkbox` | 0 | REMOVE |
| `@radix-ui/react-separator` | 0 | REMOVE |
| `@radix-ui/react-scroll-area` | 0 | REMOVE |
| `@radix-ui/react-switch` | 0 | REMOVE |
| `@radix-ui/react-slider` | 0 | REMOVE |
| `@radix-ui/react-label` | 0 | REMOVE |
| `@radix-ui/react-toast` | 0 (usa Toaster custom + zustand) | REMOVE |
| `react-hook-form` | 0 | REMOVE (o usar en wizard listing) |
| `@hookform/resolvers` | 0 | REMOVE (idem) |
| `zod` | solo `api/contact` | KEEP |
| `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`, `cva`, tanstack, zustand, supabase | en uso | KEEP |

**Nota:** `depcheck` no se ejecutó en CI (no hay node_modules en clone fresco). Esta lista es estática por grep de imports.

### 6.2 Backend

| Dependencia | Uso real | Veredicto (si se mantiene backend) |
|-------------|----------|-------------------------------------|
| `cloudinary` | 0 en src | REMOVE |
| `@sendgrid/mail` | 0 en src | REMOVE o implementar |
| `exceljs` | export admin | KEEP si se mantiene admin Express |
| `socket.io` | connection stub | REMOVE o implementar notificaciones reales |
| `swagger-*` | dev only | optional |
| `@prisma/client` | tests/seed; app usa TempDB | inconsistente — **arreglar o borrar** |

### 6.3 Root / workspaces / CI

- Root `package.json` declara workspaces `frontend` + `backend` y `install:all`.
- **No hay** `frontend/package-lock.json` ni `backend/package-lock.json`.
- CI hace `npm ci` con `cache-dependency-path: frontend/package-lock.json` y `backend/package-lock.json` → **fallará**.
- CI corre `npm run type-check` y `npm run test:ci` en frontend → **scripts no existen**.
- CI escucha `main`/`develop`; default branch del repo es la de Claude → **desalineación**.
- Deploy jobs son **echo placeholders**, no deploy real.
- Root `package-lock.json` (~560 KB) puede estar desincronizado con monorepo real.

### 6.4 Scripts ausentes vs megaprompt

| Esperado (ops) | Existe hoy |
|----------------|------------|
| `npm run seed:demo` | Sí en frontend |
| `npm run health` | No |
| `npm run backup-check` | No |
| `type-check` / `test` frontend | No |
| Playwright / Vitest | No |

---

## 7. Features críticas — gap real vs marketing

| Feature (prioridad Agente 3) | Estado en HEAD | Notas |
|------------------------------|----------------|-------|
| 1. Upload real de imágenes | **Parcial** | `useUploadGalleryFile` + migration 004; validación mime/size principalmente en Storage policy; UI acepta files sin hard-check client robusto; sin antivirus |
| 2. Wizard listing multi-step + PENDING | **Ausente en HEAD** | En PR #11 (`claude/project-status-review-5Q2dS`); modelo de “avisos” no está en Supabase schema actual |
| 3. Admin cola moderación + preview fotos | **Parcial (providers)** | `/admin/proveedores` approve/reject; **no** cola de listings; depende de dropdown/select rotos |
| 4. Metadata fields dinámicos | **Solo backend legacy** | No migrado a Supabase |
| 5. Emails transaccionales | **No** | Sin Resend/SendGrid cableado en FE; backend package sin uso |
| 6. Mercado Pago featured | **No** | — |
| Chat / móvil / i18n / geo | Fuera de scope | Correcto no implementar aún |

### 7.1 Chile compliance (muestra)

| Requisito | Estado |
|-----------|--------|
| Consentimiento explícito Ley 19.628 en registro | **Revisar:** registro tiene UI; no auditado como checkbox legal formal en este pase (probable gap) |
| Política privacidad / términos | Páginas estáticas existen; fecha “Enero 2025”; genéricas |
| Flujo eliminación de datos | **No** endpoint/self-service obvio |
| Moderación contenido sensible documentada | **No** en docs honestas |

### 7.2 Observabilidad

- Sin Sentry en frontend HEAD.
- Sin health check en Next (backend tiene `/health` no desplegado).
- Sin logging estructurado product-side.

---

## 8. PRs abiertas (contexto, no mergeadas en HEAD)

| PR | Título corto | Head branch | Relevancia cleanup |
|----|--------------|-------------|--------------------|
| **#11** | Listings + admin moderation + provider profiles | `claude/project-status-review-5Q2dS` | **Máxima** — features críticas faltantes |
| **#10** | Env validation, Prisma real, readiness, frontend hardening | `codex/continue-improvements-for-operability-wiqd9h` | Ops; parte ya solapada/obsoleta vs Supabase |
| #9 | Placeholder Codex | `codex/continue-improvements-for-operability` | Superada por #10 |
| #8 | Review remaining improvements | `claude/review-remaining-improvements-1DmDa` | Revisar cherry-picks |
| #6 | UI rediseño marketplace | `claude/improve-service-site-b8jUf` | Posible solapamiento visual |
| #5 | Catalog UI + inline admin | `codex/improve-performance-and-elevate-quality` | — |
| #4 | Landing gallery minimalism | `codex/develop-web-platform-for-modeling-services` | — |
| #2 | Preview services fallback | `codex/improve-repository-design-for-modern-appeal-8f0khx` | Mocks — solapado con mockProviders |

**Riesgo:** 8 PRs divergentes sobre la misma base → merge caos. Cleanup debe ocurrir en una **branch de consolidación** con decisión Supabase-first, y cherry-pick selectivo de #11 (adaptado a schema Supabase, no Express).

---

## 9. Lista priorizada de eliminación / archivo (para Agente 2)

### Prioridad 0 — Seguridad / build (hacer primero)

1. **Quitar del índice git** `backend/.env` (y rotar cualquier secreto reutilizado).
2. **Arreglar o stubear** `dropdown-menu.tsx` + `select.tsx` (si no se arregla, no hay build verde).
3. Endurecer `.gitignore` para `.env`, `temp-db.json`, `*.db`.

### Prioridad 1 — Dual-stack (post decisión Agente 1)

4. Si Supabase-first (recomendado):
   - Eliminar o mover a `archive/2026-legacy/backend/` toda la carpeta `backend/`.
   - Eliminar workspace backend del root `package.json`.
   - Reescribir `.env.example` y README stack section.
   - Actualizar CI: solo frontend + supabase checks.
5. **Antes de borrar Prisma schema:** exportar inventario de modelos útiles (metadata, approval flow, rejectionReason) a backlog Supabase migrations.

### Prioridad 2 — Documentación overclaiming

6. Archivar a `archive/2026-legacy/docs/` la lista §4.2.
7. Dejar en root solo: `README.md` (honesto), `LICENSE`, `CONTRIBUTING.md` (si se actualiza), y docs nuevas del megaprompt (`ARCHITECTURE-DECISION.md`, `ADMIN-GUIDE.md`, este `AUDIT-REPORT.md`).

### Prioridad 3 — Dependencias y basura

8. Podar Radix/react-hook-form no usados **o** usarlos en features Agente 3.
9. Borrar `public/manifest.json` root si no se usa.
10. Alinear nombre package `luxeservices` → MiPage.
11. Limpiar `package-lock` monorepo / generar lockfiles coherentes con CI.

### Prioridad 4 — Mocks residuales (después de seed real estable)

12. Restringir `mockProviders` a demo/dev.
13. Eliminar comentarios TODO muertos y shims `hasSupabaseEnv` paths que enmascaran misconfig en prod.

---

## 10. Justificación de no-eliminación (qué NO tocar todavía)

| Activo | Por qué mantener |
|--------|------------------|
| `frontend/supabase/schema.sql` + migrations 002–005 | Fuente de verdad DB actual |
| Hooks Supabase (`useAdmin`, `useGallery`, …) | Producto real |
| Páginas admin/dashboard/explorar/auth | Core UX |
| `mockProviders` (temporal) | Evita home vacía sin env; quitar solo tras seed/prod data |
| Contenido conceptual de Prisma metadata / approval | Reimplementar en Supabase, no descartar ideas |
| PR #11 diff | Fuente de wizard/moderación a portar |

---

## 11. Checklist de verificación post-cleanup (preview Agente 2/4)

- [ ] `git ls-files | findstr /i "\.env$"` → vacío salvo examples
- [ ] No existe `temp-db.json` en tree de trabajo principal
- [ ] `npx tsc --noEmit` en frontend sin error
- [ ] `next build` exit 0
- [ ] Cero imports a Express / `NEXT_PUBLIC_API_URL` en runtime FE
- [ ] `npx depcheck` limpio (o allowlist justificada)
- [ ] Docs root sin “100% completo” / “listo para producción” sin evidencia
- [ ] CI scripts = scripts reales en package.json

---

## 12. Recomendación al Agente 1 (Arquitecto)

**Decisión recomendada: Supabase-first estricto.**

Razones forenses (no opinión de producto abstracta):

1. Vercel solo despliega `frontend/`.
2. Todo el data path de HEAD ya es Supabase (auth, RLS, storage, hooks).
3. Express no tiene consumidores en el FE.
4. Operar un solo admin humano (Nicolás) es más realista con Supabase Dashboard + RLS + Edge Functions que con Express + Prisma + Railway + Cloudinary + JWT propio.
5. El backend actual **ni siquiera usa Prisma en runtime** (TempDB).

**Plan de consolidación sugerido:**

```
[Browser] → Next.js 14 (Vercel)
              ├─ Supabase Auth + RLS
              ├─ Supabase Postgres (providers, services, gallery, reviews, reports, site_settings)
              ├─ Supabase Storage (gallery, avatars)
              ├─ Edge Functions / Route Handlers (emails, Mercado Pago webhooks, contact)
              └─ (opcional) cron jobs externos solo si hay trabajo pesado
```

**NO** mantener dual write FE↔Express.

---

## 13. Riesgos si se ignora este informe

1. Seguir mergeando PRs sobre Express (#10/#11 backend) **aumenta** la deuda dual-stack.
2. Secretos en git siguen en historial aunque se “arregle” el working tree.
3. Docs “100%” inducen a deploy prematuro sin pagos, emails, tests ni compliance.
4. Build roto por UI faltante puede estar enmascarado si nadie corre `next build` local con strict TS.

---

## 14. Entregables del Agente 0

| Entregable | Estado |
|------------|--------|
| Escaneo recursivo del repo | Hecho |
| Lista priorizada de eliminación + justificación | Este documento §4–§9 |
| Mapa dualidad Supabase vs Prisma | §2 |
| Secrets trackeados | §3 |
| Deps no usadas (estático) | §6 |
| Archivo | `AUDIT-REPORT.md` (este archivo) |

**Siguiente paso (orden obligatorio):**  
**Agente 1 — Arquitecto & Consolidator** → producir `ARCHITECTURE-DECISION.md` y plan de movimiento de lógica a Supabase, **sin cleanup agresivo hasta que este informe sea aceptado**.

---

*Generado por Agente 0 — Auditor Forense. No inventa features no presentes en HEAD. Cualquier claim de “listo” posterior debe contrastarse con este baseline.*
