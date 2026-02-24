#!/usr/bin/env node

const requiredForBuild = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const missing = requiredForBuild.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`❌ Missing required frontend env vars for build: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('✅ Frontend environment validation passed.');
