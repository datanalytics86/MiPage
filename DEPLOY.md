# Deploy — MiPage

Sitio: https://mi-page-lake.vercel.app  
Repositorio: `datanalytics86/MiPage`. Producción es la rama `main`. Root Directory en Vercel: `frontend`.

## Qué responde el sitio hoy

Comprobado el 2026-11-11, sin cambiar nada en la base:

- `/`, `/explorar` y `/login` respondieron HTTP 200.
- `/api/health` respondió `status: ok`, `version: 1.0.0`, y `checks` con `supabase_env`, `resend`, `mercadopago` y `sentry`. No trae `database` ni `commit`.

Ese health es el de `main` anterior a esta pila. Cuando esta pila esté mergeada y desplegada, `/api/health` responde 200 solo si la consulta mínima a `providers` funciona. Si faltan las variables, la consulta falla o tarda más de 4 segundos, responde 503. El cuerpo trae `commit` (`VERCEL_GIT_COMMIT_SHA`) y `checks`. No incluye secretos.

No mergear el frontend de las fases 1 a 4 antes de aplicar las migraciones que cada PR nombra. El orden es migración, luego frontend, luego smoke.

## Actualizar esta pila

1. Confirmar que el proyecto de Supabase está activo.
2. Si la base ya tiene las tablas (schema viejo y 002, 004, 005, 006 pegados a mano), no correr el baseline. Pegar solo:
   - `frontend/supabase/migrations/20240102000007_tier1_hardening.sql`
   - `frontend/supabase/migrations/20240102000008_tier1_admin.sql`
   - `frontend/supabase/migrations/20240102000009_tier1_product.sql`
3. Si la base está vacía, desde `frontend/`: `npx supabase db push` (los ocho archivos de la tabla de abajo).
4. No ejecutar `frontend/supabase/seed/003_seed_demo_data.sql`.
5. Mergear a `main` en el orden de los PR y esperar el deploy de Vercel.
6. Smoke: `/`, `/explorar`, `/login`, `/register`, `/contacto`, un perfil aprobado si existe, `GET /api/health` (200 y `checks.database: true`).

## Desde cero

1. Proyecto nuevo en Supabase.
2. Vercel, repositorio `datanalytics86/MiPage`, Production Branch `main`, Root Directory `frontend`.
3. Variables de la tabla de abajo.
4. Desde `frontend/`, `npx supabase db push`, o el SQL Editor en el orden de la tabla.
5. Auth, en el apartado siguiente.
6. Alguien se registra. Luego: `npm run admin:create -- tu-correo@dominio.cl`.
7. Redeploy y el smoke de arriba.

## Auth (Supabase)

- Site URL: `https://mi-page-lake.vercel.app` (o el dominio propio).
- Redirect URLs: `https://mi-page-lake.vercel.app/auth/callback` y `https://mi-page-lake.vercel.app/auth/update-password`. En local, `config.toml` ya incluye `http://127.0.0.1:3000/auth/callback` y `http://127.0.0.1:3000/auth/update-password`.
- Confirmación de correo encendida en producción. En local está apagada para que las pruebas RLS puedan iniciar sesión.
- Protección de contraseñas filtradas encendida.
- SMTP propio (Resend), para no depender del cupo del correo integrado.

## Variables

La lista única, sin contraseñas, es `.env.example` en la raíz. Se copia a `frontend/.env.local`.

| Dónde | Obligatorias | Opcionales |
|-------|----------------|------------|
| Vercel Production | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL` | `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL`, `MERCADOPAGO_ACCESS_TOKEN`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` |
| GitHub Actions | | `SUPABASE_DB_URL`, `BACKUP_ENCRYPTION_KEY` |

`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL` y `BACKUP_ENCRYPTION_KEY` nunca van en `NEXT_PUBLIC_*`.

Turnstile: las dos claves juntas. Con solo el secreto, registro y contacto responden 400. Sin ninguna, el widget no aparece y el servidor no lo exige.

Sentry: sin DSN no se envía nada. No está instalado `@sentry/nextjs`.

## Migraciones

Desde `frontend/`:

```bash
npx supabase db push
```

El CLI solo lee `frontend/supabase/migrations/`. `schema.sql` es la copia legible y no se ejecuta. Hace falta Docker para `supabase start`. Sin Docker, se pega cada archivo una vez en el SQL Editor.

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

El SQL de 007, 008 y 009 no cambió al renombrarlos. Son idempotentes. En una base que ya tiene tablas, el baseline (`CREATE TABLE`) falla: usar el paso 2 de "Actualizar esta pila".

`config.toml` no siembra datos demo. El seed vive en `frontend/supabase/seed/` y no forma parte de las migraciones.

## Respaldo semanal

`.github/workflows/backup-weekly.yml` (lunes 06:00 UTC y manual). Sin `SUPABASE_DB_URL` termina en verde y no hace nada. Con URL exige `BACKUP_ENCRYPTION_KEY`, corre `pg_dump --no-owner --format=custom` y sube `mipage.dump.enc` (retención 14 días).

Restaurar en una base vacía:

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -in mipage.dump.enc -out mipage.dump
pg_restore --clean --if-exists --no-owner --dbname "$SUPABASE_DB_URL" mipage.dump
```

`npm run backup-check` solo imprime este recordatorio. El cron de GitHub Actions corre en la rama por defecto, después del merge.

## Vigilancia

`.github/workflows/health-daily.yml` llama a `https://mi-page-lake.vercel.app/api/health` y falla si no es HTTP 200. También solo corre en la rama por defecto. Hasta que esta pila esté en `main`, ese check mira el health viejo.

## Destacado de pago: no implementado

Sigue la gestión manual con vencimiento y el botón de pago oculto si no hay token de Mercado Pago. Si más adelante se pide el cobro en línea, haría falta: tabla `payments`, webhook de Mercado Pago con validación de firma, activación automática con `featured_until` y una vista de pagos en `/admin`.

## Imágenes

`next.config.js` solo optimiza `*.supabase.co`. No vuelvas a agregar `images.unsplash.com`, `api.dicebear.com` ni `res.cloudinary.com`. Las fotos de demostración que apunten a Unsplash dejan de pasar por `next/image`.

## No tocar

- No reintroducir en `vercel.json` un `routes` catch-all (`/(.*)` hacia `frontend/$1`). Rompe `/perfil/[slug]`.
- No restaurar `archive/2026-legacy/backend`.
- No poner `service_role` en variables `NEXT_PUBLIC_*`.
- No bajar los umbrales de cobertura ni saltarse `npm run test:ci`.

## Si el build falla

Desde `frontend/`: `npm run lint`, `npm run type-check`, `npm run test:ci`, `npm run build`. La causa habitual de un 404 de plataforma en `/explorar` es un Root Directory distinto de `frontend`.
