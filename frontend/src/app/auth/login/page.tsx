'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

type RoleOption = 'ADMIN' | 'PUBLISHER' | 'CLIENT';

type FormErrors = Partial<Record<'email' | 'password' | 'general', string>>;

const roleLabels: Record<RoleOption, { label: string; description: string; href: string }> = {
  ADMIN: {
    label: 'Administrador',
    description: 'Gestiona catálogo, reportes y cuentas.',
    href: '/admin',
  },
  PUBLISHER: {
    label: 'Oferente',
    description: 'Actualiza portafolios, promociones y agenda.',
    href: '/oferentes',
  },
  CLIENT: {
    label: 'Cliente',
    description: 'Explora perfiles y deja reseñas verificadas.',
    href: '/clientes',
  },
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
  const { setAuth } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<RoleOption>('ADMIN');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const credentials = DEMO_CREDENTIALS[selectedRole];
    const isValidEmail = formData.email.trim().toLowerCase() === credentials.email;
    const isValidPassword = formData.password === credentials.password;

    if (!isValidEmail || !isValidPassword) {
      const errorMessage = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
      setIsLoading(false);
      return;
    }

    const redirectPath = roleLabels[selectedRole].href || '/';
    const token = `${selectedRole.toLowerCase()}-demo-token`;

    setAuth(credentials.user, token);
    toast.success('¡Bienvenido de vuelta!');

    router.push(redirectPath);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f4]">
      <header className="border-b border-neutral-200 bg-white/90">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <Link href="/" className="text-xl font-semibold tracking-tight text-neutral-900">
            MiPage
          </Link>
          <Link href="/" className="text-sm text-neutral-500 transition hover:text-neutral-900">
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-88px)] max-w-4xl flex-col justify-center px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[0.55fr,0.45fr] lg:items-center">
          <section className="space-y-6">
            <header className="space-y-3">
              <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Portal seguro</p>
              <h1 className="text-3xl font-semibold text-neutral-900">Elige tu acceso</h1>
              <p className="text-sm text-neutral-600">
                Selecciona el perfil con el que deseas ingresar. Cada rol dispone de herramientas específicas según las
                necesidades del servicio.
              </p>
            </header>

            <div className="grid gap-3 md:grid-cols-3">
              {(Object.keys(roleLabels) as RoleOption[]).map((role) => {
                const roleInfo = roleLabels[role];
                const isActive = selectedRole === role;

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`flex h-full flex-col gap-2 rounded-2xl border p-4 text-left transition ${
                      isActive
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900 hover:text-neutral-900'
                    }`}
                  >
                    <span className="text-sm font-semibold">{roleInfo.label}</span>
                    <span className={`text-xs ${isActive ? 'text-neutral-100/80' : 'text-neutral-500'}`}>
                      {roleInfo.description}
                    </span>
                    <span className={`text-xs font-semibold ${isActive ? 'text-neutral-200' : 'text-neutral-400'}`}>
                      {roleInfo.href.replace('/', '') || 'inicio'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">
              <p>
                ¿Primera vez aquí? Revisa las vistas dedicadas para cada rol y conoce las herramientas disponibles antes de
                iniciar sesión.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                <Link href="/admin" className="text-neutral-900 underline underline-offset-4">
                  Dashboard administrador
                </Link>
                <Link href="/oferentes" className="text-neutral-900 underline underline-offset-4">
                  Portal de oferentes
                </Link>
                <Link href="/clientes" className="text-neutral-900 underline underline-offset-4">
                  Experiencia cliente
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 text-sm">
                <p className="text-neutral-500">Estás iniciando sesión como</p>
                <p className="text-lg font-semibold text-neutral-900">{roleLabels[selectedRole].label}</p>
              </div>

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                required
                fullWidth
                placeholder="tucorreo@ejemplo.cl"
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
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  ⚠️ {errors.general}
                </div>
              )}

              <Button type="submit" variant="fire" size="lg" fullWidth isLoading={isLoading}>
                Iniciar sesión
              </Button>
            </form>

            <div className="mt-6 space-y-4 text-xs text-neutral-500">
              <p className="font-semibold text-neutral-700">Accesos de demostración</p>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <p className="font-medium text-neutral-800">Administrador</p>
                  <p>Email: admin@mipage.cl · Contraseña: password123</p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <p className="font-medium text-neutral-800">Oferente</p>
                  <p>Email: maria@example.com · Contraseña: password123</p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <p className="font-medium text-neutral-800">Cliente</p>
                  <p>Email: juan@example.com · Contraseña: password123</p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-neutral-500">
              ¿No tienes cuenta?{' '}
              <Link href="/auth/register" className="font-semibold text-neutral-900 underline underline-offset-4">
                Regístrate aquí
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
