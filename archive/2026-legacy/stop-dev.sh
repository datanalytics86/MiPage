#!/bin/bash

# Script para detener los servicios de MiPage

echo "🛑 Deteniendo servicios de MiPage..."

# Leer PIDs si existen
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID 2>/dev/null
        echo "   ✓ Backend detenido (PID: $BACKEND_PID)"
    fi
    rm -f .backend.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID 2>/dev/null
        echo "   ✓ Frontend detenido (PID: $FRONTEND_PID)"
    fi
    rm -f .frontend.pid
fi

# Matar cualquier proceso en los puertos 3000 y 3001 por si acaso
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    echo "   ✓ Puerto 3001 liberado"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    echo "   ✓ Puerto 3000 liberado"
fi

echo ""
echo "✅ Todos los servicios detenidos"
