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
| | `MERCADOPAGO_ACCESS_TOKEN` (pago Destacado; el botón sigue oculto sin token) |
| | `SENTRY_DSN` y `NEXT_PUBLIC_SENTRY_DSN` (errores; inerte sin DSN) |
| | `TURNSTILE_SECRET_KEY` y `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (las dos juntas) |
| | `SUPABASE_DB_URL` y `BACKUP_ENCRYPTION_KEY` (solo secretos de GitHub Actions) |

6. [ ] Supabase SQL, en este orden, con `supabase db push` desde `frontend/` (o el SQL Editor, archivo por archivo). `schema.sql` es la copia legible; el CLI no lo ejecuta. El baseline es esa misma copia.

| Orden | Archivo |
|-------|---------|
| 1 | `frontend/supabase/migrations/20240101000000_baseline.sql` |
| 2 | `frontend/supabase/migrations/20240102000002_site_settings_admin.sql` |
| 3 | `frontend/supabase/migrations/20240102000004_storage_gallery.sql` |
| 4 | `frontend/supabase/migrations/20240102000005_auto_provider_registration.sql` |
| 5 | `frontend/supabase/migrations/20240102000006_listings_metadata_moderation.sql` |
| 6 | `frontend/supabase/migrations/20240102000007_tier1_hardening.sql` |
| 7 | `frontend/supabase/migrations/20240102000008_tier1_admin.sql` |
| 8 | `frontend/supabase/migrations/20240102000009_tier1_product.sql` |

El SQL de 007, 008 y 009 no cambió: solo el nombre del archivo, para que el baseline quede primero. No ejecutes `frontend/supabase/seed/003_seed_demo_data.sql` en producción.

Si la base de producción ya tiene las tablas (el `schema.sql` viejo y 002, 004, 005, 006 pegados a mano), no vuelvas a correr el baseline ni esos cuatro archivos: `CREATE TABLE` fallaría. En ese caso pega solo `20240102000007`, `20240102000008` y `20240102000009`. Son idempotentes. Una base vacía sí usa `supabase db push` con los ocho archivos.

7. [ ] Smoke live (deben ser **200**, no 404 de Vercel):

```
/  /explorar  /explorar/masajes  /explorar/modelaje
/perfil/valentina-reyes  /login  /register  /api/health
```

`/api/health` → `200` solo si la consulta mínima a `providers` responde. `503` si faltan las variables, la consulta falla o tarda más de 4 segundos. El cuerpo trae `commit` (`VERCEL_GIT_COMMIT_SHA`) y `checks`. No incluye secretos.

## No tocar

- No reintroducir `vercel.json` `routes` catch-all (`/(.*)` → `frontend/$1`). Rompe `/perfil/[slug]`.
- No restaurar `archive/2026-legacy/backend` (Express/Prisma).
- No poner `service_role` en variables `NEXT_PUBLIC_*`.

## Si el deploy de `main` falla

Build local: `cd frontend && npm run type-check && npm test && npm run build`.  
Root Directory mal puesto es la causa #1 de 404 `/explorar`.

## Migraciones con Supabase CLI

Desde `frontend/`:

```
npx supabase db push
```

Eso aplica solo `frontend/supabase/migrations/`, en el orden de la tabla de arriba. Hace falta Docker para `supabase start` local. Sin Docker, el SQL se pega en el SQL Editor en ese mismo orden, cada archivo una vez. `schema.sql` no se vuelve a ejecutar si ya corriste el baseline.

Confirmación de correo en el `config.toml` local está apagada para que las pruebas RLS puedan iniciar sesión. En producción la confirmación queda encendida (tarea del dueño).

## Respaldo semanal

Workflow `.github/workflows/backup-weekly.yml` (lunes 06:00 UTC y manual). Si falta el secreto `SUPABASE_DB_URL`, termina en verde y no hace nada. Si está, exige `BACKUP_ENCRYPTION_KEY`, corre `pg_dump --no-owner --format=custom` y sube `mipage.dump.enc`.

Restaurar en una base vacía:

```
openssl enc -d -aes-256-cbc -pbkdf2 -in mipage.dump.enc -out mipage.dump
pg_restore --clean --if-exists --no-owner --dbname "$SUPABASE_DB_URL" mipage.dump
```

`npm run backup-check` solo imprime este recordatorio.

El cron de GitHub Actions solo corre en la rama por defecto, después del merge.

## Vigilancia

`.github/workflows/health-daily.yml` llama a `https://mi-page-lake.vercel.app/api/health` y falla si no es HTTP 200. También solo corre en la rama por defecto.

## Turnstile y Sentry

Sin claves, Turnstile no se muestra y el servidor no lo exige. Con solo el secreto, registro y contacto responden 400. Hay que poner `TURNSTILE_SECRET_KEY` y `NEXT_PUBLIC_TURNSTILE_SITE_KEY` juntas. La CSP ya permite `https://challenges.cloudflare.com`.

Sentry no instala `@sentry/nextjs`. Sin `SENTRY_DSN` o `NEXT_PUBLIC_SENTRY_DSN` no envía nada. Con DSN, el boundary de error hace un POST al store API.

## Destacado de pago: no implementado

Sigue la gestión manual con vencimiento y el botón de pago oculto si no hay token de Mercado Pago. Si más adelante se pide el cobro en línea, haría falta: tabla `payments`, webhook de Mercado Pago con validación de firma, activación automática con `featured_until` y una vista de pagos en `/admin`.

## Imágenes

`next.config.js` solo optimiza `*.supabase.co`. Las fotos de demostración en Unsplash dejan de pasar por `next/image`. No vuelvas a agregar `images.unsplash.com`, `api.dicebear.com` ni `res.cloudinary.com`.
