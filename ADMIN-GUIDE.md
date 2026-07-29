# ADMIN-GUIDE — MiPage (un solo administrador)

Guía ultra simple para **Nicolás**. Sin código. ~10 minutos al día.

---

## Acceso

1. Entra a https://mi-page-lake.vercel.app/login  
2. Usa la cuenta con rol `admin` en Supabase (`profiles.role = 'admin'`)  
3. Ve a **Admin** → `/admin`

Si no puedes entrar: Supabase Dashboard → Table Editor → `profiles` → pon `role = admin` en tu usuario.

---

## Checklist diario (10 minutos)

| # | Tarea | Dónde | Hecho |
|---|--------|--------|-------|
| 1 | Revisar **pendientes** de moderación | Admin → Moderación | ☐ |
| 2 | Abrir **Fotos** en cada pendiente | Preview modal | ☐ |
| 3 | **Aprobar** o **Rechazar** (con motivo) | Botones | ☐ |
| 4 | Revisar **reportes** nuevos | Admin → Reportes | ☐ |
| 5 | Mirar stats del dashboard | Admin home | ☐ |
| 6 | (Semanal) Site settings / textos | Admin → Configuración | ☐ |
| 7 | (Semanal) `npm run backup-check` o Dashboard backups | Supabase | ☐ |

---

## Cómo moderar un aviso

1. **Admin → Moderación**  
2. Filtra por estado **Pendiente**  
3. Clic **Fotos** → revisa imágenes (calidad, contenido sensible, rostro, texto)  
4. Si OK → **Aprobar** (queda público en Explorar)  
5. Si no → **Rechazar** → escribe motivo claro  
   - El publisher recibe email si `RESEND_API_KEY` está en Vercel  
   - Si no hay Resend, el rechazo igual se guarda en DB  

### Criterios sugeridos de rechazo

- Fotos borrosas / stock sin persona real  
- Contenido sexual explícito no permitido por política del sitio  
- Datos de contacto spam en la bio  
- Categoría incorrecta o ciudad inventada  
- Menores de edad (rechazo inmediato + suspensión)

---

## Cómo agregar campos metadata

1. **Admin → Metadata**  
2. Completa:
   - **Key:** `snake_case` (ej. `years_experience`)  
   - **Label:** texto visible  
   - **Tipo:** text / number / select / …  
   - **Aplica a:** masajes / modelaje / todas  
3. **Crear campo**  
4. El wizard de publicación (`/dashboard/avisos/nuevo`) usará defaults locales si la tabla no existe; con migration `006` lee de Supabase.

Si falla el insert: ejecuta `frontend/supabase/migrations/006_listings_metadata_moderation.sql` en el SQL Editor de Supabase.

---

## Destacar un perfil (featured)

- En Moderación → menú ⋮ → **Destacar**  
- Opcional pagos: endpoint `/api/payments/featured` (requiere `MERCADOPAGO_ACCESS_TOKEN`)

---

## Métricas en vivo

- Admin home: total usuarios, proveedores aprobados, reportes pendientes  
- Supabase Dashboard → Table Editor / Auth → users para detalle  
- Health: `https://TU_DOMINIO/api/health`

---

## Solicitudes de borrado de datos (Ley 19.628)

1. Usuario autenticado hace POST a `/api/account/delete-request`  
2. Aparece en tabla `data_deletion_requests` (Supabase)  
3. Admin procesa: anonimiza/borra perfil + storage y marca `completed`

---

## Si algo se rompe

| Síntoma | Qué mirar |
|---------|-----------|
| Admin vacío | Env Supabase en Vercel; rol admin |
| Upload falla | Bucket `gallery` + policies 004 |
| Nadie ve perfiles nuevos | Status sigue `pending` — falta aprobar |
| Emails no salen | `RESEND_API_KEY` + `EMAIL_FROM` |
| Health 503 | Faltan `NEXT_PUBLIC_SUPABASE_*` |

---

## No hagas esto

- No restaures `archive/2026-legacy/backend` en producción  
- No subas `.env` a git  
- No des `service_role` al frontend  
- No apruebes sin mirar las fotos  

---

## Contacto técnico

Repo: `datanalytics86/MiPage`  
ADR: `ARCHITECTURE-DECISION.md`  
Auditoría: `AUDIT-REPORT.md`
