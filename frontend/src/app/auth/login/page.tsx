'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuthStore } from '@/lib/auth';

type RoleOption = 'ADMIN' | 'PUBLISHER' | 'CLIENT';

const roleLabels: Record<RoleOption, string> = {
  ADMIN: 'Admin',
  PUBLISHER: 'Oferente',
  CLIENT: 'Usuario',
};

const DEMO_CREDENTIALS: Record<
  RoleOption,
  {
    email: string;
    password: string;
    user: { id: string; name: string; role: 'ADMIN' | 'PUBLISHER' | 'USER'; email: string; isVerified: boolean };
  }
> = {
  ADMIN: {
    email: 'admin@mipage.cl',
    password: 'password123',
    user: {
      id: 'admin-001',
      name: 'Administradora Demo',
      role: 'ADMIN',
      email: 'admin@mipage.cl',
      isVerified: true,
    },
  },
  PUBLISHER: {
    email: 'maria@example.com',
    password: 'password123',
    user: {
      id: 'publisher-001',
      name: 'María Campos',
      role: 'PUBLISHER',
      email: 'maria@example.com',
      isVerified: false,
    },
  },
  CLIENT: {
    email: 'juan@example.com',
    password: 'password123',
    user: {
      id: 'client-001',
      name: 'Juan Pérez',
      role: 'USER',
      email: 'juan@example.com',
      isVerified: true,
    },
  },
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect');
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (role: RoleOption) => {
    setSelectedRole(role);
    setError('');

    if (!email || !password) {
      setError('Completa email y contraseña.');
      return;
    }

    setIsLoading(true);

    const credentials = DEMO_CREDENTIALS[role];
    const emailMatch = email.trim().toLowerCase() === credentials.email;
    const passwordMatch = password === credentials.password;

    if (!emailMatch || !passwordMatch) {
      setError('Credenciales incorrectas.');
      setIsLoading(false);
      return;
    }

    const token = `${role.toLowerCase()}-demo-token`;
    setAuth(credentials.user, token);

    const fallback = role === 'ADMIN' ? '/admin' : role === 'PUBLISHER' ? '/oferentes' : '/clientes';
    router.push(redirect ?? fallback);
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-10 rounded-3xl border border-white/10 bg-white/8 px-8 py-10 backdrop-blur">
          <header className="space-y-3 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-300">MiPage</p>
            <h1 className="text-2xl font-semibold text-white">Acceso seguro</h1>
          </header>

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="sr-only" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/80 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 focus:border-white focus:outline-none"
                autoComplete="email"
                required
              />
              <label className="sr-only" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/80 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 focus:border-white focus:outline-none"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(roleLabels) as RoleOption[]).map((role) => {
                const isActive = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleLogin(role)}
                    disabled={isLoading}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-white text-neutral-900 shadow'
                        : 'border border-white/20 bg-white/10 text-neutral-200 hover:border-white hover:text-white'
                    } ${isLoading ? 'opacity-70' : ''}`}
                  >
                    {roleLabels[role]}
                  </button>
                );
              })}
            </div>

            {error && <p className="text-center text-xs text-red-300">{error}</p>}
            {!error && selectedRole && email && password && (
              <p className="text-center text-xs text-neutral-400">
                Accediendo como {roleLabels[selectedRole]} · {DEMO_CREDENTIALS[selectedRole].email}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
