# 🚀 Acceso a MiPage en GitHub Codespaces

## ✅ Servicios Corriendo

- **Backend:** Puerto 3001 (Escuchando en 0.0.0.0) ✓
- **Frontend:** Puerto 3000 (Escuchando en 0.0.0.0) ✓
- **Status:** Ambos servicios operando correctamente

## 🌐 Método de Acceso Recomendado: Simple Browser de VS Code

Debido a las restricciones de autenticación de GitHub Codespaces, la mejor forma de acceder a la aplicación es usando el **Simple Browser integrado de VS Code**:

### **Pasos para acceder:**

#### **Opción 1: Desde la paleta de comandos**

1. Presiona **F1** (o Cmd/Ctrl + Shift + P)
2. Escribe: **"Simple Browser: Show"**
3. Selecciona la opción
4. En la barra de direcciones que aparece, escribe: `http://localhost:3000`
5. Presiona Enter

#### **Opción 2: Desde la pestaña PORTS (Más rápido)**

1. Ve a la pestaña **"PORTS"** (panel inferior)
2. Busca el puerto **3000**
3. Haz **clic derecho** en el puerto
4. Selecciona **"Open in Browser"** o **"Preview in Editor"**

Esto abrirá un navegador interno dentro de VS Code que tiene acceso directo a localhost.

## 🔐 Credenciales de Prueba

Una vez que accedas, usa estas credenciales:

### **Administrador:**
```
Email:    admin@mipage.cl
Password: password123
```

### **Publisher:**
```
Email:    maria@example.com
Password: password123
```

### **Usuario:**
```
Email:    juan@example.com
Password: password123
```

## 🔧 Scripts Útiles

### Detener servicios:
```bash
./stop-dev.sh
```

### Iniciar servicios:
```bash
./start-dev.sh
```

### Ver logs en tiempo real:
```bash
# Backend
tail -f backend.log

# Frontend
tail -f frontend.log
```

## ⚠️ Sobre el Error 401

El error **401 Unauthorized** que ves al intentar acceder desde un navegador externo ocurre porque:

1. **GitHub Codespaces requiere autenticación** - Incluso con puertos "públicos", GitHub puede requerir que estés autenticado
2. **Repositorios privados** - Si el repositorio es privado, solo los colaboradores pueden acceder a los puertos
3. **Políticas de organización** - Tu organización puede tener políticas que restringen el acceso público

**Solución:** Usa el **Simple Browser de VS Code** que bypasea estas restricciones ya que accede directamente a `localhost` sin pasar por el proxy de GitHub.

## 📝 URLs de Referencia

- **Local Frontend:** http://localhost:3000
- **Local Backend:** http://localhost:3001
- **Backend Health:** http://localhost:3001/health
- **API Docs (Swagger):** http://localhost:3001/api-docs

## 🎯 Funcionalidades Disponibles

- ✅ Sistema de autenticación completo
- ✅ Roles: Admin, Publisher, Usuario
- ✅ Gestión de servicios profesionales
- ✅ Sistema de reservas
- ✅ Dashboard para publishers
- ✅ Panel de administración
- ✅ Sistema de metadata dinámico
- ✅ API REST documentada con Swagger

## 💡 Tips

1. **Usa el Simple Browser** - Es la forma más confiable de acceder en Codespaces
2. **Los cambios se recargan automáticamente** - Hot reload está activo en ambos servicios
3. **Logs en tiempo real** - Usa `tail -f` para ver los logs mientras desarrollas
4. **Health check** - Verifica que el backend esté funcionando con: `curl http://localhost:3001/health`

---

**Todo está listo y funcionando correctamente. ¡Solo necesitas usar el Simple Browser de VS Code para acceder!**
