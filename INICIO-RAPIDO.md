# 🚀 Inicio Rápido - MiPage (SIN errores)

## ⚠️ IMPORTANTE: Sigue EXACTAMENTE estos pasos

### Paso 1: Configurar Base de Datos

#### Opción A: Usar SQLite Local (MÁS FÁCIL - RECOMENDADO PARA PROBAR)

```bash
cd backend

# 1. Cambiar a SQLite en schema.prisma
# Edita: backend/prisma/schema.prisma
# Cambia la línea 8-9 a:

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

```bash
# 2. Crear .env con configuración mínima
cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
JWT_SECRET="mi-secreto-super-seguro-12345678"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
EOF

# 3. Instalar dependencias
npm install

# 4. Generar cliente de Prisma
npx prisma generate

# 5. Crear base de datos
npx prisma db push

# 6. Poblar con datos de prueba (IMPORTANTE)
npm run seed

# 7. Iniciar backend
npm run dev
```

#### Opción B: Usar Supabase (PostgreSQL en la nube)

Solo si quieres usar PostgreSQL en Supabase:

1. Ve a https://supabase.com y crea cuenta gratuita
2. Crea un nuevo proyecto
3. Ve a Settings > Database > Connection String > URI
4. Copia el string de conexión
5. Crea `.env` en la carpeta `backend`:

```bash
cd backend
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:[TU-PASSWORD]@db.[TU-PROYECTO].supabase.co:5432/postgres"
JWT_SECRET="mi-secreto-super-seguro-12345678"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
EOF
```

Luego:
```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

### Paso 2: Configurar Frontend

Abre OTRA terminal (deja el backend corriendo):

```bash
cd frontend

# 1. Crear .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
EOF

# 2. Instalar dependencias
npm install

# 3. Iniciar frontend
npm run dev
```

### Paso 3: Abrir en el Navegador

Abre: **http://localhost:3000**

## 🔑 Credenciales para Login

### Admin (Panel de administración)
```
Email: admin@mipage.cl
Password: password123
```
Luego ve a: http://localhost:3000/admin

### Publisher (Crear servicios)
```
Email: maria@example.com
Password: password123
```
Luego ve a: http://localhost:3000/services/new

### Usuario Regular
```
Email: juan@example.com
Password: password123
```

## ✅ Verificar que Todo Funciona

### 1. Backend (Terminal 1)
Deberías ver:
```
✅ Base de datos limpiada
✅ Usuarios creados
✅ Servicios creados
✅ Reseñas creadas
✅ Posts creados
🎉 Seed completado exitosamente!
```

Y luego:
```
🚀 Servidor corriendo en http://localhost:3001
```

### 2. Frontend (Terminal 2)
Deberías ver:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 3. Navegador
- ✅ Deberías ver fotos de servicios en la página principal
- ✅ Los inputs de login DEBEN ser visibles (fondo blanco, borde gris)
- ✅ Puedes escribir email y password
- ✅ Al hacer login, redirige a la home

## 🆘 Solución de Problemas

### "No veo fotos"
1. Verifica que el backend esté corriendo en http://localhost:3001
2. Abre http://localhost:3001/api/services en el navegador
3. Deberías ver JSON con servicios

### "No puedo hacer login"
1. Verifica que ejecutaste `npm run seed` en el backend
2. Verifica que veas el mensaje "Seed completado exitosamente"
3. Usa EXACTAMENTE las credenciales de arriba

### "No veo los campos de email/password"
1. Presiona Ctrl+Shift+R (hard refresh) en el navegador
2. Limpia cache del navegador
3. Verifica que el frontend esté corriendo en el puerto 3000

### "Error de conexión con backend"
1. Verifica que AMBAS terminales estén corriendo
2. Backend debe estar en http://localhost:3001
3. Frontend debe estar en http://localhost:3000
4. Verifica el archivo `.env.local` en frontend

### "Error al ejecutar seed"
```bash
# Reinstalar prisma
cd backend
rm -rf node_modules
rm -f prisma/dev.db
npm install
npx prisma generate
npx prisma db push
npm run seed
```

## 📸 URLs de Fotos para Crear Servicios

Cuando crees un servicio nuevo, usa estas URLs:

### Para Modelaje:
```
https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800
https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800
https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800
```

### Para Masajes:
```
https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800
https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800
https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800
```

## 🎯 Flujo Completo de Prueba

1. **Login como Publisher (María)**
   - Email: maria@example.com / password123
   - Ve a `/services/new`
   - Crea un servicio con fotos

2. **Login como Admin**
   - Email: admin@mipage.cl / password123
   - Ve a `/admin`
   - Aprueba el servicio de María

3. **Logout y vuelve a la home**
   - El servicio aprobado debería aparecer en la página principal

## 📞 ¿Necesitas Ayuda?

Si después de seguir TODOS estos pasos aún tienes problemas:

1. Comparte el error EXACTO que ves
2. Comparte qué ves en la Terminal 1 (backend)
3. Comparte qué ves en la Terminal 2 (frontend)
4. Comparte una captura de pantalla del navegador (con F12 abierto para ver errores)

---

**¡Importante!** Deja AMBAS terminales corriendo mientras usas la aplicación.
