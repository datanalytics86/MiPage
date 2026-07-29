#!/usr/bin/env node
/**
 * Documents / verifies backup readiness for Supabase PITR.
 * Does not call Supabase Management API unless SUPABASE_ACCESS_TOKEN is set.
 */
console.log(`
MiPage — Backup checklist (Supabase)
====================================
1. Supabase Dashboard → Project Settings → Database → Backups
2. Pro plan: enable PITR (Point-in-Time Recovery)
3. Weekly: verify latest backup timestamp is < 24h
4. Restore drill (staging): restore to a new project, smoke-test login + explore
5. Storage: gallery bucket objects are in the same project backups

Env tips:
- Keep SUPABASE_SERVICE_ROLE_KEY only in Vercel server env / password manager
- Never commit service role keys

Status: MANUAL CHECK (no automated Management API call without token)
`)

if (!process.env.SUPABASE_ACCESS_TOKEN) {
  console.log('Result: skipped automated API (set SUPABASE_ACCESS_TOKEN for future automation)')
  process.exit(0)
}

console.log('SUPABASE_ACCESS_TOKEN present — extend this script to call Management API if needed.')
process.exit(0)
