# ADMIN-GUIDE — MiPage (un solo administrador)

Guía ultra simple. **Sin código.** Objetivo: **≤ 8 minutos al día**.  
Detalle de automatización: **`ADMIN-AUTOMATION.md`**.

---

## Acceso

1. https://mi-page-lake.vercel.app/login (o tu dominio)  
2. Cuenta con `profiles.role = 'admin'`  
3. **Admin** → `/admin`

Si no entras: Supabase → Table Editor → `profiles` → `role = admin`.

---

## Checklist diario (≤ 8 minutos)

| Min | Tarea | Dónde | ☐ |
|-----|--------|--------|---|
| 0:00 | Leer **Cola del día** | `/admin` | |
| 0:30 | Ir a pendientes | Botón “Revisar N pendientes” o `/admin/proveedores?status=pending` | |
| 1:00 | Priorizar badges **Revisar primero** / flags rojos | Lista | |
| 2:00 | **Fotos** en cada caso dudoso | Preview grande | |
| 4:00 | **Aprobar** (individual o **lote**) | Botones / bulk bar | |
| 6:00 | **Rechazar** con motivo (chip o custom) | Modal / lote | |
| 7:00 | Reportes si el banner lo indica | `/admin/reportes` | |
| 7:30 | (Opc.) health | `/api/health` | |

### Semanal (~10 min extra)

- Site settings / textos → Configuración  
- Metadata fields nuevos → Metadata  
- Featured / destacados → menú ⋮ en moderación  
- `npm run backup-check` o Dashboard Supabase backups  

---

## Moderación (one-click + lote)

1. Filtro **Pendiente**  
2. Revisa flags automáticos (sugerencias, no decisiones):  
   - `NO_PHOTOS`, `BIO_SPAM` = prioridad alta  
   - `FEW_PHOTOS`, `BIO_THIN` = aviso  
3. **Fotos** → calidad, persona real, política  
4. Aprobar o rechazar  
5. **Lote:** “Seleccionar pendientes visibles” → Aprobar/Rechazar lote  

### Motivos de rechazo sugeridos

- Fotos borrosas / stock  
- Contenido no permitido  
- Spam / contacto engañoso  
- Categoría o ciudad incorrecta  
- Perfil incompleto  
- Menores → rechazo inmediato + suspensión  

Emails: si `RESEND_API_KEY` está en Vercel, el publisher recibe aviso. Si no, el rechazo igual se guarda.

---

## Metadata

1. Admin → **Metadata**  
2. Key `snake_case`, label, tipo, aplica a categoría  
3. Migration `006` debe estar aplicada en Supabase  

---

## Destacar (featured)

Moderación → ⋮ → **Destacar**  
Opcional: pago Mercado Pago (`/api/payments/featured`).

---

## Métricas

- Admin home: usuarios, proveedores activos, reportes  
- Cola del día: resumen en lenguaje natural  
- Health: `GET /api/health`  

---

## Borrado de datos (Ley 19.628)

1. Usuario autenticado → `POST /api/account/delete-request`  
2. Tabla `data_deletion_requests`  
3. Admin procesa en Supabase / proceso  

---

## Si algo se rompe

| Síntoma | Qué mirar |
|---------|-----------|
| Admin vacío | Env Supabase + rol admin |
| Upload falla | Bucket `gallery` + migration 004 |
| No aparecen perfiles nuevos | Siguen `pending` |
| Emails no salen | `RESEND_API_KEY` |
| Health 503 | Faltan `NEXT_PUBLIC_SUPABASE_*` reales en Production |

---

## No hagas esto

- No restaures `archive/2026-legacy/backend` en prod  
- No subas `.env` a git  
- No expongas `service_role` al browser  
- No apruebes sin mirar fotos en casos con flag **high**  

---

## Docs relacionadas

| Archivo | Uso |
|---------|-----|
| `ADMIN-AUTOMATION.md` | Automatizaciones y bulk |
| `QA-REPORT.md` | Calidad y residuales |
| `UX-OPPORTUNITIES.md` | Mejoras de fricción |
| `ARCHITECTURE-DECISION.md` | Supabase-first |
| `PROGRESS.md` | Estado del proyecto |
