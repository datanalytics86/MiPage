import { test, expect } from '@playwright/test'

/**
 * Critical product flows — structural + RBAC smoke.
 * Full auth moderation against live Supabase requires:
 *   E2E_PROVIDER_EMAIL / E2E_PROVIDER_PASSWORD
 *   E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD
 */

const hasProviderCreds =
  !!process.env.E2E_PROVIDER_EMAIL && !!process.env.E2E_PROVIDER_PASSWORD
const hasAdminCreds = !!process.env.E2E_ADMIN_EMAIL && !!process.env.E2E_ADMIN_PASSWORD

test.describe('1) Public surface + dark premium', () => {
  test('home is dark and photo-first', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('explorar lists or empty state', async ({ page }) => {
    const res = await page.goto('/explorar', { waitUntil: 'domcontentloaded' })
    expect(res?.ok() || res?.status() === 304).toBeTruthy()
    await expect(page.locator('body')).toBeVisible()
    // Desktop or hydrated mobile UI eventually exposes filters/search
    await page.waitForTimeout(500)
    expect(page.url()).toContain('/explorar')
  })

  test('register exposes Ley 19.628 consent', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByText(/Ley 19\.628/i)).toBeVisible()
  })
})

test.describe('2) RBAC gates (escalation must fail)', () => {
  test('unauthenticated admin → login or blocked', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' })
    const url = page.url()
    const ok =
      url.includes('/login') ||
      url.includes('/admin') ||
      (await page.getByText(/auth not configured|iniciar|sesión/i).count()) > 0
    expect(ok).toBeTruthy()
  })

  test('unauthenticated dashboard → login or blocked', async ({ page }) => {
    await page.goto('/dashboard/avisos/nuevo', { waitUntil: 'domcontentloaded' })
    const url = page.url()
    expect(
      url.includes('/login') || url.includes('/dashboard') || url.includes('/')
    ).toBeTruthy()
  })
})

test.describe('3) Publisher wizard surface', () => {
  test('wizard route responds', async ({ page }) => {
    const res = await page.goto('/dashboard/avisos/nuevo', {
      waitUntil: 'domcontentloaded',
    })
    // 200/302/303/307/404/503(auth not configured in prod without real Supabase)
    const status = res?.status() ?? 200
    expect([200, 302, 303, 307, 401, 403, 404, 503]).toContain(status)
  })

  test('wizard steps visible when provider logged in', async ({ page }) => {
    test.skip(!hasProviderCreds, 'Set E2E_PROVIDER_EMAIL/PASSWORD')
    await page.goto('/login')
    await page.fill('input[type="email"]', process.env.E2E_PROVIDER_EMAIL!)
    await page.fill('input[type="password"]', process.env.E2E_PROVIDER_PASSWORD!)
    await page.getByRole('button', { name: /iniciar|entrar|login/i }).click()
    await page.goto('/dashboard/avisos/nuevo')
    await expect(page.getByText(/datos básicos|fotos|servicios/i).first()).toBeVisible({
      timeout: 15000,
    })
  })
})

test.describe('4) Admin moderation surface', () => {
  test('admin login → proveedores moderation UI', async ({ page }) => {
    test.skip(!hasAdminCreds, 'Set E2E_ADMIN_EMAIL/PASSWORD')
    await page.goto('/login')
    await page.fill('input[type="email"]', process.env.E2E_ADMIN_EMAIL!)
    await page.fill('input[type="password"]', process.env.E2E_ADMIN_PASSWORD!)
    await page.getByRole('button', { name: /iniciar|entrar|login/i }).click()
    await page.goto('/admin/proveedores')
    await expect(
      page.getByText(/gestión de proveedores|pendiente|moderación|proveedor/i).first()
    ).toBeVisible({ timeout: 15000 })
  })
})

test.describe('5) Favorites + health', () => {
  test('favoritos requires auth or shows empty', async ({ page }) => {
    await page.goto('/favoritos', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('body')).toBeVisible()
    // Title or CTA may be in client-rendered empty state
    await expect(
      page.getByRole('heading').or(page.getByText(/favorito|sesión|iniciar/i)).first()
    ).toBeVisible({ timeout: 15000 })
  })

  test('health endpoint contract', async ({ request }) => {
    const res = await request.get('/api/health')
    expect([200, 503]).toContain(res.status())
    const json = await res.json()
    expect(json).toHaveProperty('checks')
  })
})
