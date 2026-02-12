#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$BACKEND_DIR"

if [ ! -f .env ]; then
  cat > .env <<'ENVEOF'
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="dev-secret-local-mipage-123456"
JWT_EXPIRES_IN="7d"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
SENDGRID_API_KEY=""
FROM_EMAIL="noreply@example.com"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENVEOF
  echo "✅ .env local creado en backend/.env"
else
  echo "ℹ️ backend/.env ya existe; se mantiene configuración actual"
fi

echo "📦 Instalando dependencias..."
npm install

echo "🧬 Generando Prisma Client..."
npx prisma generate

echo "🗄️ Sincronizando base de datos local..."
npx prisma db push

echo "🌱 Cargando datos ficticios..."
npm run db:seed

echo "\n🎉 Backend local listo."
echo "➡️ Ejecuta: cd backend && npm run dev"
