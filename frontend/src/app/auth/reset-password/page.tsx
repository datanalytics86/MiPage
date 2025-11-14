'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      setStatus('error');
      setMessage('Token inválido. Solicita un nuevo enlace.');
      return;
    }

    if (!password || password !== confirmPassword) {
      setStatus('error');
      setMessage('Las contraseñas deben coincidir.');
      return;
    }

    setStatus('submitting');
    setMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'No fue posible actualizar la contraseña.');
      }

      setStatus('success');
      setMessage(data?.message || 'Contraseña actualizada. Ya puedes iniciar sesión.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Error inesperado al actualizar la contraseña.');
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 py-16 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 px-8 py-10 shadow-xl backdrop-blur">
        <h1 className="text-lg font-semibold tracking-wide text-white">Restablecer contraseña</h1>
        <p className="mt-2 text-sm text-neutral-300">
          Ingresa y confirma tu nueva contraseña para continuar.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4" autoComplete="off">
          <div>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/25 bg-white/85 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 outline-none transition focus:border-white"
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-white/25 bg-white/85 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 outline-none transition focus:border-white"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="min-h-[1.75rem] text-xs text-neutral-200">
            {message && (
              <p className={status === 'error' ? 'text-red-300' : 'text-emerald-300'}>{message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200 disabled:opacity-60"
          >
            {status === 'submitting' ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
        <button
          type="button"
          onClick={handleBackToLogin}
          className="mt-6 inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-xs font-medium text-neutral-200 transition hover:border-white hover:text-white"
        >
          Volver al login
        </button>
      </div>
    </div>
  );
}
