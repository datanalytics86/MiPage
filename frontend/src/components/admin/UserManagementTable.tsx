'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'PUBLISHER' | 'ADMIN';
  isActive: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REGISTERED' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';
  createdAt: string;
  metadata?: {
    rut?: string;
    edad?: number;
    ciudad?: string;
    comuna?: string;
    tipoServicio?: string;
    nacionalidad?: string;
  };
  _count?: {
    services: number;
    reviews: number;
  };
}

interface UserManagementTableProps {
  onViewUser: (user: User) => void;
  onToggleActive: (userId: string, isActive: boolean) => void;
  onExport: () => void;
  isExporting?: boolean;
}

export default function UserManagementTable({
  onViewUser,
  onToggleActive,
  onExport,
  isExporting = false,
}: UserManagementTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');

  useEffect(() => {
    fetchUsers();

    // Listen for refresh events
    const handleRefresh = () => fetchUsers();
    window.addEventListener('refreshUsers', handleRefresh);

    return () => {
      window.removeEventListener('refreshUsers', handleRefresh);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const queryParams = new URLSearchParams();
      if (roleFilter) queryParams.append('role', roleFilter);
      if (statusFilter) queryParams.append('approvalStatus', statusFilter);
      if (cityFilter) queryParams.append('ciudad', cityFilter);
      if (globalFilter) queryParams.append('search', globalFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/with-metadata?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Error al cargar usuarios');

      const data = await response.json();
      setUsers(data.data?.users || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters when they change
  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, cityFilter]);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => (
          <div className="font-medium text-warm-50">{row.original.name}</div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <div className="text-warm-200 text-sm">{row.original.email}</div>
        ),
      },
      {
        accessorKey: 'metadata.rut',
        header: 'RUT',
        cell: ({ row }) => (
          <div className="text-warm-200 text-sm">
            {row.original.metadata?.rut || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'metadata.edad',
        header: 'Edad',
        cell: ({ row }) => (
          <div className="text-warm-200 text-sm">
            {row.original.metadata?.edad || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'metadata.ciudad',
        header: 'Ciudad',
        cell: ({ row }) => (
          <div className="text-warm-200 text-sm">
            {row.original.metadata?.ciudad || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'metadata.tipoServicio',
        header: 'Servicio',
        cell: ({ row }) => {
          const tipo = row.original.metadata?.tipoServicio;
          if (!tipo) return <span className="text-warm-500">-</span>;

          const badgeClass =
            tipo === 'MODELAJE' ? 'badge-modelaje' :
            tipo === 'MASAJES' ? 'badge-masajes' :
            tipo === 'ACOMPAÑANTES' ? 'badge-acompanantes' :
            'badge-otros';

          return <span className={badgeClass}>{tipo}</span>;
        },
      },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: ({ row }) => {
          const role = row.original.role;
          const variant =
            role === 'ADMIN' ? 'lust' :
            role === 'PUBLISHER' ? 'fire' :
            'default';

          return (
            <Badge variant={variant as any}>
              {role === 'ADMIN' ? '👑 Admin' :
               role === 'PUBLISHER' ? '📝 Publisher' :
               '👤 User'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'approvalStatus',
        header: 'Estado',
        cell: ({ row }) => {
          const status = row.original.approvalStatus;
          const className =
            status === 'ACTIVE' ? 'status-active' :
            status === 'PENDING' || status === 'APPROVED' ? 'status-pending' :
            status === 'INACTIVE' ? 'status-inactive' :
            status === 'REJECTED' ? 'status-rejected' :
            'status-inactive';

          return <span className={className}>{status}</span>;
        },
      },
      {
        accessorKey: '_count.services',
        header: 'Servicios',
        cell: ({ row }) => (
          <div className="text-center text-warm-200">
            {row.original._count?.services || 0}
          </div>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Activo',
        cell: ({ row }) => {
          const user = row.original;
          if (user.role === 'ADMIN') return <span className="text-warm-500">-</span>;

          return (
            <button
              onClick={() => onToggleActive(user.id, !user.isActive)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                user.isActive
                  ? 'bg-success/20 text-green-400 hover:bg-success/30'
                  : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
              }`}
              disabled={user.approvalStatus !== 'REGISTERED'}
              title={
                user.approvalStatus !== 'REGISTERED'
                  ? 'Solo usuarios registrados pueden ser activados/desactivados'
                  : ''
              }
            >
              {user.isActive ? '✓ Sí' : '✗ No'}
            </button>
          );
        },
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="dark"
              size="sm"
              onClick={() => onViewUser(row.original)}
            >
              Ver
            </Button>
          </div>
        ),
      },
    ],
    [onViewUser, onToggleActive]
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <div className="card-dark p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-fire-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-warm-200 mt-4">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="card-dark p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <Input
              placeholder="🔍 Buscar por nombre, email o RUT..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              fullWidth
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-dark w-full"
            >
              <option value="">👥 Todos los roles</option>
              <option value="USER">👤 Users</option>
              <option value="PUBLISHER">📝 Publishers</option>
              <option value="ADMIN">👑 Admins</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-dark w-full"
            >
              <option value="">📊 Todos los estados</option>
              <option value="PENDING">⏳ Pendiente</option>
              <option value="APPROVED">✅ Aprobado</option>
              <option value="REGISTERED">📝 Registrado</option>
              <option value="ACTIVE">🟢 Activo</option>
              <option value="INACTIVE">⚫ Inactivo</option>
              <option value="REJECTED">❌ Rechazado</option>
            </select>
          </div>

          {/* Export Button */}
          <div>
            <Button
              variant="fire"
              onClick={onExport}
              isLoading={isExporting}
              fullWidth
            >
              📥 Exportar Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-dark-700">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-semibold text-warm-300 bg-dark-900 cursor-pointer hover:bg-dark-850 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() && (
                          <span className="text-fire-500">
                            {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-warm-500"
                  >
                    <div className="text-6xl mb-4">📭</div>
                    <p>No se encontraron usuarios</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-dark-800 hover:bg-dark-800 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-dark-700 px-6 py-4 flex items-center justify-between bg-dark-900">
          <div className="text-sm text-warm-300">
            Mostrando {table.getRowModel().rows.length} de {users.length} usuarios
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="dark"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              ← Anterior
            </Button>
            <span className="text-sm text-warm-300 px-4">
              Página {table.getState().pagination.pageIndex + 1} de{' '}
              {table.getPageCount()}
            </span>
            <Button
              variant="dark"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
