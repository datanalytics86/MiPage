#!/bin/bash

# Script para iniciar MiPage en modo desarrollo
# Ejecuta tanto el backend como el frontend

echo "🚀 Iniciando MiPage en modo desarrollo..."
echo ""

# Verificar si los puertos están en uso
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  El puerto 3001 (backend) ya está en uso"
    echo "   Matando proceso existente..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 2
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  El puerto 3000 (frontend) ya está en uso"
    echo "   Matando proceso existente..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

echo "📦 Verificando dependencias..."

# Verificar e instalar dependencias del backend
if [ ! -d "backend/node_modules" ]; then
    echo "   Instalando dependencias del backend..."
    (cd backend && npm install)
fi

# Verificar e instalar dependencias del frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "   Instalando dependencias del frontend..."
    (cd frontend && npm install)
fi

echo ""
echo "🔧 Iniciando servicios..."
echo ""

# Iniciar backend en background
echo "   ✓ Iniciando backend en puerto 3001..."
(cd backend && npm start > ../backend.log 2>&1) &
BACKEND_PID=$!

# Esperar a que el backend esté listo
sleep 3

# Verificar que el backend arrancó correctamente
if curl -s http://localhost:3001/api/health > /dev/null 2>&1 || curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "   ✓ Backend iniciado correctamente (PID: $BACKEND_PID)"
else
    echo "   ✓ Backend iniciado (PID: $BACKEND_PID)"
fi

# Iniciar frontend en background
echo "   ✓ Iniciando frontend en puerto 3000..."
(cd frontend && npm run dev > ../frontend.log 2>&1) &
FRONTEND_PID=$!

# Esperar a que el frontend esté listo
sleep 8

echo ""
echo "✅ MiPage está corriendo!"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "👤 Credenciales de prueba:"
echo "   Admin:     admin@mipage.cl / password123"
echo "   Publisher: maria@example.com / password123"
echo "   Usuario:   juan@example.com / password123"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 Para detener los servicios:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   O ejecuta: ./stop-dev.sh"
echo ""

# Guardar PIDs para el script de stop
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

# Mantener el script corriendo
echo "Presiona Ctrl+C para detener todos los servicios..."
echo ""

# Función para limpiar al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    rm -f .backend.pid .frontend.pid
    echo "✅ Servicios detenidos"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Esperar indefinidamente
wait
