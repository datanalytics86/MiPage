'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

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

    // Validar contraseñas
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
      toast.success('¡Cuenta creada exitosamente!');
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
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-fire-500 to-lust-500 bg-clip-text text-transparent">
              MiPage
            </h1>
          </Link>
          <p className="text-warm-300 mt-3 text-lg">Crea tu cuenta</p>
        </div>

        {/* Form Card */}
        <div className="card-dark p-8 shadow-dark-lg">
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

            <div>
              <label className="block text-sm font-medium text-warm-200 mb-3">
                Tipo de cuenta
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'USER' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.role === 'USER'
                      ? 'border-fire-500 bg-fire-500/10 shadow-fire'
                      : 'border-dark-700 hover:border-dark-600 bg-dark-900'
                  }`}
                >
                  <div className="text-3xl mb-2">👤</div>
                  <div className={`font-semibold text-sm ${
                    formData.role === 'USER' ? 'text-fire-400' : 'text-warm-200'
                  }`}>
                    Usuario
                  </div>
                  <div className="text-xs text-warm-500">Buscar servicios</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'PUBLISHER' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.role === 'PUBLISHER'
                      ? 'border-lust-500 bg-lust-500/10 shadow-lust'
                      : 'border-dark-700 hover:border-dark-600 bg-dark-900'
                  }`}
                >
                  <div className="text-3xl mb-2">⭐</div>
                  <div className={`font-semibold text-sm ${
                    formData.role === 'PUBLISHER' ? 'text-lust-400' : 'text-warm-200'
                  }`}>
                    Publicador
                  </div>
                  <div className="text-xs text-warm-500">Ofrecer servicios</div>
                </button>
              </div>
            </div>

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
              ✨ Crear Cuenta
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

          {/* Login Link */}
          <div className="text-center">
            <p className="text-warm-300">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-fire-500 font-semibold hover:text-fire-400 transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
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
