# Deploy — MiPage (ops, 3 minutos)

Live actual: https://mi-page-lake.vercel.app  
Código bueno: `main` @ GitHub `datanalytics86/MiPage`.

**Estado 2026-08-16:** el dominio público sigue sirviendo el landing viejo (“neurosensorial”). `/explorar` en live responde **404 de plataforma**. MCP/CLI de esta sesión **no pueden** cambiar Production Branch (proyecto existe, API 403/404). Esto es un clic del dueño.

## Checklist (dueño, en orden)

1. [ ] Vercel → proyecto **mi-page** (o el que tenga el dominio `mi-page-lake.vercel.app`)
2. [ ] **Settings → Git → Production Branch = `main`**
3. [ ] **Settings → General → Root Directory = `frontend`**
4. [ ] **Deployments → … → Redeploy** del último commit de `main` (o *Promote* el preview de `main`)
5. [ ] Env **Production** (Settings → Environment Variables):

| Obligatorias | Opcionales |
|--------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `SUPABASE_SERVICE_ROLE_KEY` (seed / ops) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `RESEND_API_KEY` + `EMAIL_FROM` |
| `NEXT_PUBLIC_APP_URL=https://mi-page-lake.vercel.app` | `ADMIN_NOTIFY_EMAIL` (ping cola PENDING) |
| | `MERCADOPAGO_ACCESS_TOKEN` (pago Destacado) |

6. [ ] Supabase SQL: `frontend/supabase/schema.sql` y migrations **`002` → `006`**
7. [ ] Smoke live (deben ser **200**, no 404 de Vercel):

```
/  /explorar  /explorar/masajes  /explorar/modelaje
/perfil/valentina-reyes  /login  /register  /api/health
```

`/api/health` → `200` si hay env Supabase; `503` degradado (sin mocks) si faltan.

## No tocar

- No reintroducir `vercel.json` `routes` catch-all (`/(.*)` → `frontend/$1`). Rompe `/perfil/[slug]`.
- No restaurar `archive/2026-legacy/backend` (Express/Prisma).
- No poner `service_role` en variables `NEXT_PUBLIC_*`.

## Si el deploy de `main` falla

Build local: `cd frontend && npm run type-check && npm test && npm run build`.  
Root Directory mal puesto es la causa #1 de 404 `/explorar`.
