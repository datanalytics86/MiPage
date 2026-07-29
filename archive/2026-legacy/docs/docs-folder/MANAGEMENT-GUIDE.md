# 📊 Guía de Gestión para No-Expertos

Esta guía te enseña cómo manejar tu plataforma MiPage sin conocimientos técnicos avanzados.

## 🎯 Tareas Comunes

### 1. Aprobar/Rechazar Servicios

**Acceso:** http://localhost:3000/admin (en producción: tu-dominio.com/admin)

**Pasos:**
1. Inicia sesión como admin
2. Ve a "Servicios Pendientes"
3. Revisa cada servicio:
   - ¿Las fotos son apropiadas?
   - ¿La descripción es clara?
   - ¿El precio es razonable?
4. Click en "Aprobar" o "Rechazar"

**Criterios de Rechazo:**
- Fotos inapropiadas
- Descripción engañosa
- Información incompleta
- Precio fuera de mercado

### 2. Moderar Reseñas

**Acceso:** Panel Admin > Reseñas

**Cuándo eliminar una reseña:**
- Lenguaje ofensivo
- Spam o publicidad
- Información falsa
- Acoso

**Pasos:**
1. Ve a la reseña
2. Click en "⋮" (tres puntos)
3. Selecciona "Eliminar"
4. Confirma

### 3. Gestionar Usuarios

**Verificar un Usuario:**
1. Admin > Usuarios
2. Busca al usuario
3. Click en "Verificar"
4. El usuario obtiene una insignia ✓

**Eliminar un Usuario:**
⚠️ **Cuidado:** Esto eliminará todos sus servicios y reseñas
1. Admin > Usuarios
2. Busca al usuario
3. Click en "Eliminar"
4. Confirma

### 4. Agregar Nueva Categoría

**Archivos a editar:**

1. **Backend:** `backend/prisma/schema.prisma`
   ```prisma
   enum Category {
     MODELAJE
     MASAJES_PROFESIONALES
     TU_NUEVA_CATEGORIA  // ← Agregar aquí
   }
   ```

2. **Aplicar cambios:**
   ```bash
   cd backend
   npx prisma db push
   ```

3. **Frontend:** `frontend/src/lib/utils.ts`
   ```typescript
   export function getCategoryLabel(category: string): string {
     const labels: Record<string, string> = {
       MODELAJE: 'Modelaje',
       MASAJES_PROFESIONALES: 'Masajes Profesionales',
       TU_NUEVA_CATEGORIA: 'Tu Etiqueta',  // ← Agregar
     };
     return labels[category] || category;
   }
   ```

4. **Reiniciar servicios:**
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend (en otra terminal)
   cd frontend
   npm run dev
   ```

### 5. Cambiar Colores del Sitio

**Archivo:** `frontend/tailwind.config.js`

```javascript
colors: {
  primary: {
    500: '#0ea5e9',  // ← Cambia este color
    600: '#0284c7',  // ← Y este
  }
}
```

**Herramientas útiles:**
- https://tailwindcss.com/docs/customizing-colors
- https://coolors.co/ (generador de paletas)

### 6. Actualizar Precios Destacados

**Opción A: Desde el Admin Panel**
1. Admin > Servicios
2. Busca el servicio
3. Click en "Hacer Premium"

**Opción B: Desde la Base de Datos**
```sql
-- En Supabase > SQL Editor
UPDATE services
SET "isPremium" = true
WHERE id = 'uuid-del-servicio';
```

### 7. Ver Estadísticas

**Acceso:** Admin > Dashboard

**Métricas disponibles:**
- Total de usuarios
- Servicios publicados
- Reseñas
- Rating promedio
- Servicios por categoría

**Exportar datos:**
1. Admin > Estadísticas
2. Click en "Exportar CSV"
3. Abre con Excel/Google Sheets

## 🔧 Mantenimiento Regular

### Semanal

✅ Revisar servicios pendientes
✅ Moderar reseñas nuevas
✅ Verificar usuarios legítimos

### Mensual

✅ Revisar estadísticas de uso
✅ Actualizar dependencias: `npm update`
✅ Backup de base de datos (automático en Supabase)
✅ Revisar logs de errores

### Cada 3 Meses

✅ Actualizar Node.js si hay nueva versión
✅ Revisar y eliminar usuarios inactivos
✅ Optimizar base de datos
✅ Revisar costos de servicios (Vercel, Railway, etc.)

## 💾 Backup y Recuperación

### Backup Automático (Supabase)

Supabase hace backups diarios automáticos (últimos 7 días).

**Restaurar:**
1. Ve a Supabase > Settings > Database
2. Click en "Point in Time Recovery"
3. Selecciona fecha y hora
4. Confirma

### Backup Manual

```bash
# Exportar datos
cd backend
npx prisma db pull
# Guarda el archivo schema.prisma

# Exportar desde Supabase
# Dashboard > Database > Backups > Download
```

## 📧 Gestión de Emails

Si configuraste SendGrid:

**Plantillas de email:**
- Bienvenida: `backend/src/templates/welcome.html`
- Servicio aprobado: `backend/src/templates/approved.html`
- Nueva reseña: `backend/src/templates/review.html`

**Personalizar:**
1. Edita los archivos HTML
2. Usa variables: `{{nombre}}`, `{{email}}`, etc.

## 📊 Analytics

### Google Analytics (Opcional)

1. Crea cuenta en https://analytics.google.com
2. Obtén tu ID (ej: G-XXXXXXXXXX)
3. Agrega a `frontend/src/app/layout.tsx`:

```typescript
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    `,
  }}
/>
```

## 🚨 Problemas Comunes

### "No puedo acceder al admin"

**Solución:**
```bash
# Crear usuario admin manualmente
cd backend
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  const hashedPassword = await bcrypt.hash('tu-password', 10);
  await prisma.user.update({
    where: { email: 'tu-email@example.com' },
    data: { role: 'ADMIN' }
  });
  console.log('Admin actualizado!');
  process.exit(0);
})();
"
```

### "El sitio está lento"

**Checklist:**
1. ¿Cuántos usuarios simultáneos? (ver Railway/Vercel metrics)
2. ¿Queries lentas en DB? (ver Supabase logs)
3. ¿Imágenes muy grandes? (Cloudinary debería optimizar)
4. ¿Necesitas escalar? (ver [DEPLOYMENT.md](./DEPLOYMENT.md#escalado))

### "Error en producción"

1. **Ver logs:**
   - Railway: Dashboard > Deployments > View Logs
   - Vercel: Dashboard > Deployments > Function Logs

2. **Rollback:**
   - Railway: Deployments > Anterior > Rollback
   - Vercel: Deployments > Anterior > Promote to Production

## 📞 Cuándo Contratar Ayuda

Necesitas un desarrollador si:

- ❌ Quieres cambios mayores en diseño
- ❌ Necesitas integrar pagos online (Stripe, WebPay)
- ❌ Quieres app móvil nativa
- ❌ Problemas de seguridad complejos
- ❌ Optimizaciones de performance avanzadas

**Costo estimado:** $500-2000 USD por feature

**Dónde encontrar:**
- Upwork
- Freelancer.com
- GetOnBrd.com (Chile)

## 📚 Recursos Adicionales

- [Video: Cómo usar el Admin Panel]()
- [Video: Aprobar servicios]()
- [Video: Moderar contenido]()
- [FAQ](./FAQ.md)

## ✅ Checklist Diario

```
[ ] Revisar nuevos servicios (5 min)
[ ] Revisar nuevas reseñas (5 min)
[ ] Responder mensajes de soporte (10 min)
[ ] Verificar que el sitio esté online (1 min)
```

---

**¿Tienes dudas?** Abre un issue en GitHub o escribe a soporte@mipage.cl
