'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Profile, Provider } from '@/types/database'

interface AuthState {
  user: User | null
  profile: Profile | null
  provider: Provider | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, data?: { name?: string; role?: 'user' | 'provider' }) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    provider: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const supabase = getSupabaseClient()

  // Fetch user profile and provider data
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // Fetch provider if user is a provider
      let provider = null
      if (profile?.role === 'provider') {
        const { data: providerData } = await supabase
          .from('providers')
          .select('*')
          .eq('user_id', userId)
          .single()
        provider = providerData
      }

      return { profile, provider }
    } catch (error) {
      console.error('Error fetching user data:', error)
      return { profile: null, provider: null }
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const { profile, provider } = await fetchUserData(session.user.id)
          setState({
            user: session.user,
            profile,
            provider,
            session,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { profile, provider } = await fetchUserData(session.user.id)
          setState({
            user: session.user,
            profile,
            provider,
            session,
            isLoading: false,
            isAuthenticated: true,
          })
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            provider: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          })
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setState(prev => ({ ...prev, session }))
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    data?: { name?: string; role?: 'user' | 'provider' }
  ) => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: data?.name || '',
            role: data?.role || 'user',
          },
        },
      })

      if (error) return { error }

      // Create profile after signup
      if (authData.user) {
        await supabase.from('profiles').insert({
          id: authData.user.id,
          email,
          name: data?.name || null,
          role: data?.role || 'user',
        })

        // If registering as provider, create provider record
        if (data?.role === 'provider') {
          const slug = (data.name || email.split('@')[0])
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')

          await supabase.from('providers').insert({
            user_id: authData.user.id,
            slug: `${slug}-${Date.now()}`,
            display_name: data.name || 'Nuevo Proveedor',
            category: 'masajes',
            city: 'Santiago',
            status: 'pending',
          })
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshProfile = async () => {
    if (state.user) {
      const { profile, provider } = await fetchUserData(state.user.id)
      setState(prev => ({ ...prev, profile, provider }))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
