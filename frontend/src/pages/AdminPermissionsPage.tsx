import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Key, Search, Package, ChevronDown, ChevronRight } from 'lucide-react'

import { adminApi } from '@/services/admin'
import type { PermissionCatalogItem } from '@/types/admin'

const MODULE_ICONS: Record<string, string> = {
  participantes: '👥',
  users: '👤',
  roles: '🛡️',
  permissions: '🔑',
  reports: '📊',
  audit: '📜',
  system: '⚙️',
  notifications: '🔔',
}

const MODULE_COLORS: Record<string, string> = {
  participantes: 'bg-blue-50 border-blue-200 text-blue-700',
  users: 'bg-purple-50 border-purple-200 text-purple-700',
  roles: 'bg-green-50 border-green-200 text-green-700',
  permissions: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  reports: 'bg-pink-50 border-pink-200 text-pink-700',
  audit: 'bg-orange-50 border-orange-200 text-orange-700',
  system: 'bg-gray-50 border-gray-200 text-gray-700',
  notifications: 'bg-indigo-50 border-indigo-200 text-indigo-700',
}

export default function AdminPermissionsPage() {
  const [search, setSearch] = useState('')
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-permissions-catalog'],
    queryFn: () => adminApi.getPermissionsCatalog(),
  })

  const toggleModule = (moduleName: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleName)) {
        next.delete(moduleName)
      } else {
        next.add(moduleName)
      }
      return next
    })
  }

  const expandAll = () => {
    if (data) {
      setExpandedModules(new Set(Object.keys(data.modules)))
    }
  }

  const collapseAll = () => {
    setExpandedModules(new Set())
  }

  // Filtrado de permisos por búsqueda
  const filteredModules = useMemo(() => {
    if (!data || !search.trim()) return data?.modules ?? {}

    const searchLower = search.toLowerCase()
    const filtered: Record<string, PermissionCatalogItem[]> = {}

    Object.entries(data.modules).forEach(([moduleName, permissions]) => {
      const matchingPerms = permissions.filter(
        (perm) =>
          perm.code.toLowerCase().includes(searchLower) ||
          perm.name.toLowerCase().includes(searchLower) ||
          perm.description?.toLowerCase().includes(searchLower) ||
          moduleName.toLowerCase().includes(searchLower)
      )

      if (matchingPerms.length > 0) {
        filtered[moduleName] = matchingPerms
      }
    })

    return filtered
  }, [data, search])

  const totalPermissions = data?.total ?? 0
  const totalModules = Object.keys(filteredModules).length
  const totalFilteredPermissions = Object.values(filteredModules).reduce((sum, perms) => sum + perms.length, 0)

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <div>
          <h1 className="heading-1">Catálogo de Permisos</h1>
          <p className="text-secondary mt-1">
            Explora todos los permisos disponibles en el sistema organizados por módulo.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card flex items-center gap-3 p-4">
            <div className="rounded-lg bg-primary-100 p-2">
              <Key className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{totalPermissions}</p>
              <p className="text-xs text-secondary">Permisos totales</p>
            </div>
          </div>

          <div className="card flex items-center gap-3 p-4">
            <div className="rounded-lg bg-blue-100 p-2">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{Object.keys(data?.modules ?? {}).length}</p>
              <p className="text-xs text-secondary">Módulos</p>
            </div>
          </div>

          <div className="card flex items-center gap-3 p-4">
            <div className="rounded-lg bg-green-100 p-2">
              <Search className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{expandedModules.size}</p>
              <p className="text-xs text-secondary">Módulos expandidos</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Controls */}
      <section className="card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-2 rounded-component border border-neutral-200 bg-white px-3 py-2 shadow-sm sm:max-w-md">
            <Search className="h-4 w-4 text-neutral-500" aria-hidden="true" />
            <input
              className="flex-1 border-none bg-transparent text-sm focus:outline-none"
              placeholder="Buscar por código, nombre o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-secondary text-sm" onClick={expandAll}>
              Expandir todos
            </button>
            <button type="button" className="btn btn-secondary text-sm" onClick={collapseAll}>
              Contraer todos
            </button>
          </div>
        </div>

        {search && (
          <p className="mt-3 text-sm text-secondary">
            Mostrando {totalFilteredPermissions} permisos en {totalModules} módulos
          </p>
        )}
      </section>

      {/* Content */}
      <section className="space-y-4">
        {isLoading && (
          <div className="card">
            <p className="text-sm text-secondary">Cargando catálogo de permisos...</p>
          </div>
        )}

        {isError && (
          <div className="card">
            <p className="text-sm text-error">No fue posible cargar el catálogo de permisos.</p>
          </div>
        )}

        {!isLoading && totalModules === 0 && (
          <div className="card">
            <div className="py-8 text-center">
              <Package className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-3 text-sm text-secondary">
                {search ? 'No se encontraron permisos que coincidan con tu búsqueda.' : 'No hay permisos registrados.'}
              </p>
            </div>
          </div>
        )}

        {!isLoading && !isError && totalModules > 0 && (
          <div className="space-y-3">
            {Object.entries(filteredModules)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([moduleName, permissions]) => {
                const isExpanded = expandedModules.has(moduleName)
                const moduleColor = MODULE_COLORS[moduleName] || MODULE_COLORS.system
                const moduleIcon = MODULE_ICONS[moduleName] || '📦'

                return (
                  <article key={moduleName} className="card overflow-hidden p-0">
                    {/* Module Header */}
                    <button
                      type="button"
                      className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-neutral-50"
                      onClick={() => toggleModule(moduleName)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl" aria-hidden="true">
                          {moduleIcon}
                        </span>
                        <div>
                          <h2 className="text-base font-semibold capitalize text-text-primary">{moduleName}</h2>
                          <p className="text-xs text-secondary">
                            {permissions.length} {permissions.length === 1 ? 'permiso' : 'permisos'}
                          </p>
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-neutral-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-neutral-400" />
                      )}
                    </button>

                    {/* Permissions List */}
                    {isExpanded && (
                      <div className="border-t border-neutral-200 bg-neutral-50">
                        <div className="divide-y divide-neutral-200">
                          {permissions.map((permission) => (
                            <div key={permission.code} className="flex items-start gap-4 p-4 transition-colors hover:bg-white">
                              <div className={`mt-0.5 rounded-md border px-2 py-1 ${moduleColor}`}>
                                <span className="text-xs font-mono font-semibold">{permission.action}</span>
                              </div>

                              <div className="flex-1">
                                <p className="text-sm font-medium text-text-primary">{permission.name}</p>
                                <p className="mt-0.5 font-mono text-xs text-neutral-500">{permission.code}</p>
                                {permission.description && (
                                  <p className="mt-1 text-xs text-secondary">{permission.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
          </div>
        )}
      </section>
    </div>
  )
}
