import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, Save, Loader2, Shield } from 'lucide-react'
import { toast } from 'react-toastify'
import adminApi from '@/services/admin'
import type { RoleResponse, PermissionResponse } from '@/types/admin'

interface RolePermissionsModalProps {
  role: RoleResponse
  isOpen: boolean
  onClose: () => void
}

export default function RolePermissionsModal({ role, isOpen, onClose }: RolePermissionsModalProps) {
  const queryClient = useQueryClient()
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([])

  // Fetch permisos disponibles
  const { data: permissionsData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['permissions', 'all'],
    queryFn: () => adminApi.listPermissions({ limit: 200 }), // Traer todos los permisos
    enabled: isOpen,
  })

  // Inicializar permisos seleccionados cuando se abre el modal
  useEffect(() => {
    if (isOpen && role.permissions) {
      setSelectedPermissionIds(role.permissions.map((p) => p.id))
    }
  }, [isOpen, role.permissions])

  // Mutation para actualizar permisos del rol
  const updatePermissionsMutation = useMutation({
    mutationFn: (permissionIds: string[]) =>
      adminApi.updateRole(role.id, { permission_ids: permissionIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['role', role.id] })
      toast.success('Permisos actualizados exitosamente')
      onClose()
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || 'Error al actualizar permisos'
      toast.error(message)
      console.error('Error updating permissions:', error)
    },
  })

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updatePermissionsMutation.mutate(selectedPermissionIds)
  }

  const handleClose = () => {
    if (!updatePermissionsMutation.isPending) {
      onClose()
    }
  }

  // Agrupar permisos por módulo
  const permissionsByModule = permissionsData?.items.reduce((acc, permission) => {
    // Extraer módulo del código (ej: "users:view" -> "users")
    const module = permission.code.split(':')[0] || 'otros'
    if (!acc[module]) {
      acc[module] = []
    }
    acc[module].push(permission)
    return acc
  }, {} as Record<string, PermissionResponse[]>)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 animate-scale-in max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Gestionar Permisos del Rol
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Rol: <span className="font-medium">{role.name}</span>
            </p>
            {role.description && (
              <p className="text-xs text-gray-500 mt-1">{role.description}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={updatePermissionsMutation.isPending}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1">
            {isLoadingPermissions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <span className="ml-3 text-gray-600">Cargando permisos...</span>
              </div>
            ) : permissionsByModule && Object.keys(permissionsByModule).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(permissionsByModule).map(([module, permissions]) => (
                  <div key={module} className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-blue-600" />
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {permissions.map((permission) => {
                        const isSelected = selectedPermissionIds.includes(permission.id)
                        return (
                          <label
                            key={permission.id}
                            className={`flex items-start p-3 rounded-md border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            } ${
                              updatePermissionsMutation.isPending
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleTogglePermission(permission.id)}
                              disabled={updatePermissionsMutation.isPending}
                              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="ml-2 flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {permission.name}
                              </div>
                              {permission.description && (
                                <div className="text-xs text-gray-600 mt-0.5">
                                  {permission.description}
                                </div>
                              )}
                              <div className="text-xs text-gray-500 mt-1 font-mono">
                                {permission.code}
                              </div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay permisos disponibles
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 rounded-b-lg">
            <div className="text-sm text-gray-600">
              {selectedPermissionIds.length} permiso(s) seleccionado(s)
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={updatePermissionsMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={
                  updatePermissionsMutation.isPending ||
                  !permissionsData?.items ||
                  permissionsData.items.length === 0
                }
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
              >
                {updatePermissionsMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={16} />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
