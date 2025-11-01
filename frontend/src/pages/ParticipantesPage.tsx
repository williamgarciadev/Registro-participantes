import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Plus, Search, Edit, Trash2, RefreshCw } from 'lucide-react'
import { participantesApi } from '@/services/participantes'
import type { EstadoParticipante } from '@/types/participante'

export default function ParticipantesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<EstadoParticipante | ''>('')
  const [deleteModal, setDeleteModal] = useState<{ id: string; nombre: string } | null>(null)
  const queryClient = useQueryClient()

  // Query para obtener participantes
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['participantes', estadoFilter],
    queryFn: () =>
      participantesApi.getAll({
        estado: estadoFilter || undefined,
      }),
  })

  // Query para buscar participantes
  const { data: searchData, refetch: searchRefetch } = useQuery({
    queryKey: ['participantes-search', searchQuery],
    queryFn: () => participantesApi.search({ q: searchQuery }),
    enabled: searchQuery.length > 0,
  })

  // Mutation para eliminar participante
  const deleteMutation = useMutation({
    mutationFn: participantesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participantes'] })
      toast.success('Participante eliminado correctamente')
    },
    onError: () => {
      toast.error('Error al eliminar participante')
    },
  })

  const handleDelete = (id: string, nombre: string) => {
    setDeleteModal({ id, nombre })
  }

  const confirmDelete = () => {
    if (deleteModal) {
      deleteMutation.mutate(deleteModal.id)
      setDeleteModal(null)
    }
  }

  const cancelDelete = () => {
    setDeleteModal(null)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery) {
      searchRefetch()
    }
  }

  const participantes = searchQuery ? searchData?.participantes : data?.participantes
  const total = searchQuery ? searchData?.total : data?.total

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Participantes</h1>
          <p className="text-gray-600 mt-1">
            {total !== undefined ? `${total} participante${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''}` : 'Cargando...'}
          </p>
        </div>
        <Link to="/participantes/nuevo" className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Participante
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input flex-1"
            />
            <button type="submit" className="btn btn-primary ml-2">
              <Search className="h-5 w-5" />
            </button>
          </form>

          {/* Filter by status */}
          <div className="flex items-center space-x-2">
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value as EstadoParticipante | '')}
              className="input"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="pendiente">Pendiente</option>
            </select>
            <button onClick={() => refetch()} className="btn btn-secondary">
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Cargando participantes...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error al cargar participantes</p>
          </div>
        ) : participantes && participantes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Registro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participantes.map((participante) => (
                  <tr key={participante.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {participante.nombre} {participante.apellido}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{participante.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {participante.telefono || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          participante.estado === 'activo'
                            ? 'bg-green-100 text-green-800'
                            : participante.estado === 'inactivo'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {participante.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(participante.fecha_registro).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/participantes/${participante.id}/editar`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <Edit className="h-5 w-5 inline" />
                      </Link>
                      <button
                        onClick={() =>
                          handleDelete(
                            participante.id,
                            `${participante.nombre} ${participante.apellido}`
                          )
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No se encontraron participantes</p>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full transform transition-all animate-in zoom-in duration-200">
            <div className="p-8">
              {/* Icono */}
              <div className="flex items-center justify-center w-14 h-14 mx-auto bg-red-100 rounded-full">
                <Trash2 className="h-7 w-7 text-red-600" />
              </div>

              {/* Título */}
              <h3 className="mt-5 text-xl font-bold text-gray-900 text-center">
                Eliminar participante
              </h3>

              {/* Mensaje */}
              <p className="mt-3 text-sm text-gray-600 text-center leading-relaxed">
                ¿Estás seguro de que deseas eliminar a{' '}
                <span className="font-semibold text-gray-900">{deleteModal.nombre}</span>?
              </p>
              <p className="mt-2 text-xs text-gray-500 text-center">
                El participante será marcado como inactivo y podrá ser recuperado después.
              </p>

              {/* Botones */}
              <div className="mt-7 flex gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
