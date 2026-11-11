import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { safeRedirect } from '@/lib/safeRedirect'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = safeRedirect(url.searchParams.get('next'), '/')

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      const login = new URL('/login', url.origin)
      login.searchParams.set('error', 'auth')
      return NextResponse.redirect(login)
    }
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
