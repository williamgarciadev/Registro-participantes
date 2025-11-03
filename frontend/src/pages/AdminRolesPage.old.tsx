import { useQuery } from '@tanstack/react-query'
import { Shield } from 'lucide-react'

import { adminApi } from '@/services/admin'
import { useAuth } from '@/components/AuthProvider'

export default function AdminRolesPage() {
  const { hasPermission } = useAuth()
  const canManageRoles = hasPermission('roles:manage')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () =>
      adminApi.listRoles({
        limit: 100,
        offset: 0,
      }),
  })

  const roles = data?.items ?? []

  return (
    <div className="space-y-4 pb-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="heading-1">Roles del sistema</h1>
          <p className="text-secondary mt-0.5">Organiza los permisos agrupándolos en roles reutilizables.</p>
        </div>
        {canManageRoles && (
          <button type="button" className="btn btn-primary sm:inline-flex" disabled>
            <Shield className="h-4 w-4" aria-hidden="true" />
            Nuevo rol
          </button>
        )}
      </header>

      <section className="card">
        {isLoading && <p className="text-sm text-secondary">Cargando roles...</p>}
        {isError && <p className="text-sm text-error">No fue posible cargar los roles.</p>}

        {!isLoading && roles.length === 0 && (
          <div className="py-6 text-center text-sm text-secondary">
            Aún no se han configurado roles en el sistema.
          </div>
        )}

        {!isLoading && roles.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => (
              <article key={role.id} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                <header className="mb-3">
                  <h2 className="text-base font-semibold text-text-primary">{role.name}</h2>
                  {role.description && <p className="text-xs text-neutral-500">{role.description}</p>}
                </header>
                <section className="space-y-2 text-xs text-neutral-600">
                  <p className="font-medium">Permisos asignados:</p>
                  {role.permissions.length === 0 ? (
                    <p className="text-neutral-400">Sin permisos asociados</p>
                  ) : (
                    <ul className="flex flex-wrap gap-2">
                      {role.permissions.map((permission) => (
                        <li key={permission.id} className="badge badge-neutral">
                          {permission.code}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
