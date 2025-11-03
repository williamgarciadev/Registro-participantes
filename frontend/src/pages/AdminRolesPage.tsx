import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Shield, Search, Users as UsersIcon, Key, ChevronDown, ChevronUp } from 'lucide-react'

import { adminApi } from '@/services/admin'
import { useAuth } from '@/components/AuthProvider'
import type { RoleResponse } from '@/types/admin'
import RoleModal from '@/components/RoleModal'

export default function AdminRolesPage() {
  const { hasPermission } = useAuth()
  const canManageRoles = hasPermission('roles:manage')

  const [search, setSearch] = useState('')
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set())

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () =>
      adminApi.listRoles({
        limit: 100,
        offset: 0,
      }),
  })

  const roles = data?.items ?? []

  const filteredRoles = roles.filter(
    (role) =>
      !search.trim() ||
      role.name.toLowerCase().includes(search.toLowerCase()) ||
      role.description?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleRole = (roleId: string) => {
    setExpandedRoles((prev) => {
      const next = new Set(prev)
      if (next.has(roleId)) {
        next.delete(roleId)
      } else {
        next.add(roleId)
      }
      return next
    })
  }

  const groupPermissionsByModule = (permissions: RoleResponse['permissions']) => {
    const grouped: Record<string, typeof permissions> = {}

    permissions.forEach((perm) => {
      const module = perm.code.split(':')[0] || 'general'
      if (!grouped[module]) {
        grouped[module] = []
      }
      grouped[module].push(perm)
    })

    return grouped
  }

  const getRoleStats = (role: RoleResponse) => {
    const permissionsByModule = groupPermissionsByModule(role.permissions)
    const moduleCount = Object.keys(permissionsByModule).length

    return {
      totalPermissions: role.permissions.length,
      moduleCount,
    }
  }

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

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="heading-1">Roles del Sistema</h1>
            <p className="text-secondary mt-1">Organiza los permisos agrupándolos en roles reutilizables.</p>
          </div>
          {canManageRoles && (
            <button type="button" className="btn btn-primary sm:inline-flex" disabled>
              <Shield className="h-4 w-4" aria-hidden="true" />
              Nuevo rol
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card flex items-center gap-3 p-4">
            <div className="rounded-lg bg-primary-100 p-2">
              <Shield className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{roles.length}</p>
              <p className="text-xs text-secondary">Roles configurados</p>
            </div>
          </div>

          <div className="card flex items-center gap-3 p-4">
            <div className="rounded-lg bg-blue-100 p-2">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {roles.reduce((sum, role) => sum + role.permissions.length, 0)}
              </p>
              <p className="text-xs text-secondary">Permisos asignados</p>
            </div>
          </div>

          <div className="card flex items-center gap-3 p-4">
            <div className="rounded-lg bg-green-100 p-2">
              <UsersIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{expandedRoles.size}</p>
              <p className="text-xs text-secondary">Roles expandidos</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <section className="card">
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-component border border-neutral-200 bg-white px-3 py-2 shadow-sm sm:max-w-md">
            <Search className="h-4 w-4 text-neutral-500" aria-hidden="true" />
            <input
              className="flex-1 border-none bg-transparent text-sm focus:outline-none"
              placeholder="Buscar roles por nombre o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {canManageRoles && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setSelectedRole(null)
                setModalMode('create')
                setIsModalOpen(true)
              }}
            >
              <Shield className="h-4 w-4" />
              Nuevo rol
            </button>
          )}
        </div>

        {search && (
          <p className="mt-3 text-sm text-secondary">
            Mostrando {filteredRoles.length} de {roles.length} roles
          </p>
        )}
      </section>

      {/* Content */}
      <section>
        {isLoading && (
          <div className="card">
            <p className="text-sm text-secondary">Cargando roles...</p>
          </div>
        )}

        {isError && (
          <div className="card">
            <p className="text-sm text-error">No fue posible cargar los roles.</p>
          </div>
        )}

        {!isLoading && filteredRoles.length === 0 && (
          <div className="card">
            <div className="py-8 text-center">
              <Shield className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-3 text-sm text-secondary">
                {search ? 'No se encontraron roles que coincidan con tu búsqueda.' : 'Aún no se han configurado roles en el sistema.'}
              </p>
            </div>
          </div>
        )}

        {!isLoading && filteredRoles.length > 0 && (
          <div className="space-y-4">
            {filteredRoles.map((role) => {
              const isExpanded = expandedRoles.has(role.id)
              const stats = getRoleStats(role)
              const permissionsByModule = groupPermissionsByModule(role.permissions)

              return (
                <article key={role.id} className="card overflow-hidden p-0">
                  {/* Role Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary-100 p-2">
                          <Shield className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold capitalize text-text-primary">{role.name}</h2>
                          {role.description && <p className="mt-0.5 text-sm text-secondary">{role.description}</p>}

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="badge badge-neutral">
                              <Key className="mr-1 h-3 w-3" />
                              {stats.totalPermissions} permisos
                            </span>
                            <span className="badge badge-neutral">
                              <Shield className="mr-1 h-3 w-3" />
                              {stats.moduleCount} módulos
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => toggleRole(role.id)}
                        aria-label={isExpanded ? 'Contraer detalles' : 'Expandir detalles'}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Contraer
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Ver permisos
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Permissions Details (Expandable) */}
                  {isExpanded && (
                    <div className="border-t border-neutral-200 bg-neutral-50 p-5">
                      {role.permissions.length === 0 ? (
                        <p className="text-sm text-secondary">Este rol no tiene permisos asignados.</p>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            Permisos por módulo
                          </p>

                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(permissionsByModule)
                              .sort(([a], [b]) => a.localeCompare(b))
                              .map(([moduleName, modulePermissions]) => {
                                const moduleIcon = MODULE_ICONS[moduleName] || '📦'

                                return (
                                  <div key={moduleName} className="rounded-lg border border-neutral-200 bg-white p-3">
                                    <div className="mb-2 flex items-center gap-2">
                                      <span className="text-lg" aria-hidden="true">
                                        {moduleIcon}
                                      </span>
                                      <h3 className="text-sm font-semibold capitalize text-text-primary">{moduleName}</h3>
                                      <span className="ml-auto rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                                        {modulePermissions.length}
                                      </span>
                                    </div>

                                    <ul className="space-y-1">
                                      {modulePermissions.map((perm) => (
                                        <li key={perm.id} className="flex items-start gap-2 text-xs">
                                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                                          <div>
                                            <p className="font-medium text-text-primary">{perm.name}</p>
                                            <p className="font-mono text-neutral-500">{perm.code}</p>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Role Modal */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRole(null)
        }}
        role={selectedRole}
        mode={modalMode}
      />
    </div>
  )
}
