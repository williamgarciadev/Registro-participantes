import { FormEvent, useState, useEffect } from 'react'
import { X, Save, AlertCircle, Search } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/services/admin'
import type { RoleResponse, PermissionCatalogItem } from '@/types/admin'

interface RoleModalProps {
  isOpen: boolean
  onClose: () => void
  role?: RoleResponse | null
  mode: 'create' | 'edit'
}

export default function RoleModal({ isOpen, onClose, role, mode }: RoleModalProps) {
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permission_ids: [] as string[],
  })

  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  // Cargar catálogo de permisos
  const { data: catalogData } = useQuery({
    queryKey: ['admin-permissions-catalog-for-role'],
    queryFn: () => adminApi.getPermissionsCatalog(),
    enabled: isOpen,
  })

  // Cargar permisos para obtener IDs
  const { data: permissionsData } = useQuery({
    queryKey: ['admin-permissions-list'],
    queryFn: () => adminApi.listPermissions({ limit: 200, offset: 0 }),
    enabled: isOpen,
  })

  // Mapear código de permiso a ID
  const permissionCodeToId = new Map(
    permissionsData?.items.map(p => [p.code, p.id]) || []
  )

  // Reset form when role changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && role) {
        setFormData({
          name: role.name,
          description: role.description || '',
          permission_ids: role.permissions.map(p => p.id),
        })
      } else {
        setFormData({
          name: '',
          description: '',
          permission_ids: [],
        })
      }
      setError('')
      setSearch('')
    }
  }, [isOpen, role, mode])

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => adminApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      onClose()
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Error al crear el rol')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (!role) throw new Error('No role to update')
      return adminApi.updateRole(role.id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      onClose()
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Error al actualizar el rol')
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('El nombre del rol es requerido')
      return
    }

    if (mode === 'create') {
      createMutation.mutate(formData)
    } else {
      updateMutation.mutate(formData)
    }
  }

  const togglePermission = (permissionCode: string) => {
    const permissionId = permissionCodeToId.get(permissionCode)
    if (!permissionId) return

    setFormData((prev) => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter((id) => id !== permissionId)
        : [...prev.permission_ids, permissionId],
    }))
  }

  const toggleModule = (permissions: PermissionCatalogItem[]) => {
    const modulePermissionIds = permissions
      .map(p => permissionCodeToId.get(p.code))
      .filter((id): id is string => id !== undefined)
    
    const allSelected = modulePermissionIds.every(id => formData.permission_ids.includes(id))

    setFormData((prev) => ({
      ...prev,
      permission_ids: allSelected
        ? prev.permission_ids.filter(id => !modulePermissionIds.includes(id))
        : [...new Set([...prev.permission_ids, ...modulePermissionIds])],
    }))
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  // Filtrar módulos por búsqueda
  const filteredModules = catalogData?.modules
    ? Object.entries(catalogData.modules).filter(([moduleName, permissions]) =>
        !search.trim() ||
        moduleName.toLowerCase().includes(search.toLowerCase()) ||
        permissions.some(p =>
          p.code.toLowerCase().includes(search.toLowerCase()) ||
          p.name.toLowerCase().includes(search.toLowerCase())
        )
      )
    : []

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {mode === 'create' ? 'Nuevo Rol' : 'Editar Rol'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            disabled={isPending}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 p-6 overflow-y-auto">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary">
                Nombre del rol *
              </label>
              <input
                id="name"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isPending}
                placeholder="ej: Editor, Moderador"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-primary">
                Descripción
              </label>
              <textarea
                id="description"
                rows={2}
                className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isPending}
                placeholder="Breve descripción del rol y sus responsabilidades"
              />
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="block text-sm font-medium text-text-primary">
                  Permisos ({formData.permission_ids.length} seleccionados)
                </label>
              </div>

              {/* Search */}
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2">
                <Search className="h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Buscar permisos..."
                  className="flex-1 border-none bg-transparent text-sm focus:outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={isPending}
                />
              </div>

              {/* Permissions by Module */}
              <div className="space-y-3 rounded-lg border border-neutral-200 p-3 max-h-64 overflow-y-auto">
                {filteredModules.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    {search ? 'No se encontraron permisos' : 'Cargando permisos...'}
                  </p>
                ) : (
                  filteredModules.map(([moduleName, permissions]) => {
                    const modulePermissionIds = permissions
                      .map(p => permissionCodeToId.get(p.code))
                      .filter((id): id is string => id !== undefined)
                    const allSelected = modulePermissionIds.every(id => formData.permission_ids.includes(id))
                    const someSelected = modulePermissionIds.some(id => formData.permission_ids.includes(id))

                    return (
                      <div key={moduleName} className="rounded-lg border border-neutral-200 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <input
                            id={`module-${moduleName}`}
                            type="checkbox"
                            checked={allSelected}
                            ref={(input) => {
                              if (input) input.indeterminate = someSelected && !allSelected
                            }}
                            onChange={() => toggleModule(permissions)}
                            disabled={isPending}
                            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          <label htmlFor={`module-${moduleName}`} className="flex-1 cursor-pointer">
                            <p className="text-sm font-semibold capitalize text-text-primary">{moduleName}</p>
                          </label>
                          <span className="text-xs text-neutral-500">{permissions.length}</span>
                        </div>

                        <div className="ml-6 space-y-1.5">
                          {permissions.map((permission) => {
                            const permissionId = permissionCodeToId.get(permission.code)
                            if (!permissionId) return null

                            return (
                              <div key={permission.code} className="flex items-start gap-2">
                                <input
                                  id={`perm-${permission.code}`}
                                  type="checkbox"
                                  checked={formData.permission_ids.includes(permissionId)}
                                  onChange={() => togglePermission(permission.code)}
                                  disabled={isPending}
                                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor={`perm-${permission.code}`} className="flex-1 cursor-pointer">
                                  <p className="text-sm font-medium text-text-primary">{permission.name}</p>
                                  <p className="text-xs text-neutral-500">{permission.code}</p>
                                </label>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {mode === 'create' ? 'Creando...' : 'Guardando...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {mode === 'create' ? 'Crear Rol' : 'Guardar Cambios'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
