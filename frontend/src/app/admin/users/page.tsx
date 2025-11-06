'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import Button from '@/components/ui/Button';
import UserManagementTable from '@/components/admin/UserManagementTable';
import UserDetailsModal from '@/components/admin/UserDetailsModal';
import InviteUserModal from '@/components/admin/InviteUserModal';
import MetadataFieldsManager from '@/components/admin/MetadataFieldsManager';
import ServiceTypesManager from '@/components/admin/ServiceTypesManager';
import toast from 'react-hot-toast';

type TabType = 'users' | 'metadata' | 'services';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'ADMIN') {
      toast.error('No tienes permisos para acceder');
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  const handleViewUser = (user: any) => {
    setSelectedUserId(user.id);
    setShowUserDetails(true);
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/toggle-active`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al cambiar estado');
      }

      toast.success(`Usuario ${isActive ? 'activado' : 'desactivado'}`);

      // Force table refresh
      window.dispatchEvent(new Event('refreshUsers'));
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al cambiar estado del usuario');
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Error al exportar');

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usuarios-mipage-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Archivo exportado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al exportar usuarios');
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-fire-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="bg-dark-900 border-b border-dark-700 shadow-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-warm-50">Gestión de Usuarios</h1>
              <p className="text-warm-300">Panel de administración de MiPage</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="fire"
                onClick={() => setShowInviteModal(true)}
              >
                ➕ Invitar Usuario
              </Button>
              <Link href="/admin">
                <Button variant="dark">
                  ← Volver al Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="card-dark mb-6">
          <div className="flex border-b border-dark-700">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 font-semibold transition-all ${
                activeTab === 'users'
                  ? 'text-fire-500 border-b-2 border-fire-500'
                  : 'text-warm-300 hover:text-warm-50'
              }`}
            >
              👥 Gestión de Usuarios
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`px-6 py-4 font-semibold transition-all ${
                activeTab === 'metadata'
                  ? 'text-fire-500 border-b-2 border-fire-500'
                  : 'text-warm-300 hover:text-warm-50'
              }`}
            >
              📋 Campos de Metadata
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-4 font-semibold transition-all ${
                activeTab === 'services'
                  ? 'text-fire-500 border-b-2 border-fire-500'
                  : 'text-warm-300 hover:text-warm-50'
              }`}
            >
              🏷️ Tipos de Servicio
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'users' && (
            <UserManagementTable
              onViewUser={handleViewUser}
              onToggleActive={handleToggleActive}
              onExport={handleExport}
              isExporting={isExporting}
            />
          )}

          {activeTab === 'metadata' && <MetadataFieldsManager />}

          {activeTab === 'services' && <ServiceTypesManager />}
        </div>
      </div>

      {/* Modals */}
      <UserDetailsModal
        isOpen={showUserDetails}
        onClose={() => {
          setShowUserDetails(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
      />

      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteSent={() => {
          // Refresh users table
          window.dispatchEvent(new Event('refreshUsers'));
        }}
      />
    </div>
  );
}
