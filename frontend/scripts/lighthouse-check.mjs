#!/usr/bin/env node
/**
 * Run Lighthouse against a target URL (default: local or live).
 * Usage:
 *   LH_URL=http://localhost:3000 node scripts/lighthouse-check.mjs
 *   LH_URL=https://mi-page-lake.vercel.app node scripts/lighthouse-check.mjs
 *
 * Exit 0 only if Performance, Accessibility, Best Practices, SEO all ≥ threshold (default 92).
 */
import { spawnSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const url = process.env.LH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000'
const threshold = Number(process.env.LH_THRESHOLD || 92)
const outDir = join(process.cwd(), 'lighthouse-reports')
mkdirSync(outDir, { recursive: true })

const outJson = join(outDir, 'report.json')
const outHtml = join(outDir, 'report.html')

console.log(`Lighthouse → ${url} (threshold ≥ ${threshold})`)

const args = [
  'lighthouse',
  url,
  '--only-categories=performance,accessibility,best-practices,seo',
  '--chrome-flags=--headless --no-sandbox --disable-gpu',
  '--output=json',
  '--output=html',
  `--output-path=${join(outDir, 'report')}`,
  '--quiet',
]

// prefer npx lighthouse
const result = spawnSync('npx', ['--yes', ...args], {
  encoding: 'utf8',
  shell: true,
  maxBuffer: 20 * 1024 * 1024,
})

if (result.status !== 0 && result.error) {
  console.error(result.stderr || result.error)
}

// lighthouse writes report.report.json or report.json depending on version
import { readFileSync, existsSync } from 'node:fs'

let reportPath = join(outDir, 'report.report.json')
if (!existsSync(reportPath)) reportPath = join(outDir, 'report.json')
if (!existsSync(reportPath)) {
  // try .lighthouseci style
  console.error('No lighthouse JSON report found. stderr:', result.stderr)
  console.error('stdout:', result.stdout?.slice(0, 500))
  process.exit(result.status || 1)
}

const report = JSON.parse(readFileSync(reportPath, 'utf8'))
const cats = report.categories || {}
const scores = {
  performance: Math.round((cats.performance?.score ?? 0) * 100),
  accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
  'best-practices': Math.round((cats['best-practices']?.score ?? 0) * 100),
  seo: Math.round((cats.seo?.score ?? 0) * 100),
}

console.log('Scores:', scores)
writeFileSync(
  join(outDir, 'scores.json'),
  JSON.stringify({ url, threshold, scores, at: new Date().toISOString() }, null, 2)
)

const failed = Object.entries(scores).filter(([, v]) => v < threshold)
if (failed.length) {
  console.error(
    `FAIL: below ${threshold}:`,
    failed.map(([k, v]) => `${k}=${v}`).join(', ')
  )
  process.exit(1)
}

console.log(`PASS: all categories ≥ ${threshold}`)
process.exit(0)
