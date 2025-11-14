'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type Role = 'USER' | 'PUBLISHER' | 'ADMIN';

type Tab = 'users' | 'emails';

interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  isActive?: boolean;
  emailConfirmed?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  lastLogin?: string | null;
}

interface EmailLog {
  id: string;
  recipientEmail: string;
  emailType?: string;
  subject?: string;
  sentAt?: string;
  status?: string;
  errorMessage?: string | null;
}

interface EmailLogResponse {
  data: EmailLog[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const AdminDashboardPage = () => {
  const router = useRouter();
  const { user, token, hasHydrated, logout } = useAuthStore((state) => ({
    user: state.user,
    token: state.token,
    hasHydrated: state.hasHydrated,
    logout: state.logout,
  }));

  const [activeTab, setActiveTab] = useState<Tab>('users');

  // User management state
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [confirmationFilter, setConfirmationFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving'>('idle');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    role: 'USER' as Role,
    isActive: true,
    emailConfirmed: true,
  });

  // Email log state
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [emailPagination, setEmailPagination] = useState<EmailLogResponse['pagination']>();
  const [emailFilters, setEmailFilters] = useState<{ type: string; status: string }>({ type: 'all', status: 'all' });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [resendState, setResendState] = useState<string | null>(null);

  const ensureAdmin = useCallback(() => {
    if (!hasHydrated) return false;
    if (!user || user.role !== 'ADMIN') {
      router.replace('/auth/login?redirect=/admin');
      return false;
    }
    return true;
  }, [hasHydrated, router, user]);

  const handleUnauthorized = useCallback(() => {
    logout();
    router.replace('/auth/login?redirect=/admin');
  }, [logout, router]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setUsersLoading(true);
    setUsersError(null);

    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (confirmationFilter === 'confirmed') params.append('emailConfirmed', 'true');
      if (confirmationFilter === 'pending') params.append('emailConfirmed', 'false');

      const response = await fetch(`${API_URL}/api/admin/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error('No fue posible cargar los usuarios.');
      }

      const data = await response.json();
      const fetchedUsers: ManagedUser[] = data?.data ?? [];
      setUsers(fetchedUsers);

      if (!selectedUserId && fetchedUsers.length > 0) {
        setSelectedUserId(fetchedUsers[0].id);
      } else if (selectedUserId && !fetchedUsers.find((item) => item.id === selectedUserId)) {
        setSelectedUserId(fetchedUsers[0]?.id ?? null);
      }
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : 'Error inesperado al cargar usuarios.');
    } finally {
      setUsersLoading(false);
    }
  }, [token, searchTerm, roleFilter, statusFilter, confirmationFilter, selectedUserId, handleUnauthorized]);

  useEffect(() => {
    if (!ensureAdmin()) return;
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(debounce);
  }, [ensureAdmin, fetchUsers, searchTerm, roleFilter, statusFilter, confirmationFilter]);

  useEffect(() => {
    if (!ensureAdmin()) return;
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ensureAdmin]);

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return users.find((item) => item.id === selectedUserId) ?? null;
  }, [selectedUserId, users]);

  useEffect(() => {
    if (!selectedUser) return;
    setEditForm({
      name: selectedUser.name ?? '',
      phone: selectedUser.phone ?? '',
      role: selectedUser.role,
      isActive: selectedUser.isActive !== false,
      emailConfirmed: Boolean(selectedUser.emailConfirmed ?? selectedUser.isVerified ?? true),
    });
    setActionMessage(null);
  }, [selectedUser]);

  const handleUserUpdate = async () => {
    if (!token || !selectedUser) return;
    setSaveState('saving');
    setActionMessage(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          phone: editForm.phone,
          role: editForm.role,
          isActive: editForm.isActive,
          emailConfirmed: editForm.emailConfirmed,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'No fue posible actualizar al usuario.');
      }

      setActionMessage('Cambios guardados correctamente.');
      fetchUsers();
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Error al guardar cambios.');
    } finally {
      setSaveState('idle');
    }
  };

  const handleUserDelete = async () => {
    if (!token || !selectedUser) return;
    setSaveState('saving');
    setActionMessage(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'No fue posible eliminar al usuario.');
      }

      setActionMessage('Usuario eliminado.');
      setSelectedUserId(null);
      fetchUsers();
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Error al eliminar usuario.');
    } finally {
      setSaveState('idle');
    }
  };

  const handleSendReset = async () => {
    if (!token || !selectedUser) return;
    setSaveState('saving');
    setActionMessage(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'No fue posible enviar el correo.');
      }

      const data = await response.json().catch(() => ({}));
      setActionMessage(data?.message || 'Instrucciones enviadas al usuario.');
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Error al enviar las instrucciones.');
    } finally {
      setSaveState('idle');
    }
  };

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((item) => item.isActive !== false).length;
    const publishers = users.filter((item) => item.role === 'PUBLISHER').length;
    const pendingEmail = users.filter((item) => !(item.emailConfirmed ?? item.isVerified ?? true)).length;
    return { total, active, publishers, pendingEmail };
  }, [users]);

  const fetchEmailLogs = useCallback(async () => {
    if (!token) return;
    setEmailLoading(true);
    setEmailError(null);

    try {
      const params = new URLSearchParams();
      if (emailFilters.type !== 'all') params.append('emailType', emailFilters.type);
      if (emailFilters.status !== 'all') params.append('status', emailFilters.status);

      const response = await fetch(`${API_URL}/api/admin/email-logs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error('No fue posible cargar el historial de emails.');
      }

      const data: EmailLogResponse = await response.json();
      setEmailLogs(data?.data ?? []);
      setEmailPagination(data?.pagination);
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : 'Error inesperado al cargar emails.');
    } finally {
      setEmailLoading(false);
    }
  }, [token, emailFilters, handleUnauthorized]);

  useEffect(() => {
    if (!ensureAdmin()) return;
    if (activeTab === 'emails') {
      fetchEmailLogs();
    }
  }, [activeTab, ensureAdmin, fetchEmailLogs]);

  const handleResendEmail = async (id: string) => {
    if (!token) return;
    setResendState(id);
    setEmailError(null);
    try {
      const response = await fetch(`${API_URL}/api/admin/email-logs/${id}/resend`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'No fue posible reenviar el correo.');
      }

      fetchEmailLogs();
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : 'Error al reenviar el correo.');
    } finally {
      setResendState(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-3xl border border-white/10 bg-black/40 px-8 py-8 backdrop-blur">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Panel administrativo</p>
          <h1 className="text-2xl font-semibold text-white">Control total de MiWeb</h1>
          <p className="text-sm text-neutral-300">Activa, edita y audita usuarios registrados, además de revisar el historial de notificaciones enviadas.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Usuarios totales" value={stats.total} />
          <StatCard label="Activos" value={stats.active} />
          <StatCard label="Oferentes" value={stats.publishers} />
          <StatCard label="Email por confirmar" value={stats.pendingEmail} highlight />
        </div>
      </header>

      <main className="mx-auto mt-8 w-full max-w-6xl">
        <div className="mb-6 flex gap-3 text-xs uppercase tracking-[0.2em] text-neutral-400">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`rounded-full px-4 py-2 transition ${activeTab === 'users' ? 'bg-white text-neutral-900' : 'border border-white/20 bg-transparent hover:text-white'}`}
          >
            Usuarios
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('emails')}
            className={`rounded-full px-4 py-2 transition ${activeTab === 'emails' ? 'bg-white text-neutral-900' : 'border border-white/20 bg-transparent hover:text-white'}`}
          >
            Emails
          </button>
        </div>

        {activeTab === 'users' && (
          <section className="grid gap-8 lg:grid-cols-[320px,1fr]">
            <aside className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur">
              <div className="space-y-4">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por nombre o email"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-neutral-400 outline-none focus:border-white"
                />
                <FilterSelect
                  label="Rol"
                  value={roleFilter}
                  options={[
                    { label: 'Todos', value: 'all' },
                    { label: 'Admin', value: 'ADMIN' },
                    { label: 'Oferentes', value: 'PUBLISHER' },
                    { label: 'Usuarios', value: 'USER' },
                  ]}
                  onChange={(value) => setRoleFilter(value as typeof roleFilter)}
                />
                <FilterSelect
                  label="Estado"
                  value={statusFilter}
                  options={[
                    { label: 'Todos', value: 'all' },
                    { label: 'Activos', value: 'active' },
                    { label: 'Inactivos', value: 'inactive' },
                  ]}
                  onChange={(value) => setStatusFilter(value as typeof statusFilter)}
                />
                <FilterSelect
                  label="Confirmación"
                  value={confirmationFilter}
                  options={[
                    { label: 'Todos', value: 'all' },
                    { label: 'Confirmados', value: 'confirmed' },
                    { label: 'Pendientes', value: 'pending' },
                  ]}
                  onChange={(value) => setConfirmationFilter(value as typeof confirmationFilter)}
                />
              </div>

              <div className="mt-6 space-y-2">
                {usersLoading && <p className="text-xs text-neutral-400">Cargando usuarios...</p>}
                {usersError && <p className="text-xs text-red-300">{usersError}</p>}
                {!usersLoading && !usersError && users.length === 0 && (
                  <p className="text-xs text-neutral-400">Sin resultados para los filtros seleccionados.</p>
                )}
              </div>

              <ul className="mt-6 space-y-2 overflow-y-auto pr-1">
                {users.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedUserId(item.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        selectedUserId === item.id
                          ? 'border-white/40 bg-white/10 text-white'
                          : 'border-white/10 bg-white/5 text-neutral-300 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      <p className="font-medium text-white">{item.name || 'Sin nombre'}</p>
                      <p className="text-xs text-neutral-400">{item.email}</p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-400">
                        <span>{item.role === 'PUBLISHER' ? 'Oferente' : item.role === 'ADMIN' ? 'Admin' : 'Usuario'}</span>
                        <span className={`rounded-full px-2 py-0.5 ${item.isActive === false ? 'bg-red-500/20 text-red-200' : 'bg-emerald-500/20 text-emerald-200'}`}>
                          {item.isActive === false ? 'Inactivo' : 'Activo'}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur">
              {!selectedUser && <p className="text-sm text-neutral-300">Selecciona un usuario para ver y editar sus datos.</p>}
              {selectedUser && (
                <div className="space-y-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Ficha del usuario</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">{selectedUser.name || selectedUser.email}</h2>
                    <p className="text-sm text-neutral-400">
                      Creado el{' '}
                      {selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleString('es-CL', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'sin datos'}
                    </p>
                    {selectedUser.lastLogin && (
                      <p className="text-xs text-neutral-500">Último acceso {new Date(selectedUser.lastLogin).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-neutral-300">
                      Nombre
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-neutral-400 outline-none focus:border-white"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-neutral-300">
                      Teléfono
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))}
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-neutral-400 outline-none focus:border-white"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-neutral-300">
                      Rol
                      <select
                        value={editForm.role}
                        onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value as Role }))}
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white outline-none focus:border-white"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="PUBLISHER">Oferente</option>
                        <option value="USER">Usuario</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-neutral-300">
                      Estado
                      <select
                        value={editForm.isActive ? 'active' : 'inactive'}
                        onChange={(event) => setEditForm((current) => ({ ...current, isActive: event.target.value === 'active' }))}
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white outline-none focus:border-white"
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-neutral-300">
                      Confirmación de email
                      <select
                        value={editForm.emailConfirmed ? 'confirmed' : 'pending'}
                        onChange={(event) => setEditForm((current) => ({ ...current, emailConfirmed: event.target.value === 'confirmed' }))}
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white outline-none focus:border-white"
                      >
                        <option value="confirmed">Confirmado</option>
                        <option value="pending">Pendiente</option>
                      </select>
                    </label>
                    <div className="space-y-2 text-sm text-neutral-300">
                      Email
                      <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">{selectedUser.email}</p>
                    </div>
                  </div>

                  {actionMessage && <p className="text-sm text-emerald-300">{actionMessage}</p>}

                  <div className="flex flex-wrap gap-3 text-sm">
                    <button
                      type="button"
                      onClick={handleUserUpdate}
                      disabled={saveState === 'saving'}
                      className="rounded-full bg-white px-5 py-2 font-medium text-neutral-900 transition hover:bg-neutral-200 disabled:opacity-60"
                    >
                      Guardar cambios
                    </button>
                    <button
                      type="button"
                      onClick={handleSendReset}
                      disabled={saveState === 'saving'}
                      className="rounded-full border border-white/30 px-5 py-2 font-medium text-neutral-200 transition hover:border-white hover:text-white disabled:opacity-60"
                    >
                      Enviar reset de contraseña
                    </button>
                    <button
                      type="button"
                      onClick={handleUserDelete}
                      disabled={saveState === 'saving'}
                      className="rounded-full border border-red-400 px-5 py-2 font-medium text-red-200 transition hover:border-red-200 hover:text-red-100 disabled:opacity-60"
                    >
                      Eliminar usuario
                    </button>
                  </div>
                </div>
              )}
            </section>
          </section>
        )}

        {activeTab === 'emails' && (
          <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <FilterSelect
                label="Tipo de email"
                value={emailFilters.type}
                options={[
                  { label: 'Todos', value: 'all' },
                  { label: 'Confirmación', value: 'confirmation' },
                  { label: 'Bienvenida', value: 'welcome' },
                  { label: 'Recuperación', value: 'password_reset' },
                  { label: 'Cambio contraseña', value: 'password_changed' },
                ]}
                onChange={(value) => setEmailFilters((current) => ({ ...current, type: value }))}
              />
              <FilterSelect
                label="Estado"
                value={emailFilters.status}
                options={[
                  { label: 'Todos', value: 'all' },
                  { label: 'Enviados', value: 'sent' },
                  { label: 'Fallidos', value: 'failed' },
                  { label: 'Pendientes', value: 'pending' },
                ]}
                onChange={(value) => setEmailFilters((current) => ({ ...current, status: value }))}
              />
              <button
                type="button"
                onClick={fetchEmailLogs}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-200 transition hover:border-white hover:text-white"
              >
                Actualizar
              </button>
            </div>

            <div className="mt-6">
              {emailLoading && <p className="text-xs text-neutral-400">Cargando historial...</p>}
              {emailError && <p className="text-xs text-red-300">{emailError}</p>}
              {!emailLoading && !emailError && emailLogs.length === 0 && (
                <p className="text-xs text-neutral-400">No hay registros para los filtros seleccionados.</p>
              )}
            </div>

            <div className="mt-4 divide-y divide-white/5 rounded-2xl border border-white/10">
              {emailLogs.map((log) => (
                <div key={log.id} className="flex flex-col gap-2 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-white">{log.subject || 'Sin asunto'}</p>
                    <p className="text-xs text-neutral-400">{log.recipientEmail}</p>
                    <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                      {log.emailType || 'sin tipo'} · {log.sentAt ? new Date(log.sentAt).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : 'sin fecha'}
                    </p>
                    {log.errorMessage && <p className="text-xs text-red-300">{log.errorMessage}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-wide ${
                      log.status === 'failed'
                        ? 'bg-red-500/20 text-red-200'
                        : log.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-200'
                        : 'bg-emerald-500/20 text-emerald-200'
                    }`}
                    >
                      {log.status || 'desconocido'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleResendEmail(log.id)}
                      disabled={resendState === log.id}
                      className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-white hover:text-white disabled:opacity-60"
                    >
                      {resendState === log.id ? 'Reenviando...' : 'Reenviar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {emailPagination && (
              <p className="mt-4 text-xs text-neutral-400">
                {emailPagination.total} registros · Página {emailPagination.page} de {emailPagination.totalPages}
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

interface FilterSelectProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

const FilterSelect = ({ label, value, options, onChange }: FilterSelectProps) => {
  return (
    <label className="flex flex-col gap-1 text-xs text-neutral-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white outline-none focus:border-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

const StatCard = ({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) => (
  <div className={`rounded-2xl border px-5 py-4 ${highlight ? 'border-amber-500/40 bg-amber-500/10 text-amber-100' : 'border-white/10 bg-white/5 text-white'}`}>
    <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">{label}</p>
    <p className="mt-2 text-2xl font-semibold">{value}</p>
  </div>
);

export default AdminDashboardPage;
