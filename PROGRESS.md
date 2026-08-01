# PROGRESS — MiPage

**Última actualización:** 2026-08-01 (landing/buttons QAQC multiagente)  
**Branch:** `main`  

---

## FASE Landing + Buttons QAQC (2026-08-01)

1. [x] Inventario landings + smoke preview/prod  
2. [x] Matriz botones/CTAs públicas (header/footer/home/explorar/auth/institucionales)  
3. [x] P0: quitar `vercel.json` routes catch-all (rompe `/perfil/[slug]`)  
4. [x] P0: `AuthGate` en dashboard + admin (sin shell privilegiado abierto)  
5. [x] Footer: Panel → `/login?redirect=/dashboard`; Sobre nosotros; emails legales  
6. [x] SSG perfiles mock + categorías en build  
7. [x] E2E smoke ampliado (chips, footer, institucionales, favoritos CTA)  
8. [x] `LANDING-BUTTONS-QA-REPORT.md`  
9. [ ] Redeploy Vercel Production Branch = `main` (ops)  
10. [ ] Revalidar preview post-deploy: `/perfil/valentina-reyes` = 200  

---

## FASE Route Audit (2026-07-31)

1. [x] Root cause `/explorar/[category]` 404 en Vercel (`vercel.json` routes catch-all)  
2. [x] `generateStaticParams` masajes/modelaje  
3. [x] `/forgot-password` page (link login ya no 404)  
4. [x] `register?role=` → `type=` consistency  
5. [x] `ROUTE-AUDIT-REPORT.md`  
6. [x] Preview categorías 200 (SSG); **re-abierto:** catch-all reintroducido y **re-eliminado** 2026-08-01  
7. [ ] Production Branch = `main` + smoke live  

---

## FASE 0 — Ops (dueño)

1. [ ] Vercel → **Production Branch = `main`** + redeploy  
2. [ ] Env Production: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
3. [ ] Migrations `002`–`006` en Supabase  
4. [ ] Verificar live: `html.dark`, `/explorar`, `/explorar/modelaje`, `/perfil/*`, `/api/health`  
5. [ ] (Opc.) Root Directory = `frontend` en Vercel UI  
6. [ ] (Opc.) Lighthouse mobile en dominio público  

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
| LH desktop ≥ 92 | ✅ **97/100/100/100** (lab previo) |
| LH mobile medido | ✅ **81/100/100/100** (lab) |
| Coverage crítica | ✅ ~**96%** lines · ~**81%** branches |
| Unit tests | ✅ **50** |
| Landing/buttons QA | ✅ ver `LANDING-BUTTONS-QA-REPORT.md` |
| type-check + tests + build | ✅ |
| E2E chromium smoke+critical | ✅ **31** pass / 5 skip auth |

---

## Lighthouse lab (cierre previo)

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

- `LANDING-BUTTONS-QA-REPORT.md` — matriz CTAs, HTTP, fixes P0/P1  
- `ROUTE-AUDIT-REPORT.md` — categorías Vercel  
- `QA-REPORT.md` — scores, tests, residuales  
- `UX-OPPORTUNITIES.md` — quick wins  
- `ADMIN-AUTOMATION.md` — bulk + flags + cola día  
