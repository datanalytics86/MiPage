import { NextResponse, type NextRequest } from 'next/server'
import { updateSession, protectedRoutes, adminRoutes, authRoutes } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { hasSupabaseEnv } from '@/lib/supabase/env'

/** Marketing/public routes: skip heavy session refresh (client AuthContext still works). */
function isPublicMarketingPath(pathname: string): boolean {
  if (pathname === '/') return true
  const prefixes = [
    '/explorar',
    '/perfil/',
    '/ayuda',
    '/contacto',
    '/privacidad',
    '/terminos',
    '/sobre-nosotros',
    '/favoritos',
  ]
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const isProd = process.env.NODE_ENV === 'production'
  const { pathname } = request.nextUrl

  if (!hasSupabaseEnv()) {
    if (isProd) {
      if (
        pathname.startsWith('/admin') ||
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/api/account')
      ) {
        return NextResponse.json({ error: 'Auth not configured' }, { status: 503 })
      }
    }
    return NextResponse.next()
  }

  // Fast path: public pages without cookie session round-trip (LCP)
  const needsAuthGate =
    protectedRoutes.some((route) => pathname.startsWith(route)) ||
    adminRoutes.some((route) => pathname.startsWith(route)) ||
    authRoutes.some((route) => pathname.startsWith(route))

  if (!needsAuthGate && isPublicMarketingPath(pathname)) {
    return NextResponse.next()
  }

  const response = await updateSession(request)

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute || isAdminRoute) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (isAdminRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    if (pathname.startsWith('/dashboard')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'provider' && profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  if (isAuthRoute) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const redirect = request.nextUrl.searchParams.get('redirect') || '/'
      return NextResponse.redirect(new URL(redirect, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
