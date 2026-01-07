import { useFavoritesStore } from '@/stores/favoritesStore'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { useToast } from '@/stores/uiStore'

export function useFavorites() {
  const { user, isAuthenticated } = useAuth()
  const toast = useToast()
  const {
    favorites,
    isLoading,
    isSynced,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
  } = useFavoritesStore()

  // Sync favorites when user logs in
  useEffect(() => {
    if (isAuthenticated && user && !isSynced) {
      fetchFavorites(user.id)
    } else if (!isAuthenticated && favorites.length > 0) {
      clearFavorites()
    }
  }, [isAuthenticated, user, isSynced])

  const toggleFavorite = async (providerId: string) => {
    if (!isAuthenticated || !user) {
      toast.info('Inicia sesión', 'Debes iniciar sesión para guardar favoritos')
      return false
    }

    const isCurrentlyFavorite = isFavorite(providerId)

    if (isCurrentlyFavorite) {
      const success = await removeFavorite(user.id, providerId)
      if (success) {
        toast.success('Eliminado de favoritos')
      }
      return !success
    } else {
      const success = await addFavorite(user.id, providerId)
      if (success) {
        toast.success('Agregado a favoritos')
      }
      return success
    }
  }

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
    favoritesCount: favorites.length,
  }
}
