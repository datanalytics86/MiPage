# Architecture Decision Record — MiPage

**Fecha:** 2026-07-28  
**Estado:** Aceptada  
**Basado en:** `AUDIT-REPORT.md` (Agente 0)

---

## Decisión

**Supabase-first estricto.** Un solo path de producto:

```
[Usuario] → Next.js 14 (Vercel)
              ├─ Supabase Auth (sesiones, recovery)
              ├─ Supabase Postgres + RLS (datos)
              ├─ Supabase Storage (imágenes/video)
              ├─ Next.js Route Handlers (emails, health, webhooks, contact)
              └─ Supabase Dashboard (admin humano sin código)
```

El directorio `backend/` (Express + Prisma + `temp-db.json`) se **archiva** en `archive/2026-legacy/backend/`. No se despliega. No se instala en CI de producto.

---

## Contexto

| Evidencia forense | Implicación |
|-------------------|-------------|
| `vercel.json` solo construye `frontend/` | Express no está en producción live |
| Frontend no llama a Express | Dual-stack = deuda, no feature |
| Controllers usan `TempPrismaClient` / JSON | Backend no era Prisma real en runtime |
| Operador único (Nicolás) | Preferir Dashboard + RLS a ops de Node+Railway |

---

## Modelo de dominio (Supabase)

| Concepto producto | Tabla / mecanismo |
|-------------------|-------------------|
| Usuario | `auth.users` + `profiles` |
| Anuncio / listing | Fila `providers` (status: pending → approved/rejected) + `gallery` + `services` |
| Moderación | Admin actualiza `providers.status`, `rejection_reason`, `is_featured` |
| Metadata dinámica | `metadata_fields` + `provider_metadata` (JSON/valores) |
| CMS sitio | `site_settings` |
| Reportes | `reports` |
| Emails | Route Handler + Resend (opcional; no-op si falta API key) |
| Featured paid | Route Handler Mercado Pago (opcional; feature flag) |

**Nota:** No reintroducimos el modelo Prisma `Service` como listing independiente. El “aviso” del marketplace es el **perfil de proveedor** con fotos y servicios de menú.

---

## Diagrama simple

```
                 ┌─────────────────────┐
                 │   Vercel (Next.js)  │
                 │  App Router + MW    │
                 └──────────┬──────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
   ┌────────────┐   ┌──────────────┐   ┌─────────────┐
   │ Supabase   │   │ Supabase     │   │ Route       │
   │ Auth       │   │ Postgres+RLS │   │ Handlers    │
   └────────────┘   └──────┬───────┘   │ /api/*      │
                           │           └──────┬──────┘
                           ▼                  │
                    ┌──────────────┐          ▼
                    │ Storage      │   Resend / MP (opc.)
                    │ gallery      │
                    └──────────────┘
```

---

## Qué se mueve a Supabase

1. Auth, roles, sesiones — ya en Supabase.
2. CRUD providers/services/gallery/reviews/favorites/reports — ya en hooks.
3. Moderación admin — RLS + role `admin` (ya parcialmente).
4. Upload — Storage policies (migration 004) + validación client/server.
5. Metadata — nuevas migrations (no Prisma).
6. Emails / pagos — Edge-friendly Route Handlers, no Express.

## Qué se elimina del path activo

- Express, JWT propio, bcrypt local, Socket.io, Cloudinary-as-primary, temp-db, Prisma app runtime.
- Docs overclaiming (archivadas).
- Dependencias FE no usadas (o se reutilizan en wizard).

## Qué se conserva en archive

- Ideas de metadata / approval flow del schema Prisma (referencia histórica).
- Scripts seed Express (no canónicos; el seed canónico es `frontend/scripts/seed-demo.mjs` + SQL).

---

## Env canónico (frontend)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # solo server (seed, admin emails)
RESEND_API_KEY=                     # opcional
EMAIL_FROM=noreply@tudominio.cl     # opcional
MERCADOPAGO_ACCESS_TOKEN=           # opcional featured
NEXT_PUBLIC_APP_URL=https://...
SENTRY_DSN=                         # opcional
```

Prohibido en client bundle: service role, Resend, Mercado Pago secret.

---

## Middleware y seguridad

- Middleware **exige** env Supabase en producción; no no-op silencioso en prod.
- RBAC: `profiles.role` ∈ {user, provider, admin}.
- Headers: XFO, nosniff, referrer, permissions; añadir CSP básica + HSTS en prod.
- Upload: allowlist mime, max size, path `{provider_id}/...`, policies Storage.

---

## Operación single-admin (Nicolás)

| Tarea diaria | Dónde |
|--------------|--------|
| Aprobar/rechazar proveedores | `/admin/proveedores` |
| Featured | checkbox admin o pago MP |
| Metadata fields | `/admin/metadata` + tabla |
| Site settings | `/admin/configuracion` |
| Usuarios / roles | `/admin/usuarios` o Supabase Dashboard |
| Backup | Supabase PITR / daily backups (plan) |
| Health | `GET /api/health` |

Sin levantar Express ni SQLite.

---

## Migración desde archive/backend

No hay cutover de datos Express (temp-db no era prod). Live = Supabase. Si existieran datos Prisma históricos, import one-shot (fuera de scope).

---

## Consecuencias

**Positivas:** un stack, menos secrets, deploy simple, admin sin código, alineado con Vercel live.  
**Negativas:** features de PR #11 orientadas a Express hay que **portar** a Supabase (no merge ciego).  
**Riesgo mitigado:** no reintroducir `NEXT_PUBLIC_API_URL` hacia un backend Node.

---

## Criterio de “hecho” arquitectónico

- [x] Decisión documentada
- [x] `backend/` fuera del path activo (`archive/2026-legacy/backend/`)
- [x] Root package solo scripts → frontend (sin workspaces Express)
- [x] Env examples solo Supabase + opcionales
- [x] CI solo frontend + tests (Vitest + type-check + build)
- [x] README honesto refleja este ADR

**Actualizado:** 2026-07-29 (re-auditoría Agente 0 + cleanup residual).
