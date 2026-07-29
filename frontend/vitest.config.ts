import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      include: [
        'src/lib/uploadValidation.ts',
        'src/lib/metadataFields.ts',
        'src/lib/email.ts',
        'src/lib/rbac.ts',
        'src/lib/moderation.ts',
        'src/lib/rateLimit.ts',
        'src/lib/filters.ts',
        'src/lib/whatsapp.ts',
        'src/lib/supabase/env.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 85,
        branches: 70,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
