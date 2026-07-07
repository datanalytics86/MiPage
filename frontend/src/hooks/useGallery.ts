import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { syncProviderGallery } from '@/lib/providerSync'
import type { GalleryItem } from '@/types/database'

export const galleryKeys = {
  all: ['gallery'] as const,
  provider: (providerId: string) => [...galleryKeys.all, providerId] as const,
}

export function useProviderGallery(providerId: string | undefined) {
  return useQuery({
    queryKey: galleryKeys.provider(providerId || ''),
    enabled: hasSupabaseEnv() && !!providerId,
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .eq('provider_id', providerId!)
        .order('sort_order')

      if (error) throw error
      return (data || []) as GalleryItem[]
    },
  })
}

function getPublicUrl(path: string) {
  const supabase = getSupabaseClient()
  const { data } = supabase.storage.from('gallery').getPublicUrl(path)
  return data.publicUrl
}

function extractGalleryStoragePath(url: string): string | null {
  const publicMatch = url.match(/\/storage\/v1\/object\/public\/gallery\/(.+)$/)
  if (publicMatch) return decodeURIComponent(publicMatch[1].split('?')[0])
  if (url.includes('/gallery/')) {
    return url.split('/gallery/')[1]?.split('?')[0] ?? null
  }
  return null
}

export function useAddGalleryUrl() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      providerId,
      url,
      isCover,
      sortOrder,
    }: {
      providerId: string
      url: string
      isCover?: boolean
      sortOrder?: number
    }) => {
      const supabase = getSupabaseClient()

      if (isCover) {
        await supabase
          .from('gallery')
          .update({ is_cover: false })
          .eq('provider_id', providerId)
      }

      const { data, error } = await supabase
        .from('gallery')
        .insert({
          provider_id: providerId,
          type: 'image',
          url,
          is_cover: isCover ?? false,
          sort_order: sortOrder ?? 0,
        })
        .select()
        .single()

      if (error) throw error
      await syncProviderGallery(providerId)
      return data as GalleryItem
    },
    onSuccess: (_, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.provider(providerId) })
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
  })
}

export function useUploadGalleryFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      providerId,
      file,
      isFirst,
      sortOrder,
    }: {
      providerId: string
      file: File
      isFirst?: boolean
      sortOrder?: number
    }) => {
      const supabase = getSupabaseClient()
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${providerId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(path, file, { upsert: false })

      if (uploadError) throw uploadError

      const url = getPublicUrl(path)
      const isCover = isFirst ?? false

      if (isCover) {
        await supabase
          .from('gallery')
          .update({ is_cover: false })
          .eq('provider_id', providerId)
      }

      const { data, error } = await supabase
        .from('gallery')
        .insert({
          provider_id: providerId,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url,
          is_cover: isCover,
          sort_order: sortOrder ?? 0,
        })
        .select()
        .single()

      if (error) throw error
      await syncProviderGallery(providerId)
      return data as GalleryItem
    },
    onSuccess: (_, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.provider(providerId) })
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
  })
}

export function useDeleteGalleryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      providerId,
      url,
    }: {
      id: string
      providerId: string
      url: string
    }) => {
      const supabase = getSupabaseClient()

      const storagePath = extractGalleryStoragePath(url)
      if (storagePath) {
        const { error: storageError } = await supabase.storage.from('gallery').remove([storagePath])
        if (storageError) console.warn('Storage delete:', storageError.message)
      }

      const { error } = await supabase.from('gallery').delete().eq('id', id)
      if (error) throw error
      await syncProviderGallery(providerId)
    },
    onSuccess: (_, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.provider(providerId) })
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
  })
}

export function useSetGalleryCover() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, providerId }: { id: string; providerId: string }) => {
      const supabase = getSupabaseClient()
      await supabase.from('gallery').update({ is_cover: false }).eq('provider_id', providerId)
      const { error } = await supabase.from('gallery').update({ is_cover: true }).eq('id', id)
      if (error) throw error
      await syncProviderGallery(providerId)
    },
    onSuccess: (_, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.provider(providerId) })
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
  })
}