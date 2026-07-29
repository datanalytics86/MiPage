# 🚀 Guía Rápida de Inicio - MiPage

## Para No-Expertos

Esta guía te ayudará a poner en marcha MiPage en tu computador local en menos de 30 minutos.

## Paso 1: Instalar Prerequisitos (10 min)

### Windows:

1. **Node.js:**
   - Ve a https://nodejs.org/
   - Descarga la versión LTS (20.x)
   - Ejecuta el instalador
   - Abre CMD y verifica: `node --version`

2. **Git:**
   - Ve a https://git-scm.com/
   - Descarga e instala
   - Verifica: `git --version`

### Mac:

```bash
# Instala Homebrew (si no lo tienes)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instala Node.js y Git
brew install node git
```

### Linux (Ubuntu/Debian):

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

## Paso 2: Clonar y Configurar (5 min)

```bash
# Clona el repositorio
git clone <tu-repositorio-url>
cd MiPage

# Crea archivos de configuración
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

## Paso 3: Configurar Base de Datos (10 min)

### Opción A: Supabase (Recomendado - Gratis)

1. Ve a https://supabase.com
2. Crea cuenta (con GitHub es más rápido)
3. Click en "New Project"
4. Nombre: `mipage-db`
5. Password: (guarda esto)
6. Región: South America
7. Click en "Create Project" (toma 2-3 min)

8. Una vez creado:
   - Ve a Settings > Database
   - Copia el "Connection String" (URI mode)
   - Pega en `backend/.env` como `DATABASE_URL`

### Opción B: PostgreSQL Local (Avanzado)

```bash
# Mac
brew install postgresql
brew services start postgresql
createdb mipage

# Linux
sudo apt-get install postgresql
sudo -u postgres createdb mipage

# Windows: Descarga desde postgresql.org
```

## Paso 4: Instalar y Ejecutar (5 min)

### Terminal 1 - Backend:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

Deberías ver: `🚀 MiPage API Server running on port 3001`

### Terminal 2 - Frontend:

```bash
cd frontend
npm install
npm run dev
```

Deberías ver: `ready - started server on localhost:3000`

## Paso 5: Probar la Aplicación

1. Abre tu navegador en: http://localhost:3000
2. Deberías ver la página de inicio con servicios de ejemplo

### Credenciales de Prueba:

```
Admin:
  Email: admin@mipage.cl
  Password: password123

Publisher:
  Email: maria@example.com
  Password: password123

Usuario:
  Email: juan@example.com
  Password: password123
```

## 🎉 ¡Listo!

Tu aplicación está corriendo. Ahora puedes:

- ✅ Ver servicios en la página principal
- ✅ Registrar nuevos usuarios
- ✅ Crear servicios (como Publisher)
- ✅ Dejar reseñas
- ✅ Explorar el admin panel

## Problemas Comunes

### "Port 3000 already in use"

```bash
# Mac/Linux
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID <el-numero> /F
```

### "Cannot connect to database"

1. Verifica que el `DATABASE_URL` en `.env` esté correcto
2. Asegúrate de que Supabase esté activo
3. Intenta: `npx prisma db push` nuevamente

### "Module not found"

```bash
# Borra node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

### "Prisma Client not initialized"

```bash
cd backend
npx prisma generate
```

## Siguientes Pasos

1. **Personalizar:** Edita colores en `frontend/tailwind.config.js`
2. **Agregar Categorías:** Ver [README.md](../README.md#actualizar-contenido)
3. **Desplegar:** Ver [DEPLOYMENT.md](./DEPLOYMENT.md)

## Video Tutorial

[Próximamente: Tutorial en YouTube]

## ¿Necesitas Ayuda?

- 📧 Email: soporte@mipage.cl
- 💬 Issues: https://github.com/tu-usuario/mipage/issues
- 📖 Docs: https://docs.mipage.cl

---

**Tiempo total estimado: 20-30 minutos**
