'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'
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
  signUp: (
    email: string,
    password: string,
    data?: {
      name?: string
      role?: 'user' | 'provider'
      category?: string
      city?: string
      privacyConsent?: boolean
      ageDeclared?: boolean
      turnstileToken?: string
    }
  ) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = hasSupabaseEnv() ? getSupabaseClient() : null
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    provider: null,
    session: null,
    isLoading: Boolean(supabase),
    isAuthenticated: false,
  })

  // Fetch user profile and provider data
  const fetchUserData = async (userId: string) => {
    if (!supabase) return { profile: null, provider: null }
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
    if (!supabase) return

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const { profile, provider } = await fetchUserData(session.user.id)
          if (profile && (profile as { is_suspended?: boolean }).is_suspended) {
            await supabase.auth.signOut()
            setState((prev) => ({ ...prev, isLoading: false, isAuthenticated: false }))
            return
          }
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
          if (profile && (profile as { is_suspended?: boolean }).is_suspended) {
            await supabase.auth.signOut()
            return
          }
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
    if (!supabase) {
      return { error: new Error('Supabase no configurado') }
    }
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
    data?: {
      name?: string
      role?: 'user' | 'provider'
      category?: string
      city?: string
      privacyConsent?: boolean
      ageDeclared?: boolean
      turnstileToken?: string
    }
  ) => {
    if (!supabase) {
      return { error: new Error('Supabase no configurado') }
    }
    try {
      const gate = await fetch('/api/auth/register-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turnstileToken: data?.turnstileToken || '' }),
      })
      if (gate.status === 429) {
        return { error: new Error('Demasiados intentos de registro. Espera un momento.') }
      }
      if (gate.status === 400) {
        return { error: new Error('No se pudo verificar que eres una persona.') }
      }

      // Solo user o provider. El trigger descarta cualquier otro valor, incluido admin.
      const role = data?.role === 'provider' ? 'provider' : 'user'
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
          data: {
            name: data?.name || '',
            role,
            category: data?.category || 'masajes',
            city: data?.city || 'Santiago',
            privacy_consent: data?.privacyConsent ? 'true' : 'false',
            privacy_consent_version: data?.privacyConsent ? '2026-11-11' : '',
            age_declared: data?.ageDeclared ? 'true' : 'false',
          },
        },
      })

      if (error) return { error }

      // El rol lo fija handle_new_user. No se escribe role desde el cliente.
      if (authData.user && authData.session) {
        await supabase
          .from('profiles')
          .update({ name: data?.name || null })
          .eq('id', authData.user.id)

        if (role === 'provider') {
          await supabase
            .from('providers')
            .update({
              display_name: data?.name || 'Nuevo Proveedor',
              category: data?.category || 'masajes',
              city: data?.city || 'Santiago',
            })
            .eq('user_id', authData.user.id)
        }
      }

      return {
        error: null,
        needsEmailConfirmation: !authData.session,
      }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
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
