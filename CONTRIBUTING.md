# Contribuir a MiPage

El producto está en `frontend/`. Node `>=20.9.0`. El backend de `archive/2026-legacy/` no se despliega y no se testea.

## Arranque

1. Clona el repositorio.
2. Copia `.env.example` a `frontend/.env.local` y completa la URL y la anon key de Supabase. El ejemplo no trae contraseñas.
3. Desde `frontend/`: `npm install` y `npm run dev`.
4. Rama nueva desde `main`. No hagas push a `main`.

## Antes de abrir un PR

Desde `frontend/`, en este orden:

```bash
npm run lint
npm run type-check
npm run test:ci
npm run build
```

`test:ci` exige cobertura solo sobre los archivos listados en `frontend/vitest.config.ts`: líneas 85, funciones 90, ramas 75, statements 85. No bajes esos números.

`npm audit --omit=dev --audit-level=high` tiene que salir en 0. No agregues un paquete que lo rompa.

Commits en inglés, Conventional Commits (`feat:`, `fix:`, `docs:`).

Cambios de base: una migración nueva e idempotente en `frontend/supabase/migrations/`. No reescribas el SQL ya aplicado. No edites `schema.sql` salvo la cabecera legible. El seed demo no entra en una migración.

La interfaz va en español (Chile). Sin emojis. El sistema visual está en `DESIGN-SYSTEM.md`.

## Qué no hace falta construir

- Cobro en línea del Destacado. Sigue manual. Ver `DEPLOY.md`.
- Un segundo backend, Redis o Cypress. Las pruebas de punta a punta son Playwright (`npm run test:e2e:critical`). Sin `E2E_PROVIDER_EMAIL` y `E2E_ADMIN_EMAIL` esos casos se saltan.

## Seguridad

No abras un issue público con una vulnerabilidad. No subas `.env`, service role ni llaves de respaldo.

Al contribuir, el cambio queda bajo la licencia MIT (`LICENSE`).
