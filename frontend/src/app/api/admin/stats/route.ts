import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminGuard'

export async function GET() {
  const gate = await requireAdmin()
  if (gate.error) return gate.error
  const supabase = gate.supabase
  const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const month = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const soon = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const now = new Date().toISOString()

  const [
    users,
    providers,
    reports,
    pending,
    oldest,
    messages,
    deletions,
    expiring,
    signups7,
    signups30,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('providers').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('providers').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('providers').select('created_at').eq('status', 'pending').order('created_at', { ascending: true }).limit(1),
    supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('data_deletion_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('providers').select('id', { count: 'exact', head: true }).eq('is_featured', true).gt('featured_until', now).lt('featured_until', soon),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', week),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', month),
  ])

  return NextResponse.json({
    totalUsers: users.count ?? 0,
    activeProviders: providers.count ?? 0,
    pendingReports: reports.count ?? 0,
    pendingProviders: pending.count ?? 0,
    oldestPendingAt: oldest.data?.[0]?.created_at ?? null,
    unreadMessages: messages.error ? 0 : messages.count ?? 0,
    pendingDeletions: deletions.count ?? 0,
    expiringFeatured: expiring.error ? 0 : expiring.count ?? 0,
    signups7: signups7.count ?? 0,
    signups30: signups30.count ?? 0,
    system: {
      database: !users.error,
      email: Boolean(process.env.RESEND_API_KEY?.trim()),
      payments: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()),
    },
  })
}
