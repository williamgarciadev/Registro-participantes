import { useState, FormEvent, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Plus, Search, Edit, Trash2, RefreshCw, X, Users, ListFilter, Hash } from 'lucide-react'
import { participantesApi } from '@/services/participantes'
import type { EstadoParticipante } from '@/types/participante'
import { usePageHeader } from '@/components/PageHeaderContext'

export default function ParticipantesPage() {
  const PAGE_SIZE_OPTIONS = [10, 25, 50] as const
  const [searchQuery, setSearchQuery] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<EstadoParticipante | ''>('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0])
  const [deleteModal, setDeleteModal] = useState<{ id: string; nombre: string } | null>(null)
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null)
  const queryClient = useQueryClient()
  const { setHeader, resetHeader } = usePageHeader()

  useEffect(() => {
    setHeader({
      title: 'Participantes',
      subtitle: 'Gestión de inscripciones y asistencia',
      actions: (
        <Link to="/participantes/nuevo" className="btn btn-primary hidden sm:inline-flex">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Registrar participante
        </Link>
      ),
    })

    return () => {
      resetHeader()
    }
  }, [resetHeader, setHeader])

  useEffect(() => {
    if (deleteModal) {
      cancelButtonRef.current?.focus()
    }
  }, [deleteModal])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDeleteModal(null)
      }
    }

    if (deleteModal) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [deleteModal])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['participantes', estadoFilter, page, pageSize],
    queryFn: () =>
      participantesApi.getAll({
        estado: estadoFilter || undefined,
        skip: page * pageSize,
        limit: pageSize,
      }),
  })

  const {
    data: searchData,
    refetch: searchRefetch,
    isFetching: isSearching,
    isLoading: isSearchLoading,
    isError: isSearchError,
  } = useQuery({
    queryKey: ['participantes-search', searchQuery, page, pageSize],
    queryFn: () =>
      participantesApi.search({
        q: searchQuery,
        skip: page * pageSize,
        limit: pageSize,
      }),
    enabled: searchQuery.length > 0,
  })

  const activeData = searchQuery.length > 0 ? searchData : data
  const participantes = activeData?.participantes ?? []
  const total = activeData?.total
  const totalItems = total ?? 0
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize)
  const isTableLoading = searchQuery.length > 0 ? isSearchLoading || isSearching : isLoading
  const isTableError = searchQuery.length > 0 ? isSearchError : isError
  const pageStart = participantes.length > 0 ? page * pageSize + 1 : 0
  const pageEnd = participantes.length > 0 ? pageStart + participantes.length - 1 : 0
  const filterLabel =
    estadoFilter === ''
      ? 'Todos los estados'
      : estadoFilter.charAt(0).toUpperCase() + estadoFilter.slice(1)

  useEffect(() => {
    const activeTotal = searchQuery.length > 0 ? searchData?.total : data?.total
    if (activeTotal === undefined) {
      return
    }
    const maxPageIndex = activeTotal === 0 ? 0 : Math.max(Math.ceil(activeTotal / pageSize) - 1, 0)
    if (page > maxPageIndex) {
      setPage(maxPageIndex)
    }
  }, [data, searchData, page, pageSize, searchQuery])

  const deleteMutation = useMutation({
    mutationFn: participantesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participantes'] })
      queryClient.invalidateQueries({ queryKey: ['participantes-search'] })
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

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    setPage(0)
    if (searchQuery.trim().length > 0) {
      searchRefetch()
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <nav className="flex items-center gap-2 text-sm text-tertiary" aria-label="Ruta de navegación">
        <Link to="/" className="transition-colors hover:text-primary-600">
          Panel
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-secondary">Participantes</span>
      </nav>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="heading-1">Participantes</h1>
          <p className="text-secondary mt-1" aria-live="polite">
            {total !== undefined
              ? `${total} participante${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''}`
              : 'Cargando...'}
          </p>
        </div>
        <Link to="/participantes/nuevo" className="btn btn-primary sm:hidden">
          <Plus className="h-5 w-5" aria-hidden="true" />
          <span>Nuevo participante</span>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="stat-card animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">Total registrados</span>
              <p className="mt-2 text-3xl font-semibold text-text-primary">{totalItems}</p>
            </div>
            <span className="stat-card__icon stat-card__icon--primary">
              <Users className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-xs text-tertiary flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            Todos los participantes en el sistema
          </p>
        </div>

        <div className="stat-card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">Filtro activo</span>
              <p className="mt-2 text-2xl font-semibold text-text-primary">{filterLabel}</p>
            </div>
            <span className="stat-card__icon stat-card__icon--warning">
              <ListFilter className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-xs text-tertiary">
            Página {totalPages === 0 ? 1 : page + 1} de {Math.max(totalPages, 1)}
          </p>
        </div>

        <div className="stat-card sm:col-span-2 xl:col-span-1 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">Rango mostrado</span>
              <p className="mt-2 text-2xl font-semibold text-text-primary">
                {participantes.length > 0 ? `${pageStart}-${pageEnd}` : 'Sin resultados'}
              </p>
            </div>
            <span className="stat-card__icon stat-card__icon--success">
              <Hash className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-xs text-tertiary">
            Mostrando {participantes.length} registro{participantes.length !== 1 ? 's' : ''} en esta página
          </p>
        </div>
      </div>

      <div className="filters-toolbar" aria-label="Filtros de participantes">
        <form onSubmit={handleSearch} className="filters-toolbar__search" role="search" aria-label="Buscar participantes">
          <div className="filters-toolbar__search-input">
            <Search className="filters-toolbar__search-icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar por nombre, apellido o email..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setPage(0)
              }}
              className="input filters-toolbar__search-field"
              aria-label="Campo de búsqueda de participantes"
            />
          </div>
          <button type="submit" className="btn btn-primary filters-toolbar__search-button" aria-label="Ejecutar búsqueda">
            Buscar
          </button>
        </form>

        <div className="filters-toolbar__controls" role="group" aria-label="Filtrar por estado">
          <div className="filters-toolbar__select-wrapper">
            <select
              value={estadoFilter}
              onChange={(event) => {
                setEstadoFilter(event.target.value as EstadoParticipante | '')
                setPage(0)
              }}
              className="input"
              aria-label="Seleccionar estado"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
          <button
            onClick={() => {
              if (searchQuery.trim().length > 0) {
                searchRefetch()
              } else {
                refetch()
              }
            }}
            className="btn btn-secondary filters-toolbar__refresh"
            type="button"
            aria-label="Recargar listado de participantes"
          >
            <RefreshCw className="h-5 w-5" aria-hidden="true" />
            <span className="filters-toolbar__refresh-label">Actualizar</span>
          </button>
        </div>
      </div>

      <div className="card overflow-hidden p-0 motion-feedback animate-fade-in" role="region" aria-live="polite">
        {isTableLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16" role="status">
            <div className="inline-flex items-center justify-center">
              <div className="spinner" style={{ width: '2rem', height: '2rem', borderWidth: '3px' }} aria-hidden="true" />
            </div>
            <p className="text-secondary text-lg font-medium">Cargando participantes...</p>
            <p className="text-tertiary text-sm">Por favor espere un momento</p>
          </div>
        ) : isTableError ? (
          <div className="text-center py-16 px-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error-50 mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-error text-lg font-semibold mb-2">Error al cargar participantes</p>
            <p className="text-secondary text-sm">Por favor, intenta recargar la página</p>
          </div>
        ) : participantes.length > 0 ? (
          <>
            <div className="table-wrapper border-0">
              <table className="table-enhanced" aria-label="Listado de participantes">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th>Fecha registro</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {participantes.map((participante, index) => (
                    <tr key={participante.id} className="animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
                      <td>
                        <span className="text-sm font-semibold text-text-primary">
                          {participante.nombre} {participante.apellido}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-secondary">{participante.email}</span>
                      </td>
                      <td>
                        <span className="text-sm text-secondary">{participante.telefono || '—'}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            participante.estado === 'activo'
                              ? 'badge-success'
                              : participante.estado === 'inactivo'
                              ? 'badge-error'
                              : 'badge-warning'
                          }`}
                        >
                          {participante.estado}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-secondary">
                          {new Date(participante.fecha_registro).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex gap-2">
                          <Link
                            to={`/participantes/${participante.id}/editar`}
                            className="inline-flex items-center gap-1 rounded-component px-3 py-1.5 text-primary-600 hover:bg-primary-50 hover:text-primary-700 focus-ring transition-all"
                            aria-label={`Editar participante ${participante.nombre} ${participante.apellido}`}
                          >
                            <Edit className="h-4 w-4" aria-hidden="true" />
                            <span className="text-xs font-medium">Editar</span>
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(participante.id, `${participante.nombre} ${participante.apellido}`)
                            }
                            className="inline-flex items-center gap-1 rounded-component px-3 py-1.5 text-error hover:bg-error-50 focus-ring transition-all"
                            type="button"
                            aria-label={`Eliminar participante ${participante.nombre} ${participante.apellido}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span className="text-xs font-medium">Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-4 border-t border-border-muted bg-surface-alt px-6 py-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-secondary" aria-live="polite">
                Mostrando <span className="font-semibold text-text-primary">{pageStart}-{pageEnd}</span> de{' '}
                <span className="font-semibold text-text-primary">{totalItems}</span> participante{totalItems !== 1 ? 's' : ''}
              </p>
              <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center md:gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="page-size-select" className="text-sm text-secondary font-medium">
                    Filas por página:
                  </label>
                  <select
                    id="page-size-select"
                    className="input focus-ring"
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value))
                      setPage(0)
                    }}
                    aria-label="Cambiar cantidad de filas por página"
                    style={{ width: 'auto', minWidth: '6rem' }}
                  >
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => setPage((current) => Math.max(current - 1, 0))}
                    disabled={page === 0 || isTableLoading}
                    aria-label="Página anterior"
                  >
                    ← Anterior
                  </button>
                  <span className="text-sm text-secondary font-medium px-3">
                    <span className="text-text-primary">{totalPages === 0 ? 1 : page + 1}</span> / {Math.max(totalPages, 1)}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={isTableLoading || totalPages === 0 || page >= totalPages - 1}
                    aria-label="Página siguiente"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 px-6 animate-scale-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-50 mb-6">
              <Users className="h-10 w-10 text-primary-500" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No se encontraron participantes</h3>
            <p className="text-secondary text-sm mb-6 max-w-md mx-auto">
              {searchQuery || estadoFilter
                ? 'Intenta ajustar los filtros o realizar una búsqueda diferente'
                : 'Comienza registrando tu primer participante'}
            </p>
            {!searchQuery && !estadoFilter && (
              <Link to="/participantes/nuevo" className="btn btn-primary inline-flex">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Registrar participante
              </Link>
            )}
          </div>
        )}
      </div>

      {deleteModal && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => {
            if (!deleteMutation.isPending) {
              cancelDelete()
            }
          }}
        >
          <div
            className="modal-content"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="modal-delete-title"
            aria-describedby="modal-delete-description"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={cancelDelete}
              aria-label="Cerrar modal de eliminación"
              disabled={deleteMutation.isPending}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="modal-icon">
              <Trash2 className="h-7 w-7" aria-hidden="true" />
            </div>
            <span className="modal-eyebrow">Confirmar eliminación</span>
            <h3 id="modal-delete-title" className="mt-4 text-center text-xl font-semibold text-text-primary">
              Eliminar participante
            </h3>
            <p id="modal-delete-description" className="mt-3 text-center text-sm text-secondary leading-relaxed">
              ¿Estás seguro de que deseas eliminar a{' '}
              <span className="font-semibold text-text-primary">{deleteModal.nombre}</span> de la lista?
            </p>
            <p className="mt-2 text-center text-xs text-tertiary">
              El participante será marcado como inactivo y podrá ser recuperado después.
            </p>
            <div className="modal-actions">
              <button
                onClick={cancelDelete}
                disabled={deleteMutation.isPending}
                className="btn btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                ref={cancelButtonRef}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="btn btn-destructive flex-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
                  <>
                    <div
                      className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"
                      aria-hidden="true"
                    />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
