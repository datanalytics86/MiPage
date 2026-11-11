# grok.11.11.2026 — MiPage a Tier 1, autogestionable por un solo administrador

**Para:** Grok (agente de código con acceso al repo `datanalytics86/MiPage`)
**De:** auditoría del 2026-11-11 sobre `main` @ `bcc35e3`
**Objetivo:** dejar el sitio en estado *Tier 1*: seguro, desplegable sin sorpresas y operable al 100 % por el dueño desde `/admin`, sin abrir Supabase, Vercel ni el repo para el día a día.

Lee este documento completo antes de tocar código. Las fases van en orden de prioridad: **no empieces la Fase 2 sin cerrar la Fase 1**.

---

## 1. Contexto del proyecto

- Marketplace chileno de servicios de **modelaje** y **masajes**. Proveedor publica aviso → queda `pending` → admin aprueba/rechaza → visible en `/explorar` → contacto por WhatsApp.
- Stack: Next.js 14.2.35 (App Router) + TypeScript + Tailwind en `frontend/`; Supabase (Auth, Postgres, Storage, RLS); hosting Vercel con Root Directory `frontend`.
- Emails opcionales por Resend (`/api/notify`), pago de "Destacado" opcional por Mercado Pago (`/api/payments/featured`).
- `archive/2026-legacy/` es un backend Express muerto. **No lo toques ni lo restaures.**
- SQL: `frontend/supabase/schema.sql` + `frontend/supabase/migrations/002…006` (se pegan a mano en el SQL Editor; no hay Supabase CLI configurado).

## 2. Estado verificado hoy (2026-11-11)

Pasan en local sobre `main`: `npm run lint` (1 warning), `npm run type-check`, `npm run test:ci` (56 tests, 96 % líneas), `npm run build`.

Producción (`https://mi-page-lake.vercel.app`): `/`, `/explorar`, `/explorar/masajes`, `/perfil/valentina-reyes`, `/login`, `/register`, `/sitemap.xml`, `/api/health` responden **200**; `/admin` y `/dashboard` redirigen (307) a login. El HTML servido es el de `main` actual.

Consecuencias:

1. **La documentación está desfasada.** `README.md`, `DEPLOY.md` y `PROGRESS.md` dicen que producción sirve el landing viejo y que `/explorar` da 404. Ya no es cierto. Hay que corregirlos (Fase 5).
2. **El deploy no es el bloqueo. La seguridad de la base de datos sí.** Ver Fase 1.
3. **Sin verificar:** desde el entorno de auditoría el host de Supabase que usa el bundle de producción no respondió (502 / timeout), mientras que `supabase.com` sí. No se pudo distinguir entre bloqueo de red del entorno y proyecto pausado o eliminado. `/api/health` devuelve `ok` solo porque comprueba que las variables existen, no que la base responda. **Paso 0 del dueño** (sección 9): confirmar que el proyecto Supabase está activo.

`npm audit --omit=dev`: `next@14.2.35` arrastra avisos **críticos** y altos (DoS, cache poisoning, SSRF, XSS con nonces, bypass de middleware, entre otros); el arreglo que propone npm es subir de versión mayor. También altos en `postcss`, `nanoid`, `source-map-js`, `zod`.

---

## 3. Reglas de trabajo (obligatorias)

1. Trabaja en ramas `tier1/<fase>-<tema>` y abre un PR por fase contra `main`. No hagas push directo a `main`. No hagas merge tú: el dueño revisa y mergea.
2. Antes de cada commit, dentro de `frontend/`: `npm run lint && npm run type-check && npm run test:ci && npm run build`. Si algo falla, arréglalo; no lo saltes ni bajes umbrales de cobertura.
3. Nunca desactives, borres ni marques `skip` un test para ponerlo en verde.
4. Ningún secreto en el repo ni en variables `NEXT_PUBLIC_*`. `SUPABASE_SERVICE_ROLE_KEY` solo en código de servidor (route handlers), nunca importado desde un componente cliente.
5. Todo cambio de base de datos va en **migraciones nuevas e idempotentes** (`007_…`, `008_…`), que se puedan ejecutar dos veces sin error (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`, `CREATE OR REPLACE`). No edites `schema.sql` ni las migraciones 002–006 salvo donde este documento lo pide explícitamente.
6. No ejecutes nada contra la base de producción. Tú escribes el SQL; el dueño lo aplica (sección 9).
7. Orden de despliegue: **primero la migración, después el frontend** que depende de ella. Cada PR debe decir en su descripción qué migración requiere.
8. No inventes datos: nada de métricas falsas, perfiles demo en producción ni textos legales con afirmaciones que el código no cumple.
9. Mantén la dirección visual actual (`DESIGN-SYSTEM.md`): oscuro, OKLCH, dorado único, foto primero, sin emojis. No rediseñes.
10. Todo el texto de interfaz en español de Chile.
11. Si una instrucción de este documento choca con lo que encuentras en el código, **detente en ese punto, explica el choque en el PR y sigue con el resto**. No improvises un cambio de alcance.
12. Al terminar cada fase, entrega el reporte de la sección 10.

---

## 4. FASE 1 — Seguridad crítica (bloquea todo lo demás)

Todo lo de esta fase está verificado leyendo el código. Cualquier persona con una cuenta gratuita y la consola del navegador puede explotar los puntos 1.1–1.4 hoy.

### 1.1 Cualquiera puede hacerse administrador

- `frontend/supabase/schema.sql:351-363` — `handle_new_user()` copia el rol desde `raw_user_meta_data->>'role'`, que controla el cliente. Registrarse con `options.data.role = 'admin'` crea un admin.
- `schema.sql:41-43` — la política `"Users can update own profile"` no restringe columnas ni tiene `WITH CHECK`. Cualquier usuario puede ejecutar `update profiles set role = 'admin' where id = <su id>`.
- El propio frontend escribe el rol desde el cliente: `frontend/src/contexts/AuthContext.tsx:190-196` y `frontend/src/app/dashboard/avisos/nuevo/page.tsx:208`.

**Qué hacer (migración `007_tier1_hardening.sql`):**

- Función `public.is_admin()` `SECURITY DEFINER`, `STABLE`, `SET search_path = public`, que devuelve si `auth.uid()` tiene `role = 'admin'`. Úsala en **todas** las políticas en lugar del `EXISTS (SELECT 1 FROM profiles …)` repetido. Es obligatorio antes de restringir el `SELECT` de `profiles` (1.3); de lo contrario las políticas de `profiles` que consultan `profiles` entran en recursión.
- `handle_new_user()`: aceptar solo `'user'` o `'provider'` desde metadata; cualquier otro valor → `'user'`. Guardar también `privacy_consent_at` y `privacy_consent_version` (hoy el checkbox de Ley 19.628 del registro no se persiste en ninguna parte).
- Trigger `BEFORE UPDATE ON profiles`: si cambia `role` y quien ejecuta no es admin (y `auth.uid()` no es nulo, para no bloquear al service role), lanzar excepción. Excepción permitida: `user → provider` sobre la propia fila. Impedir además que el **último admin** se quite el rol a sí mismo. Proteger `id` y `email` contra cambios del propio usuario.
- Frontend: eliminar toda escritura de `role` desde el cliente. El paso `user → provider` del wizard debe hacerse con una RPC `become_provider()` o quedar cubierto por la excepción del trigger.

### 1.2 Un proveedor puede aprobarse, destacarse y verificarse solo

- `schema.sql:100-102` — `"Users can update own provider profile"` permite al dueño de la fila cambiar **cualquier** columna: `status = 'approved'`, `is_featured`, `is_verified`, `rating`, `review_count`, `view_count`. Se salta la moderación completa, que es el producto.

**Qué hacer:**

- Trigger `BEFORE INSERT OR UPDATE ON providers` para no-admins: en `INSERT` forzar `status = 'pending'`, `is_featured = false`, `is_verified = false`, `rating = 0`, `review_count = 0`, `view_count = 0`. En `UPDATE` impedir cambios en `is_featured`, `is_verified`, `rating`, `review_count`, `view_count`, `moderated_at`, `moderated_by`, `user_id`, y permitir en `status` únicamente la transición a `'pending'` (reenvío a revisión).
- Regla de producto a implementar en ese trigger: si un perfil `approved` cambia `display_name`, `bio`, `photos`, `cover_photo`, `category`, `whatsapp` o `instagram`, vuelve a `pending`. Cambios de precio y servicios no requieren re-moderación.
- Borrar la política duplicada de `SELECT` en `providers` (hay dos: `schema.sql:92-94` y `002_site_settings_admin.sql:46-56`).

### 1.3 Los correos y teléfonos de todos los usuarios son públicos

- `schema.sql:37-39` — `"Public profiles are viewable by everyone"` con `USING (true)`. Con la anon key (que viaja en el bundle) se puede descargar `email` y `phone` de toda la tabla `profiles`. Incumple la misma Ley 19.628 que el sitio declara respetar.

**Qué hacer:**

- `SELECT` en `profiles` solo para la propia fila o `is_admin()`.
- Exponer públicamente solo `id`, `name`, `avatar_url` mediante una vista `public_profiles` (o RPC equivalente). Adaptar las consultas que hoy embeben `profiles` para mostrar el autor de una reseña (`frontend/src/hooks/useProviders.ts:140-148`, `useReviews.ts`, `perfil/[slug]/comentarios`).
- Criterio de aceptación: con la anon key, `select email from profiles` devuelve 0 filas o error; las reseñas siguen mostrando nombre y avatar.

### 1.4 `/api/notify` es un relé de correo abierto

- `frontend/src/app/api/notify/route.ts` no exige sesión. Con `type: 'generic'` acepta `email`, `subject` y `html` arbitrarios: cualquiera puede enviar phishing desde el dominio del sitio. El caso `provider_pending` además inserta `displayName` sin escapar (`route.ts:75`).

**Qué hacer:**

- Eliminar los tipos `generic` e `invitation`.
- Exigir sesión en todos los casos. El servidor **nunca** acepta el destinatario desde el cliente: lo obtiene de la base a partir de `providerId`.
- Mover la moderación al servidor: `POST /api/admin/providers/[id]/moderate` que (a) verifica que quien llama es admin, (b) actualiza `status`, `rejection_reason`, `moderated_at`, `moderated_by`, (c) escribe en el log de auditoría (Fase 2), (d) envía el email, (e) registra el resultado en `notification_log` (la tabla existe desde la migración 006 pero nada escribe en ella). `frontend/src/hooks/useAdmin.ts:80-124` pasa a llamar a esa ruta. La acción en lote usa la misma ruta con una lista de ids.
- `provider_pending` y `admin_new_pending` se disparan desde una ruta de servidor autenticada al enviar el wizard, no desde el navegador.
- Escapar todo valor dinámico en las plantillas (`escapeHtml` ya existe en `frontend/src/lib/email.ts`).

### 1.5 Reseñas manipulables y calificación que nunca se actualiza

- `schema.sql:191-199` — `"Providers can respond to reviews"` es un `UPDATE` sin restricción de columnas: el proveedor puede reescribir el `rating` y el `comment` de las reseñas que recibe.
- `schema.sql:373-394` — `update_provider_rating()` no es `SECURITY DEFINER`: corre con los permisos de quien reseña, RLS bloquea el `UPDATE` sobre `providers` y la calificación **nunca cambia**. El recálculo del cliente (`frontend/src/hooks/useReviews.ts:64-79`) falla en silencio por la misma razón.
- No existe política `DELETE` en `reviews`: ni el autor ni el admin pueden borrar una reseña.
- Nada impide que un proveedor se reseñe a sí mismo.
- `useMarkHelpful` (`useReviews.ts:121-147`) intenta un `UPDATE` que RLS rechaza para cualquiera que no sea autor o proveedor.

**Qué hacer:**

- `update_provider_rating()` → `SECURITY DEFINER` con `search_path` fijo; devolver `COALESCE(NEW, OLD)`; `rating` a 0 cuando no quedan reseñas.
- Sustituir la política de respuesta por una RPC `respond_to_review(review_id, response)` que solo toca `provider_response` y `response_date` y valida que quien llama es dueño del perfil.
- Trigger en `reviews`: el autor solo puede modificar `rating` y `comment`; rechazar la inserción si `user_id` es el dueño del proveedor reseñado.
- Políticas `DELETE`: autor y admin.
- Quitar el recálculo de rating del cliente. "Útil": implementarlo con una RPC idempotente por usuario (tabla `review_helpful_votes`) o quitar el botón. No dejar un botón que no hace nada.
- Añadir columna `is_hidden` para que el admin pueda ocultar una reseña sin borrarla (se usa en Fase 2).

### 1.6 Otros agujeros de esta fase

| # | Problema | Dónde | Arreglo |
|---|----------|-------|---------|
| a | Redirección abierta: `?redirect=https://sitio-malo` se respeta tras el login | `frontend/src/middleware.ts:120-122`, `frontend/src/app/(auth)/login/page.tsx:39-40` | Helper `safeRedirect()` en `lib/`: solo rutas que empiezan con `/` y no con `//` ni `/\`; con tests. Usarlo en ambos sitios |
| b | Pago de Destacado: sin sesión, el precio lo fija el cliente (`unitPrice`), y no hay webhook, así que pagar no activa nada | `frontend/src/app/api/payments/featured/route.ts` | En esta fase: exigir sesión, validar que el `providerId` pertenece a quien llama, tomar el precio del servidor, y **ocultar el botón** de pago cuando MP no esté configurado. El flujo completo va en Fase 4 |
| c | Contador de visitas: `UPDATE` desde el cliente que RLS bloquea a visitantes; solo sube cuando el dueño mira su propio perfil | `frontend/src/hooks/useProviders.ts:157-161` | RPC `increment_provider_view(slug)` `SECURITY DEFINER`, solo para perfiles `approved`; una vez por sesión de navegador |
| d | `AuthGate` deja pasar si `profile` es `null` (falló la carga) | `frontend/src/components/auth/AuthGate.tsx:104` | Sin perfil cargado → no renderizar hijos |
| e | Filtro de búsqueda interpolado en `.or()` de PostgREST | `useProviders.ts:54-56` | Sanear comas, paréntesis y comodines antes de interpolar |
| f | Rate limit en memoria: en serverless cada instancia tiene su propio contador | `frontend/src/lib/rateLimit.ts` | Rate limit persistente (tabla en Supabase con RPC, o Upstash si el dueño lo aprueba) para `/api/contact`, registro y envío de avisos |
| g | CSP con `'unsafe-eval'` en producción | `frontend/next.config.js:19` | Quitarlo en producción (mantenerlo solo en desarrollo). Verificar que el sitio sigue funcionando |
| h | Servicios y galería de perfiles `pending`/`rejected` legibles por cualquiera | `schema.sql:141-143`, `258-260` | `SELECT` solo si el proveedor está `approved`, o es el dueño, o `is_admin()` |
| i | El admin no puede borrar filas de `gallery` ni de `services` de otros | no hay política de admin en esas tablas | Añadir políticas `FOR ALL` con `is_admin()` |
| j | Script de seed con contraseña por defecto pública (`DemoMiPage2026!`) y cuenta `admin@mipage.cl` | `frontend/scripts/seed-demo.mjs`, `.env.example`, `003_seed_demo_data.sql` | El script debe negarse a correr sin `DEMO_SEED_PASSWORD` explícita y sin un flag `--i-know-this-is-not-production`. Mover `003` fuera de `migrations/` a `supabase/seed/` y quitarlo de las instrucciones de deploy |
| k | Next.js con avisos críticos | `frontend/package.json` | Subir a la versión estable de Next que deje `npm audit --omit=dev --audit-level=high` sin hallazgos. **Consulta la guía oficial de migración de la versión elegida** en vez de asumir los cambios; revisa en particular `cookies()` y `params` en `lib/supabase/server.ts`, las páginas dinámicas, el middleware y `next lint`. Actualiza `@supabase/ssr` al patrón `getAll`/`setAll`. Va en su propio PR. Después, hacer que el paso de `npm audit` en CI sea bloqueante (hoy tiene `continue-on-error: true`) |

### 1.7 Pruebas de seguridad (obligatorias para cerrar la fase)

Crear `frontend/supabase/tests/rls.sql` (o un script Node contra un Supabase local levantado con la CLI) que demuestre, con un usuario normal, un proveedor y un admin:

- un usuario no puede cambiar su `role`, ni registrarse como admin por metadata;
- un proveedor no puede poner `status = 'approved'`, `is_featured` ni `is_verified`;
- anónimo no puede leer `email` ni `phone` de `profiles`;
- un proveedor no puede alterar `rating`/`comment` de una reseña recibida, ni reseñarse;
- insertar una reseña actualiza `providers.rating` y `review_count`;
- anónimo no ve servicios ni galería de un perfil `pending`.

Además, tests unitarios para `safeRedirect()` y para las nuevas rutas de servidor (401 sin sesión, 403 sin rol admin).

---

## 5. FASE 2 — Autogestión real desde `/admin`

Meta: que el dueño no necesite abrir Supabase para nada del día a día. Hoy sí lo necesita para todo lo que sigue.

### 2.1 Cosas que hoy están rotas o son de adorno

1. **Reportes: la página falla y nadie puede reportar.** `frontend/src/hooks/useAdmin.ts:186-193` embebe `reporter:profiles (…)`, pero `reports` tiene dos claves foráneas a `profiles` (`reporter_id` y `resolved_by`), así que PostgREST responde con error de relación ambigua (mismo fallo que MIP-010). Y en todo `src/` no hay ningún `insert` en `reports`: no existe botón "Reportar".
   - Arreglar el embed con el nombre explícito de la clave foránea.
   - Añadir "Reportar" en el perfil público y en cada reseña (requiere sesión; motivo + descripción).
   - En `/admin/reportes`: enlace directo a lo reportado, acciones "Suspender perfil", "Ocultar reseña", "Descartar"; guardar `resolved_by` y `resolution_note`.
2. **Configuración de adorno.** `/admin/configuracion` guarda `maintenanceMode`, `allowProviderRegistration`, `requireEmailVerification`, `requireIdVerification`, `commissionRate`, `minWithdrawal`, pero **ningún otro archivo los lee**. Las secciones "Notificaciones" y "Apariencia" tampoco hacen nada.
   - Conectar de verdad: `maintenanceMode` (página de mantenimiento para todos menos el admin) y `allowProviderRegistration` (ocultar la opción en el registro **y** rechazarlo en la base).
   - Eliminar de la interfaz lo que no tenga efecto: comisión, retiro mínimo, verificación de identidad, notificaciones, apariencia.
   - Añadir lo que el dueño sí necesita editar sin código: emails de contacto, soporte, legal y privacidad; enlace de Instagram; precio y duración del Destacado; aviso global (banner con texto y activación); plantillas de motivos de rechazo (hoy fijas en `frontend/src/app/admin/proveedores/page.tsx:71-77`); textos del hero de la home.
   - `frontend/src/lib/site.ts` tiene emails `@mipage.cl` e Instagram fijos en el código: pasan a leerse de `site_settings`, con los valores actuales como respaldo.
   - Leer `site_settings` en servidor con caché (`revalidate` corto), no en el middleware en cada petición.
   - Corregir el seed de la migración 002, que inserta estadísticas falsas (`"500+"`, `"10.000+"`): en la 007, borrar la fila `stats` de `site_settings`.
3. **Mensajes de contacto que se pierden.** `frontend/src/app/api/contact/route.ts:26-33` solo hace `console.info`. El dueño nunca los ve.
   - Tabla `contact_messages` (inserción solo desde el servidor), email al admin si Resend está configurado, y bandeja `/admin/mensajes` con estados nuevo / respondido / archivado y botón para responder por correo.
4. **Borrado de datos sin interfaz.** La página de privacidad le dice al usuario que "envíe un POST autenticado a `/api/account/delete-request`" (`frontend/src/app/(main)/privacidad/page.tsx:91-94`). El admin tampoco tiene dónde ver las solicitudes.
   - Página `/cuenta` (la ruta ya está protegida en el middleware, pero la página no existe): editar nombre y avatar, cambiar contraseña, solicitar eliminación de cuenta, cerrar sesión. Enlace desde el menú de usuario.
   - Página `/admin/solicitudes`: listar y procesar. "Completar" llama a una ruta de servidor con service role que borra los archivos de Storage del usuario y luego el usuario de Auth (el resto cae por `ON DELETE CASCADE`), con confirmación escrita y registro en auditoría.
   - Reescribir el párrafo de privacidad para que apunte a `/cuenta`.
5. **Recuperar contraseña no funciona.** `frontend/src/app/(auth)/forgot-password/page.tsx:35-36` redirige a `/login`, y no existe ninguna página para escribir la contraseña nueva. Tampoco hay ruta de callback para confirmar el correo.
   - Crear `/auth/callback` (intercambio de código en servidor) y `/auth/update-password`. Ajustar `redirectTo` en recuperación y `emailRedirectTo` en registro.
   - Probar el ciclo completo: registro → correo → confirmación → login → olvido → correo → nueva contraseña → login.

### 2.2 Capacidades que faltan en el panel

| Área | Qué falta | Criterio de aceptación |
|------|-----------|------------------------|
| Primer admin | Hoy solo se logra editando `profiles` a mano | Script `npm run admin:create -- <email>` (service role, solo servidor) documentado en `ADMIN-GUIDE.md`; es la **única** vez que el dueño toca una terminal |
| Moderación | La cola solo permite ver fotos; para leer bio, WhatsApp, servicios y campos dinámicos hay que ir a otra parte | Panel de detalle con todo el aviso, historial de decisiones y motivo anterior, con aprobar / rechazar en el mismo panel |
| Moderación | El admin no puede corregir ni borrar | Editar campos de un aviso, quitar una foto concreta (fila de `gallery` **y** archivo en Storage), eliminar un perfil completo |
| Destacados | Es un booleano sin vencimiento | Columna `featured_until`; al destacar se elige duración; el listado público ignora los vencidos; el admin ve cuándo vence cada uno |
| Usuarios | Solo cambio de rol, sin confirmación ni protección | Confirmación al dar o quitar admin; no permitir quitarse el rol a uno mismo si es el último; suspender una cuenta (bloquea login y oculta su perfil); ver el perfil de proveedor asociado |
| Reseñas | No hay moderación | `/admin/resenas`: listar, ocultar, restaurar, eliminar |
| Categorías y ciudades | Fijas en el código (`lib/site.ts`, `normalizeCategory` en `lib/providers.ts`, `generateStaticParams`) | Tablas `categories` y `cities` gestionadas desde `/admin`; `/explorar/[category]`, los filtros, el registro y el wizard las leen de ahí; añadir una categoría no requiere deploy |
| Auditoría | No queda rastro de quién hizo qué | Tabla `admin_audit_log` (quién, acción, objetivo, antes/después, fecha), escrita desde las rutas de servidor; vista `/admin/actividad` |
| Emails | `notification_log` existe pero está vacía y no tiene interfaz | Vista con enviados, omitidos y fallidos, y botón de reintento |
| Escala | Todas las listas del admin cargan la tabla completa y filtran en el navegador | Paginación y búsqueda en servidor en proveedores, usuarios, reportes, reseñas y mensajes. El contador de pendientes del layout usa `count`, no descarga todo (`frontend/src/app/admin/layout.tsx:67-68`) |
| Panel inicial | Solo tres números | Añadir: avisos pendientes y antigüedad del más viejo, mensajes sin leer, solicitudes de borrado, destacados por vencer en 7 días, altas de los últimos 7 y 30 días, y una tarjeta "Estado del sistema" (base de datos, email, pagos) |
| Exportación | No hay | Descarga CSV de proveedores y de usuarios |

Todas las acciones destructivas llevan diálogo de confirmación. Todas las mutaciones de admin pasan por rutas de servidor que verifican el rol; RLS queda como segunda barrera, no como la única.

---

## 6. FASE 3 — Producto y experiencia Tier 1

1. **Privacidad de las fotos.** Antes de subir, procesar en el navegador: redimensionar (lado mayor ≈ 2000 px), recomprimir y **eliminar metadatos EXIF** (incluida la ubicación GPS). En esta categoría de servicios es un riesgo real para las personas que publican. Limitar el bucket `gallery` a imágenes mientras no exista reproductor de video. Validar el tipo por contenido, no solo por extensión.
2. **Limpieza de archivos.** Borrar un ítem de galería o un perfil debe borrar también el archivo en Storage. Añadir en `/admin` una acción para listar y limpiar huérfanos.
3. **Wizard robusto** (`frontend/src/app/dashboard/avisos/nuevo/page.tsx:160-288`). Hoy son muchas escrituras sueltas desde el cliente: si falla la tercera foto queda un aviso a medias. Subir fotos primero y confirmar el envío con una sola RPC transaccional. Guardar borrador para no perder lo escrito. Exigir correo verificado para enviar.
4. **Mayoría de edad.** Los términos exigen 18+, pero nada lo recoge. Declaración obligatoria de mayoría de edad en el registro de proveedor (guardar fecha de aceptación) y `CHECK (age IS NULL OR age >= 18)` en `providers`. Aviso de sitio para mayores de 18, activable desde Configuración.
5. **SEO de perfiles.** `/perfil/[slug]` es 100 % cliente: Google ve una página vacía.
   - Obtener el perfil en servidor, con `generateMetadata` (título, descripción, imagen Open Graph) y JSON-LD.
   - `notFound()` real para slugs inexistentes o no aprobados.
   - Quitar `generateStaticParams` basado en `mockProviders` (`frontend/src/app/(main)/perfil/[slug]/page.tsx:9-11`): hoy producción prerenderiza seis perfiles ficticios.
   - `sitemap.ts` debe incluir los perfiles aprobados y las categorías activas, y excluir `/login` y `/register`.
6. **Explorar.** Paginación en servidor, URL que refleje los filtros (compartible), y orden que respete `featured_until`.
7. **Estados del proveedor.** En el dashboard: qué falta para publicar, estado actual, motivo de rechazo con botón "Corregir y reenviar", vencimiento del Destacado. Corregir el warning de `react-hooks/exhaustive-deps` en `frontend/src/hooks/useFavorites.ts:27`.
8. **Accesibilidad y rendimiento.** Mantener a11y 100; subir Lighthouse móvil de ~81 a ≥ 90 midiendo sobre producción. Las páginas del admin pesan ~250 kB de JS inicial: cargar de forma diferida modales y tablas.
9. **Consistencia de tipos.** `frontend/src/types/index.ts:5` define `ProviderStatus` como `'pending' | 'active' | 'suspended' | 'inactive'`, que no coincide con la base. Generar tipos desde el esquema (`supabase gen types`) y eliminar los escritos a mano en `types/database.ts`. Quitar la nota "intentionally untyped" de `lib/supabase/client.ts`.

---

## 7. FASE 4 — Operación y despliegue

1. **Health real.** `frontend/src/app/api/health/route.ts` devuelve `ok` con que existan las variables (ni siquiera usa `hasSupabaseEnv()`, así que un placeholder cuenta como válido). Debe hacer una consulta mínima a la base y devolver 503 si falla. Incluir el commit desplegado (`VERCEL_GIT_COMMIT_SHA`).
2. **Vigilancia.** Workflow programado en GitHub Actions (diario) que llame a `/api/health` de producción y falle si no es 200. Sirve de alerta por correo y de actividad periódica sobre la base.
3. **Errores.** `SENTRY_DSN` aparece en `.env.example` y en health, pero no hay SDK instalado. Integrar Sentry de forma que sea inerte sin DSN, o eliminar todas las referencias. Sin punto medio.
4. **Migraciones reproducibles.** Adoptar Supabase CLI: `supabase/config.toml`, migraciones con marca de tiempo a partir de un baseline que equivalga a `schema.sql` + 002 + 004 + 005 + 006 + las nuevas. Documentar `supabase db push`. Corregir la cabecera de `schema.sql`, que todavía dice "LuxeServices". Los datos demo van en `supabase/seed/`, nunca en migraciones.
5. **CI.** Añadir un job que levante Supabase local, aplique las migraciones y corra las pruebas RLS de 1.7 y los E2E autenticados (hoy 5 de los E2E críticos se saltan siempre por falta de credenciales). Auditoría de dependencias bloqueante.
6. **Respaldos.** `frontend/scripts/backup-check.mjs` solo imprime texto. Reemplazarlo por un workflow semanal opcional que haga `pg_dump` usando un secreto `SUPABASE_DB_URL` y guarde el resultado cifrado como artefacto; si el secreto no existe, el workflow termina en verde sin hacer nada. Documentar cómo restaurar.
7. **Destacado de pago completo** (solo si el dueño confirma que quiere cobrar en línea; si no, dejarlo como en 1.6-b): tabla `payments`, webhook de Mercado Pago con validación de firma, activación automática con `featured_until`, y vista de pagos en `/admin`.
8. **Entorno.** Añadir `engines.node` a `frontend/package.json`. Quitar de `next.config.js` los `remotePatterns` que no se usan en producción (`images.unsplash.com`, `api.dicebear.com`, `res.cloudinary.com`). Añadir verificación anti-bots (Cloudflare Turnstile) en registro y contacto, activable por variable de entorno, ajustando la CSP.

---

## 8. FASE 5 — Documentación

El repo tiene 16 archivos `.md` en la raíz, varios contradictorios o con fechas viejas.

- Dejar en la raíz: `README.md`, `DEPLOY.md`, `ADMIN-GUIDE.md`, `DESIGN-SYSTEM.md`, `ARCHITECTURE-DECISION.md`, `CONTRIBUTING.md`, `LICENSE`. Mover el resto a `archive/reports/`.
- `README.md` y `DEPLOY.md`: quitar el "estado honesto" de agosto (producción desfasada, `/explorar` 404), que ya no aplica. Describir el estado real.
- `DEPLOY.md`: checklist de deploy desde cero y de actualización, con el orden *migración → frontend → smoke*, todas las variables de entorno y la configuración de Supabase Auth de la sección 9.
- `ADMIN-GUIDE.md`: reescribir según el panel nuevo. No debe quedar ninguna instrucción del tipo "abre Supabase y edita la tabla", salvo la creación del primer admin.
- `.env.example` y `frontend/.env.local.example`: una sola fuente, sin contraseñas por defecto.

---

## 9. Tareas que solo puede hacer el dueño

Grok: **no intentes hacer estas tareas.** Inclúyelas como checklist en la descripción del PR correspondiente.

**Paso 0, antes de todo**

- [ ] Entrar a Supabase y confirmar que el proyecto de producción está **activo** (no pausado). Abrir `/explorar` en producción y comprobar que carga datos reales.
- [ ] Revisar en Supabase → Authentication → Users si existen `admin@mipage.cl`, `valentina@mipage.cl`, `camila@mipage.cl`, `sofia@mipage.cl`, `isabella@mipage.cl` o `cliente@mipage.cl`. Si existen, se creó el seed demo en producción con una contraseña que está publicada en el repo: **eliminarlas o cambiarles la contraseña de inmediato**.
- [ ] Revisar en la tabla `profiles` cuántas filas tienen `role = 'admin'` y que todas sean cuentas propias. Con los fallos 1.1 cualquiera pudo haberse dado ese rol.
- [ ] Revisar en `providers` que no haya perfiles `approved`, `is_featured` o `is_verified` que el dueño no haya aprobado personalmente.

**Con cada PR**

- [ ] Aplicar la migración indicada en el SQL Editor **antes** de mergear.
- [ ] Mergear y esperar el deploy de Vercel.
- [ ] Correr el smoke del PR.

**Configuración única**

- [ ] Supabase → Authentication → URL Configuration: `Site URL` = dominio de producción; añadir a Redirect URLs `…/auth/callback` y `…/auth/update-password`.
- [ ] Supabase → Authentication: confirmación de correo activada; protección contra contraseñas filtradas activada; SMTP propio (Resend) para no depender del límite del correo integrado.
- [ ] Vercel → variables de Production: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL`. Opcionales: `MERCADOPAGO_ACCESS_TOKEN`, `SENTRY_DSN`, claves de Turnstile.
- [ ] Decidir: ¿dominio propio? El código usa correos `@mipage.cl`; si ese dominio no es del dueño, cambiarlos en Configuración en cuanto la Fase 2 lo permita.
- [ ] Decidir: ¿cobro en línea del Destacado (Fase 4.7) o gestión manual?
- [ ] Decidir: plan de Supabase. El plan gratuito pausa proyectos inactivos y no incluye respaldos automáticos; para un sitio en producción con datos personales conviene el plan de pago o, como mínimo, el workflow de respaldo de la Fase 4.6.
- [ ] Hacer revisar términos y política de privacidad por un abogado. El texto actual es genérico.

---

## 10. Definición de terminado y formato de entrega

**Tier 1 está cumplido cuando:**

- [ ] Las pruebas RLS de 1.7 pasan en CI.
- [ ] `npm audit --omit=dev --audit-level=high` no reporta nada y es bloqueante en CI.
- [ ] Un usuario nuevo no puede, por ninguna vía del cliente, volverse admin, aprobarse, destacarse ni leer correos ajenos.
- [ ] Ningún endpoint envía correo a un destinatario elegido por el cliente.
- [ ] El dueño puede, **solo desde `/admin`**: moderar avisos viendo todo su contenido, editar y eliminar avisos y fotos, destacar con vencimiento, gestionar usuarios y roles, atender reportes, moderar reseñas, leer y responder mensajes de contacto, procesar solicitudes de borrado, editar categorías, ciudades, textos, correos y banner, activar modo mantenimiento, ver el historial de acciones y el estado del sistema.
- [ ] Todo interruptor de Configuración tiene efecto real o fue eliminado.
- [ ] Funciona el ciclo completo de registro, confirmación de correo y recuperación de contraseña.
- [ ] Los perfiles públicos se renderizan en servidor, con metadatos, y aparecen en el sitemap; no hay perfiles ficticios en producción.
- [ ] `/api/health` falla cuando la base no responde, y hay una alerta diaria.
- [ ] Lighthouse sobre producción: escritorio ≥ 95, móvil ≥ 90, accesibilidad 100.
- [ ] La documentación describe el estado real, y `ADMIN-GUIDE.md` no manda al dueño a Supabase.

**Al cerrar cada fase, entrega en la descripción del PR:**

1. Qué se hizo, punto por punto contra este documento (hecho / parcial / no hecho, y por qué).
2. Migraciones que el dueño debe aplicar, en orden.
3. Variables de entorno nuevas.
4. Salida real de lint, type-check, tests, build y `npm audit`.
5. Pasos de smoke manual (rutas y resultado esperado).
6. Riesgos conocidos y cómo revertir.
7. Cualquier punto donde el código real contradijo este documento.

No declares nada "listo" sin haberlo ejecutado. Si no pudiste verificar algo, dilo.
