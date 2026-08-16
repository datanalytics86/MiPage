# MiPage

Marketplace web de servicios de **modelaje** y **masajes** (Chile), centrado en perfiles visuales y moderación humana.

**Live:** https://mi-page-lake.vercel.app  

> **Estado honesto (2026-08-16):** el código de `main` está listo para vender contactos (wizard → PENDING → admin → Explorar → WhatsApp). **Producción sigue desfasada** (landing “neurosensorial”, `/explorar` 404). El dueño debe poner Production Branch = `main`. Checklist: `DEPLOY.md`.

**Estética (branch `feat/tier1-tactile-sensory`):** dirección *Tactile Sensory Precision* — OKLCH, gold unificado, page-fold mark, grain en el suelo, sin emojis ni orbs. Ver `DESIGN-SYSTEM.md` y `TIER1-CRITIQUE.md`.

---

## Stack real

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 14 + TypeScript + Tailwind |
| Auth / DB / Storage / RLS | **Supabase** |
| Hosting | Vercel (`frontend/`) |
| Emails (opcional) | Resend vía `/api/notify` |
| Featured (opcional) | Mercado Pago vía `/api/payments/featured` |

El backend Express/Prisma/temp-db fue **archivado** en `archive/2026-legacy/backend/` (no se despliega).

---

## Qué funciona hoy

- Registro / login (Supabase Auth) con consentimiento **Ley 19.628**
- Explorar + perfiles + favoritos + reseñas (con Supabase configurado)
- Dashboard proveedor: perfil, servicios, galería, **wizard de aviso** (`/dashboard/avisos/nuevo`) → estado **PENDING**
- Admin: cola de proveedores, preview de fotos, approve/reject + motivo, featured, metadata fields, site settings
- Upload a Supabase Storage con validación de tipo/tamaño (bloquea `.exe`/`.php`, etc.)
- Health: `GET /api/health`
- Solicitud de borrado de datos: `POST /api/account/delete-request`
- Tests unitarios (Vitest) + smoke E2E (Playwright)

## Qué falta / es opcional

| Ítem | Estado |
|------|--------|
| Chat en tiempo real | No |
| App móvil | No |
| i18n / geolocalización fina | No |
| Resend en prod | Opcional (sin key = skip) |
| Mercado Pago featured | Opcional (501 sin token) |
| Cobertura E2E auth completa | Requiere credenciales seed |
| Lighthouse ≥ 92 | **Desktop local 98/100/100/100** ✅ · Mobile lab local Perf~81 (CPU 4×) · Live histórico 96/98/96/100 · Preview `main` deploy **success** (auth wall Vercel) |
| npm audit 0 high (Next 14) | Parcheado a `14.2.35`; cierre total exige Next 16 (breaking) |
| Default branch | **`main`** (PR #12 mergeada) |
| Vercel Production Branch | **Bloqueado en ops:** dueño debe apuntar a `main` + Root Directory `frontend`. Ver `DEPLOY.md` |

---

## Setup local

```bash
git clone https://github.com/datanalytics86/MiPage.git
cd MiPage/frontend
cp .env.local.example .env.local
# Completa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

### Supabase

1. Crea proyecto en https://supabase.com  
2. Ejecuta en orden: `frontend/supabase/schema.sql` y migrations `002`…`006`  
3. Crea buckets `gallery` y `avatars` (o usa `004_storage_gallery.sql`)  
4. (Opcional) `npm run seed:demo` con service role  

Guía de admin diario: **`ADMIN-GUIDE.md`**.

---

## Scripts

```bash
npm run dev           # desarrollo
npm run build         # build producción
npm run test          # unit tests
npm run test:ci       # unit + coverage thresholds
npm run test:e2e      # Playwright smoke
npm run type-check    # tsc --noEmit
npm run seed:demo     # datos demo
npm run health        # GET /api/health
npm run backup-check  # checklist backups PITR
```

---

## Flujo de negocio

1. Provider completa wizard → `providers.status = pending` + fotos en Storage  
2. Admin revisa en `/admin/proveedores` (preview fotos) → **Aprobar** o **Rechazar** (motivo + email si Resend)  
3. Aprobado → visible en explorar/perfil público  
4. Featured: admin flag o pago MP opcional  

---

## Seguridad

- RLS en Supabase; middleware RBAC para `/admin` y `/dashboard`  
- Headers: CSP, HSTS, X-Frame-Options, nosniff  
- No secrets en client bundle (service role solo server)  
- `backend/.env` legacy eliminado del tree activo  

---

## Deploy

- Vercel apunta a monorepo root con build del frontend (`vercel.json`)  
- **Solo `main`** debe ser production (CI lo documenta)  
- Variables en Vercel: las de `.env.example`  

---

## Changelog estético (2026-08-16)

- Tokens a OKLCH; gold unificado (`oklch(0.78 0.09 88)`)
- Radios variables (`tight` / `control` / `photo` / `panel`)
- Brand: page-fold + dog-ear gold (`BrandMark`)
- Hero editorial (sin orbs, sin emojis)
- Motion: spring cards, stagger `.reveal`, View Transition en la marca, `prefers-reduced-motion`
- Grain en el suelo de la página, nunca sobre fotos

---

## Docs

| Archivo | Contenido |
|---------|-----------|
| `ARCHITECTURE-DECISION.md` | Por qué Supabase-first |
| `AUDIT-REPORT.md` | Auditoría forense (re-audit 2026-07-29) |
| `DESIGN-SYSTEM.md` | Tokens OKLCH + photo-first |
| `TIER1-CRITIQUE.md` | Rounds de critique estético |
| `ADMIN-GUIDE.md` | Operación diaria (10 min) |
| `DEPLOY.md` | Checklist Vercel / env / migrations |
| `archive/2026-legacy/` | Docs y backend históricos |

---

## Licencia

MIT — ver `LICENSE`.
