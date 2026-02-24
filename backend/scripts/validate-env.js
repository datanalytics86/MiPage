#!/usr/bin/env node

const requiredInProduction = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL'];

const shouldValidate = process.env.NODE_ENV === 'production';

if (!shouldValidate) {
  process.exit(0);
}

const missing = requiredInProduction.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('✅ Backend environment validation passed.');
