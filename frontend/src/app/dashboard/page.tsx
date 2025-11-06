'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import Button from '@/components/ui/Button';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import ServicesList from '@/components/dashboard/ServicesList';
import ServiceUpdates from '@/components/dashboard/ServiceUpdates';
import PublisherProfile from '@/components/dashboard/PublisherProfile';
import {
  HomeIcon,
  ChartBarIcon,
  ListBulletIcon,
  MegaphoneIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

type TabType = 'overview' | 'services' | 'updates' | 'profile';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'PUBLISHER') {
      router.push('/');
      return;
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'Dashboard',
      icon: ChartBarIcon,
      emoji: '📊',
    },
    {
      id: 'services' as TabType,
      label: 'Mis Servicios',
      icon: ListBulletIcon,
      emoji: '📦',
    },
    {
      id: 'updates' as TabType,
      label: 'Actualizaciones',
      icon: MegaphoneIcon,
      emoji: '📢',
    },
    {
      id: 'profile' as TabType,
      label: 'Mi Perfil',
      icon: UserIcon,
      emoji: '👤',
    },
  ];

  if (!user || user.role !== 'PUBLISHER') {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-warm-50 mb-2">Acceso Restringido</h1>
          <p className="text-warm-400 mb-6">
            Debes ser un publicador para acceder al dashboard
          </p>
          <Link href="/">
            <Button variant="fire">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Top Navigation */}
      <header className="bg-dark-900/95 backdrop-blur-sm shadow-dark border-b border-dark-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-fire-500 to-lust-500 bg-clip-text text-transparent">
                MiPage
              </h1>
              <span className="hidden md:inline text-warm-500 text-sm">
                / Publisher Dashboard
              </span>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="dark" size="md">
                  <HomeIcon className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline">Inicio</span>
                </Button>
              </Link>
              <Button
                variant="dark"
                size="md"
                onClick={handleLogout}
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="card-dark p-6 sticky top-24">
              {/* User Info */}
              <div className="mb-6 pb-6 border-b border-dark-700">
                <div className="flex items-center gap-3 mb-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-fire-500"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-fire-500/10 border-2 border-fire-500 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-fire-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-warm-50 truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-warm-500 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-fire-500/10 border border-fire-500/30 rounded-full text-sm font-medium text-fire-400">
                  <span>⭐</span>
                  <span>Publisher</span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-fire-500 to-fire-600 text-white shadow-fire'
                        : 'text-warm-300 hover:bg-dark-850 hover:text-fire-400'
                    }`}
                  >
                    <span className="text-xl">{tab.emoji}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'services' && <ServicesList />}
            {activeTab === 'updates' && <ServiceUpdates />}
            {activeTab === 'profile' && <PublisherProfile />}
          </main>
        </div>
      </div>

      {/* Mobile Tab Bar (Bottom Navigation) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-dark-900 border-t border-dark-800 z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-fire-500/10 text-fire-400'
                  : 'text-warm-500 hover:text-fire-400'
              }`}
            >
              <span className="text-2xl">{tab.emoji}</span>
              <span className="text-xs font-medium truncate w-full text-center">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
