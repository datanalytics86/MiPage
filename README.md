# MiPage

Marketplace web de servicios de **modelaje** y **masajes** (Chile), centrado en perfiles visuales y moderación humana.

**Live:** https://mi-page-lake.vercel.app  

> **Estado honesto (2026-07-29):** Supabase-first consolidado + **design system dark premium** (`DESIGN-SYSTEM.md`). Flujo publish → moderate → public en código. **No** es “100% completo”: faltan chat, app móvil, i18n, geo avanzada; Lighthouse ≥ 92 no medido en live; migration `006` + env de prod deben estar aplicados. Ver `AUDIT-REPORT.md`.

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
| Lighthouse ≥ 92 | Desktop local **98/100/96/100**; live prev **96/98/96/100**; mobile local thr. ~83 (revalidar en Vercel `main`) |
| npm audit 0 high (Next 14) | Parcheado a `14.2.35`; cierre total exige Next 16 (breaking) |
| Default branch | **`main`** (PR #12 mergeada) |

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

## Docs

| Archivo | Contenido |
|---------|-----------|
| `ARCHITECTURE-DECISION.md` | Por qué Supabase-first |
| `AUDIT-REPORT.md` | Auditoría forense (re-audit 2026-07-29) |
| `DESIGN-SYSTEM.md` | Tokens dark premium + componentes foto-first |
| `ADMIN-GUIDE.md` | Operación diaria (10 min) |
| `archive/2026-legacy/` | Docs y backend históricos |

---

## Licencia

MIT — ver `LICENSE`.
