# PROGRESS — MiPage Tier-1 Continuous

**Última actualización:** 2026-07-29  
**Default branch:** `main`  
**HEAD:** ver `git log -1`  
**PR #12:** MERGED (2026-07-29) → https://github.com/datanalytics86/MiPage/pull/12  
**Release:** https://github.com/datanalytics86/MiPage/releases/tag/v1.1.0-tier1  

---

## Criterios de éxito final

| Criterio | Estado |
|----------|--------|
| Dark premium en toda la app | **Hecho** (`html.dark`, tokens Lust, dashboard/admin dark) |
| PhotoGrid, GalleryLightbox, Skeleton, EmptyState, ErrorState | **Hecho** e integrados |
| Lighthouse ≥ 92 (4 categorías) | **Desktop local: 97/100/100/100**. Live viejo: 96/98/96/100. Mobile lab localhost ~81. **Re-medir preview/prod Vercel tras fix de deploy** |
| E2E 5 flujos | **36 passed**, 4 skipped (creds E2E_*) |
| Panel Admin solo-admin | **Hecho** |
| ADMIN-GUIDE | **Hecho** |
| PR #12 + `main` limpia | **Hecho** |
| PRs Express cerradas | **Hecho** (#2–#11) |
| Type-check + tests + build | **Verde** (CI main SUCCESS) |
| Vercel Production → `main` | **Pendiente manual** (prod aún en `3576437`) |
| Migrations 002–006 en Supabase prod | **Pendiente manual** |
| Live refleja código nuevo (dark) | **Pendiente** (live sin `class=dark`; deploys preview fallaban por env) |

---

## FASE 0 — Completada

- [x] PR #12 mergeada a `main`
- [x] Default branch = `main`
- [x] PRs legacy cerradas
- [x] Higiene ESLint / dual-stack archive
- [x] CI verde en `main`

## FASE 1–3 — Completadas en código

- Dark premium + design system
- RSC home, next/font, photo-first
- E2E + unit tests
- Lighthouse desktop ≥ 92

## FASE 4 — Ops + fix deploy Vercel (esta iteración)

### Problema encontrado

Los **Preview deploys de `main` fallaban** en Vercel. Causa: `validate-env.mjs` trataba `VERCEL=1` como producción estricta y hacía `exit 1` si faltaban `NEXT_PUBLIC_SUPABASE_*` (común en Preview si los secrets solo están en Production).

### Fix aplicado

- `validate-env.mjs`: Preview/CI → placeholders + warn; **Production** Vercel → requiere secrets reales.
- Header sin framer-motion (menos JS mobile).
- Push a `main` para reintentar deploy automático.

### Checklist manual Vercel (dueño del proyecto)

1. Vercel → **mi-page** → Settings → Git → **Production Branch = `main`**
2. Settings → Environment Variables → asegurar `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` en **Production** (y Preview si quieres data real en previews)
3. Redeploy Production desde el último commit de `main`
4. Supabase SQL Editor: `frontend/supabase/schema.sql` + migrations `002`…`006`
5. Verificar live: `html.dark`, `/api/health`, admin login

---

## Lighthouse (lab)

| Target | Perf | A11y | BP | SEO |
|--------|------|------|-----|-----|
| Desktop local (Tier-1) | 97 | 100 | 100 | 100 |
| Live `mi-page-lake` (commit viejo) | 96 | 98 | 96 | 100 |
| Mobile local throttled | ~81 | 100 | 100 | 100 |

---

*No declarar “live Tier-1” hasta Production en `main` con dark visible y health 200.*
