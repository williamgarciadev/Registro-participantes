import { useQuery } from '@tanstack/react-query'
import { Key } from 'lucide-react'

import { adminApi } from '@/services/admin'

export default function AdminPermissionsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: () =>
      adminApi.listPermissions({
        limit: 200,
        offset: 0,
      }),
  })

  const permissions = data?.items ?? []

  return (
    <div className="space-y-4 pb-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="heading-1">Permisos disponibles</h1>
          <p className="text-secondary mt-0.5">Listado de permisos que pueden asignarse a los roles.</p>
        </div>
        <button type="button" className="btn btn-secondary sm:inline-flex" disabled>
          <Key className="h-4 w-4" aria-hidden="true" />
          Gestionar permisos
        </button>
      </header>

      <section className="card">
        {isLoading && <p className="text-sm text-secondary">Cargando permisos...</p>}
        {isError && <p className="text-sm text-error">No fue posible cargar los permisos.</p>}

        {!isLoading && permissions.length === 0 && (
          <div className="py-6 text-center text-sm text-secondary">No hay permisos registrados.</div>
        )}

        {!isLoading && permissions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Código</th>
                  <th className="px-4 py-3 font-semibold">Nombre</th>
                  <th className="px-4 py-3 font-semibold">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm text-text-primary">
                {permissions.map((permission) => (
                  <tr key={permission.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-xs text-neutral-500">{permission.code}</td>
                    <td className="px-4 py-3">{permission.name}</td>
                    <td className="px-4 py-3 text-neutral-600">{permission.description || 'Sin descripción'}</td>
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
