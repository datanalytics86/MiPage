import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { useAuth } from '@/contexts/AuthContext'
import { loadPublicAuthors } from '@/lib/publicProfiles'
import type { ReviewWithUser } from '@/types/database'

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
        .select('*')
        .eq('provider_id', providerId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      const authors = await loadPublicAuthors(
        supabase,
        (data || []).map((review) => review.user_id as string)
      )
      return (data || []).map((review) => ({
        ...review,
        user: authors.get(review.user_id) ?? { name: null, avatar_url: null },
      })) as ReviewWithUser[]
    },
    enabled: hasSupabaseEnv() && !!providerId,
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
      const { error } = await supabase.rpc('respond_to_review', {
        p_review_id: reviewId,
        p_response: response,
      })

      if (error) throw error
      return { providerId }
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
      const { error } = await supabase.rpc('mark_review_helpful', {
        p_review_id: reviewId,
      })
      if (error) throw error
      return { reviewId, providerId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.provider(data.providerId) })
    },
  })
}
