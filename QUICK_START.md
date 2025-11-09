# 🚀 Inicio Rápido - MiPage

## ✅ Estado Actual

**Ambos servidores están corriendo correctamente:**
- ✅ Backend: http://localhost:3001
- ✅ Frontend: http://localhost:3000

## 🔐 Acceso al Sistema

Abre tu navegador y ve a:
```
http://localhost:3000
```

Luego haz clic en **"Login"** y usa las siguientes credenciales:

### Credenciales de Prueba

**Administrador** (acceso al panel de administración):
```
Email:    admin@mipage.cl
Password: password123
```

**Publisher** (gestiona servicios y dashboard):
```
Email:    maria@example.com
Password: password123
```

**Usuario** (explora y reserva servicios):
```
Email:    juan@example.com
Password: password123
```

## 🛠️ Scripts de Control

### Iniciar todo de una vez
```bash
./start-dev.sh
```
Este script:
- ✓ Verifica dependencias
- ✓ Inicia el backend en puerto 3001
- ✓ Inicia el frontend en puerto 3000
- ✓ Muestra las URLs y credenciales

### Detener todos los servicios
```bash
./stop-dev.sh
```

### Iniciar manualmente

**Backend:**
```bash
cd backend
npm start
```

**Frontend (en otra terminal):**
```bash
cd frontend
npm run dev
```

## 📝 Ver Logs

Los logs se guardan en archivos cuando usas `./start-dev.sh`:

```bash
# Ver logs del backend en tiempo real
tail -f backend.log

# Ver logs del frontend en tiempo real
tail -f frontend.log
```

## 🔍 Páginas Importantes

Una vez que hayas iniciado sesión:

- **Home**: http://localhost:3000/
- **Login**: http://localhost:3000/auth/login
- **Register**: http://localhost:3000/auth/register
- **Servicios**: http://localhost:3000/services
- **Admin Panel** (solo admin): http://localhost:3000/admin
- **Dashboard** (solo publisher): http://localhost:3000/dashboard
- **Debug/Diagnóstico**: http://localhost:3000/debug

## ⚠️ Solución de Problemas

### El login no funciona
1. Verifica que el backend esté corriendo: `curl http://localhost:3001`
2. Verifica que el frontend esté corriendo: `curl http://localhost:3000`
3. Revisa los logs en `backend.log` y `frontend.log`
4. Si usas Codespaces, verifica que las URLs en `frontend/.env` coincidan con tu Codespace

### Puerto ya en uso
```bash
# Liberar puerto 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Liberar puerto 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Reinstalar dependencias
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📊 Base de Datos

El backend usa **SQLite con datos mock en memoria** para evitar problemas con Prisma en este entorno.

Los datos se cargan automáticamente al iniciar el backend con usuarios y servicios de prueba.

## 🌐 Configuración de URLs

### Desarrollo Local (actual)
El proyecto está configurado para `localhost`:
- Backend: `http://localhost:3001/api`
- Frontend: `http://localhost:3000`

### GitHub Codespaces
Si usas Codespaces, el frontend tiene **detección automática de URL** en `frontend/src/lib/api.ts`.

O puedes actualizar manualmente `frontend/.env`:
```env
NEXT_PUBLIC_API_URL=https://TU-CODESPACE-3001.app.github.dev/api
NEXT_PUBLIC_APP_URL=https://TU-CODESPACE-3000.app.github.dev
```

## 🎯 Próximos Pasos

1. ✅ Ambos servidores están corriendo
2. 🌐 Abre http://localhost:3000 en tu navegador
3. 🔐 Prueba hacer login con las credenciales de arriba
4. 🚀 Explora la aplicación

## 💡 Consejos

- Usa **Ctrl+C** en la terminal donde corrieron `./start-dev.sh` para detener todo
- Los cambios en el código se recargan automáticamente (hot reload)
- Para ver la API backend directamente: http://localhost:3001
- Para debug del login: http://localhost:3000/debug

---

**¿Problemas?** Revisa los logs o ejecuta `./stop-dev.sh` y luego `./start-dev.sh` para reiniciar todo.
