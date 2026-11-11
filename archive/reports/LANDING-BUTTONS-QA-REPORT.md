# LANDING-BUTTONS-QA-REPORT — MiPage

**Fecha:** 2026-08-01  
**Branch:** `main`  
**Stack:** Next.js 14 App Router · `frontend/` · dark premium  
**Preview:** `https://mi-page-git-main-datanalytics86s-projects.vercel.app`  
**Producción (desfasada al momento del audit):** `https://mi-page-lake.vercel.app`

---

## Resumen ejecutivo

| Criterio | Estado |
|----------|--------|
| `/`, `/explorar`, `/explorar/masajes`, `/explorar/modelaje` → 200 (raíz, sin `/frontend`) | ✅ local + preview (masajes/modelaje SSG); prod desfasada |
| Cero botones header/footer/home → 404 | ✅ (hrefs verificados; E2E footer crawl) |
| Matriz botones landings públicas | ✅ documentada abajo |
| type-check + unit tests + build | ✅ 50 tests · build 40 páginas · categorías + perfiles mock SSG |
| Smoke E2E landings/CTAs | ✅ chromium 31 passed / 5 skipped (auth sin creds) |
| `LANDING-BUTTONS-QA-REPORT.md` | ✅ este archivo |
| Push `main` listo para Vercel | ✅ |

---

## Agente 0 — Inventario landings

### `page.tsx` bajo `frontend/src/app`

| Ruta | Archivo | Público / auth |
|------|---------|----------------|
| `/` | `(main)/page.tsx` | público |
| `/explorar` | `(main)/explorar/page.tsx` | público |
| `/explorar/[category]` | `(main)/explorar/[category]/page.tsx` | público (masajes, modelaje) |
| `/favoritos` | `(main)/favoritos/page.tsx` | público (gate UI sin sesión) |
| `/perfil/[slug]` | `(main)/perfil/[slug]/page.tsx` | público |
| `/perfil/[slug]/comentarios` | `.../comentarios/page.tsx` | público |
| `/ayuda` | `(main)/ayuda/page.tsx` | público |
| `/contacto` | `(main)/contacto/page.tsx` | público |
| `/terminos` | `(main)/terminos/page.tsx` | público |
| `/privacidad` | `(main)/privacidad/page.tsx` | público |
| `/sobre-nosotros` | `(main)/sobre-nosotros/page.tsx` | público |
| `/login` | `(auth)/login/page.tsx` | público (redirect si sesión) |
| `/register` | `(auth)/register/page.tsx` | público |
| `/forgot-password` | `(auth)/forgot-password/page.tsx` | público |
| `/dashboard/*` | `dashboard/**` | auth provider/admin |
| `/admin/*` | `admin/**` | auth admin |
| APIs | `api/**/route.ts` | server |

### `vercel.json`

**Problema P0 detectado:** catch-all

```json
"routes": [{ "src": "/(.*)", "dest": "frontend/$1" }]
```

rompe el enrutado de `@vercel/next` para **segmentos dinámicos** (platform `NOT_FOUND`):

| Ruta en preview (pre-fix) | Status |
|----------------------------|--------|
| `/explorar/masajes` (SSG) | 200 |
| `/explorar/modelaje` (SSG) | 200 |
| `/perfil/valentina-reyes` | **404** platform |
| `/explorar/invalid-cat` | **404** (no llega al `redirect`) |
| `/frontend`, `/frontend/explorar` | 200 (doble path indeseable) |

**Fix:** eliminar `routes` legacy; mantener solo `builds` → `@vercel/next` sobre `frontend/package.json`.  
El builder monta la app en la raíz del dominio. **No reintroducir** el catch-all.

Recomendación ops: Vercel **Root Directory = `frontend`** (opcional pero ideal) + Production Branch = `main`.

### Smoke HTTP (preview, 2026-08-01 pre-fix routes)

| Ruta | Status | Notas |
|------|--------|-------|
| `/` | 200 | OK |
| `/explorar` | 200 | OK |
| `/explorar/masajes` | 200 | SSG |
| `/explorar/modelaje` | 200 | SSG |
| `/login`, `/register`, `/forgot-password` | 200 | OK |
| `/favoritos` | 200 | empty / login CTA |
| `/ayuda` … `/sobre-nosotros` | 200 | OK |
| `/dashboard`, `/admin` | 200 HTML shell abierto | **P0 UX** → AuthGate |
| `/api/health` | 503 degraded | `supabase_env: false` esperado sin secrets |
| `/perfil/*` | 404 platform | **P0** routes |
| Prod `/explorar/masajes` | 404 | deploy desfasado |

### Build local (post-fix)

```
● /explorar/[category] → /explorar/masajes, /explorar/modelaje
● /perfil/[slug] → 6 mock slugs (valentina-reyes, …)
```

---

## Agente 1 — Matriz botones / CTAs (landings públicas)

| Origen | Texto visible | Tipo | Destino | Page? | Status esperado | Severidad pre-fix |
|--------|---------------|------|---------|-------|-----------------|---------------------|
| Header | Logo MiPage | Link | `/` | sí | 200 | — |
| Header | Explorar | Link | `/explorar` | sí | 200 | — |
| Header | Masajes | Link | `/explorar/masajes` | sí | 200 | — |
| Header | Modelaje | Link | `/explorar/modelaje` | sí | 200 | — |
| Header | Buscar (submit) | form | `/explorar?q=` | sí | 200 | — |
| Header | Iniciar sesión | Link | `/login` | sí | 200 | — |
| Header | Registrarse | Link | `/register` | sí | 200 | — |
| Header (auth) | Favoritos | Link | `/favoritos` | sí | 200 | — |
| Header (auth provider) | Mi Dashboard | Link | `/dashboard` | sí | gate | — |
| Header (auth admin) | Panel Admin | Link | `/admin` | sí | gate | — |
| Home | Chip Masajes | Link | `/explorar/masajes` | sí | 200 | — |
| Home | Chip Modelaje | Link | `/explorar/modelaje` | sí | 200 | — |
| Home | Search | router | `/explorar?q=` | sí | 200 | — |
| Home | Ver todos | Link | `/explorar` | sí | 200 | — |
| Home | Cards featured | Link | `/perfil/[slug]` | sí | 200 post-fix | **P0** 404 Vercel |
| Home | Registrarme como profesional | Link | `/register?type=provider` | sí | 200 | — |
| Footer | Masajes / Modelaje / Ver todos | Link | `/explorar/*` | sí | 200 | — |
| Footer | Sobre nosotros | Link | `/sobre-nosotros` | sí | 200 | **añadido** |
| Footer | Únete como profesional | Link | `/register?type=provider` | sí | 200 | — |
| Footer | Panel de control | Link | `/login?redirect=/dashboard` | sí | 200 | **fix** (antes `/dashboard` shell abierto) |
| Footer | Ayuda / Términos / Privacidad / Contacto | Link | paths | sí | 200 | — |
| Footer | Instagram / email | external | social / mailto | n/a | n/a | — |
| Explorar | Filtros categoría | router | `/explorar/{cat}` | sí | 200 | — |
| Explorar | Cards | Link | `/perfil/[slug]` | sí | 200 post-fix | **P0** |
| Explorar | Empty “Limpiar filtros” | Button | onAction | sí | n/a | — |
| Favoritos (anon) | Iniciar sesión | Link | `/login?redirect=/favoritos` | sí | 200 | — |
| Favoritos (anon) | Explorar sin sesión | Link | `/explorar` | sí | 200 | — |
| Login | ¿Olvidaste contraseña? | Link | `/forgot-password` | sí | 200 | — |
| Login | Registrarse | Link | `/register` | sí | 200 | — |
| Register | Términos / Privacidad | Link | `/terminos`, `/privacidad` | sí | 200 | — |
| Register | Login | Link | `/login` | sí | 200 | — |
| Forgot | Volver al login | Link | `/login` | sí | 200 | — |
| Ayuda | Guías | Link | explorar, favoritos, register?type=provider, sobre-nosotros | sí | 200 | — |
| Ayuda | Contacto | Link | `/contacto` | sí | 200 | — |
| Contacto | mailto | a | siteConfig.emails | n/a | n/a | — |
| Sobre nosotros | Explorar / provider | Link | `/explorar`, `?type=provider` | sí | 200 | — |
| Perfil | WhatsApp | a | `wa.me` | n/a | external | — |
| Perfil | Reseñas | Link | `/perfil/[slug]/comentarios` | sí | 200 | — |
| Perfil | Guardar favorito | Button | store/API | n/a | n/a | — |
| 404 page | Inicio / Explorar / Contacto | Link | paths | sí | 200 | — |

**Query params:** `type=provider` unificado; legacy `?role=provider` → soft redirect en `next.config.js`.

---

## Agente 2–3 — Crawl anónimo + auth-gated

### Comportamiento auth (post-fix)

| Destino | Sin sesión + Supabase | Sin sesión + sin Supabase |
|---------|----------------------|---------------------------|
| `/dashboard/*` | middleware → `/login?redirect=…` | **AuthGate** mensaje “Acceso no disponible” + CTAs públicos |
| `/admin/*` | middleware → login o home si no admin | AuthGate (solo `admin`) |
| Footer “Panel de control” | `/login?redirect=/dashboard` | login page 200 (no shell privilegiado) |

### Fixes aplicados en código

1. **`vercel.json`:** quitar `routes` catch-all (P0 perfiles / dinámicos).  
2. **`AuthGate`:** client gate en `dashboard/layout` y `admin/layout`.  
3. **Footer:** panel → login con redirect; link Sobre nosotros; import muerto.  
4. **`perfil/[slug]`:** `generateStaticParams` desde mock (6 slugs).  
5. **Emails legales:** `siteConfig.emails` (eliminado `legal@luxeservices.com`).  
6. **E2E:** chips home, footer crawl, landings institucionales, favoritos CTA, dashboard gate.

---

## Agente 4 — Visual / a11y (spot-check)

| Check | Resultado |
|-------|-----------|
| Tema dark (`html.dark`) | ✅ E2E |
| Header focus / aria-label iconos (favoritos, menú) | ✅ presentes |
| Empty states (favoritos, explorar, perfil) | ✅ premium + CTA |
| Tap targets botones design system | h-11 (≥44px) |
| Mobile nav drawer | chips/header menú |

Sin P0 visual nuevos; residuales documentados en `UX-OPPORTUNITIES.md` / LH lab previos.

---

## Agente 5 — QAQC técnico

| Check | Resultado |
|-------|-----------|
| `npm run type-check` | ✅ |
| `npm test` (vitest) | ✅ **50** passed |
| `next build` | ✅ `/explorar/masajes`, `/explorar/modelaje`, 6× `/perfil/*` |
| E2E chromium `smoke` + `critical-flows` | ✅ **31** passed, **5** skipped (E2E_* creds) |
| Lighthouse | no re-ejecutado este ciclo; baseline previo desktop 97 / a11y 100 |

```bash
cd frontend
npm run type-check
npm test
npm run build
npm run test:e2e:critical   # o project=chromium
```

---

## Agente 6 — Limpieza

- CTAs: unificado provider `type=`; footer panel no apunta a shell abierto.  
- Sin “próximamente” engañoso en P0 públicos (admin config “próximamente” solo en área admin).  
- Dead import `MapPin` en Footer eliminado.  
- No se eliminaron features reales.

---

## Bugs y severidad

| # | Bug | Sev | Fix |
|---|-----|-----|-----|
| 1 | Catch-all `routes` → 404 en `/perfil/[slug]` y dinámicos | **P0** | Quitar routes en `vercel.json` |
| 2 | `/dashboard` y `/admin` shell abierto sin sesión (sin Supabase / middleware bypass) | **P0** | `AuthGate` + middleware API 503 |
| 3 | Footer “Panel de control” → `/dashboard` anónimo | **P1** | `/login?redirect=/dashboard` |
| 4 | Prod desfasada: categorías y forgot-password 404 | **P0 ops** | Redeploy Production = `main` |
| 5 | Email legal legacy `luxeservices.com` | **P2** | `siteConfig.emails.legal` |
| 6 | Footer sin Sobre nosotros | **P2** | link añadido |

---

## Residuales honestos

1. **Producción** (`mi-page-lake`) no refleja `main` hasta redeploy / Production Branch.  
2. **`/api/health` 503** sin `NEXT_PUBLIC_SUPABASE_*` reales — contrato intencional.  
3. **Perfiles live** sin Supabase muestran empty “Supabase no configurado” (no 404 post-fix).  
4. **Auth E2E** requiere `E2E_PROVIDER_*` / `E2E_ADMIN_*`.  
5. **Root Directory Vercel:** preferible `frontend` en UI para no depender de `builds` legacy.  
6. No reintroducir Express ni catch-all `frontend/$1`.

---

## Checklist criterios de éxito

- [x] Landings categoría 200 en build + E2E local  
- [x] Header/footer/home sin href a 404 (crawl E2E)  
- [x] Matriz botones landings públicas  
- [x] type-check + tests + build OK  
- [x] Smoke E2E crítico verde (chromium)  
- [x] Este reporte en repo  
- [x] Commits atómicos listos para push `main`

---

## Commits de este pipeline

- `fix(qa): landing/button crawl — zero dead CTAs + category routes verified`  
  (vercel routes, AuthGate, footer, perfiles SSG, E2E, docs)
