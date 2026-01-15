'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { CameraIcon, SparklesIcon, UserGroupIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

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
      toast.success('Bienvenido de vuelta');

      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else if (data.user.role === 'PUBLISHER') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al iniciar sesión';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050308] flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-fire-600/20 via-transparent to-secondary-600/20" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200)' }}
        />
        <div className="relative z-10 flex flex-col justify-center p-12">
          <Link href="/" className="inline-block mb-8">
            <span className="text-4xl font-bold bg-gradient-to-r from-fire-400 to-secondary-400 bg-clip-text text-transparent">
              MiPage
            </span>
          </Link>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Conecta con los mejores<br />profesionales creativos
          </h2>
          <p className="text-warm-300 text-lg mb-10 max-w-md">
            Accede a tu cuenta y descubre servicios de fotografía, modelaje y eventos de calidad profesional.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-warm-200">
              <div className="p-2 rounded-lg bg-fire-500/20 border border-fire-500/30">
                <CameraIcon className="h-5 w-5 text-fire-400" />
              </div>
              <span>Fotógrafos profesionales</span>
            </div>
            <div className="flex items-center gap-4 text-warm-200">
              <div className="p-2 rounded-lg bg-secondary-500/20 border border-secondary-500/30">
                <SparklesIcon className="h-5 w-5 text-secondary-400" />
              </div>
              <span>Modelos para tus proyectos</span>
            </div>
            <div className="flex items-center gap-4 text-warm-200">
              <div className="p-2 rounded-lg bg-primary-500/20 border border-primary-500/30">
                <UserGroupIcon className="h-5 w-5 text-primary-400" />
              </div>
              <span>Staff para eventos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="inline-block">
              <span className="text-4xl font-bold bg-gradient-to-r from-fire-400 to-secondary-400 bg-clip-text text-transparent">
                MiPage
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Iniciar sesión
            </h1>
            <p className="text-warm-400">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
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

              <div>
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
                <div className="mt-2 text-right">
                  <Link href="/auth/forgot-password" className="text-sm text-fire-400 hover:text-fire-300 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              {errors.general && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              <Button
                type="submit"
                variant="fire"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                Iniciar sesión
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[#0d0a11] text-warm-500">o</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-warm-400">
                ¿No tienes cuenta?{' '}
                <Link href="/auth/register" className="text-fire-400 font-medium hover:text-fire-300 transition-colors">
                  Regístrate gratis
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-warm-400 hover:text-warm-200 text-sm transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
