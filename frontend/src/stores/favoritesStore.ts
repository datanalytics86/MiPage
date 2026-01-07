import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Provider } from '@/types/database'

interface FavoriteItem {
  id: string
  provider_id: string
  provider?: Provider
  added_at: string
}

interface FavoritesState {
  favorites: FavoriteItem[]
  isLoading: boolean
  isSynced: boolean

  // Actions
  fetchFavorites: (userId: string) => Promise<void>
  addFavorite: (userId: string, providerId: string) => Promise<boolean>
  removeFavorite: (userId: string, providerId: string) => Promise<boolean>
  isFavorite: (providerId: string) => boolean
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: false,
      isSynced: false,

      fetchFavorites: async (userId: string) => {
        set({ isLoading: true })
        try {
          const supabase = getSupabaseClient()
          const { data, error } = await supabase
            .from('favorites')
            .select(`
              id,
              provider_id,
              created_at,
              provider:providers (*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

          if (error) throw error

          const favorites = (data || []).map(item => ({
            id: item.id,
            provider_id: item.provider_id,
            provider: item.provider as unknown as Provider,
            added_at: item.created_at,
          }))

          set({ favorites, isLoading: false, isSynced: true })
        } catch (error) {
          console.error('Error fetching favorites:', error)
          set({ isLoading: false })
        }
      },

      addFavorite: async (userId: string, providerId: string) => {
        const supabase = getSupabaseClient()

        try {
          // Optimistic update
          const tempFavorite: FavoriteItem = {
            id: `temp-${Date.now()}`,
            provider_id: providerId,
            added_at: new Date().toISOString(),
          }
          set(state => ({
            favorites: [tempFavorite, ...state.favorites],
          }))

          const { data, error } = await supabase
            .from('favorites')
            .insert({ user_id: userId, provider_id: providerId })
            .select(`
              id,
              provider_id,
              created_at,
              provider:providers (*)
            `)
            .single()

          if (error) throw error

          // Replace temp with real data
          set(state => ({
            favorites: state.favorites.map(f =>
              f.id === tempFavorite.id
                ? {
                    id: data.id,
                    provider_id: data.provider_id,
                    provider: data.provider as unknown as Provider,
                    added_at: data.created_at,
                  }
                : f
            ),
          }))

          return true
        } catch (error) {
          // Rollback on error
          set(state => ({
            favorites: state.favorites.filter(f => f.provider_id !== providerId),
          }))
          console.error('Error adding favorite:', error)
          return false
        }
      },

      removeFavorite: async (userId: string, providerId: string) => {
        const supabase = getSupabaseClient()
        const { favorites } = get()

        // Store for rollback
        const removedFavorite = favorites.find(f => f.provider_id === providerId)

        try {
          // Optimistic update
          set(state => ({
            favorites: state.favorites.filter(f => f.provider_id !== providerId),
          }))

          const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('provider_id', providerId)

          if (error) throw error
          return true
        } catch (error) {
          // Rollback on error
          if (removedFavorite) {
            set(state => ({
              favorites: [...state.favorites, removedFavorite],
            }))
          }
          console.error('Error removing favorite:', error)
          return false
        }
      },

      isFavorite: (providerId: string) => {
        return get().favorites.some(f => f.provider_id === providerId)
      },

      clearFavorites: () => {
        set({ favorites: [], isSynced: false })
      },
    }),
    {
      name: 'luxe-favorites',
      partialize: (state) => ({
        favorites: state.favorites.map(f => ({
          id: f.id,
          provider_id: f.provider_id,
          added_at: f.added_at,
        })),
      }),
    }
  )
)
