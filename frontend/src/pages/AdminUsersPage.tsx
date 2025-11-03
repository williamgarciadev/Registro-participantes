import { FormEvent, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, UserPlus } from 'lucide-react'

import { adminApi } from '@/services/admin'
import type { UserSummary } from '@/types/admin'
import { useAuth } from '@/components/AuthProvider'

const PAGE_LIMIT = 20

export default function AdminUsersPage() {
  const { hasPermission } = useAuth()
  const canManageUsers = hasPermission('users:manage')

  const [search, setSearch] = useState('')

  const queryKey = useMemo(() => ['admin-users', search], [search])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      adminApi.listUsers({
        limit: PAGE_LIMIT,
        offset: 0,
        search: search.trim() ? search.trim() : undefined,
      }),
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    refetch()
  }

  const users: UserSummary[] = data?.items ?? []

  return (
    <div className="space-y-4 pb-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="heading-1">Usuarios del sistema</h1>
          <p className="text-secondary mt-0.5">
            Gestiona las cuentas y roles asignados a cada miembro del equipo.
          </p>
        </div>
        {canManageUsers && (
          <button type="button" className="btn btn-primary sm:inline-flex" disabled>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Nuevo usuario
          </button>
        )}
      </header>

      <section className="card">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" onSubmit={handleSubmit}>
          <div className="flex w-full items-center gap-2 rounded-component border border-neutral-200 bg-white px-3 py-2 shadow-sm sm:max-w-sm">
            <Search className="h-4 w-4 text-neutral-500" aria-hidden="true" />
            <input
              className="flex-1 border-none bg-transparent text-sm focus:outline-none"
              placeholder="Buscar por nombre o correo"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" className="btn btn-secondary">
              Buscar
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        {isLoading && <p className="text-sm text-secondary">Cargando usuarios...</p>}
        {isError && <p className="text-sm text-error">No fue posible cargar la lista de usuarios.</p>}

        {!isLoading && users.length === 0 && (
          <div className="py-6 text-center text-sm text-secondary">No se encontraron usuarios con los filtros actuales.</div>
        )}

        {!isLoading && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Roles</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm text-text-primary">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary">{user.full_name || 'Sin nombre'}</span>
                        <span className="text-xs text-neutral-500">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.roles.length === 0 ? (
                        <span className="badge badge-neutral">Sin roles</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role) => (
                            <span key={role} className="badge badge-primary">
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.is_active ? 'badge-success' : 'badge-error'}`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
