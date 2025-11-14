import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'PUBLISHER' | 'ADMIN';
  avatar?: string;
  isVerified: boolean;
  emailConfirmed?: boolean;
  isActive?: boolean;
  phone?: string;
  bio?: string;
  lastLogin?: string | null;
  metadata?: {
    businessName?: string;
    address?: string;
    website?: string;
    socialMedia?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
    };
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (user: User, token: string, options?: { expiresInMs?: number }) => void;
  refreshSession: (expiresInMs?: number) => void;
  setUser: (user: User) => void;
  setHasHydrated: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      expiresAt: null,
      isAuthenticated: false,
      hasHydrated: false,
      setAuth: (user, token, options) => {
        const expiresInMs = options?.expiresInMs ?? 1000 * 60 * 60 * 12; // 12 horas
        const expiresAt = Date.now() + expiresInMs;

        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('tokenExpiry', String(expiresAt));
        }

        set({ user, token, expiresAt, isAuthenticated: true });
      },
      refreshSession: (expiresInMs = 1000 * 60 * 60 * 12) => {
        const { token, user } = get();
        if (!token || !user) return;

        const expiresAt = Date.now() + expiresInMs;
        if (typeof window !== 'undefined') {
          localStorage.setItem('tokenExpiry', String(expiresAt));
        }

        set({ expiresAt });
      },
      setUser: (user) => {
        set({ user });
      },
      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiry');
        }

        set({ user: null, token: null, expiresAt: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const getToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const expiryRaw = localStorage.getItem('tokenExpiry');

    if (!token) return null;

    if (expiryRaw) {
      const expiresAt = Number.parseInt(expiryRaw, 10);
      if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
        useAuthStore.getState().logout();
        return null;
      }
    }

    return token;
  }
  return null;
};

export const isAuthenticated = () => {
  const { isAuthenticated, expiresAt } = useAuthStore.getState();
  if (!isAuthenticated) return false;

  if (expiresAt && expiresAt <= Date.now()) {
    useAuthStore.getState().logout();
    return false;
  }

  return true;
};

export const hasRole = (role: string | string[]) => {
  const { user } = useAuthStore.getState();
  if (!user) return false;

  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  return user.role === role;
};

const finalizeHydration = (state?: AuthState | Partial<AuthState> | null) => {
  const expiresAt = state?.expiresAt ?? null;
  const hasValidSession = !!state?.token && !!state?.user && (!expiresAt || expiresAt > Date.now());

  if (!hasValidSession) {
    useAuthStore.setState({
      user: null,
      token: null,
      expiresAt: null,
      isAuthenticated: false,
      hasHydrated: true,
    });

    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
    }
    return;
  }

  useAuthStore.setState((current) => ({
    ...current,
    user: state?.user ?? null,
    token: state?.token ?? null,
    expiresAt,
    isAuthenticated: true,
    hasHydrated: true,
  }));
};

if (typeof window !== 'undefined') {
  useAuthStore.persist.onFinishHydration((state) => {
    finalizeHydration(state as AuthState);
  });
} else {
  useAuthStore.setState({ hasHydrated: true });
}
