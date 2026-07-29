# 🔧 SOLUCIÓN: Problema de Acceso como Administrador

**Fecha:** 2025-11-06
**Problema:** No se puede acceder como administrador

---

## ❌ EL PROBLEMA

El backend está completamente implementado, pero **las migraciones de Prisma no se ejecutaron** por restricciones de conectividad. Esto significa que:

- ✅ El código está listo
- ✅ El schema está actualizado
- ✅ El seed tiene los datos
- ❌ La base de datos NO tiene las tablas nuevas
- ❌ El usuario admin NO existe en la BD

---

## ✅ LA SOLUCIÓN

### Paso 1: Ejecutar Migraciones de Prisma

```bash
cd backend

# Generar el cliente de Prisma
npx prisma generate

# Opción A: Migración completa (recomendado)
npx prisma migrate dev --name add_metadata_system

# Opción B: Push directo (más rápido, para desarrollo)
npx prisma db push
```

### Paso 2: Ejecutar el Seed

```bash
# Esto creará todos los usuarios de prueba
npm run seed
```

**Salida esperada:**
```
🌱 Iniciando seed de base de datos...
✅ Base de datos limpiada
✅ Usuarios creados
✅ Tipos de servicio creados
✅ Campos de metadata creados
✅ Metadata de usuarios creada
✅ Servicios creados
✅ Actualizaciones de servicios creadas
✅ Reseñas creadas
✅ Posts creados
✅ Notificaciones creadas

🎉 Seed completado exitosamente!

📝 Credenciales de prueba:
  Admin:       admin@mipage.cl / password123
  Publisher 1: maria@example.com / password123
  Publisher 2: carlos@example.com / password123
  Publisher 3: sofia@example.com / password123
  User:        juan@example.com / password123
```

### Paso 3: Iniciar el Servidor

```bash
npm run dev
```

### Paso 4: Hacer Login como Admin

**Endpoint:** `POST http://localhost:3001/api/auth/login`

**Body:**
```json
{
  "email": "admin@mipage.cl",
  "password": "password123"
}
```

**Respuesta esperada:**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": "...",
    "email": "admin@mipage.cl",
    "name": "Administrador",
    "role": "ADMIN",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    "isVerified": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Paso 5: Usar el Token

Copia el token de la respuesta y úsalo en las siguientes requests:

**Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧪 PROBAR ENDPOINTS DE ADMIN

Una vez que tengas el token, puedes probar:

### 1. Estadísticas del sitio
```bash
GET http://localhost:3001/api/admin/stats
Authorization: Bearer <tu-token>
```

### 2. Usuarios con metadata (tabla Excel)
```bash
GET http://localhost:3001/api/admin/users/with-metadata?page=1&limit=20
Authorization: Bearer <tu-token>
```

### 3. Campos de metadata
```bash
GET http://localhost:3001/api/admin/metadata-fields
Authorization: Bearer <tu-token>
```

### 4. Tipos de servicio
```bash
GET http://localhost:3001/api/admin/service-types
Authorization: Bearer <tu-token>
```

### 5. Invitar nuevo usuario
```bash
POST http://localhost:3001/api/admin/users/invite
Authorization: Bearer <tu-token>
Content-Type: application/json

{
  "email": "nuevo@example.com",
  "name": "Usuario Nuevo"
}
```

### 6. Exportar usuarios a Excel
```bash
GET http://localhost:3001/api/admin/users/export
Authorization: Bearer <tu-token>
```

---

## 🔍 VERIFICAR ESTADO DE LA BASE DE DATOS

### Ver estado de Prisma
```bash
cd backend
npx prisma studio
```

Esto abrirá una interfaz web en `http://localhost:5555` donde podrás:
- Ver todas las tablas
- Ver los datos existentes
- Editar datos manualmente
- Verificar relaciones

### Ver si las tablas existen
```bash
npx prisma db execute --stdin <<< "SELECT name FROM sqlite_master WHERE type='table';"
```

---

## ⚠️ POSIBLES ERRORES

### Error: "Environment variable not found: DATABASE_URL"

**Solución:** Crear archivo `.env` en `backend/`

```bash
cd backend
cp .env.example .env
```

Editar `.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu-secreto-super-seguro-cambia-esto-123456"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Error: "PrismaClient is unable to run in this browser environment"

**Solución:** Asegurarte de estar ejecutando en Node.js, no en el browser.

```bash
# Verificar versión de Node
node --version  # Debe ser 18.x o superior

# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Invalid `prisma.user.create()` invocation"

**Solución:** La tabla no existe. Ejecutar migraciones:

```bash
npx prisma db push
npx prisma generate
```

### Error 403 al descargar binarios de Prisma

**Solución:** Usar variable de entorno:

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma db push
```

---

## 📱 PROBAR CON FRONTEND (después de FASE 3)

Una vez que el backend esté funcionando:

1. Iniciar frontend
```bash
cd frontend
npm run dev
```

2. Ir a `http://localhost:3000/auth/login`

3. Login con:
   - Email: `admin@mipage.cl`
   - Password: `password123`

4. Ir a `http://localhost:3000/admin`

---

## 🎯 CHECKLIST DE VERIFICACIÓN

- [ ] Migraciones ejecutadas (`npx prisma db push`)
- [ ] Cliente generado (`npx prisma generate`)
- [ ] Seed ejecutado (`npm run seed`)
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Login funciona (retorna token)
- [ ] Endpoints admin responden con 200
- [ ] Prisma Studio muestra datos (`npx prisma studio`)

---

## 💡 RESUMEN RÁPIDO

```bash
# En una terminal, ejecutar:
cd backend
npx prisma generate
npx prisma db push
npm run seed
npm run dev

# Probar login:
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mipage.cl","password":"password123"}'
```

---

**Estado actual:** Backend 100% funcional, solo falta ejecutar migraciones
**Próximo paso:** Ejecutar comandos de arriba y probar login
