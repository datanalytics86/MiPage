import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Review, ReviewWithUser } from '@/types/database'

export const reviewKeys = {
  all: ['reviews'] as const,
  provider: (providerId: string) => [...reviewKeys.all, 'provider', providerId] as const,
  user: (userId: string) => [...reviewKeys.all, 'user', userId] as const,
}

interface CreateReviewData {
  provider_id: string
  rating: number
  comment: string
}

// Fetch reviews for a provider
export function useProviderReviews(providerId: string, limit = 10) {
  const supabase = getSupabaseClient()

  return useQuery({
    queryKey: reviewKeys.provider(providerId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:profiles!reviews_user_id_fkey (name, avatar_url)
        `)
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as ReviewWithUser[]
    },
    enabled: !!providerId,
  })
}

// Create a new review
export function useCreateReview() {
  const queryClient = useQueryClient()
  const supabase = getSupabaseClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: CreateReviewData) => {
      if (!user) throw new Error('Must be logged in to create a review')

      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      // Update provider's review count and rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('provider_id', data.provider_id)

      if (reviews) {
        const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        await supabase
          .from('providers')
          .update({
            rating: Math.round(avgRating * 10) / 10,
            review_count: reviews.length,
          })
          .eq('id', data.provider_id)
      }

      return review
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.provider(variables.provider_id) })
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
  })
}

// Add provider response to a review
export function useRespondToReview() {
  const queryClient = useQueryClient()
  const supabase = getSupabaseClient()

  return useMutation({
    mutationFn: async ({ reviewId, response, providerId }: {
      reviewId: string
      response: string
      providerId: string
    }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          provider_response: response,
          response_date: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .select()
        .single()

      if (error) throw error
      return { ...data, providerId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.provider(data.providerId) })
    },
  })
}

// Mark review as helpful
export function useMarkHelpful() {
  const queryClient = useQueryClient()
  const supabase = getSupabaseClient()

  return useMutation({
    mutationFn: async ({ reviewId, providerId }: { reviewId: string; providerId: string }) => {
      const { data: review } = await supabase
        .from('reviews')
        .select('helpful_count')
        .eq('id', reviewId)
        .single()

      const { error } = await supabase
        .from('reviews')
        .update({
          helpful_count: (review?.helpful_count || 0) + 1,
        })
        .eq('id', reviewId)

      if (error) throw error
      return { reviewId, providerId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.provider(data.providerId) })
    },
  })
}
