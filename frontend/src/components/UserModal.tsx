import { FormEvent, useState, useEffect } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/services/admin'
import type { UserResponse, RoleResponse } from '@/types/admin'

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  user?: UserResponse | null
  mode: 'create' | 'edit'
}

export default function UserModal({ isOpen, onClose, user, mode }: UserModalProps) {
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    is_active: true,
    role_ids: [] as string[],
  })

  const [error, setError] = useState('')

  // Cargar roles disponibles
  const { data: rolesData } = useQuery({
    queryKey: ['admin-roles-for-user-modal'],
    queryFn: () => adminApi.listRoles({ limit: 100, offset: 0 }),
    enabled: isOpen,
  })

  const roles: RoleResponse[] = rolesData?.items ?? []

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && user) {
        setFormData({
          email: user.email,
          password: '',
          full_name: user.full_name || '',
          is_active: user.is_active,
          role_ids: user.roles.map(r => r.id),
        })
      } else {
        setFormData({
          email: '',
          password: '',
          full_name: '',
          is_active: true,
          role_ids: [],
        })
      }
      setError('')
    }
  }, [isOpen, user, mode])

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => adminApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      onClose()
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Error al crear el usuario')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (!user) throw new Error('No user to update')
      const updateData: any = { ...data }
      if (!updateData.password) delete updateData.password // Don't send empty password
      return adminApi.updateUser(user.id, updateData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      onClose()
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Error al actualizar el usuario')
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'create') {
      if (!formData.email || !formData.password) {
        setError('Email y contraseña son requeridos')
        return
      }
      createMutation.mutate(formData)
    } else {
      if (!formData.email) {
        setError('Email es requerido')
        return
      }
      updateMutation.mutate(formData)
    }
  }

  const toggleRole = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      role_ids: prev.role_ids.includes(roleId)
        ? prev.role_ids.filter((id) => id !== roleId)
        : [...prev.role_ids, roleId],
    }))
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
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
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary">
              Email *
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-text-primary">
              Nombre completo
            </label>
            <input
              id="full_name"
              type="text"
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary">
              Contraseña {mode === 'create' && '*'}
              {mode === 'edit' && <span className="text-xs text-neutral-500"> (dejar vacío para no cambiar)</span>}
            </label>
            <input
              id="password"
              type="password"
              required={mode === 'create'}
              minLength={8}
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isPending}
              placeholder={mode === 'create' ? 'Mínimo 8 caracteres' : 'Dejar vacío para mantener actual'}
            />
          </div>

          {mode === 'edit' && (
            <div className="flex items-center gap-2">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                disabled={isPending}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-text-primary">
                Usuario activo
              </label>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Roles</label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-neutral-200 p-3">
              {roles.length === 0 ? (
                <p className="text-sm text-neutral-500">No hay roles disponibles</p>
              ) : (
                roles.map((role) => (
                  <div key={role.id} className="flex items-start gap-2">
                    <input
                      id={`role-${role.id}`}
                      type="checkbox"
                      checked={formData.role_ids.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      disabled={isPending}
                      className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor={`role-${role.id}`} className="flex-1 cursor-pointer">
                      <p className="text-sm font-medium text-text-primary">{role.name}</p>
                      {role.description && <p className="text-xs text-neutral-500">{role.description}</p>}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
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
                  {mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
