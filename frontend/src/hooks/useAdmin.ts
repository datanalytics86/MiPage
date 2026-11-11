import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { sanitizePostgrestSearch } from '@/lib/filters'
import type { ProviderStatus, ReportStatus, UserRole } from '@/types/database'

export const adminKeys = {
  all: ['admin'] as const,
  providers: () => [...adminKeys.all, 'providers'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  reports: () => [...adminKeys.all, 'reports'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
}

export interface AdminProviderRow {
  id: string
  user_id: string
  slug: string
  display_name: string
  category: string
  city: string
  status: ProviderStatus
  is_verified: boolean
  is_featured: boolean
  rating: number
  review_count: number
  price_min: number | null
  cover_photo: string | null
  photos: string[]
  created_at: string
  bio: string | null
  email: string
  services_count: number
  whatsapp: string | null
  instagram: string | null
  rejection_reason: string | null
  featured_until: string | null
  metadata: Record<string, unknown> | null
  services: { name: string; price: number }[]
}

export function useAdminPendingCount() {
  return useQuery({
    queryKey: [...adminKeys.providers(), 'pending-count'],
    enabled: hasSupabaseEnv(),
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { count, error } = await supabase
        .from('providers')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
      if (error) throw error
      return count ?? 0
    },
  })
}

export function useAdminProviders(params?: {
  q?: string
  status?: string
  category?: string
  page?: number
  pageSize?: number
}) {
  const page = params?.page ?? 0
  const pageSize = params?.pageSize ?? 20
  return useQuery({
    queryKey: [...adminKeys.providers(), params ?? null],
    enabled: hasSupabaseEnv(),
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('providers')
        .select(
          `
          *,
          profile:profiles!user_id (email),
          services (name, price)
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })

      if (params?.status && params.status !== 'all') query = query.eq('status', params.status)
      if (params?.category && params.category !== 'all') query = query.eq('category', params.category)
      const q = sanitizePostgrestSearch(params?.q || '')
      if (q) query = query.ilike('display_name', `%${q}%`)

      const { data, error, count } = await query.range(page * pageSize, page * pageSize + pageSize - 1)
      if (error) throw error

      const rows = (data || []).map((row) => {
        const profile = row.profile as { email: string } | null
        const services = (row.services as { name: string; price: number }[] | null) || []
        return {
          id: row.id,
          user_id: row.user_id,
          slug: row.slug,
          display_name: row.display_name,
          category: row.category,
          city: row.city,
          status: row.status,
          is_verified: row.is_verified,
          is_featured: row.is_featured,
          rating: Number(row.rating) || 0,
          review_count: row.review_count,
          price_min: row.price_min,
          cover_photo: row.cover_photo,
          photos: row.photos || [],
          created_at: row.created_at,
          bio: row.bio ?? null,
          email: profile?.email ?? '',
          services_count: services.length,
          whatsapp: row.whatsapp ?? null,
          instagram: row.instagram ?? null,
          rejection_reason: row.rejection_reason ?? null,
          featured_until: row.featured_until ?? null,
          metadata: (row.metadata as Record<string, unknown> | null) ?? null,
          services: services.map((service) => ({
            name: service.name,
            price: Number(service.price) || 0,
          })),
        } satisfies AdminProviderRow
      })
      return { rows, total: count ?? rows.length }
    },
  })
}

export function useUpdateProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
      notify,
    }: {
      id: string
      updates: Record<string, unknown>
      notify?: {
        type: 'provider_approved' | 'provider_rejected'
        email?: string
        displayName?: string
        reason?: string
      }
    }) => {
      if (typeof updates.status === 'string') {
        const res = await fetch(`/api/admin/providers/${id}/moderate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: updates.status,
            rejection_reason:
              typeof updates.rejection_reason === 'string' || updates.rejection_reason === null
                ? updates.rejection_reason
                : notify?.reason ?? null,
          }),
        })
        if (res.status === 401) throw new Error('No autenticado')
        if (res.status === 403) throw new Error('Sin permisos')
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(body.error || 'No se pudo moderar')
        }
        return
      }

      const res = await fetch(`/api/admin/providers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.status === 401) throw new Error('No autenticado')
      if (res.status === 403) throw new Error('Sin permisos')
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || 'No se pudo guardar')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.providers() })
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
    },
  })
}

export function useModerateProviders() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      ids,
      status,
      rejection_reason,
    }: {
      ids: string[]
      status: 'approved' | 'rejected' | 'suspended' | 'pending'
      rejection_reason?: string | null
    }) => {
      const id = ids[0]
      if (!id) throw new Error('Sin avisos')
      const res = await fetch(`/api/admin/providers/${id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status, rejection_reason: rejection_reason ?? null }),
      })
      if (res.status === 401) throw new Error('No autenticado')
      if (res.status === 403) throw new Error('Sin permisos')
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || 'No se pudo moderar')
      }
      return (await res.json()) as { ok: boolean; updated: number }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.providers() })
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
    },
  })
}

export interface AdminUserRow {
  id: string
  name: string | null
  email: string
  role: UserRole
  avatar_url: string | null
  created_at: string
  is_suspended: boolean
  provider_slug: string | null
}

export function useAdminUsers(params?: { q?: string; role?: string; page?: number; pageSize?: number }) {
  const page = params?.page ?? 0
  const pageSize = params?.pageSize ?? 20
  return useQuery({
    queryKey: [...adminKeys.users(), params ?? null],
    enabled: hasSupabaseEnv(),
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('profiles')
        .select('id, name, email, role, avatar_url, created_at, is_suspended, providers(slug)', {
          count: 'exact',
        })
        .order('created_at', { ascending: false })

      if (params?.role && params.role !== 'all') query = query.eq('role', params.role)
      const q = sanitizePostgrestSearch(params?.q || '')
      if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`)

      const { data, error, count } = await query.range(page * pageSize, page * pageSize + pageSize - 1)
      if (error) throw error
      const rows = (data || []).map((row) => {
        const linked = row.providers as { slug: string }[] | { slug: string } | null
        const slug = Array.isArray(linked) ? linked[0]?.slug : linked?.slug
        return {
          id: row.id as string,
          name: (row.name as string | null) ?? null,
          email: row.email as string,
          role: row.role as UserRole,
          avatar_url: (row.avatar_url as string | null) ?? null,
          created_at: row.created_at as string,
          is_suspended: Boolean(row.is_suspended),
          provider_slug: slug ?? null,
        } satisfies AdminUserRow
      })
      return { rows, total: count ?? rows.length }
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || 'No se pudo cambiar el rol')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
    },
  })
}

export interface AdminReportRow {
  id: string
  reported_type: string
  reported_id: string
  reason: string
  description: string | null
  status: ReportStatus
  priority: string
  created_at: string
  resolved_at: string | null
  resolution_note: string | null
  reporter: { name: string | null; email: string; avatar_url: string | null }
}

export function useAdminReports(params?: { q?: string; status?: string; page?: number; pageSize?: number }) {
  const page = params?.page ?? 0
  const pageSize = params?.pageSize ?? 20
  return useQuery({
    queryKey: [...adminKeys.reports(), params ?? null],
    enabled: hasSupabaseEnv(),
    queryFn: async () => {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('reports')
        .select(
          `
          *,
          reporter:profiles!reports_reporter_id_fkey (name, email, avatar_url)
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })

      if (params?.status && params.status !== 'all') query = query.eq('status', params.status)
      const q = sanitizePostgrestSearch(params?.q || '')
      if (q) query = query.or(`reason.ilike.%${q}%,description.ilike.%${q}%`)

      const { data, error, count } = await query.range(page * pageSize, page * pageSize + pageSize - 1)
      if (error) throw error

      const rows = (data || []).map((row) => ({
        id: row.id,
        reported_type: row.reported_type,
        reported_id: row.reported_id,
        reason: row.reason,
        description: row.description,
        status: row.status,
        priority: row.priority,
        created_at: row.created_at,
        resolved_at: row.resolved_at,
        resolution_note: row.resolution_note,
        reporter: row.reporter as AdminReportRow['reporter'],
      })) satisfies AdminReportRow[]
      return { rows, total: count ?? rows.length }
    },
  })
}

export function useUpdateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      action,
      note,
    }: {
      id: string
      action: 'dismiss' | 'suspend_profile' | 'hide_review'
      note?: string
    }) => {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || 'No se pudo actualizar el reporte')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reports() })
      queryClient.invalidateQueries({ queryKey: adminKeys.providers() })
    },
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    enabled: hasSupabaseEnv(),
    queryFn: async () => {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('No se pudieron cargar las cifras')
      return (await res.json()) as {
        totalUsers: number
        activeProviders: number
        pendingReports: number
        pendingProviders: number
        oldestPendingAt: string | null
        unreadMessages: number
        pendingDeletions: number
        expiringFeatured: number
        signups7: number
        signups30: number
        system: { database: boolean; email: boolean; payments: boolean }
      }
    },
  })
}