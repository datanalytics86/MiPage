'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuthStore } from '@/lib/auth';

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const API_URL = configuredApiUrl && configuredApiUrl !== '' ? configuredApiUrl.replace(/\/+$/, '') : '';

const buildApiUrl = (path: string) => `${API_URL}${path}`;

const requestWithFallback = async (path: string, initFactory: () => RequestInit) => {
  const endpoints = API_URL ? [buildApiUrl(path), path] : [path];
  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    try {
      const init = initFactory();
      const response = await fetch(endpoint, init);
      return response;
    } catch (error) {
      lastError = error;

      const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch';
      const attemptedFallback = endpoint === path;

      if (!isNetworkError || attemptedFallback) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error('Error de red desconocido');
};

type RoleOption = 'ADMIN' | 'PUBLISHER' | 'USER';

type Mode = 'login' | 'register' | 'forgot';

const roleLabels: Record<RoleOption, string> = {
  ADMIN: 'Admin',
  PUBLISHER: 'Oferente',
  USER: 'Usuario',
};

const demoCredentials: Array<{ role: string; email: string; password: string }> = [
  { role: 'Admin', email: 'admin@mipage.cl', password: 'password123' },
  { role: 'Oferente', email: 'maria@example.com', password: 'password123' },
  { role: 'Usuario', email: 'juan@example.com', password: 'password123' },
];

const loginDestinations: Record<RoleOption, string> = {
  ADMIN: '/admin',
  PUBLISHER: '/oferentes',
  USER: '/clientes',
};

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect');
  const reason = searchParams?.get('reason');

  const { setAuth } = useAuthStore();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleOption>('USER');
  const [registerRole, setRegisterRole] = useState<RoleOption>('USER');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'login') {
      setSelectedRole(mode === 'register' ? registerRole : 'USER');
    }
  }, [mode, registerRole]);

  const resetMessages = () => {
    setError(null);
    setFeedback(null);
    setPendingConfirmationEmail(null);
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    resetMessages();

    if (!email || !password) {
      setError('Ingresa tu email y contraseña.');
      return;
    }

    if (!selectedRole) {
      setError('Selecciona el tipo de sesión.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestWithFallback('/api/auth/login', () => ({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole }),
      }));

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data?.requiresConfirmation) {
          setPendingConfirmationEmail(email.trim());
        }
        throw new Error(data?.error || 'No fue posible iniciar sesión.');
      }

      const data = await response.json();
      setAuth(data.user, data.token, { expiresInMs: data.expiresInMs });

      const destination = redirect ?? loginDestinations[selectedRole];
      router.push(destination);
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('No fue posible conectar con el servidor. Intenta nuevamente en unos momentos.');
        return;
      }
      setError(err instanceof Error ? err.message : 'Error inesperado al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    resetMessages();

    if (!email || !password || !confirmPassword || !name || !phone) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestWithFallback('/api/auth/register', () => ({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          phone,
          role: registerRole,
          acceptTerms,
        }),
      }));

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'No fue posible registrar tu cuenta.');
      }

      setFeedback('Registro exitoso. Revisa tu correo para confirmar la cuenta.');
      setMode('login');
      setPassword('');
      setConfirmPassword('');
      setAcceptTerms(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado al registrar la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (event: FormEvent) => {
    event.preventDefault();
    resetMessages();

    if (!email) {
      setError('Ingresa tu email para continuar.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestWithFallback('/api/auth/forgot-password', () => ({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }));

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'No fue posible solicitar la recuperación.');
      }

      setFeedback('Si tu correo existe, recibirás instrucciones para restablecer la contraseña.');
      setMode('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado al solicitar recuperación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!pendingConfirmationEmail) return;
    setIsLoading(true);
    try {
      const response = await requestWithFallback('/api/auth/resend-confirmation', () => ({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingConfirmationEmail }),
      }));

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'No fue posible reenviar el correo.');
      }

      setFeedback('Hemos reenviado el correo de activación. Revisa tu bandeja de entrada.');
      setPendingConfirmationEmail(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado al reenviar la confirmación.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleButtons = useMemo(() => {
    const roles: RoleOption[] = mode === 'register' ? ['USER', 'PUBLISHER'] : ['ADMIN', 'USER', 'PUBLISHER'];
    return roles.map((role) => {
      const isActive = (mode === 'register' ? registerRole : selectedRole) === role;
      return (
        <button
          key={role}
          type="button"
          disabled={isLoading}
          onClick={() => {
            if (mode === 'register') {
              setRegisterRole(role);
            } else {
              setSelectedRole(role);
            }
          }}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            isActive
              ? 'bg-white text-neutral-900 shadow'
              : 'border border-white/20 bg-white/5 text-neutral-200 hover:border-white hover:text-white'
          }`}
        >
          {roleLabels[role]}
        </button>
      );
    });
  }, [mode, registerRole, selectedRole, isLoading]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-16 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-black/40 px-8 py-10 backdrop-blur">
        <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-neutral-400">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="rounded-full border border-white/20 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white hover:bg-white/10"
          >
            Regresar
          </button>
          <span className="text-neutral-500">Acceso</span>
        </div>
        <div className="mb-8 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-neutral-400">
          {(['login', 'register'] as Mode[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                resetMessages();
                setMode(option);
              }}
              className={`transition ${mode === option ? 'text-white' : 'text-neutral-500 hover:text-white'}`}
            >
              {option === 'login' ? 'Ingresar' : 'Registrarse'}
            </button>
          ))}
        </div>

        <form
          onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleForgotPassword}
          className="space-y-5"
          autoComplete="off"
        >
          <div className="space-y-4">
            <div>
              <label className="sr-only" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/25 bg-white/85 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 outline-none transition focus:border-white"
                autoComplete="email"
                required
              />
            </div>
            {(mode === 'login' || mode === 'register') && (
              <div>
                <label className="sr-only" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-white/25 bg-white/85 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 outline-none transition focus:border-white"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
              </div>
            )}
            {mode === 'register' && (
              <>
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-xl border border-white/25 bg-white/85 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 outline-none transition focus:border-white"
                  autoComplete="new-password"
                  required
                />
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-white/25 bg-white/85 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 outline-none transition focus:border-white"
                  required
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-xl border border-white/25 bg-white/85 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 outline-none transition focus:border-white"
                  required
                />
              </>
            )}
          </div>

          <div className="space-y-4">
            {mode !== 'forgot' && (
              <div
                className={`grid gap-3 text-xs uppercase tracking-wide ${
                  mode === 'register' ? 'grid-cols-2' : 'grid-cols-3'
                }`}
              >
                {roleButtons}
              </div>
            )}
            {mode === 'register' && (
              <label className="flex items-center gap-3 text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                  className="h-4 w-4 rounded border border-white/30 bg-white/10 text-neutral-900 focus:ring-white"
                />
                <span>
                  Acepto los{' '}
                  <Link href="#" className="underline hover:text-white">
                    términos y condiciones
                  </Link>
                  .
                </span>
              </label>
            )}
          </div>

          <div className="min-h-[1.75rem] text-center text-xs leading-relaxed">
            {error && <p className="text-red-300">{error}</p>}
            {!error && feedback && <p className="text-emerald-300">{feedback}</p>}
            {!error && !feedback && reason === 'expired' && (
              <p className="text-neutral-300">La sesión expiró, vuelve a iniciar sesión.</p>
            )}
            {!error && !feedback && pendingConfirmationEmail && (
              <p className="text-amber-300">
                Debes confirmar tu correo antes de ingresar.
                <button
                  type="button"
                  className="ml-2 underline hover:text-white"
                  onClick={handleResendConfirmation}
                  disabled={isLoading}
                >
                  Reenviar confirmación
                </button>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200 disabled:opacity-60"
          >
            {mode === 'login'
              ? isLoading
                ? 'Ingresando...'
                : 'Ingresar'
              : mode === 'register'
              ? isLoading
                ? 'Registrando...'
                : 'Crear cuenta'
              : isLoading
              ? 'Enviando...'
              : 'Enviar instrucciones'}
          </button>
        </form>

        {mode === 'login' && (
          <div className="mt-6 text-center text-xs text-neutral-400">
            <button
              type="button"
              onClick={() => {
                resetMessages();
                setMode('forgot');
              }}
              className="underline hover:text-white"
            >
              ¿Olvidaste contraseña?
            </button>
          </div>
        )}

        {mode === 'forgot' && (
          <div className="mt-6 text-center text-xs text-neutral-400">
            <button
              type="button"
              onClick={() => {
                resetMessages();
                setMode('login');
              }}
              className="underline hover:text-white"
            >
              Volver a iniciar sesión
            </button>
          </div>
        )}
        <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-[11px] leading-5 text-neutral-200">
          <p className="font-semibold uppercase tracking-[0.3em] text-white/80">Credenciales de prueba</p>
          <ul className="space-y-2">
            {demoCredentials.map((credential) => (
              <li key={credential.role} className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2 text-[11px] text-neutral-100">
                <span className="font-medium uppercase tracking-[0.25em] text-white/70">{credential.role}</span>
                <span className="text-[11px] text-neutral-200">
                  {credential.email} · <span className="font-mono text-white/90">{credential.password}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
