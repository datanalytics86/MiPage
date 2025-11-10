# 🚀 Configuración para GitHub Codespaces

## ⚠️ Problema: Error 403 Forbidden

Si al abrir las URLs públicas de Codespaces obtienes un error **403 Forbidden**, es porque los puertos NO están configurados como públicos correctamente.

## ✅ Solución: Configurar Puertos como Públicos

### **PASO 1: Abrir Panel de PORTS**

1. En VS Code, ve al panel inferior
2. Busca la pestaña **"PORTS"** (está junto a Terminal, Problems, Output)
3. Haz clic en **"PORTS"**

### **PASO 2: Cambiar Visibilidad a Public**

Para **CADA** puerto (3000 y 3001):

1. **Clic derecho** en el número del puerto
2. Selecciona **"Port Visibility"**
3. Selecciona **"Public"** ⚠️ (¡NO selecciones "Private" ni "Private to Organization"!)

### **PASO 3: Verificar**

En la columna **"Visibility"** debe aparecer:
- Puerto 3000: **"Public"** 🌐
- Puerto 3001: **"Public"** 🌐

**NO debe decir:**
- ❌ "Private" 🔒
- ❌ "Private to Organization"
- ❌ "Org Private"

### **PASO 4: Abrir la Aplicación**

Una vez configurados los puertos como públicos:

1. En la pestaña **PORTS**, busca el puerto **3000**
2. Haz clic en el **icono de globo 🌐** o en la URL
3. Se abrirá tu navegador con la aplicación

O usa directamente la URL:
```
https://upgraded-space-pancake-q7gvrgw947g6cwqx-3000.app.github.dev
```

## 🔧 Configuración Automática

El archivo `.devcontainer/devcontainer.json` está configurado para hacer los puertos públicos automáticamente cuando se crea un nuevo Codespace.

Si ya estás en un Codespace existente, necesitas cambiar la visibilidad manualmente (pasos arriba).

## 🎯 URLs de tu Codespace

- **Frontend:** https://upgraded-space-pancake-q7gvrgw947g6cwqx-3000.app.github.dev
- **Backend API:** https://upgraded-space-pancake-q7gvrgw947g6cwqx-3001.app.github.dev/api

## 🔐 Credenciales de Prueba

Una vez que puedas acceder:

```
Admin:
Email:    admin@mipage.cl
Password: password123

Publisher:
Email:    maria@example.com
Password: password123

Usuario:
Email:    juan@example.com
Password: password123
```

## 📝 Verificar que los Servicios Están Corriendo

```bash
# Ver logs del backend
tail -f backend.log

# Ver logs del frontend
tail -f frontend.log

# Verificar que escuchan en 0.0.0.0
curl http://localhost:3000
curl http://localhost:3001/api
```

## 🐛 Troubleshooting

### Los servicios no responden localmente
```bash
./stop-dev.sh
./start-dev.sh
```

### Sigo viendo 403 después de cambiar a Public
1. Espera 10-20 segundos después de cambiar la visibilidad
2. Refresca el navegador (Ctrl+Shift+R o Cmd+Shift+R)
3. Prueba en una ventana de incógnito
4. Verifica que ambos puertos (3000 y 3001) estén en Public

### El puerto no aparece en la lista
```bash
# Detener y reiniciar servicios
./stop-dev.sh
./start-dev.sh
```

Los puertos deberían aparecer automáticamente en la pestaña PORTS.

## 💡 Nota Importante

**GitHub Codespaces por defecto hace los puertos PRIVADOS por seguridad.**

Debes cambiarlos manualmente a **Public** cada vez que:
- Creas un nuevo Codespace
- Reinicia el Codespace
- Los puertos desaparecen de la lista

Este es un comportamiento normal de seguridad de GitHub.
