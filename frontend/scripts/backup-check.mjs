#!/usr/bin/env node
/**
 * El respaldo automático vive en .github/workflows/backup-weekly.yml.
 * Este script solo recuerda el camino. No llama a ninguna API.
 */
console.log(`
MiPage — respaldo
=================
El volcado semanal es el workflow "Respaldo semanal"
(.github/workflows/backup-weekly.yml).

- Sin el secreto SUPABASE_DB_URL el workflow termina en verde y no hace nada.
- Con SUPABASE_DB_URL exige también BACKUP_ENCRYPTION_KEY.
- El artefacto es mipage.dump.enc (AES-256-CBC, PBKDF2), retención 14 días.

Restaurar (en una base vacía, nunca encima de producción sin copia):
  openssl enc -d -aes-256-cbc -pbkdf2 -in mipage.dump.enc -out mipage.dump
  pg_restore --clean --if-exists --no-owner --dbname "$SUPABASE_DB_URL" mipage.dump

PITR del plan de pago de Supabase sigue siendo opcional y manual:
Dashboard → Project Settings → Database → Backups.
`)
process.exit(0)
