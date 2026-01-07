import { create } from 'zustand'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface UIState {
  // Mobile menu
  isMobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  toggleMobileMenu: () => void

  // Search modal
  isSearchOpen: boolean
  setSearchOpen: (open: boolean) => void

  // Auth modal (for quick login prompts)
  isAuthModalOpen: boolean
  authModalMode: 'login' | 'register'
  setAuthModalOpen: (open: boolean, mode?: 'login' | 'register') => void

  // Toasts
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void

  // Loading states
  globalLoading: boolean
  setGlobalLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  // Mobile menu
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleMobileMenu: () => set(state => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  // Search modal
  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),

  // Auth modal
  isAuthModalOpen: false,
  authModalMode: 'login',
  setAuthModalOpen: (open, mode = 'login') => set({
    isAuthModalOpen: open,
    authModalMode: mode,
  }),

  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}`
    const duration = toast.duration || 5000

    set(state => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))

    // Auto remove after duration
    setTimeout(() => {
      get().removeToast(id)
    }, duration)
  },
  removeToast: (id) => set(state => ({
    toasts: state.toasts.filter(t => t.id !== id),
  })),

  // Loading states
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}))

// Helper hook for toast notifications
export function useToast() {
  const addToast = useUIStore(state => state.addToast)

  return {
    success: (title: string, message?: string) =>
      addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) =>
      addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) =>
      addToast({ type: 'info', title, message }),
  }
}
