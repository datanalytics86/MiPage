# PROGRESS — MiPage

**Última actualización:** 2026-07-31 (route audit + Vercel category 404 fix)  
**Branch:** `main`  

---

## FASE Route Audit (2026-07-31)

1. [x] Root cause `/explorar/[category]` 404 en Vercel (`vercel.json` routes catch-all)  
2. [x] `generateStaticParams` masajes/modelaje  
3. [x] `/forgot-password` page (link login ya no 404)  
4. [x] `register?role=` → `type=` consistency  
5. [x] `ROUTE-AUDIT-REPORT.md`  
6. [ ] Revalidar preview Vercel tras deploy: `/explorar/modelaje` = 200  
7. [ ] Production Branch = `main` + smoke live  

---

## FASE 0 — Ops (dueño)

1. [ ] Vercel → **Production Branch = `main`** + redeploy  
2. [ ] Env Production: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
3. [ ] Migrations `002`–`006` en Supabase  
4. [ ] Verificar live: `html.dark`, `/explorar`, `/explorar/modelaje`, `/api/health`  
5. [ ] (Opc.) Lighthouse mobile en dominio público  

---

## Criterios de éxito (cierre completo)

| Criterio | Estado |
|----------|--------|
| `<img>` residual crítico | ✅ 0 en `src` |
| Skeletons unificados | ✅ |
| WhatsApp prefill | ✅ |
| Empty favoritos premium | ✅ |
| Copy rechazo empático | ✅ |
| Chips filtros mobile | ✅ |
| PENDING dashboard hint | ✅ |
| E2E auth documentado (`E2E_*` en `.env.example`) | ✅ |
| LH desktop ≥ 92 | ✅ **97/100/100/100** |
| LH mobile medido | ✅ **81/100/100/100** (lab) |
| Coverage crítica | ✅ ~**96%** lines · ~**81%** branches |
| Unit tests | ✅ **50** |
| QA / UX / PROGRESS actualizados | ✅ |
| type-check + tests + build | ✅ |

---

## Lighthouse lab (cierre)

| | Perf | A11y | BP | SEO |
|--|------|------|-----|-----|
| Desktop | 97 | 100 | 100 | 100 |
| Mobile | 81 | 100 | 100 | 100 |

Mobile Perf residual: LCP lab throttled; revalidar en edge post Production=`main`.

---

## E2E

```bash
# Sin creds: gates públicos + skip auth
cd frontend && npm run test:e2e:critical

# Con auth (frontend/.env.local o shell):
# E2E_PROVIDER_EMAIL / E2E_PROVIDER_PASSWORD
# E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD
```

---

## Reportes

- `QA-REPORT.md` — scores, tests, residuales  
- `UX-OPPORTUNITIES.md` — quick wins marcados  
- `ADMIN-AUTOMATION.md` — bulk + flags + cola día  
