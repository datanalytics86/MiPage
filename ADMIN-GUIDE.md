# Guía del administrador

Un solo administrador. Todo el día a día está en `/admin`. No abras el editor de tablas de Supabase.

La única excepción es el primer admin, y ni eso es el editor: la persona se registra en el sitio y después, desde `frontend/`, con `SUPABASE_SERVICE_ROLE_KEY` en el entorno:

```bash
npm run admin:create -- tu-correo@dominio.cl
```

Luego entras en https://mi-page-lake.vercel.app/login y abres `/admin`.

## Cada día

1. `/admin` muestra la cola y los accesos rápidos.
2. Moderación (`/admin/proveedores`, filtro Pendiente). Mira las fotos. Aprueba o rechaza con motivo. Hay lote.
3. Si hay reportes, `/admin/reportes`.
4. Si alguien escribió por el formulario, `/admin/mensajes`: responder, archivar o marcar como nuevo.

## El resto del panel

| Menú | Ruta | Qué haces ahí |
|------|------|----------------|
| Dashboard | `/admin` | Cola, accesos, resumen |
| Usuarios | `/admin/usuarios` | Rol y suspensión. El último admin no puede quitarse el rol |
| Moderación | `/admin/proveedores` | Aprobar, rechazar, editar, borrar fotos, destacar con vencimiento |
| Metadata | `/admin/metadata` | Campos extra de los avisos |
| Reportes | `/admin/reportes` | Denuncias de perfiles y contenido |
| Mensajes | `/admin/mensajes` | Bandeja de contacto |
| Reseñas | `/admin/resenas` | Moderar reseñas. La nota la recalcula la base, no el formulario |
| Solicitudes | `/admin/solicitudes` | Pedidos de borrado (Ley 19.628). Se atienden aquí |
| Catálogo | `/admin/catalogo` | Categorías y ciudades |
| Actividad | `/admin/actividad` | Historial de acciones del panel |
| Correos | `/admin/correos` | Envíos y reintento. Sin `RESEND_API_KEY` no sale correo |
| Archivos | `/admin/huerfanos` | Objetos de Storage que ya no tienen ficha |
| Configuración | `/admin/configuracion` | Textos, correos, Instagram, mantenimiento, registro de profesionales, aviso 18+, precio y días del Destacado, motivos de rechazo |

Guardar en Configuración escribe los ajustes. El sitio público los lee con una caché corta.

## Destacado

Se marca a mano en Moderación. La duración sale de Configuración (días). No hay cobro en línea: el botón de pago del profesional permanece oculto mientras no exista `MERCADOPAGO_ACCESS_TOKEN`, y aun con token el pago no activa el destacado por sí solo.

## Mantenimiento y cuentas

Modo mantenimiento: el público ve el aviso. El admin sigue entrando.

Suspender una cuenta la manda al login. Se reactiva en Usuarios.

## Si algo falla

| Qué ves | Dónde mirar |
|---------|-------------|
| No entras a `/admin` | Esa cuenta no es admin. Usa `admin:create` una vez, con el correo ya registrado |
| No salen correos | Falta `RESEND_API_KEY` o el remitente. El rechazo y el aviso igual quedan guardados |
| Health 503 | Faltan las claves de Supabase o la consulta a `providers` no respondió |
| Un aviso no aparece en Explorar | Sigue `pending` o `rejected` |
| Subir fotos falla | Bucket `gallery` y la migración de storage |

## No hagas esto

- No edites filas a mano en Supabase para moderar, destacar o borrar.
- No ejecutes `frontend/supabase/seed/003_seed_demo_data.sql` en producción.
- No pongas `service_role` en una variable `NEXT_PUBLIC_*`.
- No apruebes un aviso con fotos dudosas solo por cerrar la cola.

Despliegue, migraciones y secretos: `DEPLOY.md`.
