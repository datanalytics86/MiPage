'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { CameraIcon, SparklesIcon, UserGroupIcon, ArrowLeftIcon, UserIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER' as 'USER' | 'PUBLISHER',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Las contraseñas no coinciden' });
      return;
    }

    if (formData.password.length < 6) {
      setErrors({ password: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setAuth(data.user, data.token);
      toast.success('Cuenta creada exitosamente');
      router.push('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al registrarse';
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
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-600/20 via-transparent to-fire-600/20" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200)' }}
        />
        <div className="relative z-10 flex flex-col justify-center p-12">
          <Link href="/" className="inline-block mb-8">
            <span className="text-4xl font-bold bg-gradient-to-r from-fire-400 to-secondary-400 bg-clip-text text-transparent">
              MiPage
            </span>
          </Link>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Únete a la comunidad<br />de creativos
          </h2>
          <p className="text-warm-300 text-lg mb-10 max-w-md">
            Crea tu cuenta gratuita y comienza a conectar con profesionales de fotografía, modelaje y eventos.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-warm-200">
              <div className="p-2 rounded-lg bg-fire-500/20 border border-fire-500/30">
                <CameraIcon className="h-5 w-5 text-fire-400" />
              </div>
              <span>Publica o encuentra servicios</span>
            </div>
            <div className="flex items-center gap-4 text-warm-200">
              <div className="p-2 rounded-lg bg-secondary-500/20 border border-secondary-500/30">
                <SparklesIcon className="h-5 w-5 text-secondary-400" />
              </div>
              <span>Profesionales verificados</span>
            </div>
            <div className="flex items-center gap-4 text-warm-200">
              <div className="p-2 rounded-lg bg-primary-500/20 border border-primary-500/30">
                <UserGroupIcon className="h-5 w-5 text-primary-400" />
              </div>
              <span>Pagos seguros garantizados</span>
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
              Crear cuenta
            </h1>
            <p className="text-warm-400">
              Completa tus datos para empezar
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Nombre completo"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                required
                fullWidth
                placeholder="Juan Pérez"
              />

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
                helperText="Mínimo 6 caracteres"
              />

              <Input
                label="Confirmar contraseña"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
                required
                fullWidth
                placeholder="••••••••"
              />

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-warm-200 mb-3">
                  Tipo de cuenta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'USER' })}
                    className={`relative p-4 border rounded-xl transition-all text-left ${
                      formData.role === 'USER'
                        ? 'border-fire-500 bg-fire-500/10'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    {formData.role === 'USER' && (
                      <CheckCircleIcon className="absolute top-3 right-3 h-5 w-5 text-fire-400" />
                    )}
                    <div className={`p-2 rounded-lg inline-block mb-2 ${
                      formData.role === 'USER' ? 'bg-fire-500/20' : 'bg-white/10'
                    }`}>
                      <UserIcon className={`h-5 w-5 ${formData.role === 'USER' ? 'text-fire-400' : 'text-warm-400'}`} />
                    </div>
                    <div className={`font-medium text-sm ${
                      formData.role === 'USER' ? 'text-white' : 'text-warm-200'
                    }`}>
                      Usuario
                    </div>
                    <div className="text-xs text-warm-500 mt-1">Buscar servicios</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'PUBLISHER' })}
                    className={`relative p-4 border rounded-xl transition-all text-left ${
                      formData.role === 'PUBLISHER'
                        ? 'border-secondary-500 bg-secondary-500/10'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    {formData.role === 'PUBLISHER' && (
                      <CheckCircleIcon className="absolute top-3 right-3 h-5 w-5 text-secondary-400" />
                    )}
                    <div className={`p-2 rounded-lg inline-block mb-2 ${
                      formData.role === 'PUBLISHER' ? 'bg-secondary-500/20' : 'bg-white/10'
                    }`}>
                      <BriefcaseIcon className={`h-5 w-5 ${formData.role === 'PUBLISHER' ? 'text-secondary-400' : 'text-warm-400'}`} />
                    </div>
                    <div className={`font-medium text-sm ${
                      formData.role === 'PUBLISHER' ? 'text-white' : 'text-warm-200'
                    }`}>
                      Profesional
                    </div>
                    <div className="text-xs text-warm-500 mt-1">Ofrecer servicios</div>
                  </button>
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
                Crear cuenta
              </Button>

              <p className="text-xs text-warm-500 text-center">
                Al registrarte, aceptas nuestros{' '}
                <Link href="/terms" className="text-fire-400 hover:underline">
                  Términos de uso
                </Link>{' '}
                y{' '}
                <Link href="/privacy" className="text-fire-400 hover:underline">
                  Política de privacidad
                </Link>
              </p>
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

            {/* Login Link */}
            <div className="text-center">
              <p className="text-warm-400">
                ¿Ya tienes cuenta?{' '}
                <Link href="/auth/login" className="text-fire-400 font-medium hover:text-fire-300 transition-colors">
                  Inicia sesión
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
