import { FormEvent, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, Users as UsersIcon, Shield, CheckCircle, XCircle, Crown, Settings } from 'lucide-react'

import { adminApi } from '@/services/admin'
import type { UserSummary, UserResponse } from '@/types/admin'
import { useAuth } from '@/components/AuthProvider'
import UserModal from '@/components/UserModal'

const PAGE_LIMIT = 20

type FilterStatus = 'all' | 'active' | 'inactive'

export default function AdminUsersPage() {
  const { hasPermission } = useAuth()
  const canManageUsers = hasPermission('users:manage')
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const queryKey = useMemo(() => ['admin-users', search, filterStatus], [search, filterStatus])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      adminApi.listUsers({
        limit: PAGE_LIMIT,
        offset: 0,
        search: search.trim() ? search.trim() : undefined,
        is_active: filterStatus === 'all' ? undefined : filterStatus === 'active',
      }),
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    refetch()
  }

  const users: UserSummary[] = data?.items ?? []

  const stats = useMemo(() => {
    const total = data?.total ?? 0
    const active = users.filter((u) => u.is_active).length
    const inactive = users.filter((u) => !u.is_active).length
    const superusers = users.filter((u) => u.is_superuser).length

    return { total, active, inactive, superusers }
  }, [users, data])

  const getRoleBadgeColor = (roleName: string): string => {
    const roleColors: Record<string, string> = {
      admin: 'badge-primary',
      moderator: 'badge-secondary',
      editor: 'badge-info',
      viewer: 'badge-neutral',
    }

    return roleColors[roleName.toLowerCase()] || 'badge-neutral'
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="heading-1">Usuarios del Sistema</h1>
            <p className="text-secondary mt-1">Gestiona las cuentas y roles asignados a cada miembro del equipo.</p>
          </div>
          {canManageUsers && (
            <button type="button" className="btn btn-primary sm:inline-flex" disabled>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Nuevo usuario
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="card flex items-center gap-3 p-4">
            <div className="rounded-lg bg-primary-100 p-2">
              <UsersIcon className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
              <p className="text-xs text-secondary">Total usuarios</p>
            </div>
          </div>

          <div className="card flex items-center gap-3 p-4">
            <div className="rounded-lg bg-green-100 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.active}</p>
              <p className="text-xs text-secondary">Activos</p>
            </div>
          </div>

          <div className="card flex items-center gap-3 p-4">
            <div className="rounded-lg bg-red-100 p-2">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.inactive}</p>
              <p className="text-xs text-secondary">Inactivos</p>
            </div>
          </div>

          <div className="card flex items-center gap-3 p-4">
            <div className="rounded-lg bg-yellow-100 p-2">
              <Crown className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.superusers}</p>
              <p className="text-xs text-secondary">Superusuarios</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <section className="card">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" onSubmit={handleSubmit}>
          <div className="flex w-full items-center gap-2 rounded-component border border-neutral-200 bg-white px-3 py-2 shadow-sm sm:max-w-md">
            <Search className="h-4 w-4 text-neutral-500" aria-hidden="true" />
            <input
              className="flex-1 border-none bg-transparent text-sm focus:outline-none"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-neutral-200 bg-white p-1">
              <button
                type="button"
                className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                  filterStatus === 'all' ? 'bg-primary-100 text-primary-700' : 'text-neutral-600 hover:bg-neutral-50'
                }`}
                onClick={() => setFilterStatus('all')}
              >
                Todos
              </button>
              <button
                type="button"
                className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                  filterStatus === 'active' ? 'bg-green-100 text-green-700' : 'text-neutral-600 hover:bg-neutral-50'
                }`}
                onClick={() => setFilterStatus('active')}
              >
                Activos
              </button>
              <button
                type="button"
                className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                  filterStatus === 'inactive' ? 'bg-red-100 text-red-700' : 'text-neutral-600 hover:bg-neutral-50'
                }`}
                onClick={() => setFilterStatus('inactive')}
              >
                Inactivos
              </button>
            </div>

            <button type="submit" className="btn btn-secondary">
              Buscar
            </button>

            {canManageUsers && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setSelectedUser(null)
                  setModalMode('create')
                  setIsModalOpen(true)
                }}
              >
                <UserPlus className="h-4 w-4" />
                Nuevo usuario
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Users Table */}
      <section className="card overflow-hidden p-0">
        {isLoading && (
          <div className="p-6">
            <p className="text-sm text-secondary">Cargando usuarios...</p>
          </div>
        )}

        {isError && (
          <div className="p-6">
            <p className="text-sm text-error">No fue posible cargar la lista de usuarios.</p>
          </div>
        )}

        {!isLoading && users.length === 0 && (
          <div className="py-12 text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-neutral-300" />
            <p className="mt-3 text-sm text-secondary">No se encontraron usuarios con los filtros actuales.</p>
          </div>
        )}

        {!isLoading && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Tipo
                  </th>
                  {canManageUsers && (
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                          {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{user.full_name || 'Sin nombre'}</p>
                          <p className="text-xs text-neutral-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {user.roles.length === 0 ? (
                        <span className="badge badge-neutral text-xs">Sin roles</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {user.roles.map((role) => (
                            <span key={role} className={`badge text-xs ${getRoleBadgeColor(role)}`}>
                              <Shield className="mr-1 h-3 w-3" />
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          <XCircle className="h-3 w-3" />
                          Inactivo
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {user.is_superuser ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                          <Crown className="h-3 w-3" />
                          Superusuario
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-500">Usuario</span>
                      )}
                    </td>

                    {canManageUsers && (
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/users/${user.id}/roles`)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                          aria-label={`Gestionar roles de ${user.email}`}
                        >
                          <Settings className="h-3.5 w-3.5" />
                          Gestionar Roles
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && users.length > 0 && data && (
          <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-3">
            <p className="text-xs text-secondary">
              Mostrando {users.length} de {data.total} usuarios
            </p>
          </div>
        )}
      </section>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        mode={modalMode}
      />
    </div>
  )
}
