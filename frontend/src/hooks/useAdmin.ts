import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
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
  email: string
  services_count: number
}

export function useAdminProviders() {
  return useQuery({
    queryKey: adminKeys.providers(),
    enabled: hasSupabaseEnv(),
    queryFn: async (): Promise<AdminProviderRow[]> => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('providers')
        .select(`
          *,
          profile:profiles (email),
          services (count)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((row) => {
        const profile = row.profile as { email: string } | null
        const services = row.services as { count: number }[] | null
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
          email: profile?.email ?? '',
          services_count: services?.[0]?.count ?? 0,
        }
      })
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
      const supabase = getSupabaseClient()
      const payload = {
        ...updates,
        moderated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from('providers').update(payload).eq('id', id)
      if (error) throw error

      if (notify?.email) {
        try {
          await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notify),
          })
        } catch {
          /* email is best-effort */
        }
      }
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
}

export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    enabled: hasSupabaseEnv(),
    queryFn: async (): Promise<AdminUserRow[]> => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
      if (error) throw error
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

export function useAdminReports() {
  return useQuery({
    queryKey: adminKeys.reports(),
    enabled: hasSupabaseEnv(),
    queryFn: async (): Promise<AdminReportRow[]> => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles (name, email, avatar_url)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((row) => ({
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
      }))
    },
  })
}

export function useUpdateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: { status: ReportStatus; resolution_note?: string; resolved_at?: string }
    }) => {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('reports').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reports() })
    },
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    enabled: hasSupabaseEnv(),
    queryFn: async () => {
      const supabase = getSupabaseClient()

      const [usersRes, providersRes, reportsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('providers').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ])

      return {
        totalUsers: usersRes.count ?? 0,
        activeProviders: providersRes.count ?? 0,
        pendingReports: reportsRes.count ?? 0,
      }
    },
  })
}