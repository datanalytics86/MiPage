'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token');

  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirm = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token inválido.');
        return;
      }
      setStatus('loading');
      try {
        const response = await fetch(`${API_URL}/api/auth/confirm-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.error || 'No fue posible confirmar el correo.');
        }

        setStatus('success');
        setMessage(data?.message || 'Correo confirmado. Ya puedes iniciar sesión.');
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Error inesperado al confirmar.');
      }
    };

    confirm();
  }, [token]);

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 py-16 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 px-8 py-10 text-center shadow-xl backdrop-blur">
        <h1 className="text-lg font-semibold tracking-wide text-white">Confirmación de correo</h1>
        <p className="mt-4 text-sm text-neutral-200">{status === 'loading' ? 'Confirmando tu correo...' : message}</p>
        <button
          type="button"
          onClick={handleBackToLogin}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
        >
          Volver al login
        </button>
      </div>
    </div>
  );
}
