# MiPage

Marketplace web de servicios de modelaje y masajes (Chile). Perfiles visuales, moderación humana y textos en español.

Sitio público: https://mi-page-lake.vercel.app

El 2026-11-11, `/`, `/explorar` y `/login` respondieron 200. `/api/health` en ese sitio respondió `version` 1.0.0, sin el campo `database`. Eso es lo que sirve `main` hoy. Esta rama todavía no está en producción: aquí el health consulta `providers` y responde 503 si la base no contesta.

## Stack

| Capa | Tecnología |
|------|------------|
| App | Next.js 16.4.6 (App Router) + React 19 + TypeScript + Tailwind |
| Node | `>=20.9.0` |
| Auth, Postgres, Storage, RLS | Supabase |
| Hosting | Vercel, Root Directory `frontend` |
| Correo | Resend, solo en servidor y solo si hay `RESEND_API_KEY` |
| Errores | Aviso a Sentry solo si hay DSN. Sin SDK de `@sentry/nextjs` |
| Anti-bots | Cloudflare Turnstile, apagado si faltan las dos claves |

El backend Express/Prisma está en `archive/2026-legacy/` y no se despliega.

## Qué hace este código

- Registro e inicio de sesión con Supabase. El alta de profesional pide declaración de 18 años cuando el registro está abierto.
- Explorar con paginación, perfiles públicos renderizados en el servidor y sitemap de perfiles aprobados.
- Wizard de aviso en un solo paso de base (`submit_provider_listing`). El aviso queda `pending`.
- Panel `/admin` para moderar, destacar con vencimiento, usuarios, reportes, reseñas, mensajes, borrados, catálogo, textos y mantenimiento.
- Fotos de galería subidas como archivo: se les quita EXIF antes de guardarlas. Una URL pegada no se vuelve a codificar.
- `/api/health` consulta la base. El cron diario vive en `.github/workflows/health-daily.yml` y solo corre cuando el workflow está en la rama por defecto.
- Destacado de pago en línea no está implementado. El botón se oculta si no hay token de Mercado Pago.

## Qué no hace

- Chat en vivo, app nativa, ni cobro automático del Destacado.
- No envía correo a un destinatario elegido por el cliente. `/api/notify` ya no reenvía mail.
- No hay métricas de Lighthouse medidas sobre esta rama en producción.

## Arranque local

Hace falta Node 20.9 o mayor.

```bash
git clone https://github.com/datanalytics86/MiPage.git
cd MiPage/frontend
# Copia el ejemplo de la raíz. No tiene contraseñas.
# Windows: copy ..\.env.example .env.local
# bash: cp ../.env.example .env.local
npm install
npm run dev
```

Completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. El resto está comentado en `.env.example`.

Base local (hace falta Docker):

```bash
npx supabase start
npx supabase db reset
```

Eso aplica `frontend/supabase/migrations/` en orden. No carga el seed demo. El archivo `frontend/supabase/seed/003_seed_demo_data.sql` es manual y no va a producción.

Sin Docker, el orden de SQL está en `DEPLOY.md`.

El primer admin, con la cuenta ya registrada:

```bash
npm run admin:create -- tu-correo@dominio.cl
```

## Scripts (desde `frontend/`)

```bash
npm run dev
npm run lint
npm run type-check
npm run test:ci
npm run build
npm run test:e2e:critical
npm run admin:create -- tu-correo@dominio.cl
npm run health
npm run backup-check
```

`npm audit --omit=dev --audit-level=high` es bloqueante en CI.

## Flujo

1. El profesional envía el aviso. Queda pendiente. Las fotos de archivo salen sin EXIF.
2. El admin aprueba o rechaza en `/admin/proveedores`.
3. Aprobado, el perfil se ve en Explorar y en `/perfil/[slug]`.
4. Destacar es manual, con fecha de término, desde el mismo panel.

## Documentos

| Archivo | Para qué |
|---------|----------|
| `DEPLOY.md` | Puesta en marcha y actualización |
| `ADMIN-GUIDE.md` | El día a día en `/admin` |
| `DESIGN-SYSTEM.md` | OKLCH, oro, sin emojis |
| `ARCHITECTURE-DECISION.md` | Por qué Supabase |
| `CONTRIBUTING.md` | Cómo cambiar el código |
| `archive/reports/` | Informes viejos |

Licencia MIT. Ver `LICENSE`.
