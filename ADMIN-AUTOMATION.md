# ADMIN-AUTOMATION — MiPage

**Fecha:** 2026-07-29  
**Operador objetivo:** un solo admin (sin código diario)  
**Meta checklist:** **≤ 8 minutos**  

---

## Mapa diario: antes → después

| Tarea | Antes | Después |
|-------|-------|---------|
| Ver pendientes | Filtro manual en lista | Banner **Cola del día** en `/admin` + link `?status=pending` |
| Priorizar riesgos | Todo igual | **Flags** automáticos (NO_PHOTOS, BIO_SPAM, etc.) + “Revisar primero” |
| Aprobar 5 avisos | 5 clics individuales | **Seleccionar pendientes** → **Aprobar lote** |
| Rechazar con motivo | Uno a uno + textarea | Lote + motivos predefinidos (o custom) |
| Reportes | Navegar a menú | CTA desde banner si hay pendientes |
| Salud del sitio | Manual | `GET /api/health` + script `npm run health` |
| Emails | Manual | Notify best-effort al approve/reject (Resend opcional) |

**Estimación tiempo diario (cola normal, ≤10 pendientes):** 5–8 min.

---

## Automatizaciones implementadas

### 1. Smart flags (human-in-the-loop)

Archivo: `frontend/src/lib/moderation.ts`

| Código | Severidad | Significado |
|--------|-----------|------------|
| NO_PHOTOS | high | Sin fotos |
| FEW_PHOTOS | warn | 1 foto |
| BIO_THIN | warn | Bio corta |
| BIO_SPAM | high | Enlaces/spam |
| CONTACT_IN_BIO | warn | WhatsApp/IG en bio |
| NO_CITY | warn | Sin ciudad |
| PRICE_ODD | info | Precio raro |
| CATEGORY_UNKNOWN | info | Categoría no estándar |

**Nunca auto-aprueba ni auto-rechaza.** Solo prioriza atención humana.

UI: badges en `/admin/proveedores`.

### 2. Bulk actions

En moderación:

- Checkbox por fila  
- “Seleccionar pendientes visibles”  
- **Aprobar lote** / **Rechazar lote** (usa motivo actual del form de rechazo o default)  
- Limpieza de selección  

### 3. Alerts en dashboard

`/admin` muestra tarjeta **Cola del día** si hay:

- proveedores `pending`  
- reportes `pending`  

CTA directo a moderación o reportes.  
Copy vía `summarizeAdminDay()`.

### 4. Deep-link filtro

`/admin/proveedores?status=pending` preselecciona filtro Pendiente.

### 5. Health & scripts

| Script | Uso |
|--------|-----|
| `npm run health` | Ping `/api/health` |
| `npm run backup-check` | Checklist backups Supabase |
| `npm run seed:demo` | Datos demo (service role) |
| validate-env en build | Prod Vercel exige secrets reales |

### 6. Rate limiting

`/api/notify` y `/api/contact` limitados por IP (in-memory) → menos abuso de emails/contacto.

### 7. Analytics accionables

Dashboard:

- Total usuarios  
- Proveedores aprobados  
- Reportes pendientes  
- Lista recientes + banner cola  

---

## Checklist diario actualizado (≤ 8 min)

| Min | Acción | Dónde |
|-----|--------|-------|
| 0:00 | Abrir Admin — leer **Cola del día** | `/admin` |
| 0:30 | Clic “Revisar pendientes” | `/admin/proveedores?status=pending` |
| 1:00 | Ordenar visualmente por badge **Revisar primero** / flags | Lista |
| 2:00 | Abrir **Fotos** en cada high-risk | Modal |
| 4:00 | Aprobar limpios en **lote** o uno a uno | Bulk / botones |
| 6:00 | Rechazar con motivo predefinido (lote o individual) | Bulk / modal |
| 7:00 | Reportes si el banner lo pide | `/admin/reportes` |
| 7:30 | (Opcional) Health en pestaña | `/api/health` |

**Semanal (extra ~10 min):** Configuración site settings, metadata fields, featured, backup-check.

---

## Qué se configura sin código

| Capacidad | Dónde |
|-----------|--------|
| Textos / banners / featured flags | Admin → Configuración / Moderación |
| Campos metadata dinámicos | Admin → Metadata |
| Roles (admin) | Supabase `profiles.role` o Admin usuarios |
| Motivos de rechazo | Chips predefinidos + texto libre |
| Emails transaccionales | Vercel `RESEND_API_KEY` + `EMAIL_FROM` |
| Featured pagos | `MERCADOPAGO_ACCESS_TOKEN` (opcional) |
| Secrets Supabase | Vercel env Production |

---

## Qué NO está automatizado (consciente)

- Detección de menores / deepfake / malware AV cloud  
- Rate limit multi-región (Redis)  
- Auto-feature por score de fotos  
- Slack/WhatsApp al admin (posible: webhook sobre `pending` count)  

---

## Checklist agentes C

| # | Agente | Estado |
|---|--------|--------|
| 1 | Daily workflow | Banner + deep-link ✅ |
| 2 | Smart moderation | Flags ✅ |
| 3 | Alerts | Cola del día ✅ |
| 4 | Bulk actions | Approve/reject lote ✅ |
| 5 | Health & scripts | Existentes + documentados ✅ |
| 6 | Admin analytics | Stats + summary ✅ |

---

*Un admin no debería necesitar abrir el repo para operar el día a día.*
