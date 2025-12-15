'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HeartIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/auth';
import ButtonLink from '@/components/ui/ButtonLink';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Servicios', href: '/services' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-white/5">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-bold bg-gradient-to-r from-fire-400 to-secondary-400 bg-clip-text text-transparent">
              MiPage
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-fire-400'
                    : 'text-warm-300 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/favorites"
                  className="p-2 text-warm-400 hover:text-fire-400 transition-colors"
                  title="Favoritos"
                >
                  <HeartIcon className="h-5 w-5" />
                </Link>

                {(user?.role === 'PUBLISHER' || user?.role === 'ADMIN') && (
                  <Link
                    href="/services/new"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-warm-300 hover:text-white transition-colors"
                  >
                    <PlusCircleIcon className="h-4 w-4" />
                    Publicar
                  </Link>
                )}

                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-warm-200 hover:bg-white/10 transition-colors"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {user?.name?.split(' ')[0] || 'Mi cuenta'}
                  </span>
                </Link>

                <button
                  onClick={() => logout()}
                  className="text-sm text-warm-500 hover:text-warm-300 transition-colors"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-warm-300 hover:text-white transition-colors"
                >
                  Iniciar sesión
                </Link>
                <ButtonLink
                  href="/auth/register"
                  variant="fire"
                  size="sm"
                  className="rounded-lg px-4"
                >
                  Registrarse
                </ButtonLink>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-warm-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Abrir menú</span>
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-white/5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block py-2 text-base font-medium ${
                  isActive(item.href)
                    ? 'text-fire-400'
                    : 'text-warm-300 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-white/5 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 py-2 text-warm-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserCircleIcon className="h-5 w-5" />
                    Mi cuenta
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-warm-500 hover:text-warm-300"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block py-2 text-warm-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block py-2 text-fire-400 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
