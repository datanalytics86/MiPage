import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { syncProviderPriceMin } from '@/lib/providerSync'
import type { Service } from '@/types/database'

export const serviceKeys = {
  all: ['services'] as const,
  provider: (providerId: string) => [...serviceKeys.all, providerId] as const,
}

export interface ServiceInput {
  name: string
  description?: string
  price: number
  duration?: string
  is_active?: boolean
  sort_order?: number
}

export function useProviderServices(providerId: string | undefined) {
  return useQuery({
    queryKey: serviceKeys.provider(providerId || ''),
    enabled: hasSupabaseEnv() && !!providerId,
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', providerId!)
        .order('sort_order')

      if (error) throw error
      return (data || []) as Service[]
    },
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      providerId,
      input,
    }: {
      providerId: string
      input: ServiceInput
    }) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('services')
        .insert({
          provider_id: providerId,
          name: input.name,
          description: input.description || null,
          price: input.price,
          duration: input.duration || null,
          is_active: input.is_active ?? true,
          sort_order: input.sort_order ?? 0,
        })
        .select()
        .single()

      if (error) throw error
      await syncProviderPriceMin(providerId)
      return data as Service
    },
    onSuccess: (_, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.provider(providerId) })
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      providerId,
      updates,
    }: {
      id: string
      providerId: string
      updates: Partial<ServiceInput>
    }) => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      await syncProviderPriceMin(providerId)
      return data as Service
    },
    onSuccess: (_, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.provider(providerId) })
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, providerId }: { id: string; providerId: string }) => {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (error) throw error
      await syncProviderPriceMin(providerId)
    },
    onSuccess: (_, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.provider(providerId) })
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
  })
}