import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, Save, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import adminApi from '@/services/admin'
import type { UserSummary, RoleResponse } from '@/types/admin'

interface RolesModalProps {
  user: UserSummary
  isOpen: boolean
  onClose: () => void
}

export default function RolesModal({ user, isOpen, onClose }: RolesModalProps) {
  const queryClient = useQueryClient()
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])

  // Fetch roles disponibles
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles', 'all'],
    queryFn: () => adminApi.listRoles({ limit: 100 }), // Traer todos los roles
    enabled: isOpen, // Solo fetch cuando modal está abierto
  })

  // Inicializar roles seleccionados cuando se abre el modal
  useEffect(() => {
    if (isOpen && user.roles) {
      // user.roles es string[] en UserSummary, necesitamos encontrar los IDs reales
      // de los roles que coinciden con esos nombres
      if (rolesData?.items) {
        const roleIds = user.roles
          .map((roleName) => {
            const matchingRole = rolesData.items.find(
              (r) => r.name.toLowerCase() === roleName.toLowerCase()
            )
            return matchingRole?.id
          })
          .filter((id): id is string => id !== undefined)
        
        setSelectedRoleIds(roleIds)
      }
    }
  }, [isOpen, user.roles, rolesData])

  // Mutation para actualizar roles
  const updateRolesMutation = useMutation({
    mutationFn: (roleIds: string[]) => adminApi.updateUserRoles(user.id, roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', user.id] })
      toast.success('Roles actualizados exitosamente')
      onClose()
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || 'Error al actualizar roles'
      toast.error(message)
      console.error('Error updating roles:', error)
    },
  })

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateRolesMutation.mutate(selectedRoleIds)
  }

  const handleClose = () => {
    if (!updateRolesMutation.isPending) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Gestionar Roles
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Usuario: <span className="font-medium">{user.email}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={updateRolesMutation.isPending}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {isLoadingRoles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <span className="ml-3 text-gray-600">Cargando roles...</span>
              </div>
            ) : rolesData?.items && rolesData.items.length > 0 ? (
              <div className="space-y-3">
                {rolesData.items.map((role) => {
                  const isSelected = selectedRoleIds.includes(role.id)
                  return (
                    <label
                      key={role.id}
                      className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      } ${
                        updateRolesMutation.isPending
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRole(role.id)}
                        disabled={updateRolesMutation.isPending}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900">
                          {role.name}
                        </div>
                        {role.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {role.description}
                          </div>
                        )}
                        {role.permissions && role.permissions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {role.permissions.slice(0, 3).map((permission) => (
                              <span
                                key={permission.id}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                              >
                                {permission.name}
                              </span>
                            ))}
                            {role.permissions.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                +{role.permissions.length - 3} más
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay roles disponibles
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={handleClose}
              disabled={updateRolesMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                updateRolesMutation.isPending ||
                !rolesData?.items ||
                rolesData.items.length === 0
              }
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
            >
              {updateRolesMutation.isPending ? (
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
        </form>
      </div>
    </div>
  )
}
