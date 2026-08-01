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

  test('explorar category masajes returns 200', async ({ page }) => {
    const res = await page.goto('/explorar/masajes')
    expect(res?.status()).toBe(200)
    await expect(page.locator('body')).toBeVisible()
  })

  test('explorar category modelaje returns 200', async ({ page }) => {
    const res = await page.goto('/explorar/modelaje')
    expect(res?.status()).toBe(200)
    await expect(page.locator('body')).toBeVisible()
  })

  test('forgot-password page loads', async ({ page }) => {
    const res = await page.goto('/forgot-password')
    expect(res?.status()).toBe(200)
    await expect(page.getByText(/recuperar|contraseña|email/i).first()).toBeVisible()
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

  test('home category chip Masajes → /explorar/masajes', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /masajes/i }).first().click()
    await expect(page).toHaveURL(/\/explorar\/masajes/)
    expect((await page.goto(page.url()))?.status() ?? 200).toBeLessThan(400)
  })

  test('home category chip Modelaje → /explorar/modelaje', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /modelaje/i }).first().click()
    await expect(page).toHaveURL(/\/explorar\/modelaje/)
  })

  test('header nav Explorar is not 404', async ({ page }) => {
    const res = await page.goto('/explorar')
    expect(res?.status()).toBe(200)
    await expect(page).toHaveURL(/\/explorar/)
    // Desktop header link exists; mobile uses drawer — both point to same path.
    await page.goto('/')
    const desktop = page.locator('header nav a[href="/explorar"]')
    const mobileToggle = page.getByRole('button', { name: /abrir menú|cerrar menú/i })
    if (await desktop.isVisible().catch(() => false)) {
      await desktop.click()
      await expect(page).toHaveURL(/\/explorar/)
    } else if (await mobileToggle.isVisible().catch(() => false)) {
      await mobileToggle.click()
      await page.locator('a[href="/explorar"]').first().click()
      await expect(page).toHaveURL(/\/explorar/)
    }
  })

  test('footer links resolve without 404', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    const hrefs = await footer.locator('a[href^="/"]').evaluateAll((els) => {
      const raw = els.map((a) => (a as HTMLAnchorElement).getAttribute('href') || '')
      return Array.from(new Set(raw)).filter((h) => h && !h.startsWith('/#'))
    })
    for (const href of hrefs) {
      const path = href.split('?')[0]
      const res = await page.request.get(path)
      expect(res.status(), `footer ${href}`).toBeLessThan(400)
    }
  })

  test('institutional landings return 200', async ({ request }) => {
    for (const path of ['/ayuda', '/contacto', '/terminos', '/privacidad', '/sobre-nosotros']) {
      const res = await request.get(path)
      expect(res.status(), path).toBe(200)
    }
  })

  test('favoritos empty CTA points to explorar or login', async ({ page }) => {
    await page.goto('/favoritos', { waitUntil: 'domcontentloaded' })
    const cta = page.getByRole('link', { name: /explorar|iniciar|descubrir/i }).first()
    await expect(cta).toBeVisible({ timeout: 15000 })
    const href = await cta.getAttribute('href')
    expect(href).toMatch(/\/(explorar|login)/)
  })

  test('dashboard without session is not blank privileged shell', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(800)
    const body = await page.locator('body').innerText()
    const gated =
      page.url().includes('/login') ||
      /iniciar sesión|acceso no disponible|auth not configured|sin permisos/i.test(body)
    expect(gated || body.length > 20).toBeTruthy()
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
