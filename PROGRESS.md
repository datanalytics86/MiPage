# PROGRESS — MiPage

**Última actualización:** 2026-07-29 (cierre visual/UX residual)  
**Branch:** `main`  

---

## FASE 0 — Ops (dueño del proyecto)

Production en Vercel **aún puede estar en commit viejo** (`3576437`). Checklist exacto:

1. [ ] Vercel → proyecto **mi-page** → **Settings → Git → Production Branch = `main`**
2. [ ] **Redeploy** Production desde el último commit de `main`
3. [ ] Env **Production**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (opcional) `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (solo server)
4. [ ] Supabase SQL Editor: `frontend/supabase/schema.sql` + migrations `002` … `006`
5. [ ] Verificar live:
   - HTML con `class="… dark …"`
   - `GET /api/health` → 200 o 503 con checks
   - `/explorar` carga

> El código en `main` ya está listo; sin este paso el **live público no refleja Tier-1**.

---

## Criterios de éxito (cierre)

| Criterio | Estado |
|----------|--------|
| next/image en residuales `<img>` | ✅ galería, admin preview, reseñas, comentarios, wizard (blob unoptimized) |
| Skeletons unificados | ✅ home, explorar, favoritos, admin listas, dashboard galería |
| WhatsApp prefill MiPage | ✅ `lib/whatsapp.ts` + perfil |
| Empty favoritos premium | ✅ |
| Reject copy empático | ✅ motivos con “qué corregir” |
| Lighthouse desktop ≥ 92 | ✅ **97 / 100 / 100 / 100** (lab cierre) |
| Lighthouse mobile | **81 / 100 / 100 / 100** lab (CPU 4× localhost). Causa: LCP texto ~5s en throttling; en edge suele mejorar (histórico live 96). Falta revalidar tras Production=`main`. |
| type-check / tests / build | ✅ 45 unit tests, coverage crítica ~94% |
| Docs PROGRESS / DESIGN-SYSTEM | ✅ |

---

## Commits recientes relevantes

- Pipeline 20 agentes: QA-REPORT, UX-OPPORTUNITIES, ADMIN-AUTOMATION, bulk, flags  
- Cierre: visual next/image + skeletons + UX residuales (este push)  

---

## Comandos

```bash
cd frontend
npm run type-check
npm run test:ci
npm run build
```
