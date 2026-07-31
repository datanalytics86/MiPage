# ROUTE-AUDIT-REPORT — MiPage

**Fecha:** 2026-07-31  
**Branch:** `main`  
**Stack:** Next.js 14 App Router · app en `frontend/`

---

## Causa raíz P0 — `/explorar/modelaje` y `/explorar/masajes` 404 en Vercel

| Entorno | `/explorar` | `/explorar/masajes` | `/explorar/modelaje` |
|---------|-------------|---------------------|----------------------|
| Local (antes del fix de código) | 200 | **200** | **200** |
| Preview Vercel (pre-fix) | 200 | **404** `x-vercel-error: NOT_FOUND` | **404** platform |

**Root cause:** `vercel.json` legacy con catch-all:

```json
"routes": [{ "src": "/(.*)", "dest": "frontend/$1" }]
```

Ese rewrite fuerza destinos tipo filesystem bajo `frontend/` y **rompe el enrutado del builder `@vercel/next`** para segmentos dinámicos (`[category]`). Las rutas estáticas (`/explorar`) a menudo sí resolvían; las dinámicas devolvían **platform NOT_FOUND** aunque existiera `page.tsx`.

**No era** middleware (public marketing fast-path incluye `/explorar/*`).  
**No era** ausencia de archivo (existía `explorar/[category]/page.tsx`).

### Fixes aplicados

1. **`vercel.json`:** eliminado `routes` catch-all; se mantiene solo `builds` → `@vercel/next` sobre `frontend/package.json`.
2. **`generateStaticParams`** para `masajes` y `modelaje` + `dynamicParams = true`.
3. Slug normalizado a lowercase; inválidos → `redirect('/explorar')`.

---

## Inventario de `page.tsx` (Agente 0)

| Ruta App Router | Archivo |
|-----------------|---------|
| `/` | `(main)/page.tsx` |
| `/explorar` | `(main)/explorar/page.tsx` |
| `/explorar/[category]` | `(main)/explorar/[category]/page.tsx` |
| `/favoritos` | `(main)/favoritos/page.tsx` |
| `/perfil/[slug]` | `(main)/perfil/[slug]/page.tsx` |
| `/perfil/[slug]/comentarios` | `(main)/perfil/[slug]/comentarios/page.tsx` |
| `/ayuda` | `(main)/ayuda/page.tsx` |
| `/contacto` | `(main)/contacto/page.tsx` |
| `/terminos` | `(main)/terminos/page.tsx` |
| `/privacidad` | `(main)/privacidad/page.tsx` |
| `/sobre-nosotros` | `(main)/sobre-nosotros/page.tsx` |
| `/login` | `(auth)/login/page.tsx` |
| `/register` | `(auth)/register/page.tsx` |
| `/forgot-password` | `(auth)/forgot-password/page.tsx` **(nuevo)** |
| `/dashboard` … | `dashboard/**/page.tsx` |
| `/admin` … | `admin/**/page.tsx` |
| APIs | `/api/health`, `/api/contact`, `/api/notify`, `/api/payments/featured`, `/api/account/delete-request` |

---

## Matriz UI link × page × estado

| Href / destino | page existe | Estado post-fix |
|----------------|-------------|-------------------|
| `/` | ✅ | 200 |
| `/explorar` | ✅ | 200 |
| `/explorar/masajes` | ✅ | 200 (local; Vercel tras redeploy) |
| `/explorar/modelaje` | ✅ | 200 (local; Vercel tras redeploy) |
| `/explorar?category=*` | ✅ (query en ExplorarContent) | 200 |
| `/login` | ✅ | 200 |
| `/register` | ✅ | 200 |
| `/register?type=provider` | ✅ | 200 |
| `/register?role=provider` | redirect → `type=` | soft redirect |
| `/forgot-password` | ✅ **nuevo** | 200 (antes 404) |
| `/favoritos` | ✅ | 200 |
| `/ayuda`, `/contacto`, `/terminos`, `/privacidad`, `/sobre-nosotros` | ✅ | 200 |
| `/perfil/[slug]` | ✅ | 200 (mock/demo) |
| `/dashboard/*` | ✅ | 200 sin Supabase / redirect o 503 con auth prod |
| `/admin/*` | ✅ | idem |
| `/api/health` | ✅ | 200/503 |

### Header / Footer / Home

| Origen | Links categoría | OK |
|--------|-----------------|-----|
| Header | `/explorar`, `/explorar/masajes`, `/explorar/modelaje` | ✅ |
| Footer | mismos | ✅ |
| Home chips | `/explorar/{slug}` | ✅ |
| Home CTA profesional | `/register?type=provider` | ✅ |
| Sobre nosotros CTA | era `?role=` → **`?type=provider`** | ✅ fix |

---

## Bugs encontrados y fixes

| # | Bug | Severidad | Fix |
|---|-----|-----------|-----|
| 1 | Category routes 404 en Vercel (platform) | **P0** | Quitar `routes` de `vercel.json` + `generateStaticParams` |
| 2 | `/forgot-password` link en login sin page | **P1** | Nueva page + Supabase `resetPasswordForEmail` |
| 3 | `/register?role=provider` inconsistente | **P2** | href corregido + redirect soft en next.config |

---

## Crawl smoke (local, post-fix)

Ejecutar con `npm run dev` o `next start` tras build:

```bash
# Categorías (criterio de éxito)
curl -sI http://localhost:3000/explorar/masajes   # → 200
curl -sI http://localhost:3000/explorar/modelaje  # → 200
curl -sI http://localhost:3000/forgot-password    # → 200
curl -sI http://localhost:3000/api/health         # → 200|503
```

| Ruta | Esperado |
|------|----------|
| Públicas listadas arriba | 200 |
| `/dashboard`, `/admin` sin sesión + Supabase | 302 → `/login` o shell |
| `/dashboard`, `/admin` sin Supabase en prod build | 503 JSON (middleware) / 200 en dev mock |

---

## Residuales / notas deploy

1. **Tras push a `main`:** revalidar preview  
   `https://mi-page-git-main-datanalytics86s-projects.vercel.app/explorar/modelaje` → 200  
2. **Production** `mi-page-lake.vercel.app` puede seguir en commit viejo hasta Production Branch = `main`.  
3. **Vercel Authentication** en Preview puede exigir login del team (no es 404 de app).  
4. Si el dashboard de Vercel tiene **Root Directory = `frontend`**, el `builds` en root puede ser redundante; no reintroducir `routes` catch-all.

---

## QA checklist

- [x] type-check  
- [x] unit tests  
- [x] production build  
- [x] local category routes 200  
- [x] smoke E2E ampliado (masajes, modelaje, forgot-password)  

---

*Auditoría multiagente rutas 2026-07-31.*
