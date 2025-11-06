'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const { data } = await authAPI.login(formData);
      setAuth(data.user, data.token);
      toast.success('¡Bienvenido de vuelta!');
      router.push('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al iniciar sesión';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-fire-500 to-lust-500 bg-clip-text text-transparent">
              MiPage
            </h1>
          </Link>
          <p className="text-warm-300 mt-3 text-lg">Inicia sesión en tu cuenta</p>
        </div>

        {/* Form Card */}
        <div className="card-dark p-8 shadow-dark-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
              fullWidth
              placeholder="tu@email.com"
            />

            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              required
              fullWidth
              placeholder="••••••••"
            />

            {errors.general && (
              <div className="bg-lust-500/10 border border-lust-500/30 text-lust-400 px-4 py-3 rounded-lg text-sm">
                ⚠️ {errors.general}
              </div>
            )}

            <Button
              type="submit"
              variant="fire"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              🔥 Iniciar Sesión
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-850 text-warm-500">o</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-warm-300">
              ¿No tienes cuenta?{' '}
              <Link href="/auth/register" className="text-fire-500 font-semibold hover:text-fire-400 transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 card-dark-solid p-5 border-l-4 border-fire-500">
          <p className="text-sm font-semibold text-warm-50 mb-3 flex items-center gap-2">
            <span className="text-xl">🔑</span>
            Credenciales de prueba
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-warm-500 text-sm w-24">Usuario:</span>
              <code className="flex-1 bg-dark-900 text-fire-400 px-3 py-1.5 rounded font-mono text-sm border border-dark-700">
                juan@example.com
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-warm-500 text-sm w-24">Contraseña:</span>
              <code className="flex-1 bg-dark-900 text-fire-400 px-3 py-1.5 rounded font-mono text-sm border border-dark-700">
                password123
              </code>
            </div>
          </div>
          <p className="text-xs text-warm-500 mt-3 flex items-center gap-1">
            <span>💡</span>
            Copia y pega estas credenciales para probar la aplicación
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-warm-300 hover:text-warm-50 text-sm transition-colors inline-flex items-center gap-2"
          >
            <span>←</span>
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
