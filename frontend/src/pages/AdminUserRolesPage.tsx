import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, ChevronLeft, Save, Loader2, User, CheckCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { adminApi } from '@/services/admin'
import type { UserResponse, RoleResponse } from '@/types/admin'

export default function AdminUserRolesPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])

  // Fetch usuario específico (retorna UserResponse con roles: RoleResponse[])
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => adminApi.getUser(userId!),
    enabled: !!userId,
  })

  // Fetch todos los roles disponibles
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles', 'all'],
    queryFn: () => adminApi.listRoles({ limit: 100 }),
  })

  // Inicializar roles seleccionados cuando se carga el usuario
  useEffect(() => {
    if (user?.roles) {
      // user.roles es RoleResponse[], extraer los IDs directamente
      const roleIds = user.roles.map((role) => role.id)
      setSelectedRoleIds(roleIds)
    }
  }, [user])

  // Mutation para actualizar roles
  const updateRolesMutation = useMutation({
    mutationFn: (roleIds: string[]) => adminApi.updateUserRoles(userId!, roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      toast.success('Roles actualizados exitosamente')
      // Redirigir después de 1 segundo
      setTimeout(() => navigate('/admin/users'), 1000)
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Error al actualizar roles'
      toast.error(message)
      console.error('Error updating roles:', error)
    },
  })

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateRolesMutation.mutate(selectedRoleIds)
  }

  const handleCancel = () => {
    navigate('/admin/users')
  }

  const isLoading = isLoadingUser || isLoadingRoles
  const roles = rolesData?.items ?? []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Usuario no encontrado</p>
          <button onClick={handleCancel} className="mt-4 btn btn-secondary">
            Volver a Usuarios
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header con breadcrumb */}
      <header>
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ChevronLeft size={16} />
          Volver a Usuarios
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-semibold text-blue-700">
            {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="heading-1">Gestionar Roles de Usuario</h1>
            <div className="flex items-center gap-2 mt-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900">{user.full_name || 'Sin nombre'}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{user.email}</span>
            </div>
            {user.is_superuser && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                  <Shield className="h-3 w-3" />
                  Superusuario
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Roles Selection */}
        <section className="card">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Roles Disponibles
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Selecciona los roles que deseas asignar a este usuario. Puedes seleccionar múltiples roles.
            </p>
          </div>

          {roles.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No hay roles configurados en el sistema</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => {
                const isSelected = selectedRoleIds.includes(role.id)
                return (
                  <label
                    key={role.id}
                    className={`relative flex items-start p-5 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
                    } ${
                      updateRolesMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-start flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRole(role.id)}
                        disabled={updateRolesMutation.isPending}
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Shield className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div className="font-semibold text-gray-900 capitalize">
                            {role.name}
                          </div>
                        </div>
                        {role.description && (
                          <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                        )}
                        {role.permissions && role.permissions.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-700 mb-2">
                              Permisos incluidos ({role.permissions.length}):
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.slice(0, 4).map((permission) => (
                                <span
                                  key={permission.id}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                                  title={permission.description || permission.name}
                                >
                                  {permission.code}
                                </span>
                              ))}
                              {role.permissions.length > 4 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                  +{role.permissions.length - 4} más
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                      </div>
                    )}
                  </label>
                )
              })}
            </div>
          )}
        </section>

        {/* Summary Card */}
        <section className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Resumen de Cambios</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedRoleIds.length === 0 ? (
                  'No se han seleccionado roles'
                ) : selectedRoleIds.length === 1 ? (
                  '1 rol seleccionado'
                ) : (
                  `${selectedRoleIds.length} roles seleccionados`
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={updateRolesMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={updateRolesMutation.isPending || roles.length === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
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
          </div>
        </section>
      </form>
    </div>
  )
}
