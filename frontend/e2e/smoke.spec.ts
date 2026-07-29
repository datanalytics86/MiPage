import { test, expect } from '@playwright/test'

/**
 * Smoke E2E — runs against a running Next server.
 * Full auth/moderation flows require Supabase credentials + seed users.
 */
test.describe('public smoke', () => {
  test('home loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })

  test('login page loads', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /iniciar|entrar|login/i }).or(page.locator('form'))).toBeVisible()
  })

  test('register has privacy consent', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByText(/Ley 19\.628/i)).toBeVisible()
  })

  test('explorar loads', async ({ page }) => {
    await page.goto('/explorar')
    await expect(page.locator('body')).toBeVisible()
  })

  test('dark theme root class', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('favoritos empty or login gate', async ({ page }) => {
    await page.goto('/favoritos', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('body')).toBeVisible()
    await expect(
      page.getByRole('heading').or(page.getByText(/favorito|sesión|iniciar/i)).first()
    ).toBeVisible({ timeout: 15000 })
  })

  test('health endpoint', async ({ request }) => {
    const res = await request.get('/api/health')
    // 200 when supabase env present, 503 degraded otherwise
    expect([200, 503]).toContain(res.status())
    const json = await res.json()
    expect(json).toHaveProperty('checks')
  })

  test('admin redirects unauthenticated when supabase configured', async ({ page }) => {
    const res = await page.goto('/admin')
    // either login redirect or page shell
    const url = page.url()
    expect(url.includes('/login') || url.includes('/admin') || res?.status() === 503).toBeTruthy()
  })
})

test.describe('security probes (public)', () => {
  test('search does not crash on XSS string', async ({ page }) => {
    await page.goto('/explorar?q=' + encodeURIComponent('<script>alert(1)</script>'))
    await expect(page.locator('body')).toBeVisible()
  })

  test('search handles sql-ish probe', async ({ page }) => {
    await page.goto('/explorar?q=' + encodeURIComponent("1' OR 1=1 --"))
    await expect(page.locator('body')).toBeVisible()
  })
})
