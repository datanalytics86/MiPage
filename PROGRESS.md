# PROGRESS — MiPage

**Última actualización:** 2026-08-16 (MVP vendible + solo-admin)  
**Branch:** `main`  

---

## FASE MVP vendible (2026-08-16)

1. [x] `vercel.json` sin catch-all (confirmado: solo `$schema`)
2. [x] `DEPLOY.md` — qué falta en Vercel (Production Branch, Root Directory, env, migrations)
3. [x] Mocks de catálogo **solo en `development`** sin Supabase; prod vacío / 503 honesto
4. [x] Stats públicas: números reales de Supabase o "—"
5. [x] Copy sin luxury overhyped / sin métricas inventadas (home + sobre-nosotros)
6. [x] Empty state Explorar: limpiar filtros + publicar aviso
7. [x] Reseñas de `/perfil/[slug]/comentarios` leen Supabase (login gate)
8. [x] WhatsApp CTA solo si hay número válido + prefill
9. [x] Admin: badge pendientes en layout + sort riesgo/fecha
10. [x] Destacado: copy provider + 501 MP en español + notify admin (`ADMIN_NOTIFY_EMAIL`)
11. [ ] **Dueño:** Production Branch = `main` + env + migrations 002–006 (`DEPLOY.md`)
12. [ ] **Dueño:** seed de 6–10 providers reales y aprobarlos

---

## FASE Landing + Buttons QAQC (2026-08-01)

1. [x] Inventario landings + smoke preview/prod  
2. [x] Matriz botones/CTAs públicas  
3. [x] P0: quitar `vercel.json` routes catch-all  
4. [x] `AuthGate` en dashboard + admin  
5. [x] Footer / SSG / E2E  
6. [ ] Redeploy Vercel Production Branch = `main` (**sigue pendiente del dueño**)

---

## Criterios de éxito

| Criterio | Estado |
|----------|--------|
| Copy público honesto | ✅ sin 500+ / neurosensorial en `src` |
| WhatsApp prefill | ✅ |
| Empty explorar accionable | ✅ |
| PENDING dashboard + wizard 3 fotos | ✅ |
| Admin cola + flags + bulk + fotos | ✅ |
| Badge pendientes siempre visible | ✅ |
| Featured toggle + degrade MP | ✅ |
| Mocks en prod | ✅ bloqueados (`allowMockCatalog`) |
| Production = `main` | ❌ ops dueño |
| Lighthouse desktop ≥ 90 | ⚠ lab previo 97; **no re-medido en live** (live desfasado) |

---

## E2E

```bash
cd frontend && npm run test:e2e:critical
```
